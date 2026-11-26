/* ================================================================
   JS/relatorios-base.js
   Base única de dados + Curva ABC + exportações (PDF/Excel/CSV)
   Carregar DEPOIS do <script> inline de relatorios.html
   ================================================================ */

// ---------------------------------------------------------------
// 0. CONFIGURAÇÃO — ajuste as chaves para o que as outras telas gravam
// ---------------------------------------------------------------
console.log('relatorios-base.js carregou');
const BASE_KEYS = {
  itens:      'stocklog_itens',             // Itens em Estoque
  ops:        'stocklog_ordens_producao',   // Ordens de Produção
  pedidos:    'stocklog_pedidos',           // Pedidos
  rotas:      'stocklog_rotas',             // Logística
  movimentos: 'stocklog_movimentos',        // opcional: consumo real p/ Curva ABC
};
/* Formato esperado em cada chave (JSON array, datas em ISO AAAA-MM-DD):
   itens:   {codigo, descricao, categoria, unidade, custo, qtd, min, max, consumoMes}
   ops:     {codigo, produto, qtd, progresso(0-1), setor, inicio, fim, status}
   pedidos: {numero, cliente, produto, qtd, valor, dataPedido, dataEntrega, status, segmento?, cidade?}
   rotas:   {numero, motorista, veiculo, destino, saida, previsao, status}
   movimentos (opcional): {data, codigo, qtd}
   Se a chave não existir/estiver vazia, usa os SEEDS abaixo (somente fallback). */

const ITENS_SEED = [
  { codigo: 'MAT-001', descricao: 'Chapa Aço 3mm',  categoria: 'Matéria-prima', unidade: 'un', custo: 185.00, qtd: 850,  min: 100, max: 1000, consumoMes: 40 },
  { codigo: 'MAT-002', descricao: 'Luva Nitrílica', categoria: 'EPI',           unidade: 'cx', custo: 42.00,  qtd: 45,   min: 50,  max: 500,  consumoMes: 18 },
  { codigo: 'MAT-003', descricao: 'Parafuso M8',    categoria: 'Fixação',       unidade: 'un', custo: 0.85,   qtd: 1200, min: 200, max: 2000, consumoMes: 2400 },
  { codigo: 'MAT-004', descricao: 'Flange 1020',    categoria: 'Semiacabado',   unidade: 'un', custo: 68.90,  qtd: 12,   min: 20,  max: 200,  consumoMes: 90 },
  { codigo: 'MAT-005', descricao: 'Eixo Vazado',    categoria: 'Semiacabado',   unidade: 'un', custo: 142.50, qtd: 8,    min: 10,  max: 100,  consumoMes: 55 },
  { codigo: 'MAT-006', descricao: 'Tinta Epóxi',    categoria: 'Insumo',        unidade: 'L',  custo: 54.30,  qtd: 30,   min: 20,  max: 100,  consumoMes: 35 },
];
const OPS_SEED = [
  { codigo: 'OP-2026-001', produto: 'Flange Aço 1020',    qtd: 800, progresso: 0.77, setor: 'Corte',    inicio: '2026-11-03', fim: '2026-11-28', status: 'Em andamento' },
  { codigo: 'OP-2026-002', produto: 'Eixo Vazado 420mm',  qtd: 120, progresso: 0.40, setor: 'Usinagem', inicio: '2026-11-10', fim: '2026-12-02', status: 'Em andamento' },
  { codigo: 'OP-2026-003', produto: 'Suporte Estrutural', qtd: 80,  progresso: 0.30, setor: 'Solda',    inicio: '2026-11-15', fim: '2026-12-05', status: 'Em andamento' },
  { codigo: 'OP-2026-004', produto: 'Luva Nitrílica',     qtd: 500, progresso: 0,    setor: 'Montagem', inicio: '2026-11-18', fim: '2026-12-10', status: 'Pendente' },
];
const PEDIDOS_SEED = [
  { numero: 'PED-2026-001', cliente: 'Souza',                   produto: 'Flange Aço 1020',    qtd: 500,  valor: 12500, dataPedido: '2026-11-03', dataEntrega: '2026-11-18', status: 'Concluído' },
  { numero: 'PED-2026-002', cliente: 'Indústrias Aurora',       produto: 'Eixo Vazado 420mm',  qtd: 120,  valor: 9800,  dataPedido: '2026-11-05', dataEntrega: '2026-11-25', status: 'Em andamento' },
  { numero: 'PED-2026-003', cliente: 'Peças & Cia Ltda',        produto: 'Suporte Estrutural', qtd: 80,   valor: 6200,  dataPedido: '2026-11-10', dataEntrega: '2026-12-02', status: 'Pendente' },
  { numero: 'PED-2026-004', cliente: 'Usina Metalúrgica Silva', produto: 'Carcaça Bomba',      qtd: 25,   valor: 5400,  dataPedido: '2026-11-12', dataEntrega: '2026-11-24', status: 'Em andamento' },
  { numero: 'PED-2026-005', cliente: 'Auto Peças Brasil',       produto: 'Parafuso M8',        qtd: 5000, valor: 3800,  dataPedido: '2026-11-15', dataEntrega: '2026-12-05', status: 'Pendente' },
  { numero: 'PED-2026-006', cliente: 'Metalúrgica São João',    produto: 'Chapa Aço 3mm',      qtd: 40,   valor: 2800,  dataPedido: '2026-11-18', dataEntrega: '2026-12-10', status: 'Pendente' },
];
const ROTAS_SEED = [
  { numero: 'R-001', motorista: 'João Silva',      veiculo: 'ABC-1234', destino: 'Importadora Global Insumos',  saida: '2026-11-03', previsao: '2026-11-18', status: 'Entregue' },
  { numero: 'R-002', motorista: 'Marcos Souza',    veiculo: 'XYZ-5678', destino: 'Rolamentos & Cia Indústria',  saida: '2026-11-10', previsao: '2026-11-25', status: 'Em rota' },
  { numero: 'R-003', motorista: 'Ana Paula Rocha', veiculo: 'JKL-9012', destino: 'Metalúrgica Silva Ltda',      saida: '2026-11-15', previsao: '2026-12-02', status: 'Em rota' },
  { numero: 'R-004', motorista: 'Carlos Lima',     veiculo: 'ABC-1234', destino: 'Ferramentas & Moldes Brasil', saida: '2026-11-18', previsao: '2026-12-05', status: 'Pendente' },
];

// ---------------------------------------------------------------
// 1. UTILITÁRIOS
// ---------------------------------------------------------------
const p2 = (n) => String(n).padStart(2, '0');
const HOJE = (() => { const d = new Date(); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; })();
const semAcento = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const DESEMP = JSON.parse(JSON.stringify(DADOS_PREVIEW.desempenho));
const STATUS_MAP = {
  concluido: ['Concluído', 'Entregue'],
  andamento: ['Em andamento', 'Em rota'],
  pendente:  ['Pendente'],
  cancelado: ['Cancelado'],
};

function lerBase(chave, seed) {
  try {
    const s = JSON.parse(localStorage.getItem(BASE_KEYS[chave]));
    if (Array.isArray(s) && s.length) return s;
  } catch (e) { /* usa seed */ }
  return seed;
}

function lerFiltros() {
  const v = (id, pad) => { const el = document.getElementById(id); return el && el.value ? el.value : pad; };
  return { ini: v('filtro-data-inicio', ''), fim: v('filtro-data-fim', ''), setor: v('filtro-setor', 'todos'), status: v('filtro-status', 'todos') };
}

function descFiltros(f) {
  const per = f.ini || f.fim ? `${f.ini ? isoParaBR(f.ini) : 'início'} a ${f.fim ? isoParaBR(f.fim) : 'hoje'}` : 'todo o período';
  const nomeSel = (id) => { const el = document.getElementById(id); return el ? el.options[el.selectedIndex].text : 'Todos'; };
  return `Filtros: ${per} | Setor: ${nomeSel('filtro-setor')} | Status: ${nomeSel('filtro-status')}`;
}

function nomeArq(nome, f, ext) {
  const p = [`Relatorio_${semAcento(nome)}`];
  if (f.ini || f.fim) p.push(`${f.ini || 'inicio'}_a_${f.fim || 'hoje'}`); else p.push(HOJE);
  if (f.status !== 'todos') p.push(f.status);
  if (f.setor !== 'todos') p.push(f.setor);
  return p.join('_') + '.' + ext;
}

function serialExcel(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return Math.round(Date.UTC(a, m - 1, d) / 86400000) + 25569;
}

// ---------------------------------------------------------------
// 2. BASE ÚNICA — definição dos relatórios
//    cols: [título, tipo, somar?]   tipo: txt | int | brl | pct | data
//    Status é sempre a última coluna; dataCol = coluna usada no filtro de período
// ---------------------------------------------------------------
const REL = {
  pedidos: {
    nome: 'Pedidos', dataCol: 5,
    cols: [['Nº Pedido', 'txt'], ['Cliente', 'txt'], ['Produto', 'txt'], ['Qtd.', 'int', 1], ['Valor (R$)', 'brl', 1], ['Data Pedido', 'data'], ['Data Entrega', 'data'], ['Status', 'txt']],
    linhas: () => lerBase('pedidos', PEDIDOS_SEED).map((p) => [p.numero, p.cliente, p.produto, Number(p.qtd), Number(p.valor), p.dataPedido, p.dataEntrega, p.status]),
  },
  producao: {
    nome: 'Produção', dataCol: 5,
    cols: [['Cód. OP', 'txt'], ['Produto', 'txt'], ['Qtd. (pçs)', 'int', 1], ['Progresso', 'pct'], ['Setor', 'txt'], ['Data Início', 'data'], ['Data Fim', 'data'], ['Status', 'txt']],
    linhas: () => lerBase('ops', OPS_SEED).map((o) => [o.codigo, o.produto, Number(o.qtd), Number(o.progresso) || 0, o.setor, o.inicio, o.fim, o.status]),
  },
  estoque: {
    nome: 'Estoque', dataCol: -1,
    cols: [['Cód. Item', 'txt'], ['Descrição', 'txt'], ['Unid.', 'txt'], ['Qtd. Atual', 'int'], ['Mínimo', 'int'], ['Máximo', 'int'], ['Custo unit.', 'brl'], ['Valor em estoque', 'brl', 1], ['Status', 'txt']],
    linhas: () => lerBase('itens', ITENS_SEED).map((i) => {
      const q = Number(i.qtd), mn = Number(i.min);
      const st = q < mn * 0.85 ? 'Crítico' : q < mn ? 'Baixo' : 'Normal';
      return [i.codigo, i.descricao, i.unidade || 'un', q, mn, Number(i.max), Number(i.custo), q * Number(i.custo), st];
    }),
  },
  logistica: {
    nome: 'Logística', dataCol: 4,
    cols: [['Nº Rota', 'txt'], ['Motorista', 'txt'], ['Veículo', 'txt'], ['Destino', 'txt'], ['Saída', 'data'], ['Previsão', 'data'], ['Status', 'txt']],
    linhas: () => lerBase('rotas', ROTAS_SEED).map((r) => [r.numero, r.motorista, r.veiculo, String(r.destino).trim(), r.saida, r.previsao, r.status]),
  },
};

function fmtCel(v, tipo) {
  if (v == null || v === '') return '-';
  if (tipo === 'data') return isoParaBR(v);
  if (tipo === 'int') return fmtInt(v);
  if (tipo === 'brl') return fmtBRL(v);
  if (tipo === 'pct') return fmtPct(v * 100, 0);
  return String(v);
}

function montarRelatorio(tipo, filtrar = true) {
  const f = lerFiltros();
  if (tipo === 'desempenho') {
    return { tipo, nome: 'Desempenho', def: null, raw: null, headers: DESEMP.colunas, rows: DESEMP.linhas, f };
  }
  const def = REL[tipo];
  let raw = def.linhas();
  if (filtrar) {
    if (def.dataCol >= 0) {
      if (f.ini) raw = raw.filter((r) => r[def.dataCol] >= f.ini);
      if (f.fim) raw = raw.filter((r) => r[def.dataCol] <= f.fim);
    }
    if (tipo !== 'estoque' && f.status !== 'todos') {
      const ok = STATUS_MAP[f.status] || [];
      raw = raw.filter((r) => ok.includes(r[r.length - 1]));
    }
  }
  return { tipo, nome: def.nome, def, raw, headers: def.cols.map((c) => c[0]), rows: raw.map((r) => r.map((v, i) => fmtCel(v, def.cols[i][1]))), f };
}

function reconstruirPreview() {
  Object.keys(REL).forEach((t) => {
    const m = montarRelatorio(t, true);
    DADOS_PREVIEW[t] = { colunas: m.headers, linhas: m.rows };
  });
  DADOS_PREVIEW.desempenho = DESEMP;
}

function getDadosParaExportar(tipo) {
  const m = montarRelatorio(tipo, true);
  return { headers: m.headers, rows: m.rows, nome: m.nome, m };
}

function somasRelatorio(m) {
  if (!m.def) return null;
  return m.def.cols.map((c, i) => (c[2] ? m.raw.reduce((s, r) => s + (Number(r[i]) || 0), 0) : null));
}

function semDados(m) {
  if (!m.rows.length) { showToast('Não há dados para exportar com os filtros atuais.', 'error'); return true; }
  return false;
}

// ---------------------------------------------------------------
// 3. PDF — template (faixa de marca, logo, filtros, totais, paginação)
// ---------------------------------------------------------------
let LOGO_DATAURL = null;
fetch('IMG/logo.png')
  .then((r) => r.blob())
  .then((b) => new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); }))
  .then((d) => { LOGO_DATAURL = d; })
  .catch(() => { LOGO_DATAURL = null; });

function pdfCabecalho(doc, titulo, f) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(0, 107, 179); doc.rect(0, 0, W, 70, 'F');
  doc.setFillColor(0, 77, 128);  doc.rect(0, 70, W, 4, 'F');
  let x = 40;
  if (LOGO_DATAURL) {
    doc.setFillColor(255, 255, 255); doc.roundedRect(40, 16, 38, 38, 6, 6, 'F');
    try { doc.addImage(LOGO_DATAURL, 'PNG', 43, 19, 32, 32); x = 90; } catch (e) { x = 90; }
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.text(titulo, x, 36);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text('StockLog · Gestão Industrial', x, 52);
  doc.text(`Gerado em ${formatarDataHora(new Date())}`, W - 40, 36, { align: 'right' });
  doc.setTextColor(61, 95, 126); doc.setFontSize(9);
  doc.text(descFiltros(f), 40, 92, { maxWidth: W - 80 });
  return 106;
}

function pdfRodape(doc, rotulo) {
  const n = doc.internal.getNumberOfPages();
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setDrawColor(211, 224, 238); doc.line(40, H - 32, W - 40, H - 32);
    doc.setFontSize(8); doc.setTextColor(123, 146, 178);
    doc.text(`StockLog · ${rotulo}`, 40, H - 18);
    doc.text(`Página ${i} de ${n}`, W - 40, H - 18, { align: 'right' });
  }
}

function pdfTabela(doc, m, startY) {
  const somas = somasRelatorio(m);
  const numIdx = m.def ? m.def.cols.map((c, i) => (['int', 'brl', 'pct'].includes(c[1]) ? i : -1)).filter((i) => i >= 0) : [];
  const colStyles = {}; numIdx.forEach((i) => { colStyles[i] = { halign: 'right' }; });
  let foot;
  if (somas) {
    foot = [m.headers.map((_, i) => (i === 0 ? `Total (${m.rows.length} ${m.rows.length === 1 ? 'registro' : 'registros'})` : somas[i] != null ? fmtCel(somas[i], m.def.cols[i][1]) : ''))];
  }
  doc.autoTable({
    head: [m.headers], body: m.rows, foot, startY,
    margin: { left: 40, right: 40, top: 40, bottom: 44 },
    styles: { fontSize: m.headers.length > 7 ? 8 : 9, cellPadding: 5, textColor: [10, 31, 51] },
    headStyles: { fillColor: [0, 107, 179], textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [225, 238, 251], textColor: [10, 31, 51], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 250, 255] },
    columnStyles: colStyles,
    didParseCell: (d) => { if (d.section === 'head' && numIdx.includes(d.column.index)) d.cell.styles.halign = 'right'; },
  });
}

async function exportarPDF(tipo) {
  const m = montarRelatorio(tipo, true);
  if (semDados(m)) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'pt', 'a4');
  const y = pdfCabecalho(doc, `Relatório de ${m.nome}`, m.f);
  pdfTabela(doc, m, y);
  pdfRodape(doc, `Relatório de ${m.nome}`);
  doc.save(nomeArq(m.nome, m.f, 'pdf'));
  adicionarHistorico(m.nome, 'PDF', m.rows.length);
  showToast(`PDF do relatório de ${m.nome} baixado!`, 'success');
}

async function exportarConsolidadoPDF() {
  const tipos = ['producao', 'pedidos', 'estoque', 'logistica', 'desempenho'];
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'pt', 'a4');
  const f = lerFiltros();
  let y = pdfCabecalho(doc, 'Relatório Consolidado Geral', f);
  let total = 0, primeira = true;
  tipos.forEach((t) => {
    const m = montarRelatorio(t, true);
    if (!m.rows.length) return;
    if (!primeira) { doc.addPage(); y = 50; }
    primeira = false;
    total += m.rows.length;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(0, 107, 179);
    doc.text(`Seção: ${m.nome}`, 40, y);
    pdfTabela(doc, m, y + 10);
  });
  if (!total) { showToast('Não há dados para exportar com os filtros atuais.', 'error'); return; }
  pdfRodape(doc, 'Relatório Consolidado');
  doc.save(nomeArq('Consolidado', f, 'pdf'));
  adicionarHistorico('Consolidado', 'PDF', total);
  showToast(`Relatório Consolidado com ${total} registros baixado!`, 'success');
}

// ---------------------------------------------------------------
// 4. EXCEL — datas reais, cabeçalho congelado, filtros e totais (fórmulas)
// ---------------------------------------------------------------
function exportarExcel(tipo) {
  const m = montarRelatorio(tipo, true);
  if (semDados(m)) return;
  const tipos = m.def ? m.def.cols.map((c) => c[1]) : m.headers.map((_, i) => (i === 0 ? 'txt' : 'num'));
  const nCols = m.headers.length;
  const HEAD = 4, FIRST = 5, LAST = FIRST + m.rows.length - 1, TOTAL = LAST + 1;

  const dados = m.raw
    ? m.raw.map((r) => r.map((v, i) => (tipos[i] === 'data' && v ? serialExcel(v) : v)))
    : m.rows.map((r) => r.map((v, i) => (i > 0 && String(v).trim() !== '' && isFinite(parseFloat(String(v))) && !String(v).includes('%') ? Number(v) : v)));

  const aoa = [
    [`Relatório de ${m.nome} — StockLog`],
    [descFiltros(m.f)],
    [`Gerado em: ${formatarDataHora(new Date())}`],
    [],
    m.headers,
    ...dados,
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws['!merges'] = [0, 1, 2].map((r) => ({ s: { r, c: 0 }, e: { r, c: nCols - 1 } }));
  ws['!cols'] = m.headers.map((h, c) => {
    let max = String(h).length;
    m.rows.forEach((r) => { const l = String(r[c]).length; if (l > max) max = l; });
    return { wch: Math.min(Math.max(max + 4, 12), 42) };
  });
  ws['!rows'] = [{ hpt: 26 }, { hpt: 16 }, { hpt: 16 }, { hpt: 8 }, { hpt: 24 }];

  const b = { style: 'thin', color: { rgb: 'D3E0EE' } };
  const border = { top: b, bottom: b, left: b, right: b };
  const banda = (font, fill) => ({ font, fill: { fgColor: { rgb: fill } }, alignment: { horizontal: 'center', vertical: 'center' }, border });
  const estT = banda({ bold: true, sz: 14, color: { rgb: 'FFFFFF' }, name: 'Calibri' }, '006BB3');
  const estS = banda({ italic: true, sz: 10, color: { rgb: '3D5F7E' }, name: 'Calibri' }, 'F5FAFF');
  const fmtZ = { int: '#,##0', brl: '"R$" #,##0.00', pct: '0%', data: 'dd/mm/yyyy', num: 'General' };

  for (let c = 0; c < nCols; c++) {
    [[0, estT], [1, estS], [2, estS]].forEach(([r, est]) => {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (!ws[ref]) ws[ref] = { t: 's', v: '' };
      ws[ref].s = est;
    });
    ws[XLSX.utils.encode_cell({ r: HEAD, c })].s = {
      font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' }, name: 'Calibri' },
      fill: { fgColor: { rgb: '004D80' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border,
    };
  }

  for (let r = FIRST; r <= LAST; r++) {
    const zebra = (r - FIRST) % 2 === 0 ? 'FFFFFF' : 'F5FAFF';
    for (let c = 0; c < nCols; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (!ws[ref]) ws[ref] = { t: 's', v: '' };
      const num = typeof ws[ref].v === 'number';
      if (num && fmtZ[tipos[c]]) ws[ref].z = fmtZ[tipos[c]];
      ws[ref].s = {
        font: { sz: 10, color: { rgb: '0A1F33' }, name: 'Calibri' },
        fill: { fgColor: { rgb: zebra } },
        alignment: { horizontal: tipos[c] === 'data' ? 'center' : num ? 'right' : 'left', vertical: 'center' }, border,
      };
    }
  }

  // Linha de totais (fórmulas reais SUM)
  const somas = somasRelatorio(m);
  if (somas) {
    for (let c = 0; c < nCols; c++) {
      const ref = XLSX.utils.encode_cell({ r: TOTAL, c });
      let cel = { t: 's', v: '' };
      if (c === 0) cel = { t: 's', v: `Total (${m.rows.length} ${m.rows.length === 1 ? 'registro' : 'registros'})` };
      else if (somas[c] != null) {
        const L = XLSX.utils.encode_col(c);
        cel = { t: 'n', v: somas[c], f: `SUM(${L}${FIRST + 1}:${L}${LAST + 1})`, z: fmtZ[tipos[c]] };
      }
      cel.s = {
        font: { bold: true, sz: 10, color: { rgb: '0A1F33' }, name: 'Calibri' },
        fill: { fgColor: { rgb: 'E1EEFB' } },
        alignment: { horizontal: c === 0 ? 'left' : 'right', vertical: 'center' }, border,
      };
      ws[ref] = cel;
    }
  }

  const fimRef = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: somas ? TOTAL : LAST, c: nCols - 1 } });
  ws['!ref'] = fimRef;
  ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: HEAD, c: 0 }, e: { r: LAST, c: nCols - 1 } }) };
  ws['!freeze'] = { xSplit: 0, ySplit: HEAD + 1 };
  ws['!views'] = [{ state: 'frozen', ySplit: HEAD + 1 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, m.nome.substring(0, 31));
  XLSX.writeFile(wb, nomeArq(m.nome, m.f, 'xlsx'));

  adicionarHistorico(m.nome, 'Excel', m.rows.length);
  showToast(`Excel do relatório de ${m.nome} baixado!`, 'success');
}

function exportarCSV(tipo) {
  const m = montarRelatorio(tipo, true);
  if (semDados(m)) return;
  const esc = (s) => { s = String(s); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const csv = [m.headers.map(esc).join(';'), ...m.rows.map((r) => r.map(esc).join(';'))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nomeArq(m.nome, m.f, 'csv');
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  adicionarHistorico(m.nome, 'CSV', m.rows.length);
  showToast(`CSV do relatório de ${m.nome} baixado!`, 'success');
}

// ---------------------------------------------------------------
// 5. CURVA ABC — mesma base (itens do estoque e clientes dos pedidos)
// ---------------------------------------------------------------
function gerarMovimentos() {
  const rnd = criarRng(20261023);
  const [ha, hm, hd] = HOJE.split('-').map(Number);
  const out = [];
  COMPONENTES.forEach((c) => {
    if (!c.qtdMes) return;
    for (let m = 1; m <= hm; m++) {
      const maxDia = m === hm ? hd : new Date(ha, m, 0).getDate();
      const n = 2 + Math.floor(rnd() * 3);
      for (let i = 0; i < n; i++) {
        const dia = 1 + Math.floor(rnd() * maxDia);
        const qtd = Math.max(1, Math.round((c.qtdMes * (0.7 + rnd() * 0.6)) / n));
        out.push({ data: `${ha}-${p2(m)}-${p2(dia)}`, codigo: c.codigo, qtd });
      }
    }
  });
  return out;
}
function gerarPedidos() { return PEDIDOS; } // não gera mais dados fictícios

function carregarBaseABC() {
  const itens = lerBase('itens', ITENS_SEED);
  COMPONENTES.length = 0;
  itens.forEach((i) => COMPONENTES.push({
    codigo: i.codigo, descricao: i.descricao, categoria: i.categoria || '—', unidade: i.unidade || 'un',
    custo: Number(i.custo) || 0, qtdMes: Number(i.consumoMes) || 0,
  }));

  const pedidos = lerBase('pedidos', PEDIDOS_SEED);
  PEDIDOS.length = 0;
  pedidos.forEach((p) => PEDIDOS.push({ data: p.dataPedido, cliente: p.cliente, valor: Number(p.valor) || 0 }));
  CLIENTES.length = 0;
  [...new Set(pedidos.map((p) => p.cliente))].forEach((nome) => {
    const p = pedidos.find((x) => x.cliente === nome);
    CLIENTES.push({ nome, segmento: p.segmento || '—', cidade: p.cidade || '—', valorMes: 0 });
  });

  MOVIMENTOS.length = 0;
  const codigos = new Set(COMPONENTES.map((c) => c.codigo));
  const reais = lerBase('movimentos', null);
  (reais ? reais.filter((mv) => codigos.has(mv.codigo)) : gerarMovimentos()).forEach((mv) => MOVIMENTOS.push(mv));
}

function presetParaDatas(preset) {
  const [a, m, d] = HOJE.split('-').map(Number);
  if (preset === 'ano') return [`${a}-01-01`, `${a}-12-31`];
  if (preset === 'mes') return [`${a}-${p2(m)}-01`, HOJE];
  const ini = new Date(a, m - 1, d);
  ini.setDate(ini.getDate() - (preset === '180' ? 180 : Number(preset)));
  return [`${ini.getFullYear()}-${p2(ini.getMonth() + 1)}-${p2(ini.getDate())}`, HOJE];
}

function resumoCardABC() {
  const comp = calcularABC({ ...ABC_PADRAO, modo: 'componentes' });
  const cli = calcularABC({ ...ABC_PADRAO, modo: 'clientes' });
  document.getElementById('abcCardA').textContent = comp.resumo.A.n;
  document.getElementById('abcCardTotal').textContent = fmtCompacto(comp.total);
  document.getElementById('abcCardCli').textContent = cli.resumo.A.n;
}

// ---------------------------------------------------------------
// 6. CARDS (números reais da base) + REAÇÃO AOS FILTROS
// ---------------------------------------------------------------
function setStats(tipo, valores) {
  const btn = document.querySelector(`.btn-export[data-tipo="${tipo}"]`);
  const card = btn && btn.closest('.relatorio-card');
  if (!card) return;
  card.querySelectorAll('.mini-stat .valor').forEach((el, i) => { if (valores[i] != null) el.textContent = valores[i]; });
}

function atualizarCards() {
  const col = (m, nome) => m.def.cols.findIndex((c) => c[0] === nome);
  const prod = montarRelatorio('producao', false);
  const ativas = prod.raw.filter((r) => !['Concluído', 'Cancelado'].includes(r[7]));
  const media = prod.raw.length ? prod.raw.reduce((s, r) => s + r[3], 0) / prod.raw.length : 0;
  setStats('producao', [ativas.length, fmtInt(prod.raw.reduce((s, r) => s + r[2], 0)), fmtPct(media * 100, 0)]);

  const ped = montarRelatorio('pedidos', false);
  const atrasosPed = ped.raw.filter((r) => r[7] !== 'Concluído' && r[6] < HOJE).length;
  setStats('pedidos', [ped.raw.length, fmtCompacto(ped.raw.reduce((s, r) => s + r[4], 0)), atrasosPed]);

  const log = montarRelatorio('logistica', false);
  setStats('logistica', [log.raw.length, log.raw.filter((r) => r[6] === 'Em rota').length, log.raw.filter((r) => r[6] !== 'Entregue' && r[5] < HOJE).length]);

  const est = montarRelatorio('estoque', false);
  const cont = { Normal: 0, Baixo: 0, 'Crítico': 0 };
  est.raw.forEach((r) => { cont[r[8]]++; });
  const ch = window.Chart && Chart.getChart('chartEstoque');
  if (ch) { ch.data.datasets[0].data = [cont.Normal, cont.Baixo, cont['Crítico']]; ch.update(); }
  const leg = document.querySelectorAll('.donut-legenda span');
  ['Normal', 'Baixo', 'Crítico'].forEach((k, i) => { if (leg[i]) leg[i].lastChild.textContent = `${k} · ${cont[k]}`; });

  const totalReg = prod.raw.length + ped.raw.length + est.raw.length + log.raw.length + DESEMP.linhas.length;
  setStats('consolidado', [5, totalReg, '100%']);
}

// ---------------------------------------------------------------
// 7. INICIALIZAÇÃO (dados antes do DOM; DOM depois do init inline)
// ---------------------------------------------------------------
carregarBaseABC();
reconstruirPreview();
(function () {
  const [i, f] = presetParaDatas('ano');
  ABC_PADRAO.ini = i; ABC_PADRAO.fim = f;
  ABC.ini = i; ABC.fim = f;
})();

document.addEventListener('DOMContentLoaded', function () {
  atualizarCards();
  ['filtro-data-inicio', 'filtro-data-fim', 'filtro-setor', 'filtro-status'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', function () {
      reconstruirPreview();
      renderizarPreview(document.getElementById('previewTipo').value);
    });
  });
});