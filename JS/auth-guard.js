/**
 * StockLog - Guardião de Autenticação e Autorização
 * Verifica se o usuário está logado e se possui a permissão necessária para a página atual.
 */

(function() {
    "use strict";

    const LOGIN_PAGE = "login.html";
    const DASHBOARD_PAGE = "index.html";

    // Mapeamento de permissões por página
    const PAGE_PERMISSIONS = {
        "index.html": ["Gestão", "Produção", "Logística", "Estoque"],
        "calendario.html": ["Gestão", "Produção", "Logística", "Estoque"],
        "pedidos.html": ["Gestão", "Produção"],
        "producao.html": ["Gestão", "Produção"],
        "ajuda_producao.html": ["Gestão", "Produção"],
        "kanban.html": ["Gestão", "Produção", "Estoque"],
        "qr.html": ["Gestão", "Produção", "Estoque"],
        "itens.html": ["Gestão", "Produção", "Estoque"],
        "logistica.html": ["Gestão", "Logística"],
        "rastreamento.html": ["Gestão", "Logística"],
        "fornecedores.html": ["Gestão", "Logística"],
        "relatorios.html": ["Gestão", "Produção", "Logística", "Estoque"],
        "cadastro.html": ["Gestão"],
        "perfil.html": ["Gestão", "Produção", "Logística", "Estoque"],
    };

    function checkAuth() {
        const userSession = JSON.parse(sessionStorage.getItem('usuarioLogado') || '{}');
        const currentFile = window.location.pathname.split("/").pop() || "index.html";

        // 1. Se não estiver logado, redireciona para login (exceto se já estiver na página de login ou cadastro)
        if (!userSession.uid) {
            if (currentFile !== LOGIN_PAGE && currentFile !== "cadastro.html") {
                window.location.href = LOGIN_PAGE;
            }
            return;
        }

        // 2. Se estiver logado, verifica a permissão para a página atual
        const allowedRoles = PAGE_PERMISSIONS[currentFile];
        if (allowedRoles) {
            if (allowedRoles.indexOf(userSession.area) === -1) {
                alert("Você não tem permissão para acessar esta página.");
                window.location.href = DASHBOARD_PAGE;
            }
        }
    }

    // Executa a verificação imediatamente
    checkAuth();

    // Expõe para que outras páginas possam forçar a verificação se necessário
    window.checkAuth = checkAuth;
})();
