/* =========================================================
   StockLog — Calendário Inteligente (VERSÃO PCP)
   ========================================================= */
const GOOGLE_CLIENT_ID = "SEU_CLIENT_ID_AQUI.apps.googleusercontent.com";
const GOOGLE_SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
let googleTokenClient = null;
let googleAccessToken = null;

const CAL_STORAGE = "stocklog_cal_v3";
const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAYS_PT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const MAX_EVENTS_PER_DAY = 3;

let calState = {
  events: [],
  view: "month",
  cursor: new Date(2026, 7, 1),
  selectedDate: null,
  type: "reuniao",
  activeFilter: "all"
};
let calSelectedDate = null;

function calLoad() {
  try {
    const saved = localStorage.getItem(CAL_STORAGE);
    calState.events = saved ? JSON.parse(saved) : calDefaultEvents();
    if (!saved) calSave();
  } catch (e) { calState.events = calDefaultEvents(); }
}
function calSave() { localStorage.setItem(CAL_STORAGE, JSON.stringify(calState.events)); }

function calDefaultEvents() {
  return [
    { id: "e1", title: "Reunião de alinhamento semanal", type: "reuniao", date: "2026-08-21", time: "09:00", duration: 60, setor: "Qualidade", desc: "Pauta: revisão de KPIs e alertas." },
    { id: "e2", title: "Treinamento POP-018 — Recepção de Insumos", type: "treinamento", date: "2026-08-24", time: "14:00", duration: 120, setor: "Estoque", desc: "Capacitação Almoxarifado." },
    { id: "e3", title: "🔴 Data Limite OP-2026-001 (Flange Aço)", type: "prazo-op", date: "2026-08-25", time: "18:00", duration: 0, setor: "Produção", desc: "Entrega final da OP-2026-001. 500 unidades." },
    { id: "e4", title: "Visita técnica fornecedor Inox do Brasil", type: "compromisso", date: "2026-08-27", time: "10:30", duration: 180, setor: "Compras", desc: "Levantar novos itens para cotação." },
    { id: "e5", title: "Auditoria interna — Qualidade", type: "urgente", date: "2026-08-28", time: "08:00", duration: 240, setor: "Qualidade", desc: "Atender auditores." },
    { id: "e6", title: "Treinamento WMS — Equipe Produção", type: "treinamento", date: "2026-08-30", time: "09:00", duration: 180, setor: "Produção", desc: "Capacitar 4 operadores." },
    { id: "e7", title: "🔴 Data Limite OP-2026-002 (Eixo Vazado)", type: "prazo-op", date: "2026-08-28", time: "18:00", duration: 0, setor: "Produção", desc: "Entrega final da OP-2026-002. 120 unidades." },
    { id: "e8", title: "🛠️ Manutenção Preventiva — Torno CNC 02", type: "manutencao", date: "2026-08-26", time: "07:00", duration: 480, setor: "Torno CNC 02", desc: "Troca de rolamentos e calibragem." },
    { id: "e9", title: "🔴 Data Limite OP-2026-003 (Suporte Estrutural)", type: "prazo-op", date: "2026-08-29", time: "18:00", duration: 0, setor: "Produção", desc: "Entrega final da OP-2026-003. 80 unidades." },
    { id: "e10", title: "🛠️ Manutenção Preventiva — Fresa CNC 05", type: "manutencao", date: "2026-08-27", time: "08:00", duration: 360, setor: "Fresa CNC 05", desc: "Substituição de ferramentas e revisão elétrica." },
  ];
}

function calPad(n) { return String(n).padStart(2, "0"); }
function calFmtISO(d) { return `${d.getFullYear()}-${calPad(d.getMonth()+1)}-${calPad(d.getDate())}`; }
function calFmtBR(iso) { const [y,m,d] = iso.split("-"); return `${d}/${m}/${y}`; }

function calRender() {
  document.getElementById("cal-month-label").textContent = `${MONTHS_PT[calState.cursor.getMonth()]} ${calState.cursor.getFullYear()}`;
  document.getElementById("cal-grid-month").style.display = calState.view === "month" ? "block" : "none";
  document.getElementById("cal-grid-week").style.display = calState.view === "week" ? "block" : "none";
  document.getElementById("cal-grid-day").style.display  = calState.view === "day"  ? "block" : "none";

  if (calState.view === "month") calRenderMonth();
  else if (calState.view === "week") calRenderWeek();
  else calRenderDay();

  calRenderKPIs();
  calRenderUpcoming();
}

function calFilteredEvents() {
  if (calState.activeFilter === "all") return calState.events;
  return calState.events.filter(e => e.type === calState.activeFilter);
}

function calRenderMonth() {
  const grid = document.getElementById("cal-grid-month");
  const year = calState.cursor.getFullYear();
  const month = calState.cursor.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());

  const todayIso = calFmtISO(new Date());
  const events = calFilteredEvents();
  let html = `<div class="cal-weekdays">`;
  WEEKDAYS_PT.forEach(w => html += `<div class="cal-weekday">${w}</div>`);
  html += `</div><div class="cal-days">`;

  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = calFmtISO(d);
    const outside = d.getMonth() !== month;
    const today = iso === todayIso;
    const dayEvents = events.filter(e => e.date === iso);
    const showEvents = dayEvents.slice(0, MAX_EVENTS_PER_DAY);
    const remaining = dayEvents.length - MAX_EVENTS_PER_DAY;

    const hasUrgent = dayEvents.some(e => e.type === "urgente" || e.type === "prazo-op");

    html += `<div class="cal-day ${outside ? "outside" : ""} ${today ? "today" : ""} ${hasUrgent && !outside ? "has-urgent" : ""}" onclick="calOpenDay('${iso}')">
      <div class="cal-day-num">${d.getDate()}</div>
      ${showEvents.map(e => `<div class="cal-evt type-${e.type}" title="${escapeHtml(e.title)}" onclick="event.stopPropagation(); calEdit('${e.id}')"><i class="fa-regular fa-clock" style="font-size:9px"></i> ${escapeHtml(e.time || "")} ${escapeHtml(e.title)}</div>`).join("")}
      ${remaining > 0 ? `<div class="cal-evt-more" onclick="event.stopPropagation(); calOpenDay('${iso}')"><i class="fa-solid fa-plus"></i> +${remaining} mais...</div>` : ""}
    </div>`;
  }
  html += `</div>`;
  grid.innerHTML = html;
}

function calRenderWeek() {
  const grid = document.getElementById("cal-grid-week");
  const start = new Date(calState.cursor);
  start.setDate(calState.cursor.getDate() - calState.cursor.getDay());
  const events = calFilteredEvents();

  let html = `<div class="cal-week-header">`;
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = calFmtISO(d);
    const dayEvents = events.filter(e => e.date === iso);
    html += `<div class="cal-week-col">
      <div class="cal-week-col-title">${WEEKDAYS_PT[d.getDay()]} ${calPad(d.getDate())}/${calPad(d.getMonth()+1)}</div>
      ${dayEvents.map(e => `<div class="cal-evt type-${e.type}" style="margin-bottom:6px" onclick="calEdit('${e.id}')">${escapeHtml(e.time || "")} ${escapeHtml(e.title)}</div>`).join("") || '<div style="font-size:11px;color:var(--text-muted);font-style:italic">sem compromissos</div>'}
    </div>`;
  }
  html += `</div>`;
  grid.innerHTML = html;
}

function calRenderDay() {
  const grid = document.getElementById("cal-grid-day");
  const iso = calFmtISO(calState.cursor);
  const dayEvents = calFilteredEvents().filter(e => e.date === iso);
  grid.innerHTML = `
    <div class="cal-week-col-title" style="font-size:14px;margin-bottom:14px">
      ${WEEKDAYS_PT[calState.cursor.getDay()]}, ${calState.cursor.getDate()} de ${MONTHS_PT[calState.cursor.getMonth()]} de ${calState.cursor.getFullYear()}
    </div>
    ${dayEvents.length === 0
      ? '<div style="text-align:center;color:var(--text-muted);padding:40px;font-style:italic">Nenhum compromisso nesta data.</div>'
      : dayEvents.map(e => `
        <div class="cal-side-item type-${e.type}" style="margin-bottom:10px;cursor:pointer" onclick="calEdit('${e.id}')">
          <div class="cal-side-item-title">${escapeHtml(e.title)}</div>
          <div class="cal-side-item-meta">
            <span><i class="fa-solid fa-clock"></i> ${e.time || "—"}</span>
            ${e.setor ? `<span><i class="fa-solid fa-industry"></i> ${escapeHtml(e.setor)}</span>` : ""}
          </div>
          ${e.desc ? `<div style="font-size:12px;color:var(--text-secondary);margin-top:6px">${escapeHtml(e.desc)}</div>` : ""}
        </div>`).join("")
    }`;
}

function calRenderKPIs() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const in7Days = new Date(today);
  in7Days.setDate(in7Days.getDate() + 7);

  const total = calState.events.length;
  const urgentes = calState.events.filter(e => e.type === "urgente").length;
  const semana = calState.events.filter(e => {
    const d = new Date(e.date + "T00:00:00");
    return d >= today && d <= in7Days;
  }).length;
  const prazos = calState.events.filter(e => e.type === "prazo-op" || e.type === "manutencao").length;

  document.getElementById("kpi-total").textContent = total;
  document.getElementById("kpi-urgentes").textContent = urgentes;
  document.getElementById("kpi-semana").textContent = semana;
  document.getElementById("kpi-prazos").textContent = prazos;
}

function calRenderUpcoming() {
  const list = document.getElementById("cal-upcoming-list");
  const today = calFmtISO(new Date());
  const items = calFilteredEvents()
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(a.date))
    .slice(0, 10);

  if (items.length === 0) {
    list.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:24px;font-style:italic">Nenhum compromisso futuro.</div>`;
    return;
  }
  list.innerHTML = items.map(e => {
    const [y, m, d] = e.date.split("-");
    const icon = e.type === "prazo-op" ? '🔴 ' : e.type === "manutencao" ? '🛠️ ' : '';
    return `
      <div class="upcoming-item" onclick="calEdit('${e.id}')">
        <div class="upcoming-date">
          <div class="day">${parseInt(d)}</div>
          <div class="month">${MONTHS_PT[parseInt(m)-1].slice(0,3)}</div>
        </div>
        <div class="upcoming-info">
          <div class="upcoming-title">${icon} ${escapeHtml(e.title)}</div>
          <div class="upcoming-meta">
            <span><i class="fa-solid fa-clock"></i> ${e.time || "—"}</span>
            <span><i class="fa-solid fa-industry"></i> ${escapeHtml(e.setor || "Geral")}</span>
          </div>
        </div>
        <span class="upcoming-tag tag-${e.type}">${e.type === "prazo-op" ? "Prazo OP" : e.type === "manutencao" ? "Manutenção" : e.type}</span>
      </div>`;
  }).join("");
}

function calFilterList(q) {
  q = q.toLowerCase();
  const items = document.querySelectorAll(".upcoming-item");
  items.forEach(it => {
    const title = it.querySelector(".upcoming-title").textContent.toLowerCase();
    it.style.display = title.includes(q) ? "flex" : "none";
  });
}

function calFilterType(type, btn) {
  calState.activeFilter = type;
  document.querySelectorAll(".cal-filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  calRender();
}

function calOpenDay(iso) {
  calSelectedDate = iso;
  const [y, m, d] = iso.split("-");
  document.getElementById("cal-side-date-label").textContent = `${parseInt(d)} de ${MONTHS_PT[parseInt(m)-1]} de ${y}`;
  const dayEvents = calFilteredEvents().filter(e => e.date === iso);
  const body = document.getElementById("cal-side-body");
  body.innerHTML = dayEvents.length === 0
    ? `<div style="text-align:center;color:var(--text-muted);padding:24px;font-style:italic">Nenhum compromisso.</div>`
    : dayEvents.map(e => `
        <div class="cal-side-item type-${e.type}" onclick="calEdit('${e.id}')" style="cursor:pointer">
          <div class="cal-side-item-title">${escapeHtml(e.title)}</div>
          <div class="cal-side-item-meta">
            <span><i class="fa-solid fa-clock"></i> ${e.time || "—"}</span>
            ${e.setor ? `<span><i class="fa-solid fa-industry"></i> ${escapeHtml(e.setor)}</span>` : ""}
          </div>
        </div>`).join("");
  document.getElementById("cal-side-panel").classList.add("open");
}

function calNavMonth(delta) { calState.cursor.setMonth(calState.cursor.getMonth() + delta); calRender(); }
function calGoToday() { calState.cursor = new Date(); calRender(); }
function calSetView(view, btn) {
  calState.view = view;
  document.querySelectorAll(".cal-view-btn").forEach(b => b.classList.remove("active");
  btn.classList.add("active");
  calRender();
}

function calSelectType(type, btn) {
  calState.type = type;
  document.querySelectorAll(".cal-type-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function calOpenNewEvent(dateIso = null) {
  document.getElementById("cal-evt-id").value = "";
  document.getElementById("cal-evt-titulo").value = "";
  document.getElementById("cal-evt-desc").value = "";
  document.getElementById("cal-evt-data").value = dateIso || calFmtISO(new Date());
  document.getElementById("cal-evt-hora").value = "09:00";
  document.getElementById("cal-evt-duracao").value = "60";
  document.getElementById("cal-evt-setor").value = "";
  calSelectType("reuniao", document.querySelector('.cal-type-btn[data-type="reuniao"]'));
  document.getElementById("cal-modal-title").innerHTML = '<i class="fa-solid fa-calendar-plus" style="color:var(--primary);margin-right:8px"></i>Novo compromisso';
  document.getElementById("cal-btn-delete").style.display = "none";
  document.getElementById("cal-google-badge").style.display = "none";
  openModal("calEvento");
}

function calEdit(id) {
  const e = calState.events.find(x => x.id === id);
  if (!e) return;
  document.getElementById("cal-evt-id").value = e.id;
  document.getElementById("cal-evt-titulo").value = e.title;
  document.getElementById("cal-evt-data").value = e.date;
  document.getElementById("cal-evt-hora").value = e.time || "09:00";
  document.getElementById("cal-evt-duracao").value = e.duration || 60;
  document.getElementById("cal-evt-setor").value = e.setor || "";
  document.getElementById("cal-evt-desc").value = e.desc || "";
  calSelectType(e.type, document.querySelector(`.cal-type-btn[data-type="${e.type}"]`));
  document.getElementById("cal-modal-title").innerHTML = '<i class="fa-solid fa-pen" style="color:var(--primary);margin-right:8px"></i>Editar compromisso';
  document.getElementById("cal-btn-delete").style.display = "inline-flex";
  document.getElementById("cal-google-badge").style.display = e.source === "google" ? "flex" : "none";
  document.getElementById("cal-side-panel").classList.remove("open");
  openModal("calEvento");
}

function calSaveEvent() {
  const id = document.getElementById("cal-evt-id").value;
  const title = document.getElementById("cal-evt-titulo").value.trim();
  const date = document.getElementById("cal-evt-data").value;
  if (!title || !date) { showToast("Preencha título e data.", "error"); return; }

  const data = {
    title,
    type: calState.type,
    date,
    time: document.getElementById("cal-evt-hora").value,
    duration: parseInt(document.getElementById("cal-evt-duracao").value),
    setor: document.getElementById("cal-evt-setor").value,
    desc: document.getElementById("cal-evt-desc").value.trim(),
  };

  if (id) {
    const e = calState.events.find(x => x.id === id);
    if (e) Object.assign(e, data);
    showToast("Compromisso atualizado.", "success");
  } else {
    calState.events.push({ id: "e" + Date.now().toString(36), ...data });
    showToast("Compromisso criado.", "success");
  }
  calSave();
  closeModal("calEvento");
  calRender();
}

function calDeleteEvent() {
  const id = document.getElementById("cal-evt-id").value;
  if (!id) return;
  if (!confirm("Excluir este compromisso?")) return;
  calState.events = calState.events.filter(e => e.id !== id);
  calSave();
  closeModal("calEvento");
  calRender();
  showToast("Compromisso excluído.", "warning");
}

function calImportGoogle() {
  if (GOOGLE_CLIENT_ID.includes("SEU_CLIENT_ID_AQUI")) { showToast("Configure o GOOGLE_CLIENT_ID no código antes de sincronizar.", "warning"); return; }
  if (typeof google === "undefined" || !google.accounts) { showToast("Biblioteca do Google ainda não carregou.", "error"); return; }
  if (!googleTokenClient) {
    googleTokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      callback: (resp) => {
        if (resp.error) { showToast("Não foi possível autenticarr.", "error"); return; }
        googleAccessToken = resp.access_token;
        calFetchGoogleEvents();
      },
    });
  }
  googleTokenClient.requestAccessToken({ prompt: googleAccessToken ? "" : "consent" });
}

async function calFetchGoogleEvents() {
  const btn = document.getElementById("cal-sync-btn");
  btn.disabled = true;
  showToast("Sincronizando com o Google Calendar...", "info");
  try {
    const timeMin = new Date(); timeMin.setMonth(timeMin.getMonth() - 1);
    const timeMax = new Date(); timeMax.setMonth(timeMax.getMonth() + 3);
    const params = new URLSearchParams({ timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString(), singleEvents: "true", orderBy: "startTime", maxResults: "250" });
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, { headers: { Authorization: `Bearer ${googleAccessToken}` } });
    if (res.status === 401) { googleAccessToken = null; throw new Error("Sessão expirada."); }
    if (!res.ok) throw new Error("Erro " + res.status);

    const data = await res.json();
    const imported = (data.items || []).map(ev => ({
      id: "g_" + ev.id,
      title: ev.summary || "(sem título)",
      type: "google",
      date: (ev.start.date || ev.start.dateTime || "").slice(0, 10),
      time: ev.start.dateTime ? ev.start.dateTime.slice(11, 16) : "",
      duration: 60,
      setor: "Geral",
      desc: ev.description || "",
      source: "google",
    })).filter(e => e.date);

    calState.events = calState.events.filter(e => e.source !== "google");
    calState.events.push(...imported);
    calSave();
    calRender();
    showToast(`${imported.length} compromisso(s) importado(s) do Google Calendar.`, "success");
  } catch (err) { console.error(err); showToast("Não foi possível sincronizar.", "error"); }
  finally { btn.disabled = false; }
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
}

function openModal(id) { document.getElementById("modal-" + id).classList.add("open"); }
function closeModal(id) { document.getElementById("modal-" + id).classList.remove("open"); }

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const icons = { success: "fa-circle-check", error: "fa-circle-exclamation", warning: "fa-triangle-exclamation", info: "fa-circle-info" };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || "fa-circle-info"}"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 3200);
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeModal("calEvento"); document.getElementById("cal-side-panel").classList.remove("open"); }
});

calLoad();
calRender();