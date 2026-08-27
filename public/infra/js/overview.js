import { api } from './api.js';
import { el, esc, setError, setEmpty, SEV_COLOR } from './ui.js';
import { open, renderSections, heading, note } from './modal.js';
import { renderIncidentBody, incidentSubtitle } from './incident.js';

/**
 * Overview tab — the composed, cross-source view. This is the page the
 * original single-file prototype showed, now assembled from three APIs
 * instead of three hard-coded arrays.
 */
export async function renderOverview(dashboard) {
  const [attention, actions, itsm, panels] = await Promise.all([
    api.itsm.attention(),
    api.ai.actions('?limit=14'),
    api.itsm.overview(),
    api.assist.panels()
  ]);

  renderHeader(dashboard);
  renderPriorityTiles(itsm.summary.counts);
  renderServices(dashboard.services, dashboard.summary.window);
  renderEnvNote(itsm.summary);
  renderAttention(attention.items);
  renderRisks(dashboard.risks);
  renderAiPanel(dashboard.ai, actions.actions);
  renderPriorities(dashboard.priorities);
  renderActionButtons(panels.panels);
  renderWaiting(itsm.summary.awaitingValidation);
}

/* ── Header and greeting ───────────────────────────────────── */
function renderHeader(d) {
  const s = d.summary;
  el('hdrEngineer').textContent = `${d.operator.name} · SRE II`;
  el('hdrAvail').textContent = s.availability ? `${s.availability.current}%` : '—';
  el('brandSub').textContent =
    `${d.operator.customer} · End-to-End Infrastructure Services · Day-in-the-life view`;

  el('greetLine').textContent =
    `Good morning, ${d.operator.name.split(' ')[0]} — your previous shift summary is ready.`;
  el('greetSub').innerHTML =
    `${s.agents.count} agents ran overnight · ${s.agents.autonomousActions} autonomous actions · `
    + `<b>${s.decisionsNeeded} items need your decision</b>`;

  const chips = [];
  for (const sla of s.slaAtRisk) {
    chips.push(`<span class="chip crit">${esc(sla.id)} · ${esc(sla.remaining)}</span>`);
  }
  if (s.agents.blocked) {
    chips.push(`<span class="chip warn">${s.agents.blocked} agent blocked on approval</span>`);
  }
  for (const slo of s.slosBreaching) {
    chips.push(`<span class="chip warn">${esc(slo.name)} ${esc(String(slo.current))}${esc(slo.unit)}</span>`);
  }
  el('greetChips').innerHTML = chips.join('');
}

/* ── Priority tiles ────────────────────────────────────────── */
function renderPriorityTiles(counts) {
  const order = [['P1', 'p1'], ['P2', 'p2'], ['P3', 'p3'], ['P4', 'p4']];
  el('prioTiles').innerHTML = order.map(([p, cls]) =>
    `<div class="tile ${cls}" data-priority="${p}" role="button" tabindex="0">
       <div class="n">${counts[p] ?? 0}</div><div class="t">${p}</div>
     </div>`).join('');

  el('prioTiles').querySelectorAll('.tile').forEach((tile) => {
    const show = () => openPriority(tile.dataset.priority);
    tile.addEventListener('click', show);
    tile.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } });
  });
}

async function openPriority(priority) {
  openAttentionId = null;
  try {
    const detail = await api.itsm.priority(priority);
    const body = detail.sections.map((s) => heading(s.heading) + esc(s.body)).join('')
      + (detail.note ? note(detail.note.tone, detail.note.text) : '');
    open({ title: detail.title, subtitle: 'Last shift 19:00–07:00', body, actions: [['no', 'Close']] });
  } catch (err) {
    open({ title: 'Unavailable', subtitle: priority, body: `<div class="errbox">${esc(err.message)}</div>`, actions: [['no', 'Close']] });
  }
}

/* ── Service rows ──────────────────────────────────────────── */
function renderServices(services, window) {
  el('envWindow').textContent = window?.label || '—';
  const cls = { healthy: 'ok', warning: 'deg', critical: 'crit', unknown: '' };
  const tone = { healthy: 'grn', warning: 'amb', critical: 'red', unknown: 'blu' };

  el('svcList').innerHTML = services.map((s) => {
    const extra = [];
    if (s.openIncidents.length) extra.push(`${s.openIncidents.length} open`);
    if (s.agentActions) extra.push(`${s.agentActions} agent actions`);
    return `<div class="svcrow ${cls[s.status]}">
      <div>
        <div class="nm">${esc(s.name)}</div>
        <div class="mt">${esc(s.description)}${extra.length ? ' · ' + esc(extra.join(' · ')) : ''}</div>
      </div>
      <span class="pill ${tone[s.status]}">${esc(s.statusLabel)}</span>
    </div>`;
  }).join('');
}

function renderEnvNote(summary) {
  const updated = new Date().toLocaleTimeString();
  el('envNote').innerHTML =
    `MTTA ${summary.mttaMinutes}m · MTTR ${summary.mttrMinutes}m · Auto-resolve rate <b>${summary.autoResolvedPct}%</b> (target 55%)`
    + ` <span style="color:var(--muted);font-size:11px">· updated ${esc(updated)}</span>`;
}

/* ── Attention list ────────────────────────────────────────── */
let currentAttentionItems = [];
let openAttentionId = null;

function renderAttention(items) {
  currentAttentionItems = items;
  paintAttention();
}

function paintAttention() {
  const items = currentAttentionItems;
  el('attnCount').textContent = `${items.length} open`;
  if (!items.length) return setEmpty(el('attnList'), 'Nothing needs a decision right now.');

  el('attnList').innerHTML = items.map((a, i) => `
    <div class="item" data-index="${i}" tabindex="0" role="button">
      <div class="hd">
        <div class="ttl">${esc(a.priority)} · ${esc(a.title)}</div>
        <span class="pill ${a.severity === 'critical' ? 'red' : 'amb'}">${a.severity === 'critical' ? 'Act now' : 'Review'}</span>
      </div>
      <div class="meta">
        <span>${esc(a.serviceName)}</span><span>${esc(a.slaRemaining || '—')}</span><span>${esc(a.id)}</span>
      </div>
      <div class="bar"><i style="width:${a.slaRiskPct}%;background:${SEV_COLOR[a.severity] || 'var(--amber)'}"></i></div>
    </div>`).join('');

  bindItems(el('attnList'), items, (item) => {
    openAttentionId = item.id;
    open({
      title: `${item.priority} · ${item.title}`,
      subtitle: incidentSubtitle(item),
      body: renderIncidentBody(item),
      actions: item.actions
    });
  });
}

/** Read (and clear) which attention item's modal is currently open, if any. */
export function consumeApprovedAttention() {
  const id = openAttentionId;
  openAttentionId = null;
  return id;
}

/** Drops a resolved ticket from the attention list without waiting for the next fetch. */
export function removeAttentionItem(id) {
  if (!currentAttentionItems.some((i) => i.id === id)) return;
  currentAttentionItems = currentAttentionItems.filter((i) => i.id !== id);
  paintAttention();
}

/* ── Risks ─────────────────────────────────────────────────── */
function renderRisks(risks) {
  if (!risks?.length) return setEmpty(el('riskList'), 'No predictive risks flagged.');

  el('riskList').innerHTML = risks.map((r, i) => `
    <div class="item" data-index="${i}" tabindex="0" role="button">
      <div class="hd">
        <div class="ttl">${esc(r.title)}</div>
        <span class="pill ${r.severity === 'critical' ? 'red' : 'amb'}">${r.severity === 'critical' ? 'Critical' : 'Elevated'}</span>
      </div>
      <div class="meta"><span>${esc(r.subtitle)}</span></div>
    </div>`).join('');

  bindItems(el('riskList'), risks, (risk) => {
    openAttentionId = null;
    open({
      title: risk.title,
      subtitle: risk.subtitle,
      body: heading('Assessment') + esc(risk.detail),
      actions: [['pri', 'Take Action'], ['no', 'Acknowledge']]
    });
  });
}

/* ── AI actions panel ──────────────────────────────────────── */
function renderAiPanel(ai, actions) {
  el('aiWindow').textContent = ai.window?.label || 'last 12h';
  const s = ai.summary;
  el('aiStats').innerHTML = [
    ['Auto-remediations', s.autoRemediations],
    ['Services restarted', s.servicesRestarted],
    ['Incident enrichments', s.incidentEnrichments],
    ['Tickets auto-documented', s.ticketsAutoDocumented]
  ].map(([t, n]) => `<div class="stat"><div class="n">${n}</div><div class="t">${esc(t)}</div></div>`).join('');

  el('aiLog').innerHTML = actions.map((a) =>
    `<div class="logrow">
       <div class="tm">${esc(a.time)}</div>
       <div><span class="ag">${esc(a.agent)}</span> — ${esc(a.action)}</div>
     </div>`).join('');
}

/* ── Priorities ────────────────────────────────────────────── */
function renderPriorities(priorities) {
  el('prioList').innerHTML = priorities.map(([title, sub], i) =>
    `<div class="prow">
       <div class="rank">${i + 1}</div>
       <div><div class="b">${esc(title)}</div><div class="s">${esc(sub)}</div></div>
     </div>`).join('');
}

/* ── Human-in-the-loop buttons ─────────────────────────────── */
function renderActionButtons(panels) {
  el('actionBtns').innerHTML = panels.map((p) => {
    const badge = p.badge
      ? `<span class="cnt${p.badge.tone === 'warning' ? ' amb' : ''}">${p.badge.count}</span>`
      : '';
    return `<button class="abtn" data-panel="${esc(p.id)}">${badge}${esc(p.label)}<span class="sub">${esc(p.sub)}</span></button>`;
  }).join('');

  el('actionBtns').querySelectorAll('.abtn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      openAttentionId = null;
      try {
        const panel = await api.assist.panel(btn.dataset.panel);
        open({
          title: panel.title,
          subtitle: panel.subtitle,
          body: renderSections(panel.sections),
          actions: panel.actions
        });
      } catch (err) {
        open({ title: 'Unavailable', subtitle: '', body: `<div class="errbox">${esc(err.message)}</div>`, actions: [['no', 'Close']] });
      }
    });
  });
}

/* ── Sidebar: waiting for validation ───────────────────────── */
function renderWaiting(items) {
  const tone = { info: 'blu', warning: 'amb', purple: 'pur' };
  el('waitList').innerHTML = items.map((w) =>
    `<div class="wrow"><span>${esc(w.label)}</span><span class="pill ${tone[w.tone] || 'blu'}">${w.count}</span></div>`).join('');
}

function bindItems(container, data, handler) {
  container.querySelectorAll('.item').forEach((node) => {
    const activate = () => handler(data[Number(node.dataset.index)]);
    node.addEventListener('click', activate);
    node.addEventListener('keydown', (e) => { if (e.key === 'Enter') activate(); });
  });
}

export { setError };
