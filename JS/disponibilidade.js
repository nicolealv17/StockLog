/* ================================================================
   StockLog · JS/disponibilidade.js
   Verificação de disponibilidade de componentes (estilo TOTVS Datasul)
   antes de liberar uma Ordem de Produção.

   Firebase (Realtime Database):
     /estoque/{codComp}      = { codigo, descricao, unidade, saldo }
     /ordensProducao/{OP}/componentes = [{ cod, qtd }]   (qtd = por unidade produzida)
     /reservas/{OP}/{codComp} = quantidade reservada
     /compras/solicitacoes/{pushId} = solicitação de compra gerada pela falta
     /logbot/eventos          = log (mesmo formato da página)

   Regra (igual ao MRP/Datasul):
     necessário  = qtd por unidade × quantidade da OP
     disponível  = saldo em estoque − reservado por OUTRAS OPs ativas
     situação    = OK | PARCIAL | FALTA | NÃO CADASTRADO

   Uso: basta incluir <script src="JS/disponibilidade.js" defer></script>
   no pedidos.html (depois do Firebase). Nada mais precisa ser alterado.
   ================================================================ */
(function () {
  'use strict';

  let db, cur = null;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => { const d = document.createElement('div'); d.textContent = s ?? ''; return d.innerHTML; };
  const fmt = (n) => Number(n || 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
  const INATIVO = ['concluido', 'cancelado'];

  const CSS = `
  .icon-btn.dsl-btn:hover{border-color:var(--green);color:var(--green)}
  .dsl-overlay{position:fixed;inset:0;background:rgba(6,20,36,.4);backdrop-filter:blur(2px);display:none;align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto;z-index:110}
  .dsl-overlay.open{display:flex}
  .dsl-modal{background:var(--bg-card);color:var(--text-main);border:1px solid var(--border);border-radius:14px;width:100%;max-width:1020px;box-shadow:var(--shadow-hover)}
  .dsl-head{display:flex;justify-content:space-between;align-items:center;padding:16px 22px;border-bottom:1px solid var(--border)}
  .dsl-head h3{font-size:1.1rem;display:flex;gap:10px;align-items:center}
  .dsl-head h3 i{color:var(--primary)}
  .dsl-sub{font-size:.85rem;color:var(--text-muted);margin-top:2px}
  .dsl-body{padding:18px 22px}
  .dsl-banner{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:10px;font-weight:600;margin-bottom:14px;font-size:.95rem}
  .dsl-banner.ok{background:var(--green-bg);color:var(--green)}
  .dsl-banner.warn{background:var(--amber-bg);color:var(--amber)}
  .dsl-banner.bad{background:var(--red-bg);color:var(--red)}
  .dsl-banner.info{background:var(--primary-light);color:var(--primary)}
  .dsl-wrap{overflow-x:auto}
  .dsl-table{width:100%;border-collapse:collapse;font-size:.9rem;min-width:860px}
  .dsl-table th{text-align:left;padding:8px 10px;font-size:.72rem;text-transform:uppercase;letter-spacing:.4px;color:var(--text-muted);border-bottom:2px solid var(--border);white-space:nowrap}
  .dsl-table td{padding:8px 10px;border-bottom:1px solid var(--border);vertical-align:middle}
  .dsl-table td.num,.dsl-table th.num{text-align:right;font-variant-numeric:tabular-nums}
  .dsl-table input{background:var(--bg-soft);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text-main);font:inherit;width:100%;min-width:90px}
  .dsl-table input:focus{outline:none;border-color:var(--primary)}
  .dsl-tag{display:inline-block;padding:3px 10px;border-radius:12px;font-size:.8rem;font-weight:600;white-space:nowrap}
  .dsl-tag.ok{background:var(--green-bg);color:var(--green)}
  .dsl-tag.parcial{background:var(--amber-bg);color:var(--amber)}
  .dsl-tag.falta,.dsl-tag.nao{background:var(--red-bg);color:var(--red)}
  .dsl-foot{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end;padding:14px 22px;border-top:1px solid var(--border)}
  .dsl-foot .left{margin-right:auto;display:flex;gap:10px;flex-wrap:wrap}
  .dsl-foot .btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
  .dsl-hint{font-size:.8rem;color:var(--text-muted);margin-top:10px}
  `;

  // ---------------- init ----------------
  function ready(cb) {
    const t = (n = 0) => {
      if (window.firebase && firebase.apps && firebase.apps.length) return cb();
      if (n > 60) return console.error('[Disponibilidade] Firebase não inicializado.');
      setTimeout(() => t(n + 1), 100);
    };
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', () => t()) : t();
  }

  ready(() => {
    db = firebase.database();
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    buildModal();
    const tbody = $('ordersTableBody');
    if (tbody) {
      new MutationObserver(injetarBotoes).observe(tbody, { childList: true });
      injetarBotoes();
    }
  });

  function injetarBotoes() {
    document.querySelectorAll('#ordersTableBody .row-actions').forEach((box) => {
      if (box.querySelector('.dsl-btn')) return;
      const ref = box.querySelector('[data-key]');
      if (!ref) return;
      const b = document.createElement('button');
      b.className = 'icon-btn dsl-btn';
      b.title = 'Disponibilidade de componentes';
      b.dataset.key = ref.dataset.key;
      b.innerHTML = '<i class="fas fa-boxes-stacked"></i>';
      b.addEventListener('click', () => abrir(b.dataset.key));
      box.insertBefore(b, box.querySelector('.danger') || null);
    });
  }

  // ---------------- modal ----------------
  function buildModal() {
    const el = document.createElement('div');
    el.className = 'dsl-overlay'; el.id = 'dslOverlay';
    el.innerHTML = `
      <div class="dsl-modal" role="dialog" aria-modal="true">
        <div class="dsl-head">
          <div>
            <h3><i class="fas fa-boxes-stacked"></i><span id="dslTitle">Disponibilidade de componentes</span></h3>
            <div class="dsl-sub" id="dslSub"></div>
          </div>
          <button class="modal-close" id="dslClose" aria-label="Fechar"><i class="fas fa-times"></i></button>
        </div>
        <div class="dsl-body">
          <div id="dslBanner"></div>
          <div class="dsl-wrap">
            <table class="dsl-table">
              <thead><tr>
                <th>Componente</th><th>Descrição</th><th class="num">Qtd / unid.</th>
                <th class="num">Necessário</th><th class="num">Saldo</th>
                <th class="num">Reserv. outras OPs</th><th class="num">Disponível</th>
                <th>Situação</th><th></th>
              </tr></thead>
              <tbody id="dslRows"></tbody>
            </table>
          </div>
          <datalist id="dslCodes"></datalist>
          <button class="btn btn-ghost" id="dslAdd" style="margin-top:12px"><i class="fas fa-plus"></i>Adicionar componente</button>
          <div class="dsl-hint">Disponível = saldo em estoque − quantidade já reservada por outras ordens ativas. A OP só é liberada quando todos os componentes estão OK.</div>
        </div>
        <div class="dsl-foot">
          <div class="left">
            <button class="btn btn-ghost" id="dslSeed" style="display:none"><i class="fas fa-database"></i>Cadastrar estoque de exemplo</button>
          </div>
          <button class="btn btn-ghost" id="dslSave"><i class="fas fa-floppy-disk"></i>Salvar lista</button>
          <button class="btn btn-ghost" id="dslBuy" style="display:none"><i class="fas fa-cart-shopping"></i>Gerar solicitação de compra</button>
          <button class="btn btn-primary" id="dslRelease"><i class="fas fa-play"></i>Reservar e liberar para produção</button>
        </div>
      </div>`;
    document.body.appendChild(el);

    el.addEventListener('click', (e) => { if (e.target === el) fechar(); });
    $('dslClose').onclick = fechar;
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && el.classList.contains('open')) fechar(); });
    $('dslAdd').onclick = () => { cur.rows.push({ cod: '', qtd: 1 }); renderRows(); };
    $('dslSave').onclick = salvar;
    $('dslRelease').onclick = liberar;
    $('dslBuy').onclick = gerarCompra;
    $('dslSeed').onclick = seedEstoque;
  }

  function fechar() { $('dslOverlay').classList.remove('open'); cur = null; }

  async function abrir(key) {
    const [oS, eS, rS, ordS] = await Promise.all([
      db.ref(`ordensProducao/${key}`).once('value'),
      db.ref('estoque').once('value'),
      db.ref('reservas').once('value'),
      db.ref('ordensProducao').once('value')
    ]);
    const order = oS.val();
    if (!order) return alert('Pedido não encontrado.');
    cur = {
      key, order,
      estoque: eS.val() || {},
      reservas: rS.val() || {},
      ordens: ordS.val() || {},
      rows: (order.componentes || []).map((c) => ({ cod: c.cod, qtd: c.qtd }))
    };
    if (!cur.rows.length) cur.rows.push({ cod: '', qtd: 1 });
    cur.travado = INATIVO.includes(order.status);

    $('dslSub').textContent = `${order.codigo || key} · ${order.produto || ''} · ${fmt(order.quantidade)} unid.`;
    $('dslCodes').innerHTML = Object.values(cur.estoque)
      .map((i) => `<option value="${esc(i.codigo)}">${esc(i.descricao || '')}</option>`).join('');
    $('dslSeed').style.display = Object.keys(cur.estoque).length ? 'none' : 'inline-flex';
    $('dslAdd').style.display = cur.travado ? 'none' : 'inline-flex';
    $('dslOverlay').classList.add('open');
    renderRows();
  }

  // ---------------- cálculo ----------------
  function calcular(row) {
    const o = cur.order;
    const item = cur.estoque[row.cod];
    const necessario = (Number(row.qtd) || 0) * (Number(o.quantidade) || 0);
    if (!item) return { item: null, necessario, saldo: 0, reservado: 0, disp: 0, falta: necessario, sit: 'nao' };
    const saldo = Number(item.saldo) || 0;
    let reservado = 0;
    Object.entries(cur.reservas).forEach(([op, comps]) => {
      if (op === cur.key) return;
      if (INATIVO.includes(cur.ordens[op]?.status)) return;
      reservado += Number(comps?.[row.cod]) || 0;
    });
    const disp = saldo - reservado;
    const falta = Math.max(0, necessario - disp);
    const sit = disp >= necessario ? 'ok' : disp > 0 ? 'parcial' : 'falta';
    return { item, necessario, saldo, reservado, disp, falta, sit };
  }

  const SIT = { ok: 'OK', parcial: 'Parcial', falta: 'Falta', nao: 'Não cadastrado' };

  // ---------------- render ----------------
  function renderRows() {
    const tb = $('dslRows');
    tb.innerHTML = '';
    cur.rows.forEach((row, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input list="dslCodes" data-f="cod" value="${esc(row.cod)}" placeholder="Código" ${cur.travado ? 'disabled' : ''}></td>
        <td data-c="desc"></td>
        <td class="num"><input type="number" min="0" step="any" data-f="qtd" value="${esc(String(row.qtd))}" ${cur.travado ? 'disabled' : ''}></td>
        <td class="num" data-c="nec"></td><td class="num" data-c="saldo"></td>
        <td class="num" data-c="res"></td><td class="num" data-c="disp"></td>
        <td data-c="sit"></td>
        <td>${cur.travado ? '' : `<button class="icon-btn danger" title="Remover"><i class="fas fa-trash"></i></button>`}</td>`;
      tr.querySelectorAll('input').forEach((inp) => inp.addEventListener('input', () => {
        row[inp.dataset.f] = inp.dataset.f === 'cod' ? inp.value.trim() : inp.value;
        atualizar();
      }));
      const rm = tr.querySelector('.danger');
      if (rm) rm.onclick = () => { cur.rows.splice(i, 1); if (!cur.rows.length) cur.rows.push({ cod: '', qtd: 1 }); renderRows(); };
      tr._row = row;
      tb.appendChild(tr);
    });
    atualizar();
  }

  function atualizar() {
    let ok = 0, total = 0, faltas = 0;
    $('dslRows').querySelectorAll('tr').forEach((tr) => {
      const row = tr._row;
      if (!row.cod) { ['desc','nec','saldo','res','disp','sit'].forEach((c) => (tr.querySelector(`[data-c=${c}]`).textContent = '')); return; }
      const r = calcular(row);
      const set = (c, v) => (tr.querySelector(`[data-c=${c}]`).innerHTML = v);
      const un = r.item?.unidade ? ' ' + esc(r.item.unidade) : '';
      set('desc', esc(r.item?.descricao || '—'));
      set('nec', fmt(r.necessario) + un);
      set('saldo', fmt(r.saldo) + un);
      set('res', fmt(r.reservado) + un);
      set('disp', fmt(r.disp) + un);
      set('sit', `<span class="dsl-tag ${r.sit}">${SIT[r.sit]}${r.falta > 0 && r.sit !== 'nao' ? ` · faltam ${fmt(r.falta)}` : ''}</span>`);
      total++; if (r.sit === 'ok') ok++; else faltas++;
    });

    const b = $('dslBanner');
    const st = cur.order.status;
    if (cur.travado) b.innerHTML = `<div class="dsl-banner info"><i class="fas fa-lock"></i>Pedido ${esc(STATUS_LABEL[st] || st)} — somente consulta.</div>`;
    else if (!total) b.innerHTML = `<div class="dsl-banner info"><i class="fas fa-circle-info"></i>Informe os componentes da ordem para verificar o estoque.</div>`;
    else if (!faltas) b.innerHTML = `<div class="dsl-banner ok"><i class="fas fa-circle-check"></i>Todos os componentes disponíveis — a OP pode ser liberada.</div>`;
    else b.innerHTML = `<div class="dsl-banner bad"><i class="fas fa-triangle-exclamation"></i>${faltas} de ${total} componente(s) sem disponibilidade suficiente.</div>`;

    $('dslRelease').disabled = cur.travado || !total || !!faltas;
    $('dslSave').disabled = cur.travado;
    $('dslBuy').style.display = !cur.travado && faltas ? 'inline-flex' : 'none';
  }

  const STATUS_LABEL = { concluido: 'concluído', cancelado: 'cancelado' };

  // ---------------- ações ----------------
  const linhasValidas = () => cur.rows
    .filter((r) => r.cod && Number(r.qtd) > 0)
    .map((r) => ({ cod: r.cod, qtd: Number(r.qtd) }));

  const usuario = () => firebase.auth().currentUser?.email || 'sistema';

  async function log(tipo, texto) {
    try { await db.ref('logbot/eventos').push({ tipo, texto, ref: cur.key, timestamp: Date.now() }); } catch (e) { /* ignora */ }
  }

  function toast(msg, danger) {
    const t = $('toast'); if (!t) return alert(msg);
    t.classList.toggle('danger', !!danger);
    $('toastMsg').textContent = msg;
    t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3200);
  }

  async function salvar() {
    const lista = linhasValidas();
    await db.ref(`ordensProducao/${cur.key}/componentes`).set(lista.length ? lista : null);
    await log('info', `${cur.order.codigo} · lista de componentes atualizada por ${usuario()}`);
    toast('Lista de componentes salva.');
  }

  async function liberar() {
    const lista = linhasValidas();
    if (!lista.length) return;
    // revalida com dados frescos (evita corrida com outra OP reservando o mesmo item)
    const [eS, rS, oS] = await Promise.all([db.ref('estoque').once('value'), db.ref('reservas').once('value'), db.ref('ordensProducao').once('value')]);
    cur.estoque = eS.val() || {}; cur.reservas = rS.val() || {}; cur.ordens = oS.val() || {};
    if (lista.some((r) => calcular(r).sit !== 'ok')) { atualizar(); return toast('Estoque mudou: há componentes sem disponibilidade.', true); }

    const reserva = {};
    lista.forEach((r) => { reserva[r.cod] = (reserva[r.cod] || 0) + calcular(r).necessario; });
    const upd = {};
    upd[`ordensProducao/${cur.key}/componentes`] = lista;
    upd[`ordensProducao/${cur.key}/status`] = 'producao';
    upd[`reservas/${cur.key}`] = reserva;
    await db.ref().update(upd);
    await log('info', `${cur.order.codigo} liberada para produção por ${usuario()} (componentes reservados)`);
    toast(`Pedido ${cur.order.codigo} liberado e componentes reservados.`);
    fechar();
  }

  async function gerarCompra() {
    const lista = linhasValidas();
    const faltas = lista.map((r) => ({ r, c: calcular(r) })).filter((x) => x.c.sit !== 'ok');
    if (!faltas.length) return;
    const upd = {};
    faltas.forEach(({ r, c }) => {
      const id = db.ref('compras/solicitacoes').push().key;
      upd[`compras/solicitacoes/${id}`] = {
        op: cur.order.codigo || cur.key, componente: r.cod, descricao: c.item?.descricao || '',
        quantidade: c.falta, unidade: c.item?.unidade || '', status: 'aberta',
        criadoPor: usuario(), dataCriacao: Date.now()
      };
    });
    upd[`ordensProducao/${cur.key}/componentes`] = lista;
    upd[`ordensProducao/${cur.key}/status`] = 'aguardando';
    await db.ref().update(upd);
    await log('alerta', `${cur.order.codigo} · ${faltas.length} solicitação(ões) de compra geradas por falta de material`);
    toast(`${faltas.length} solicitação(ões) de compra gerada(s). Pedido em "Aguard. Material".`);
    fechar();
  }

  async function seedEstoque() {
    const itens = [
      ['MP-AC1020-50', 'Barra aço ABNT 1020 ø50mm', 'kg', 1200],
      ['MP-AC1045-30', 'Barra aço ABNT 1045 ø30mm', 'kg', 800],
      ['CP-PARAF-M8', 'Parafuso sextavado M8', 'un', 5000],
      ['CP-ARRUELA-M8', 'Arruela lisa M8', 'un', 8000],
      ['CP-ROLAM-6204', 'Rolamento 6204', 'un', 150],
      ['IN-OLEO-CORTE', 'Óleo de corte', 'l', 60],
      ['EM-CAIXA-30', 'Caixa de papelão 30x30', 'un', 400]
    ];
    const upd = {};
    itens.forEach(([codigo, descricao, unidade, saldo]) => { upd[`estoque/${codigo}`] = { codigo, descricao, unidade, saldo }; });
    await db.ref().update(upd);
    cur.estoque = (await db.ref('estoque').once('value')).val() || {};
    $('dslCodes').innerHTML = Object.values(cur.estoque).map((i) => `<option value="${esc(i.codigo)}">${esc(i.descricao)}</option>`).join('');
    $('dslSeed').style.display = 'none';
    atualizar();
    toast('Estoque de exemplo cadastrado.');
  }
})();