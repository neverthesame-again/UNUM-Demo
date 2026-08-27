import { api } from './api.js';
import { el, esc, setError, metricCard, table } from './ui.js';
import { open, heading } from './modal.js';
import { renderIncidentBody, incidentSubtitle } from './incident.js';

/**
 * Tickets tab — everything sourced from the ITSM connector:
 * incidents, changes, problems and the recurrence clusters derived from them.
 */
export async function renderTickets() {
  try {
    const [overview, incidents, changes, problems] = await Promise.all([
      api.itsm.overview(),
      api.itsm.incidents(),
      api.itsm.changes(),
      api.itsm.problems()
    ]);

    renderSource(overview);
    renderSummary(overview.summary);
    renderIncidents(incidents.incidents);
    renderChanges(changes.changes);
    renderProblems(problems);
  } catch (err) {
    setError(el('tixIncidents'), err.message);
  }
}

function renderSource(o) {
  el('tixSource').innerHTML =
    `<span class="srcdot"></span>Source <b>${esc(o.provider)}</b> · `
    + `${o.openIncidents} open incidents · ${o.changesPending} changes pending · ${o.problemsOpen} problem records`;
  el('tixShift').textContent = `Shift ${o.summary.shift}`;
  el('tixIncBadge').textContent = `${o.openIncidents} open`;
  el('tixChgBadge').textContent = `${o.changesPending} pending`;
}

function renderSummary(s) {
  el('tixSummary').innerHTML = [
    metricCard({ label: 'Total incidents', value: s.total, sub: `${s.counts.P1} P1 · ${s.counts.P2} P2 · ${s.counts.P3} P3 · ${s.counts.P4} P4`, tone: 'info' }),
    metricCard({ label: 'Auto-resolved', value: `${s.autoResolvedPct}%`, sub: 'Target 55%', tone: 'good' }),
    metricCard({ label: 'Mean time to acknowledge', value: `${s.mttaMinutes} min`, sub: 'Target 10 min', tone: 'good' }),
    metricCard({ label: 'Mean time to restore', value: `${s.mttrMinutes} min`, sub: 'Target 45 min', tone: 'good' })
  ].join('');
}

function renderIncidents(incidents) {
  table(el('tixIncidents'), [
    { label: 'Ticket', mono: true, render: (i) => esc(i.id) },
    { label: 'Pri', render: (i) => `<span class="pill ${i.priority === 'P1' || i.priority === 'P2' ? 'red' : 'amb'}">${esc(i.priority)}</span>` },
    { label: 'Title', render: (i) => `<b>${esc(i.title)}</b><br><span style="color:var(--muted);font-size:11px">${esc(i.serviceName)}</span>` },
    { label: 'State', render: (i) => esc(i.state) },
    { label: 'Assignee', render: (i) => esc(i.assignee) },
    { label: 'SLA', render: (i) => slaCell(i) },
    { label: 'Risk', align: 'right', render: (i) => riskCell(i.slaRiskPct) }
  ], incidents, {
    onRowClick: (i) => open({
      title: `${i.priority} · ${i.title}`,
      subtitle: incidentSubtitle(i),
      body: renderIncidentBody(i),
      actions: i.actions
    })
  });
}

function renderChanges(changes) {
  table(el('tixChanges'), [
    { label: 'RFC', mono: true, render: (c) => esc(c.id) },
    { label: 'Title', render: (c) => `<b>${esc(c.title)}</b><br><span style="color:var(--muted);font-size:11px">${esc(c.window)}</span>` },
    { label: 'Risk', render: (c) => `<span class="pill ${c.risk === 'High' ? 'red' : 'amb'}">${esc(c.risk)}</span>` },
    { label: 'State', render: (c) => esc(c.state) }
  ], changes, {
    onRowClick: (c) => open({
      title: `${c.id} — ${c.title}`,
      subtitle: `${c.type} · ${c.risk} risk · ${c.state}`,
      body: heading('Details')
        + `<div class="kvs">
             <div class="b"><div class="l">CI</div><div class="v">${esc(c.ci)}</div></div>
             <div class="b"><div class="l">Window</div><div class="v">${esc(c.window)}</div></div>
             <div class="b"><div class="l">Approvers</div><div class="v">${esc(c.approvers.join(', ') || '—')}</div></div>
             <div class="b"><div class="l">Conflicts</div><div class="v"${c.conflicts.length ? ' style="color:#fcd34d"' : ''}>${c.conflicts.length || 'None'}</div></div>
           </div>`
        + (c.conflicts.length ? heading('Conflicts') + `<ul>${c.conflicts.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''),
      actions: [['ok', 'Submit to CAB'], ['no', 'Close']]
    })
  });
}

function renderProblems({ problems, clusters }) {
  const problemRows = problems.map((p) => `
    <div class="wrow">
      <span><b>${esc(p.id)}</b> — ${esc(p.title)}</span>
      <span class="pill ${p.state === 'Proposed' ? 'amb' : 'blu'}">${esc(p.state)}</span>
    </div>`).join('');

  const clusterRows = clusters.map((c) => `
    <div class="item" style="cursor:default">
      <div class="hd">
        <div class="ttl">${esc(c.title)}</div>
        <span class="pill red">${c.count} in ${c.windowDays}d</span>
      </div>
      <div class="meta"><span>${esc(c.rootCause)}</span></div>
    </div>`).join('');

  el('tixProblems').innerHTML =
    (problems.length ? `<div class="wait">${problemRows}</div>` : '<div class="empty">No open problem records.</div>')
    + `<h4 style="margin:14px 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--accent2)">Recurrence clusters</h4>`
    + (clusters.length ? `<div class="list" style="max-height:none">${clusterRows}</div>` : '<div class="empty">No clusters detected.</div>');
}

function slaCell(i) {
  if (!i.slaRemaining) return '<span style="color:var(--muted)">—</span>';
  const overdue = /overdue/i.test(i.slaRemaining);
  const colour = overdue ? 'var(--red)' : i.slaRiskPct >= 70 ? 'var(--amber)' : 'var(--muted)';
  return `<span style="color:${colour}">${esc(i.slaRemaining)}</span>`;
}

function riskCell(pct) {
  const colour = pct >= 70 ? 'var(--red)' : pct >= 50 ? 'var(--amber)' : 'var(--green)';
  return `${pct}%<div class="meter" style="width:52px;margin-left:auto"><i style="width:${pct}%;background:${colour}"></i></div>`;
}
