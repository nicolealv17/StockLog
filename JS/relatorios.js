/* ================================================================
   RELATÓRIOS · StockLog
   - Gerencia filtros, abas e preview
   - Gera downloads REAIS de PDF (jsPDF + AutoTable) e Excel (SheetJS)
   - Mantém histórico da sessão
   ================================================================ */
(function () {
  "use strict";

  /* ============================================================
     1. DADOS DE EXEMPLO (substitua futuramente por fetch da API)
     ============================================================ */
  const DADOS = {
    producao: [
      { op: "OP-2026-001", item: "Flange Aço ABNT 1020 ø50mm", setor: "Produção",     qtd: 500,  unidade: "pç",  operador: "Gustavo",  status: "Em Produção",  dataInicio: "2026-08-01", dataFim: "2026-08-30" },
      { op: "OP-2026-002", item: "Eixo Vazado 420mm",          setor: "Produção",     qtd: 120,  unidade: "pç",  operador: "Ana Ferre", status: "Controle QA",  dataInicio: "2026-08-05", dataFim: "2026-08-25" },
      { op: "OP-2026-003", item: "Tampa Inox 304 polida",       setor: "Qualidade",    qtd: 300,  unidade: "pç",  operador: "Bruno P.",  status: "Concluído",    dataInicio: "2026-07-15", dataFim: "2026-08-10" },
      { op: "OP-2026-004", item: "Parafuso M16 x 80mm",         setor: "Produção",     qtd: 5000, unidade: "un",  operador: "Vinícius",  status: "Em Produção",  dataInicio: "2026-08-12", dataFim: "2026-09-02" },
      { op: "OP-2026-005", item: "Chapa Inox 304 2mm",          setor: "Almoxarifado", qtd: 80,   unidade: "kg",  operador: "Ricardo",   status: "Pendente",     dataInicio: "2026-08-18", dataFim: "2026-08-28" },
      { op: "OP-2026-006", item: "Luva Nitrílica M",            setor: "Almoxarifado", qtd: 1200, unidade: "par", operador: "Carla M.",  status: "Cancelado",    dataInicio: "2026-07-20", dataFim: "2026-08-05" },
    ],

    pedidos: [
      { id: "PED-1042", cliente: "Metalúrgica São João",  item: "Flange ø50mm",     qtd: 500, valor: "R$ 12.500,00", dataPedido: "2026-08-05", dataEntrega: "2026-08-25", status: "Atrasado",     prioridade: "Alta" },
      { id: "PED-1043", cliente: "Indústria Aurora",      item: "Eixo 420mm",      qtd: 120, valor: "R$ 8.900,00",  dataPedido: "2026-08-07", dataEntrega: "2026-08-26", status: "Em Produção",  prioridade: "Média" },
      { id: "PED-1044", cliente: "Construções Borges",    item: "Tampa Inox 304",  qtd: 300, valor: "R$ 5.400,00",  dataPedido: "2026-08-10", dataEntrega: "2026-08-30", status: "Concluído",    prioridade: "Baixa" },
      { id: "PED-1045", cliente: "Engenharia Nova Era",   item: "Parafuso M16",    qtd: 5000, valor: "R$ 2.750,00", dataPedido: "2026-08-12", dataEntrega: "2026-09-02", status: "Em Produção",  prioridade: "Alta" },
      { id: "PED-1046", cliente: "AutoPeças Central",     item: "Luva Nitrílica",  qtd: 1200, valor: "R$ 1.380,00", dataPedido: "2026-08-15", dataEntrega: "2026-08-28", status: "Pendente",     prioridade: "Média" },
      { id: "PED-1047", cliente: "Caldeiraria Progresso", item: "Chapa Inox 304",  qtd: 80,   valor: "R$ 9.600,00", dataPedido: "2026-08-18", dataEntrega: "2026-09-05", status: "Em Transporte", prioridade: "Alta" },
    ],

    estoque: [
      { codigo: "EST-001", item: "Chapa Inox 304 2mm",  categoria: "Matéria-prima", qtdAtual: 12,  qtdMin: 50,  qtdMax: 200, unidade: "kg", localizacao: "A1-P3", status: "Crítico" },
      { codigo: "EST-002", item: "Flange Aço ABNT 1020", categoria: "Insumo",       qtdAtual: 480, qtdMin: 100, qtdMax: 1000, unidade: "pç", localizacao: "B2-P1", status: "Normal" },
      { codigo: "EST-003", item: "Parafuso M16 x 80mm",  categoria: "Insumo",       qtdAtual: 4500,qtdMin: 1000,qtdMax: 8000, unidade: "un", localizacao: "C1-P5", status: "Normal" },
      { codigo: "EST-004", item: "Luva Nitrílica M",     categoria: "EPI",          qtdAtual: 35,  qtdMin: 100, qtdMax: 500,  unidade: "par", localizacao: "D3-P2", status: "Crítico" },
      { codigo: "EST-005", item: "Tinta Epóxi Cinza",    categoria: "Acabamento",   qtdAtual: 18,  qtdMin: 20,  qtdMax: 80,   unidade: "L",  localizacao: "E1-P4", status: "Baixo" },
      { codigo: "EST-006", item: "Eixo Vazado 420mm",    categoria: "Insumo",       qtdAtual: 90,  qtdMin: 50,  qtdMax: 300,  unidade: "pç", localizacao: "B2-P7", status: "Normal" },
    ],

    logistica: [
      { rota: "RT-001", origem: "CD São Paulo",   destino: "Cliente - MG",     motorista: "José S.",  veiculo: "Caminhão 3/4", saida: "2026-08-20 08:00", previsao: "2026-08-21 14:00", status: "Entregue" },
      { rota: "RT-002", origem: "CD São Paulo",   destino: "Cliente - SP",     motorista: "Marcos L.", veiculo: "Van",           saida: "2026-08-22 07:30", previsao: "2026-08-22 18:00", status: "Em rota" },
      { rota: "RT-003", origem: "CD São Paulo",   destino: "Cliente - RJ",     motorista: "Pedro A.",  veiculo: "Carreta",       saida: "2026-08-23 06:00", previsao: "2026-08-24 20:00", status: "Atrasado" },
      { rota: "RT-004", origem: "CD São Paulo",   destino: "Cliente - RS",     motorista: "Carlos E.", veiculo: "Caminhão Toco", saida: "2026-08-25 05:00", previsao: "2026-08-27 12:00", status: "Programado" },
      { rota: "RT-005", origem: "CD São Paulo",   destino: "Cliente - PR",     motorista: "Ronaldo B.", veiculo: "Van",          saida: "2026-08-26 08:00", previsao: "2026-08-26 17:00", status: "Em rota" },
    ],

    desempenho: [
      { setor: "Produção",     oee: "82%", produtividade: "94%", eficiencia: "88%", paradas: 4, ocorrencias: "Manutenção preventiva", periodo: "Ago/2026" },
      { setor: "Qualidade",    oee: "76%", produtividade: "88%", eficiencia: "91%", paradas: 2, ocorrencias: "Refugo fora do padrão",  periodo: "Ago/2026" },
      { setor: "Logística",    oee: "90%", produtividade: "95%", eficiencia: "93%", paradas: 1, ocorrencias: "Atraso em rota RT-003",   periodo: "Ago/2026" },
      { setor: "Almoxarifado", oee: "70%", produtividade: "82%", eficiencia: "85%", paradas: 3, ocorrencias: "Reposição emergencial",   periodo: "Ago/2026" },
      { setor: "Comercial",    oee: "65%", produtividade: "78%", eficiencia: "80%", paradas: 1, ocorrencias: "Sem ocorrências",         periodo: "Ago/2026" },
    ],
  };

  /* ============================================================
     2. CONFIGURAÇÃO DAS COLUNAS POR RELATÓRIO
     ============================================================ */
  const COLUNAS = {
    producao: [
      { key: "op",         label: "Cód. OP" },
      { key: "item",       label: "Item / Produto" },
      { key: "setor",      label: "Setor" },
      { key: "qtd",        label: "Qtd." },
      { key: "unidade",    label: "Un." },
      { key: "operador",   label: "Operador" },
      { key: "status",     label: "Status" },
      { key: "dataInicio", label: "Início" },
      { key: "dataFim",    label: "Prazo" },
    ],
    pedidos: [
      { key: "id",          label: "Pedido" },
      { key: "cliente",     label: "Cliente" },
      { key: "item",        label: "Item" },
      { key: "qtd",         label: "Qtd." },
      { key: "valor",       label: "Valor" },
      { key: "dataPedido",  label: "Data pedido" },
      { key: "dataEntrega", label: "Data entrega" },
      { key: "status",      label: "Status" },
      { key: "prioridade",  label: "Prioridade" },
    ],
    estoque: [
      { key: "codigo",      label: "Código" },
      { key: "item",        label: "Item" },
      { key: "categoria",   label: "Categoria" },
      { key: "qtdAtual",    label: "Qtd. Atual" },
      { key: "qtdMin",      label: "Qtd. Mín." },
      { key: "qtdMax",      label: "Qtd. Máx." },
      { key: "unidade",     label: "Un." },
      { key: "localizacao", label: "Localização" },
      { key: "status",      label: "Status" },
    ],
    logistica: [
      { key: "rota",     label: "Rota" },
      { key: "origem",   label: "Origem" },
      { key: "destino",  label: "Destino" },
      { key: "motorista", label: "Motorista" },
      { key: "veiculo",  label: "Veículo" },
      { key: "saida",    label: "Saída" },
      { key: "previsao", label: "Previsão" },
      { key: "status",   label: "Status" },
    ],
    desempenho: [
      { key: "setor",         label: "Setor" },
      { key: "oee",           label: "OEE" },
      { key: "produtividade", label: "Produtividade" },
      { key: "eficiencia",    label: "Eficiência" },
      { key: "paradas",       label: "Paradas" },
      { key: "ocorrencias",   label: "Ocorrências" },
      { key: "periodo",       label: "Período" },
    ],
  };

  const TITULO_RELATORIO = {
    producao:    "Relatório de Produção",
    pedidos:     "Relatório de Pedidos",
    estoque:     "Relatório de Estoque",
    logistica:   "Relatório de Logística",
    desempenho:  "Relatório de Desempenho",
    consolidado: "Relatório Consolidado",
  };

  /* ============================================================
     3. HELPERS
     ============================================================ */
  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return document.querySelectorAll(sel); }

  function formatarData(date) {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  function agora() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
  }

  function lerFiltros() {
    return {
      dataInicio: $("#filtro-data-inicio").value || null,
      dataFim:    $("#filtro-data-fim").value    || null,
      setor:      $("#filtro-setor").value       || "todos",
      status:     $("#filtro-status").value      || "todos",
    };
  }

  function aplicarFiltros(dados, filtros) {
    return dados.filter(function (item) {
      // Filtro de data (campos candidatos: dataFim / dataEntrega / previsao / periodo)
      const dataItem =
        item.dataFim || item.dataEntrega || item.previsao || item.periodo || null;

      if (dataItem && (filtros.dataInicio || filtros.dataFim)) {
        // dataItem pode ser "DD/MM/YYYY HH:mm" ou "MMM/YYYY"
        const iso = converterDataISO(dataItem);
        if (iso) {
          if (filtros.dataInicio && iso < filtros.dataInicio) return false;
          if (filtros.dataFim    && iso > filtros.dataFim)    return false;
        }
      }

      // Filtro de setor
      if (filtros.setor !== "todos" && item.setor) {
        const mapa = {
          producao:     "Produção",
          qualidade:    "Qualidade",
          logistica:    "Logística",
          almoxarifado: "Almoxarifado",
          comercial:    "Comercial",
        };
        if (item.setor !== mapa[filtros.setor]) return false;
      }

      // Filtro de status
      if (filtros.status !== "todos" && item.status) {
        const mapa = {
          concluido:  ["Concluído", "Entregue"],
          andamento:  ["Em Produção", "Em Transporte", "Em rota"],
          pendente:   ["Pendente", "Programado"],
          cancelado:  ["Cancelado", "Atrasado"],
        };
        if (!mapa[filtros.status].includes(item.status)) return false;
      }

      return true;
    });
  }

  function converterDataISO(str) {
    // "DD/MM/YYYY HH:mm" → "YYYY-MM-DD"
    const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    // "MMM/YYYY" (sem dia) — converte para primeiro dia do mês
    const m2 = str.match(/^([A-Za-z]{3})\/(\d{4})$/);
    if (m2) {
      const meses = { jan:"01", fev:"02", mar:"03", abr:"04", mai:"05", jun:"06",
                      jul:"07", ago:"08", set:"09", out:"10", nov:"11", dez:"12" };
      const mm = meses[m2[1].toLowerCase()];
      if (mm) return `${m2[2]}-${mm}-01`;
    }
    // Já é ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
    return null;
  }

  function statusClass(status) {
    const s = (status || "").toLowerCase();
    if (s.includes("conclu") || s.includes("entregue") || s.includes("normal")) return "ok";
    if (s.includes("atras") || s.includes("cancel") || s.includes("crític"))  return "bad";
    if (s.includes("pend") || s.includes("program") || s.includes("baixo"))   return "warn";
    return "info";
  }

  /* ============================================================
     4. TOAST
     ============================================================ */
  let toastTimer = null;
  function toast(msg, erro) {
    const el = $("#toast");
    $("#toastTexto").textContent = msg;
    el.classList.toggle("error", !!erro);
    el.querySelector("i").className = erro
      ? "fas fa-exclamation-circle"
      : "fas fa-check-circle";
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 3500);
  }

  /* ============================================================
     5. HISTÓRICO
     ============================================================ */
  const historico = [];

  function registrarHistorico(tipo, formato, qtd) {
    historico.unshift({
      hora: agora(),
      tipo, formato, qtd,
    });
    renderHistorico();
  }

  function renderHistorico() {
    const area = $("#logArea");
    if (!historico.length) {
      area.innerHTML = '<div class="linha"><span class="hora">[—]</span><span>Nenhum download registrado nesta sessão ainda.</span></div>';
      return;
    }
    area.innerHTML = historico.map(function (h) {
      const icone = h.formato === "pdf" ? "fa-file-pdf" : "fa-file-excel";
      return (
        '<div class="linha">' +
          '<span class="hora">[' + h.hora + ']</span>' +
          '<span><i class="fas ' + icone + '" style="color: var(--primary); margin-right: 6px;"></i>' +
          '<strong>' + TITULO_RELATORIO[h.tipo] + '</strong> gerado em ' +
          h.formato.toUpperCase() + ' — ' + h.qtd + ' registros</span>' +
        '</div>'
      );
    }).join("");
  }

  $("#limparHistoricoBtn").addEventListener("click", function () {
    historico.length = 0;
    renderHistorico();
    toast("Histórico limpo");
  });

  /* ============================================================
     6. PRÉ-VISUALIZAÇÃO
     ============================================================ */
  function renderPreview() {
    const filtros = lerFiltros();
    // Mostra por padrão os pedidos (mais "gerais")
    const dadosFiltrados = aplicarFiltros(DADOS.pedidos, filtros);

    const colunas = COLUNAS.pedidos;
    $("#previewThead").innerHTML = "<tr>" +
      colunas.map(function (c) { return "<th>" + c.label + "</th>"; }).join("") +
      "</tr>";

    $("#previewTbody").innerHTML = dadosFiltrados.length
      ? dadosFiltrados.map(function (item) {
          return "<tr>" +
            colunas.map(function (c) {
              const valor = item[c.key] ?? "—";
              if (c.key === "status") {
                return '<td><span class="status-tag ' + statusClass(valor) + '">' + valor + "</span></td>";
              }
              return "<td>" + valor + "</td>";
            }).join("") +
            "</tr>";
        }).join("")
      : '<tr><td colspan="' + colunas.length + '" style="text-align: center; padding: 24px; color: var(--text-muted);">Nenhum registro encontrado com os filtros atuais.</td></tr>';

    $("#previewContador").textContent = dadosFiltrados.length + " registros";
  }

  /* ============================================================
     7. ABAS
     ============================================================ */
  $all(".tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $all(".tab").forEach(function (b) { b.classList.remove("active"); });
      $all(".tab-content").forEach(function (c) { c.classList.remove("active"); });
      btn.classList.add("active");
      $("#tab-" + btn.dataset.tab).classList.add("active");
      if (btn.dataset.tab === "preview") renderPreview();
      if (btn.dataset.tab === "historico") renderHistorico();
    });
  });

  /* ============================================================
     8. GERAÇÃO DE PDF  (jsPDF + AutoTable)
     ============================================================ */
  function gerarPDF(tipo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    const filtros = lerFiltros();
    const isConsolidado = tipo === "consolidado";
    const tipos = isConsolidado
      ? ["producao", "pedidos", "estoque", "logistica", "desempenho"]
      : [tipo];

    // Cabeçalho do PDF (capa)
    doc.setFillColor(0, 102, 179);
    doc.rect(0, 0, 297, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("StockLog", 14, 12);
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.text(isConsolidado ? "Relatório Consolidado" : TITULO_RELATORIO[tipo], 14, 20);

    doc.setTextColor(230, 240, 250);
    doc.setFontSize(9);
    doc.text("Gerado em: " + new Date().toLocaleString("pt-BR"), 200, 20);

    let yCursor = 38;

    tipos.forEach(function (t, idx) {
      if (idx > 0) {
        doc.addPage();
        yCursor = 20;
      }

      const dadosFiltrados = aplicarFiltros(DADOS[t], filtros);
      const colunas = COLUNAS[t];

      // Título da seção (em páginas múltiplas)
      if (isConsolidado) {
        doc.setTextColor(0, 102, 179);
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text(TITULO_RELATORIO[t], 14, yCursor);
        yCursor += 4;
      }

      doc.autoTable({
        startY: yCursor + 2,
        head: [colunas.map(function (c) { return c.label; })],
        body: dadosFiltrados.map(function (item) {
          return colunas.map(function (c) { return String(item[c.key] ?? "—"); });
        }),
        theme: "striped",
        headStyles: {
          fillColor: [0, 102, 179],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8.5,
          textColor: [10, 31, 51],
        },
        alternateRowStyles: { fillColor: [245, 250, 255] },
        margin: { left: 14, right: 14 },
        didDrawPage: function (data) {
          // Rodapé em cada página
          const pageCount = doc.internal.getNumberOfPages();
          const pageNum   = doc.internal.getCurrentPageInfo().pageNumber;
          doc.setFontSize(8);
          doc.setTextColor(123, 146, 178);
          doc.text(
            "Página " + pageNum + " de " + pageCount,
            data.settings.margin.left,
            doc.internal.pageSize.height - 8
          );
          doc.text(
            "Filtros: " + descreverFiltros(filtros),
            doc.internal.pageSize.width - 14,
            doc.internal.pageSize.height - 8,
            { align: "right" }
          );
        },
      });
    });

    const nomeArquivo =
      "stocklog_" + (isConsolidado ? "consolidado" : tipo) +
      "_" + new Date().toISOString().slice(0, 10) + ".pdf";

    doc.save(nomeArquivo);
    const total = isConsolidado
      ? Object.values(DADOS).reduce(function (s, arr) { return s + aplicarFiltros(arr, filtros).length; }, 0)
      : aplicarFiltros(DADOS[tipo], filtros).length;
    registrarHistorico(tipo, "pdf", total);
    toast("PDF gerado: " + nomeArquivo);
  }

  /* ============================================================
     9. GERAÇÃO DE EXCEL (SheetJS)
     ============================================================ */
  function gerarExcel(tipo) {
    const filtros = lerFiltros();
    const dadosFiltrados = aplicarFiltros(DADOS[tipo], filtros);
    const colunas = COLUNAS[tipo];

    // Cabeçalho com metadados (linhas 1-3) + tabela (a partir da linha 5)
    const wb = XLSX.utils.book_new();

    const linhasMeta = [
      ["StockLog — " + TITULO_RELATORIO[tipo]],
      ["Gerado em:", new Date().toLocaleString("pt-BR")],
      ["Filtros:", descreverFiltros(filtros)],
      [],
    ];

    const linhasTabela = [colunas.map(function (c) { return c.label; })]
      .concat(dadosFiltrados.map(function (item) {
        return colunas.map(function (c) { return item[c.key] ?? ""; });
      }));

    const linhasRodape = [[], ["Total de registros:", dadosFiltrados.length]];

    const sheet = XLSX.utils.aoa_to_sheet(
      linhasMeta.concat(linhasTabela).concat(linhasRodape)
    );

    // Ajusta largura das colunas
    sheet["!cols"] = colunas.map(function () { return { wch: 18 }; });

    // Mescla a primeira linha (título) em todas as colunas
    sheet["!merges"] = [{
      s: { r: 0, c: 0 },
      e: { r: 0, c: colunas.length - 1 },
    }];

    XLSX.utils.book_append_sheet(wb, sheet, TITULO_RELATORIO[tipo].slice(0, 30));

    const nomeArquivo = "stocklog_" + tipo + "_" + new Date().toISOString().slice(0, 10) + ".xlsx";
    XLSX.writeFile(wb, nomeArquivo);
    registrarHistorico(tipo, "excel", dadosFiltrados.length);
    toast("Excel gerado: " + nomeArquivo);
  }

  function descreverFiltros(f) {
    const partes = [];
    if (f.dataInicio) partes.push("de " + formatarData(new Date(f.dataInicio + "T00:00")));
    if (f.dataFim)    partes.push("até " + formatarData(new Date(f.dataFim    + "T00:00")));
    if (f.setor   !== "todos") partes.push("setor: " + f.setor);
    if (f.status  !== "todos") partes.push("status: " + f.status);
    return partes.length ? partes.join(" · ") : "sem filtros";
  }

  /* ============================================================
     10. EVENT LISTENERS
     ============================================================ */
  $all(".btn-export").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const tipo    = btn.dataset.tipo;
      const formato = btn.dataset.formato;
      try {
        if (formato === "pdf")   gerarPDF(tipo);
        else if (formato === "excel") gerarExcel(tipo);
      } catch (erro) {
        console.error(erro);
        toast("Erro ao gerar: " + erro.message, true);
      }
    });
  });

  $("#gerarTodosBtn").addEventListener("click", function () {
    try {
      gerarPDF("consolidado");
    } catch (erro) {
      console.error(erro);
      toast("Erro ao gerar consolidado: " + erro.message, true);
    }
  });

  // Re-renderiza preview ao mudar filtros
  $all("#filtro-data-inicio, #filtro-data-fim, #filtro-setor, #filtro-status")
    .forEach(function (el) {
      el.addEventListener("change", function () {
        if ($("#tab-preview").classList.contains("active")) renderPreview();
        atualizarPeriodoLabel();
      });
    });

  /* ============================================================
     11. INICIALIZAÇÃO
     ============================================================ */
  function atualizarPeriodoLabel() {
    const f = lerFiltros();
    let txt;
    if (f.dataInicio && f.dataFim) {
      txt = formatarData(new Date(f.dataInicio + "T00:00")) +
            " → " +
            formatarData(new Date(f.dataFim    + "T00:00"));
    } else if (f.dataInicio) {
      txt = "a partir de " + formatarData(new Date(f.dataInicio + "T00:00"));
    } else if (f.dataFim) {
      txt = "até " + formatarData(new Date(f.dataFim + "T00:00"));
    } else {
      txt = "Todo o período";
    }
    $("#periodoLabel").textContent = txt;
  }

  function init() {
    // Define datas padrão: últimos 30 dias
    const hoje = new Date();
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - 30);
    $("#filtro-data-inicio").value = inicio.toISOString().slice(0, 10);
    $("#filtro-data-fim").value    = hoje.toISOString().slice(0, 10);

    atualizarPeriodoLabel();
    renderPreview();
    renderHistorico();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
