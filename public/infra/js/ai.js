import { api } from './api.js';
import { el, esc, num, compact, setError, metricCard, table } from './ui.js';
import { open, heading } from './modal.js';

/**
 * AI Insights tab — everything sourced from the AI-observability connector.
 *
 * Three questions, in order: what did the agents do and was it in policy,
 * how good was the output, and what did it cost.
 */
export async function renderAi() {
  try {
    const [overview, agents, quality, guardrails, models, actions] = await Promise.all([
      api.ai.overview(),
      api.ai.agents(),
      api.ai.quality(),
      api.ai.guardrails(),
      api.ai.models(),
      api.ai.actions('?limit=40')
    ]);

    renderSource(overview);
    renderSummary(overview);
    renderAgents(agents.agents);
    renderQuality(quality);
    renderGuardrails(guardrails.guardrails);
    renderModels(models);
    renderActions(actions.actions);
    renderMeshSidebar(agents.agents);
  } catch (err) {
    setError(el('aiAgents'), err.message);
  }
}

function renderSource(o) {
  el('aiSource').innerHTML =
    `<span class="srcdot${o.agentsBlocked ? ' warn' : ''}"></span>Source <b>${esc(o.provider)}</b> · `
    + `${esc(o.window.label)} · ${o.agentsActive} agents active · ${o.agentsBlocked} blocked on approval · `
    + `audit log ${o.audit.immutable ? 'immutable' : 'mutable'}, ${o.audit.retentionYears}-year retention`;
  el('aiWindowBadge').textContent = o.window.label;
  el('aiTrustBadge').textContent = `Trust score ${o.trustScore}%`;
  el('aiSpendBadge').textContent = `$${o.spend.costUsd} · ${compact(o.spend.requests)} requests`;
}

function renderSummary(o) {
  const s = o.summary;
  el('aiSummary').innerHTML = [
    metricCard({ label: 'Autonomous actions', value: s.autonomousActions, sub: `${s.autoRemediations} remediations · ${s.servicesRestarted} restarts`, tone: 'info' }),
    metricCard({ label: 'Engineer hours saved', value: s.engineerHoursSaved, sub: 'Estimated from action mix', tone: 'good' }),
    metricCard({ label: 'Trust score', value: `${o.trustScore}%`, sub: 'Weighted across evaluations', tone: o.trustScore >= 90 ? 'good' : 'warn' }),
    metricCard({ label: 'Policy blocks', value: s.policyBlocks, sub: 'Actions stopped by guardrails', tone: s.policyBlocks ? 'warn' : 'good' }),
    metricCard({ label: 'Approvals requested', value: s.humanApprovalsRequested, sub: 'Waiting on a human', tone: 'pur' }),
    metricCard({ label: 'Rollbacks', value: s.rollbacksTriggered, sub: 'Actions reversed after execution', tone: s.rollbacksTriggered ? 'bad' : 'good' })
  ].join('');
}

function renderAgents(agents) {
  el('aiAgentBadge').textContent = `${agents.length} in the mesh`;
  const tone = { active: 'grn', blocked: 'amb', running: 'blu' };

  el('aiAgents').innerHTML = agents.map((a, i) => `
    <div class="acard ${esc(a.status)}" data-index="${i}" tabindex="0" role="button">
      <div class="ahd">
        <div class="an">${a.icon} ${esc(a.name)}</div>
        <span class="pill ${tone[a.status] || 'blu'}">${esc(a.statusLabel)}</span>
      </div>
      <div class="ad">${esc(a.description)}</div>
      <div class="am">
        <span>Actions <b>${a.actions12h}</b></span>
        <span>Success <b>${a.successRate}%</b></span>
        <span>Latency <b>${num(a.avgLatencyMs)}ms</b></span>
        <span>${esc(a.autonomyLevel)}</span>
      </div>
    </div>`).join('');

  el('aiAgents').querySelectorAll('.acard').forEach((node) => {
    const activate = async () => {
      const agent = agents[Number(node.dataset.index)];
      const detail = await api.ai.agent(agent.id);
      open({
        title: `${detail.icon} ${detail.name}`,
        subtitle: `${detail.statusLabel} · ${detail.autonomyLevel} · ${detail.model}`,
        body: heading('What it does') + esc(detail.description)
          + heading('Telemetry')
          + `<div class="kvs">
               <div class="b"><div class="l">Actions (12h)</div><div class="v">${detail.actions12h}</div></div>
               <div class="b"><div class="l">Success rate</div><div class="v" style="color:#86efac">${detail.successRate}%</div></div>
               <div class="b"><div class="l">Avg latency</div><div class="v">${num(detail.avgLatencyMs)}ms</div></div>
               <div class="b"><div class="l">Model</div><div class="v">${esc(detail.model)}</div></div>
             </div>`
          + heading('Recent actions')
          + (detail.recentActions.length
            ? `<ul>${detail.recentActions.map((r) => `<li><b>${esc(r.time)}</b> — ${esc(r.action)}</li>`).join('')}</ul>`
            : '<div class="empty">No actions recorded in this window.</div>'),
        actions: [['no', 'Close']]
      });
    };
    node.addEventListener('click', activate);
    node.addEventListener('keydown', (e) => { if (e.key === 'Enter') activate(); });
  });
}

function renderQuality({ metrics, failing }) {
  el('aiQuality').innerHTML = metrics.map((m) => {
    const ok = !failing.some((f) => f.id === m.id);
    const colour = ok ? 'var(--green)' : 'var(--red)';
    const pct = m.direction === 'lower'
      ? Math.max(0, 100 - (m.value / Math.max(m.target, 0.001)) * 100)
      : Math.min(100, (m.value / m.target) * 100);
    return `<div class="item" style="cursor:default">
      <div class="hd">
        <div class="ttl">${esc(m.name)}</div>
        <span class="pill ${ok ? 'grn' : 'red'}">${m.value}${esc(m.unit)}</span>
      </div>
      <div class="meta">
        <span>Target ${m.direction === 'lower' ? 'under' : 'over'} ${m.target}${esc(m.unit)}</span>
      </div>
      <div class="meter"><i style="width:${Math.min(100, pct)}%;background:${colour}"></i></div>
      <div class="meta" style="margin-top:7px"><span>${esc(m.detail)}</span></div>
    </div>`;
  }).join('');
}

function renderGuardrails(guardrails) {
  el('aiGuardrails').innerHTML = guardrails.map((g) => `
    <div class="item" style="cursor:default">
      <div class="hd">
        <div class="ttl">${esc(g.name)}</div>
        <span class="pill ${g.triggered ? 'amb' : 'grn'}">${g.triggered ? `${g.triggered} fired` : 'Clear'}</span>
      </div>
      <div class="meta"><span>${esc(g.detail)}</span></div>
    </div>`).join('');
}

function renderModels({ models, totals }) {
  table(el('aiModels'), [
    { label: 'Model', mono: true, render: (m) => `<b>${esc(m.name)}</b><br><span style="color:var(--muted);font-size:11px">${esc(m.role)}</span>` },
    { label: 'Requests', align: 'right', render: (m) => num(m.requests) },
    { label: 'Tokens in', align: 'right', render: (m) => compact(m.tokensIn) },
    { label: 'Tokens out', align: 'right', render: (m) => compact(m.tokensOut) },
    { label: 'p50', align: 'right', render: (m) => `${num(m.latencyP50Ms)}ms` },
    { label: 'p95', align: 'right', render: (m) => `${num(m.latencyP95Ms)}ms` },
    { label: 'Errors', align: 'right', render: (m) => `${m.errorRatePct}%` },
    { label: 'Cost', align: 'right', render: (m) => `$${m.costUsd.toFixed(2)}` }
  ], models);

  el('aiModels').insertAdjacentHTML('beforeend',
    `<tfoot><tr>
       <td><b>Total</b></td>
       <td class="num"><b>${num(totals.requests)}</b></td>
       <td class="num"><b>${compact(totals.tokensIn)}</b></td>
       <td class="num"><b>${compact(totals.tokensOut)}</b></td>
       <td colspan="3"></td>
       <td class="num"><b style="color:#86efac">$${totals.costUsd.toFixed(2)}</b></td>
     </tr></tfoot>`);
}

function renderActions(actions) {
  const tone = { success: 'grn', blocked: 'amb', partial: 'blu', failed: 'red' };
  table(el('aiActions'), [
    { label: 'Time', mono: true, render: (a) => esc(a.time) },
    { label: 'Agent', render: (a) => `<span style="color:var(--purple);font-weight:600">${esc(a.agent)}</span>` },
    { label: 'Action', render: (a) => esc(a.action) },
    { label: 'Outcome', render: (a) => `<span class="pill ${tone[a.outcome] || 'blu'}">${esc(a.outcome)}</span>` },
    { label: 'Mode', render: (a) => a.autonomous ? 'Autonomous' : '<span style="color:var(--amber)">Needed approval</span>' },
    { label: 'Linked to', mono: true, render: (a) => esc(a.linkedTo || '—') }
  ], actions);
}

/** The sidebar mesh panel reads the same agent list. */
function renderMeshSidebar(agents) {
  const tone = { active: 'grn', blocked: 'amb', running: 'blu' };
  el('meshList').innerHTML = agents.map((a) =>
    `<div class="wrow"><span>${a.icon} ${esc(a.name)}</span><span class="pill ${tone[a.status] || 'blu'}">${esc(a.statusLabel)}</span></div>`).join('');
}
