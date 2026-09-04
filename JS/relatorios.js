/* ================================================================
   RELATÓRIOS - LÓGICA COMPLETA
   ================================================================ */

// ================================================================
// 1. DADOS DE EXEMPLO (com datas no formato BR padronizado)
// ================================================================
const DADOS_PREVIEW = {
  pedidos: {
    colunas: ['Nº Pedido', 'Cliente', 'Produto', 'Qtd.', 'Data Pedido', 'Data Entrega', 'Status'],
    linhas: [
      ['PED-2026-001', 'Metalúrgica São João', 'Flange Aço 1020', '500', '05/08/2026', '20/08/2026', 'Concluído'],
      ['PED-2026-002', 'Indústrias Aurora', 'Eixo Vazado 420mm', '120', '10/08/2026', '25/08/2026', 'Em andamento'],
      ['PED-2026-003', 'Peças & Cia Ltda', 'Suporte Estrutural', '80', '15/08/2026', '01/09/2026', 'Pendente'],
      ['PED-2026-004', 'Usina Metalúrgica Silva', 'Carcaca Bomba', '25', '18/08/2026', '28/08/2026', 'Em andamento'],
      ['PED-2026-005', 'Auto Peças Brasil', 'Parafuso M8', '5000', '20/08/2026', '05/09/2026', 'Pendente'],
    ]
  },
  producao: {
    colunas: ['Cód. OP', 'Produto', 'Qtd.', 'Setor', 'Data Início', 'Data Fim', 'Status'],
    linhas: [
      ['OP-2026-001', 'Flange Aço 1020', '500', 'Corte', '05/08/2026', '18/08/2026', 'Concluído'],
      ['OP-2026-002', 'Eixo Vazado 420mm', '120', 'Usinagem', '10/08/2026', '22/08/2026', 'Em andamento'],
      ['OP-2026-003', 'Suporte Estrutural', '80', 'Solda', '15/08/2026', '28/08/2026', 'Em andamento'],
      ['OP-2026-004', 'Carcaca Bomba', '25', 'Montagem', '18/08/2026', '30/08/2026', 'Pendente'],
    ]
  },
  estoque: {
    colunas: ['Cód. Item', 'Descrição', 'Qtd. Atual', 'Mínimo', 'Máximo', 'Status'],
    linhas: [
      ['MAT-001', 'Chapa Aço 3mm', '850', '100', '1000', 'Normal'],
      ['MAT-002', 'Luva Nitrílica', '45', '50', '500', 'Baixo'],
      ['MAT-003', 'Parafuso M8', '1200', '200', '2000', 'Normal'],
      ['MAT-004', 'Flange 1020', '12', '20', '200', 'Crítico'],
      ['MAT-005', 'Eixo Vazado', '8', '10', '100', 'Crítico'],
      ['MAT-006', 'Tinta Epóxi', '30', '20', '100', 'Normal'],
    ]
  },
  logistica: {
    colunas: ['Nº Rota', 'Motorista', 'Veículo', 'Destino', 'Saída', 'Previsão', 'Status'],
    linhas: [
      ['R-001', 'João Silva', 'ABC-1234', 'Importadora Global Insumos', '05/08/2026', '20/08/2026', 'Entregue'],
      ['R-002', 'Marcos Souza', 'XYZ-5678', 'Rolamentos & Cia Indústria', '10/08/2026', '25/08/2026', 'Em rota'],
      ['R-003', 'Ana Paula Rocha', 'JKL-9012', 'Metalúrgica Silva Ltda ', '15/08/2026', '22/08/2026', 'Em rota'],
      ['R-004', 'Carlos Lima', 'ABC-1234', 'Ferramentas & Moldes Brasil', '18/08/2026', '28/08/2026', 'Pendente'],
    ]
  },
  desempenho: {
    colunas: ['Métrica', 'Produção', 'Qualidade', 'Logística', 'Almoxarifado', 'Comercial'],
    linhas: [
      ['OEE (%)', '82', '76', '90', '70', '65'],
      ['Produtividade', '94%', '88%', '92%', '78%', '85%'],
      ['Gargalo', '0', '1', '0', '2', '0'],
    ]
  }
};

// ================================================================
// 2. ESTADO DO HISTÓRICO
// ================================================================
const HISTORICO_KEY = 'stocklog_historico_v1';
let historico = [];

function carregarHistorico() {
  try {
    const saved = localStorage.getItem(HISTORICO_KEY);
    historico = saved ? JSON.parse(saved) : [];
    if (historico.length === 0) {
      // Dados iniciais de exemplo
      const agora = new Date();
      const dataStr = formatarDataHora(agora);
      historico = [
        { id: 'h1', data: dataStr, usuario: 'Admin', tipo: 'Estoque', formato: 'PDF', registros: 6 },
        { id: 'h2', data: dataStr, usuario: 'Admin', tipo: 'Pedidos', formato: 'Excel', registros: 5 },
        { id: 'h3', data: dataStr, usuario: 'Admin', tipo: 'Produção', formato: 'PDF', registros: 4 },
      ];
      salvarHistorico();
    }
  } catch (e) {
    historico = [];
  }
  renderizarHistorico();
}

function salvarHistorico() {
  localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico));
}

function formatarDataHora(data) {
  const d = data || new Date();
  const dia = String(d.getDate()).padStart(2,'0');
  const mes = String(d.getMonth()+1).padStart(2,'0');
  const ano = d.getFullYear();
  const hora = String(d.getHours()).padStart(2,'0');
  const min = String(d.getMinutes()).padStart(2,'0');
  const seg = String(d.getSeconds()).padStart(2,'0');
  return `${dia}/${mes}/${ano} ${hora}:${min}:${seg}`;
}

function adicionarHistorico(tipo, formato, registros) {
  const now = new Date();
  const dataStr = formatarDataHora(now);
  const usuario = 'Admin'; // Poderia ser dinâmico
  const novo = {
    id: 'h' + Date.now().toString(36),
    data: dataStr,
    usuario: usuario,
    tipo: tipo,
    formato: formato,
    registros: registros
  };
  historico.unshift(novo);
  if (historico.length > 50) historico.pop();
  salvarHistorico();
  renderizarHistorico();
}

function renderizarHistorico() {
  const area = document.getElementById('logArea');
  if (historico.length === 0) {
    area.innerHTML = '<div class="empty">Nenhum download registrado nesta sessão ainda.</div>';
    return;
  }
  area.innerHTML = historico.map(item => `
    <div class="linha">
      <span class="hora"><i class="far fa-clock"></i> ${item.data}</span>
      <span class="usuario"><i class="fas fa-user"></i> ${item.usuario}</span>
      <span class="descricao">
        <strong>${item.tipo}</strong> gerado em <strong>${item.formato}</strong>
      </span>
      <span class="registros">${item.registros} registros</span>
      <button class="btn-redownload" data-id="${item.id}" title="Re-baixar este arquivo">
        <i class="fas fa-download"></i> Baixar novamente
      </button>
    </div>
  `).join('');

  // Eventos de re-download
  area.querySelectorAll('.btn-redownload').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = this.dataset.id;
      const item = historico.find(h => h.id === id);
      if (item) {
        showToast(`Re-baixando: ${item.tipo} (${item.formato})`, 'success');
        // Simula re-download
        setTimeout(() => {
          showToast(`Arquivo ${item.tipo}.${item.formato.toLowerCase()} baixado novamente!`, 'success');
        }, 800);
      }
    });
  });
}

// ================================================================
// 3. PRÉ-VISUALIZAÇÃO
// ================================================================
function renderizarPreview(tipo) {
  const dados = DADOS_PREVIEW[tipo];
  if (!dados) return;

  // Cabeçalho
  const thead = document.getElementById('previewThead');
  thead.innerHTML = `<tr>${dados.colunas.map(c => `<th>${c}</th>`).join('')}</tr>`;

  // Corpo
  const tbody = document.getElementById('previewTbody');
  tbody.innerHTML = dados.linhas.map(linha => {
    const cells = linha.map((valor, idx) => {
      // Aplica status tags nas colunas de Status
      if (idx === dados.colunas.length - 1) {
        let cls = 'info';
        if (valor === 'Concluído' || valor === 'Entregue') cls = 'ok';
        else if (valor === 'Pendente') cls = 'warn';
        else if (valor === 'Crítico' || valor === 'Baixo') cls = 'bad';
        else if (valor === 'Em andamento' || valor === 'Em rota') cls = 'info';
        return `<td><span class="status-tag ${cls}">${valor}</span></td>`;
      }
      return `<td>${valor}</td>`;
    });
    return `<tr>${cells.join('')}</tr>`;
  }).join('');

  // Atualiza contador
  document.getElementById('previewContador').textContent = `${dados.linhas.length} registros`;
}

// ================================================================
// 4. TABS
// ================================================================
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const target = document.getElementById('tab-' + this.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

// ================================================================
// 5. EXPORTAÇÃO (PDF, Excel, CSV)
// ================================================================
function getDadosParaExportar(tipo) {
  const dados = DADOS_PREVIEW[tipo];
  if (!dados) return null;
  return {
    headers: dados.colunas,
    rows: dados.linhas,
    nome: tipo.charAt(0).toUpperCase() + tipo.slice(1)
  };
}

function exportarPDF(tipo) {
  const data = getDadosParaExportar(tipo);
  if (!data) return;
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'pt', 'a4');
  
  // Título
  doc.setFontSize(16);
  doc.setTextColor(10, 31, 51);
  doc.text(`Relatório de ${data.nome} - StockLog`, 40, 50);
  doc.setFontSize(10);
  doc.setTextColor(123, 146, 178);
  doc.text(`Gerado em: ${formatarDataHora(new Date())}`, 40, 68);
  doc.line(40, 78, 560, 78);
  
  // Tabela
  doc.autoTable({
    head: [data.headers],
    body: data.rows,
    startY: 90,
    margin: { left: 40, right: 40 },
    styles: { fontSize: 10, cellPadding: 6, textColor: [10, 31, 51] },
    headStyles: { fillColor: [0, 107, 179], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 250, 255] },
  });
  
  const nomeArquivo = `Relatorio_${data.nome}_${new Date().toISOString().slice(0,10)}.pdf`;
  doc.save(nomeArquivo);
  
  adicionarHistorico(data.nome, 'PDF', data.rows.length);
  showToast(`PDF do relatório de ${data.nome} baixado!`, 'success');
}

function exportarExcel(tipo) {
  const data = getDadosParaExportar(tipo);
  if (!data) return;
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');
  
  const nomeArquivo = `Relatorio_${data.nome}_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);
  
  adicionarHistorico(data.nome, 'Excel', data.rows.length);
  showToast(`Excel do relatório de ${data.nome} baixado!`, 'success');
}

function exportarCSV(tipo) {
  const data = getDadosParaExportar(tipo);
  if (!data) return;
  
  // Cria conteúdo CSV
  const headers = data.headers.join(';');
  const rows = data.rows.map(row => row.join(';')).join('\n');
  const csv = headers + '\n' + rows;
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Relatorio_${data.nome}_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  
  adicionarHistorico(data.nome, 'CSV', data.rows.length);
  showToast(`CSV do relatório de ${data.nome} baixado!`, 'success');
}

// ================================================================
// 6. TOAST
// ================================================================
function showToast(mensagem, tipo = 'info') {
  const toast = document.getElementById('toast');
  const texto = document.getElementById('toastTexto');
  const icon = toast.querySelector('i');
  
  texto.textContent = mensagem;
  toast.className = 'toast';
  if (tipo === 'success') {
    toast.classList.add('success');
    icon.className = 'fas fa-check-circle';
  } else if (tipo === 'error') {
    toast.classList.add('error');
    icon.className = 'fas fa-exclamation-circle';
  } else {
    icon.className = 'fas fa-info-circle';
  }
  
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ================================================================
// 7. GRÁFICOS (Chart.js)
// ================================================================
function initGraficos() {
  const C = {
    teal:    "#1f8a7e",
    sand:    "#c17d2e",
    slate:   "#34517a",
    neutral: "#2f6fb0",
    rose:    "#c0454f",
    primary: "#006bb3",
    green:   "#2f9e5c",
  };
  const LABELS_MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  function mkLine(id, color, data) {
    const el = document.getElementById(id);
    if (!el) return;
    new Chart(el.getContext("2d"), {
      type: "line",
      data: {
        labels: LABELS_MESES,
        datasets: [{
          data,
          borderColor: color,
          backgroundColor: color + "22",
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: color,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false }, 
          tooltip: { 
            enabled: true,
            callbacks: {
              label: function(context) {
                return context.parsed.y;
              }
            }
          } 
        },
        scales: {
          x: { display: false },
          y: { display: false, beginAtZero: true },
        },
      },
    });
  }

  function mkDonut(id) {
    const el = document.getElementById(id);
    if (!el) return;
    new Chart(el.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Normal", "Baixo", "Crítico"],
        datasets: [{
          data: [3, 1, 2],
          backgroundColor: [C.slate, C.sand, C.rose],
          borderColor: "#ffffff",
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: { 
          legend: { display: false }, 
          tooltip: { 
            enabled: true,
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.parsed + ' itens';
              }
            }
          } 
        },
      },
    });
  }

  function mkBar(id) {
    const el = document.getElementById(id);
    if (!el) return;
    new Chart(el.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Prod.", "Qual.", "Log.", "Alm.", "Com."],
        datasets: [{
          data: [82, 76, 90, 70, 65],
          backgroundColor: [C.teal, C.slate, C.primary, C.sand, C.neutral],
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false }, 
          tooltip: { 
            enabled: true,
            callbacks: {
              label: function(context) {
                return context.parsed.y + '%';
              }
            }
          } 
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 }, color: "#7b92b2" },
          },
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: "rgba(0,40,80,0.06)" },
            ticks: {
              font: { size: 9 },
              color: "#7b92b2",
              callback: (v) => v + "%",
            },
          },
        },
      },
    });
  }

  mkLine("sparkProducao",  C.teal,    [62, 65, 68, 70, 74, 76, 80, 82, 85, 86, 90, 92]);
  mkLine("sparkPedidos",   C.sand,    [12, 14, 13, 15, 16, 18, 17, 20, 19, 22, 21, 23]);
  mkLine("sparkLogistica", C.neutral, [4, 3, 5, 4, 6, 5, 7, 6, 5, 4, 5, 5]);
  mkDonut("chartEstoque");
  mkBar("chartDesempenho");
}

// ================================================================
// 8. INICIALIZAÇÃO
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
  // Tabs
  initTabs();
  
  // Histórico
  carregarHistorico();
  
  // Preview inicial (Pedidos)
  const previewSelect = document.getElementById('previewTipo');
  renderizarPreview(previewSelect.value);
  
  // Mudança no seletor de preview
  previewSelect.addEventListener('change', function() {
    renderizarPreview(this.value);
  });
  
  // Botões de exportação da pré-visualização
  document.getElementById('previewExportPdf').addEventListener('click', function() {
    const tipo = document.getElementById('previewTipo').value;
    exportarPDF(tipo);
  });
  document.getElementById('previewExportExcel').addEventListener('click', function() {
    const tipo = document.getElementById('previewTipo').value;
    exportarExcel(tipo);
  });
  document.getElementById('previewExportCsv').addEventListener('click', function() {
    const tipo = document.getElementById('previewTipo').value;
    exportarCSV(tipo);
  });
  
  // Botões de exportação nos cards
  document.querySelectorAll('.btn-export[data-tipo]').forEach(btn => {
    btn.addEventListener('click', function() {
      const tipo = this.dataset.tipo;
      const formato = this.dataset.formato;
      if (tipo === 'consolidado') {
        // Simula consolidado
        showToast('Relatório consolidado em PDF gerado!', 'success');
        adicionarHistorico('Consolidado', 'PDF', 27);
        return;
      }
      if (formato === 'pdf') exportarPDF(tipo);
      else if (formato === 'excel') exportarExcel(tipo);
      else if (formato === 'csv') exportarCSV(tipo);
    });
  });
  
  // Gerar todos
  document.getElementById('gerarTodosBtn').addEventListener('click', function() {
    const tipos = ['producao', 'pedidos', 'estoque', 'logistica', 'desempenho'];
    let total = 0;
    tipos.forEach(t => {
      const data = DADOS_PREVIEW[t];
      if (data) total += data.linhas.length;
    });
    showToast(`Consolidado com ${total} registros gerado em PDF!`, 'success');
    adicionarHistorico('Consolidado', 'PDF', total);
  });
  
  // Limpar histórico
  document.getElementById('limparHistoricoBtn').addEventListener('click', function() {
    if (confirm('Limpar todo o histórico de downloads?')) {
      historico = [];
      salvarHistorico();
      renderizarHistorico();
      showToast('Histórico limpo.', 'info');
    }
  });
  
  // Gráficos
  initGraficos();
});
