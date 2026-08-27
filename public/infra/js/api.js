/**
 * Self-contained static API — matches every response shape produced by the
 * Co-Worker Platform Node.js backend. Data loaded from the three bundled JSON
 * files in /infra/data/. No backend needed; works on Vercel or any static host.
 *
 * IMPORTANT: every function returns the *exact* envelope the backend routes
 * return, because the UI JS destructures specific keys (e.g. attention.items,
 * actions.actions, capacity.capacity, models.models + models.totals, …).
 */

// ── Data loader ────────────────────────────────────────────────────────
let _itsm = null, _mon = null, _ai = null, _db = null;

async function _load() {
  if (_itsm) return;
  // Determine base path whether served from /infra/ or root
  const base = window.location.pathname.includes('/infra')
    ? '/infra'
    : (document.querySelector('base')?.getAttribute('href') || '').replace(/\/$/, '');
  const root = base.endsWith('/infra') ? base : base + '/infra';
  const [r1, r2, r3, r4] = await Promise.all([
    fetch(root + '/data/itsm.json').then(r => r.json()),
    fetch(root + '/data/monitoring.json').then(r => r.json()),
    fetch(root + '/data/aiops.json').then(r => r.json()),
    fetch(root + '/mock-responses.json').then(r => r.json()),
  ]);
  _itsm = r1; _mon = r2; _ai = r3; _db = r4;
}

// ── Helper: monitoring summarise() equivalent ─────────────────────────
function _monSummarise() {
  const services = _mon.services || [];
  const byStatus = { healthy: 0, warning: 0, critical: 0, unknown: 0 };
  for (const s of services) byStatus[s.status] = (byStatus[s.status] || 0) + 1;
  const openAlerts = (_mon.alerts || []).filter(a => a.state === 'open');
  const availability = (_mon.slos || []).find(s => s.id === 'availability');
  return {
    serviceCount: services.length,
    byStatus,
    openAlerts: openAlerts.length,
    criticalAlerts: openAlerts.filter(a => a.severity === 'critical').length,
    suppressedDuplicates: (_mon.alerts || []).reduce((n, a) => n + (a.suppressedDuplicates || 0), 0),
    availabilityPct: availability ? availability.current : null,
    availabilityTarget: availability ? availability.target : null,
    slosBreaching: (_mon.slos || []).filter(s => s.status === 'breach').length,
  };
}

// ── Helper: aiops modelTotals() equivalent ────────────────────────────
function _modelTotals(models = []) {
  return models.reduce((acc, m) => ({
    requests: acc.requests + (m.requests || 0),
    tokensIn: acc.tokensIn + (m.tokensIn || 0),
    tokensOut: acc.tokensOut + (m.tokensOut || 0),
    costUsd: Number((acc.costUsd + (m.costUsd || 0)).toFixed(2)),
  }), { requests: 0, tokensIn: 0, tokensOut: 0, costUsd: 0 });
}

// ── Helper: aiops trustScore() equivalent ────────────────────────────
function _trustScore(quality = []) {
  if (!quality.length) return null;
  const scored = quality.map(q => {
    const ratio = q.direction === 'lower'
      ? (q.target === 0 ? 1 : Math.min(1, q.target / Math.max(q.value, 0.001)))
      : Math.min(1, q.value / q.target);
    return Math.max(0, Math.min(1, ratio));
  });
  return Number(((scored.reduce((a, b) => a + b, 0) / scored.length) * 100).toFixed(1));
}

// ── Helper: itsm attentionQueue() equivalent ─────────────────────────
function _attentionQueue() {
  return [...(_itsm.incidents || [])]
    .filter(i => i.state !== 'Resolved' && i.state !== 'Closed')
    .sort((a, b) => (b.slaRiskPct || 0) - (a.slaRiskPct || 0));
}

// ── Action Panels (from assist/actions.js) ────────────────────────────
const ACTION_PANELS = {
  approve: {
    id: 'approve', label: 'Approve Automation', sub: 'Agent-drafted runbooks',
    badge: { count: 3, tone: 'critical' },
    title: 'Approve Automation', subtitle: '3 agent-drafted runbooks awaiting your approval',
    sections: [
      { type: 'facts', heading: 'Queued for approval', facts: [
        ['RB-OLV-014', 'Olive pool resize + rolling recycle', null],
        ['RB-STG-007', 'Solera snapshot reclaim (2.1 TB)', null],
        ['RB-PCH-022', 'Patch retry — 8 failed servers', null],
        ['Combined risk', 'Low · all reversible', 'good'],
      ]},
      { type: 'code', heading: 'RB-OLV-014 execution plan', code:
`1. Snapshot current pgbouncer config           (10s)
2. Raise pool_size 200 → 320, reload           (5s)
3. Drain + recycle olive-api-01, 02            (4m)
4. Validate p95 < 400ms over 5m window         (5m)
5. Recycle olive-api-03..06 in pairs           (8m)
6. Reschedule recon job 23:30 → 01:00          (10s)
ROLLBACK: restore snapshot, reload             (90s)` },
      { type: 'note', tone: 'governance', text: 'Your approval is recorded with identity, timestamp and justification in the immutable audit log, retained for 6 years.' }
    ],
    actions: [['ok', 'Approve All 3'], ['pri', 'Approve RB-OLV-014 Only'], ['no', 'Reject & Comment']],
  },
  change: {
    id: 'change', label: 'Create Change', sub: 'CAB-ready RFC',
    badge: { count: 2, tone: 'warning' },
    title: 'Create Change Request', subtitle: 'Agent has pre-populated a CAB-ready RFC',
    sections: [
      { type: 'facts', heading: 'Draft RFC — CHG0032131', facts: [
        ['Title', 'Olive prior-auth DB connection pool uplift', null],
        ['Type', 'Normal · Medium risk', null],
        ['CI', 'PG-OLIVE-PRD-02 + 6 app nodes', null],
        ['Window', 'Tonight 22:00–23:30', null],
        ['Member impact', 'None — async decisioning path', null],
        ['Approvers', 'You, DBA lead, Olive product owner', null],
      ]},
      { type: 'list', heading: 'Agent-generated implementation plan', items: [
        'Pre-checks: replication lag < 5m, no active P1, backup verified within 24h',
        'Implementation: 6 steps, fully scripted, 22 minutes',
        'Validation: 50 synthetic prior-auth submissions, p95 < 400ms',
        'Rollback: config snapshot restore, 90 seconds, tested in pre-prod 27 July',
      ]},
      { type: 'list', heading: 'Also queued', items: [
        'CHG0032118 — core switch firmware (CAB 14:00)',
        'CHG0032124 — Windows July CU, split-wave recommended',
      ]},
    ],
    actions: [['ok', 'Submit to CAB'], ['pri', 'Edit Before Submit'], ['no', 'Cancel']],
  },
  diag: {
    id: 'diag', label: 'Run Diagnostics', sub: 'Olive platform stack', badge: null,
    title: 'Run Diagnostics', subtitle: 'Full-stack diagnostic sweep — Olive platform',
    sections: [
      { type: 'text', heading: 'Scope', text: '41 CIs across load balancer, app tier, database, storage and network path.' },
      { type: 'list', heading: 'Agent will collect', items: [
        'Thread dumps and heap snapshots from 6 app nodes',
        'pg_stat_activity, lock waits, slow query log (last 6h)',
        'F5 VIP health, connection table, SSL handshake timings',
        'SAN latency histogram + fabric error counters',
        'End-to-end synthetic prior-auth trace with span breakdown',
      ]},
      { type: 'text', heading: 'Impact', text: 'Read-only collection. Estimated 3–4 minutes. Negligible load (<2% CPU).' },
      { type: 'note', tone: 'info', text: 'Output is auto-attached to INC0104882 and summarised in plain language for the service review.' },
    ],
    actions: [['ok', 'Run Now'], ['pri', 'Run & Notify Me'], ['no', 'Cancel']],
  },
  remed: {
    id: 'remed', label: 'Launch Remediation', sub: 'Solera storage reclaim',
    badge: { count: 1, tone: 'critical' },
    title: 'Launch Remediation', subtitle: 'Storage reclaim — Solera Tier-1 data platform',
    sections: [
      { type: 'text', heading: 'Target', text: 'Recover 2.1 TB and drop utilisation 88.4% → 84.1%.' },
      { type: 'facts', heading: 'Reclaim breakdown', facts: [
        ['Orphaned snapshots', '1,240 GB · 47 objects', null],
        ['Expired extract cache', '610 GB', null],
        ['Deleted-VM residue', '180 GB', null],
        ['Log/temp overflow', '70 GB', null],
      ]},
      { type: 'list', heading: 'Safety gates', items: [
        'No object referenced by an active Solera care/claims dataset is touched',
        'Retention policy cross-checked against the 7-year claims records mandate',
        'All deletions staged to recycle bin for 72h before purge',
      ]},
      { type: 'note', tone: 'warning', text: 'This buys roughly 8 days. It does not solve the underlying 1.9 TB/week growth — a capacity decision is still needed this week.' },
    ],
    actions: [['ok', 'Launch Reclaim'], ['pri', 'Dry Run First'], ['no', 'Cancel']],
  },
  exec: {
    id: 'exec', label: 'Generate Exec Summary', sub: 'CIO / service review', badge: null,
    title: 'Generate Executive Summary', subtitle: 'Draft ready for the service review',
    sections: [
      { type: 'facts', heading: 'Shift summary — night shift', facts: [
        ['Availability', '99.94% (SLA 99.9%)', 'good'],
        ['Incidents', '60 total · 2 P1 · 6 P2', null],
        ['Auto-resolved', '61% (target 55%)', null],
        ['MTTR', '38 min (target 45)', null],
        ['Patch compliance', '91.3% (target 95%)', 'warn'],
        ['Engineer hours saved', '~9.4 hrs', 'good'],
      ]},
      { type: 'text', heading: 'Narrative', text: 'Two P1 incidents were restored within SLA and both have RCAs in flight. Autonomous agents took 31 actions overnight, resolving 61% of volume without human involvement and preserving roughly 9.4 engineer-hours. Two risks need executive visibility: Solera Tier-1 storage reaches capacity in 21 days and requires a procurement decision, and patch compliance sits amber at 91.3% largely due to the Olive release freeze expiring 2 August.' },
      { type: 'list', heading: 'Asks of the customer', items: [
        'Approve the Solera storage expansion PO (12-week lead time — decision needed this week)',
        'Confirm the Olive freeze lift date to unblock 22 servers',
        'Nominate an owner for the Citrix logon problem record affecting Care Navigator users',
      ]},
    ],
    actions: [['ok', 'Export to PDF'], ['pri', 'Email to CIO & Service Manager'], ['no', 'Edit Draft']],
  },
  problem: {
    id: 'problem', label: 'Create Problem Ticket', sub: 'Recurrence cluster', badge: null,
    title: 'Create Problem Ticket', subtitle: 'Recurrence cluster — Citrix logon storms',
    sections: [
      { type: 'facts', heading: 'Proposed PRB0004418', facts: [
        ['Linked incidents', '9 over 14 days', null],
        ['Service', 'End User Computing · Citrix Farm B', null],
        ['Impact', '~2,700 advocate-min per event', null],
        ['Priority', 'High', null],
      ]},
      { type: 'text', heading: 'Agent-drafted root cause', text: 'FSLogix profile container load contention. Farm B profiles sit on a share whose backing volume peaks at 6,200 IOPS, while morning logon concurrency demands roughly 9,400 IOPS. Restarting session hosts clears the symptom without addressing the storage ceiling.' },
      { type: 'list', heading: 'Proposed permanent fix', items: [
        'Enable FSLogix Cloud Cache with local SSD read cache on all Farm B hosts',
        'Split the profile share across two volumes by business unit',
        'Stagger shift-start logons by team in 10-minute bands',
      ]},
      { type: 'text', heading: 'Expected outcome', text: 'Logon time 45s → under 12s; eliminates an estimated 23 incidents per quarter.' },
    ],
    actions: [['ok', 'Create Problem Record'], ['pri', 'Assign to Problem Manager'], ['no', 'Cancel']],
  },
};

// ── The mock dashboard summary shape (from /api/dashboard) ───────────
function _dashboardSummary() {
  const db = _db['/api/dashboard'];
  // Use real scraped summary if available, otherwise build from raw data
  if (db && db.summary) return db.summary;
  const s = _itsm.summary;
  return {
    window: { label: `Last shift ${s.shift}`, from: '2026-07-29T19:00:00Z', to: '2026-07-30T07:00:00Z' },
    availability: { current: 99.94, target: 99.9 },
    incidents: { total: s.total, counts: s.counts, autoResolvedPct: s.autoResolvedPct },
    responsiveness: { mttaMinutes: s.mttaMinutes, mttrMinutes: s.mttrMinutes },
    agents: { count: _ai.agents.length, autonomousActions: _ai.summary.autonomousActions, engineerHoursSaved: _ai.summary.engineerHoursSaved, blocked: _ai.agents.filter(a => a.status === 'blocked').length },
    decisionsNeeded: _attentionQueue().length + 1,
    slaAtRisk: (_itsm.incidents || []).filter(i => (i.slaRiskPct || 0) >= 70).map(i => ({ id: i.id, remaining: i.slaRemaining })),
    slosBreaching: (_mon.slos || []).filter(s => s.status === 'breach').map(s => ({ name: s.name, current: s.current, unit: s.unit })),
  };
}

// ── Exported API surface ───────────────────────────────────────────────
export const api = {
  // ── Top-level ────────────────────────────────────────────────────────
  dashboard: async () => {
    await _load();
    const models = _ai.models || [];
    return {
      operator: { name: 'Infra Engineer', id: 'infra.eng', customer: 'GuideWell' },
      summary: _dashboardSummary(),
      services: _mon.services,
      decisions: _db['/api/dashboard']?.decisions || [],
      ai: {
        source: _ai.source,
        provider: 'mock',
        window: _ai.window,
        summary: _ai.summary,
        trustScore: _trustScore(_ai.quality),
        agentsActive: _ai.agents.filter(a => a.status === 'active').length,
        agentsBlocked: _ai.agents.filter(a => a.status === 'blocked').length,
        spend: _modelTotals(models),
        audit: _ai.audit,
      },
      risks: _itsm.risks,
      priorities: _itsm.priorities,
    };
  },

  health: () => Promise.resolve({
    status: 'ok',
    connectors: [
      { domain: 'monitoring', label: 'mock', status: 'ok', latencyMs: 1 },
      { domain: 'itsm',       label: 'mock', status: 'ok', latencyMs: 1 },
      { domain: 'aiops',      label: 'mock', status: 'ok', latencyMs: 1 },
    ],
  }),
  refresh: () => Promise.resolve({ refreshed: true, at: new Date().toISOString() }),

  context: async (id) => {
    await _load();
    const inc = (_itsm.incidents || []).find(i => i.id === id);
    if (!inc) return { error: { message: `No ticket "${id}" in the connected ITSM tool` } };
    return {
      incident: inc,
      events: (_mon.alerts || []).filter(a => a.service === inc.service || a.correlatedTo === id),
      topology: { nodes: [{ id: inc.service, label: inc.serviceName, group: 'service' }], edges: [] },
    };
  },

  // ── Monitoring ────────────────────────────────────────────────────────
  monitoring: {
    overview: async () => {
      await _load();
      return {
        source: _mon.source,
        provider: 'mock',
        window: _mon.window,
        summary: _monSummarise(),
        services: _mon.services,
        slos: _mon.slos,
      };
    },
    alerts: async (params = '') => {
      await _load();
      let list = _mon.alerts || [];
      if (params) {
        const p = new URLSearchParams(params.replace(/^\?/, ''));
        if (p.get('state')) list = list.filter(a => a.state === p.get('state'));
        if (p.get('severity')) list = list.filter(a => a.severity === p.get('severity'));
      }
      return { count: list.length, alerts: list };
    },
    slos: async () => {
      await _load();
      const slos = _mon.slos || [];
      return { count: slos.length, slos, breaching: slos.filter(s => s.status === 'breach') };
    },
    capacity: async () => {
      await _load();
      const sorted = [...(_mon.capacity || [])].sort((a, b) => (a.daysToFull ?? 1e6) - (b.daysToFull ?? 1e6));
      return { count: sorted.length, capacity: sorted };
    },
    trends: async () => {
      await _load();
      const trends = _mon.trends || [];
      return { count: trends.length, trends };
    },
    service: async (id) => {
      await _load();
      const svc = (_mon.services || []).find(s => s.id === id);
      if (!svc) return null;
      return {
        ...svc,
        alerts: (_mon.alerts || []).filter(a => a.service === id),
        capacity: (_mon.capacity || []).filter(c => c.service === id),
        trends: (_mon.trends || []).filter(t => t.service === id),
      };
    },
  },

  // ── ITSM ─────────────────────────────────────────────────────────────
  itsm: {
    overview: async () => {
      await _load();
      return {
        source: _itsm.source,
        provider: 'mock',
        summary: _itsm.summary,
        openIncidents: (_itsm.incidents || []).length,
        changesPending: (_itsm.changes || []).filter(c => c.state !== 'Closed').length,
        problemsOpen: (_itsm.problems || []).length,
        risks: _itsm.risks,
        priorities: _itsm.priorities,
      };
    },
    incidents: async (params = '') => {
      await _load();
      let list = _itsm.incidents || [];
      if (params) {
        const p = new URLSearchParams(params.replace(/^\?/, ''));
        if (p.get('priority')) list = list.filter(i => i.priority === p.get('priority'));
        if (p.get('service')) list = list.filter(i => i.service === p.get('service'));
      }
      return { count: list.length, incidents: list };
    },
    incident: async (id) => {
      await _load();
      const found = (_itsm.incidents || []).find(i => i.id.toLowerCase() === id.toLowerCase());
      if (!found) return null;
      const mins = found.slaDueAt ? Math.round((new Date(found.slaDueAt).getTime() - Date.now()) / 60000) : null;
      return { ...found, slaMinutesRemaining: mins };
    },
    attention: async () => {
      await _load();
      const items = _attentionQueue();
      return { count: items.length, items };
    },
    priority: async (p) => {
      await _load();
      return _itsm.priorityDetail?.[p] || null;
    },
    changes: async () => {
      await _load();
      const changes = _itsm.changes || [];
      return { count: changes.length, changes };
    },
    problems: async () => {
      await _load();
      const problems = _itsm.problems || [];
      return { count: problems.length, problems, clusters: _itsm.recurrenceClusters || [] };
    },
    risks: async () => {
      await _load();
      const risks = _itsm.risks || [];
      return { count: risks.length, risks };
    },
  },

  // ── AI / AIOps ────────────────────────────────────────────────────────
  ai: {
    overview: async () => {
      await _load();
      return {
        source: _ai.source,
        provider: 'mock',
        window: _ai.window,
        summary: _ai.summary,
        trustScore: _trustScore(_ai.quality),
        agentsActive: (_ai.agents || []).filter(a => a.status === 'active').length,
        agentsBlocked: (_ai.agents || []).filter(a => a.status === 'blocked').length,
        spend: _modelTotals(_ai.models),
        audit: _ai.audit,
      };
    },
    agents: async () => {
      await _load();
      const agents = _ai.agents || [];
      return { count: agents.length, agents };
    },
    agent: async (id) => {
      await _load();
      const found = (_ai.agents || []).find(a => a.id === id);
      if (!found) return null;
      const name = found.name.replace(/ Agent$/, '');
      return { ...found, recentActions: (_ai.actions || []).filter(x => x.agent === name) };
    },
    actions: async (params = '') => {
      await _load();
      let list = _ai.actions || [];
      if (params) {
        const p = new URLSearchParams(params.replace(/^\?/, ''));
        if (p.get('agent')) list = list.filter(a => a.agent.toLowerCase() === p.get('agent').toLowerCase());
        if (p.get('limit')) list = list.slice(0, Number(p.get('limit')));
      }
      return { count: list.length, actions: list };
    },
    models: async () => {
      await _load();
      const models = _ai.models || [];
      return { count: models.length, models, totals: _modelTotals(models) };
    },
    quality: async () => {
      await _load();
      const metrics = _ai.quality || [];
      const failing = metrics.filter(m => m.value !== null && m.target !== null &&
        (m.direction === 'lower' ? m.value > m.target : m.value < m.target));
      return { count: metrics.length, trustScore: _trustScore(metrics), metrics, failing };
    },
    guardrails: async () => {
      await _load();
      const guardrails = _ai.guardrails || [];
      return { count: guardrails.length, guardrails, triggered: guardrails.filter(g => g.triggered > 0) };
    },
  },

  // ── Assist ────────────────────────────────────────────────────────────
  assist: {
    greeting: async () => {
      await _load();
      const s = _itsm.summary;
      const urgent = (_itsm.incidents || []).find(i => (i.slaRiskPct || 0) >= 70);
      const avail = (_mon.slos || []).find(s => s.id === 'availability');
      return {
        operator: 'Infra Engineer',
        text: `Morning. I've reviewed the overnight shift.\n\n`
          + `**Headline:** ${s.total} incidents, ${s.autoResolvedPct}% auto-resolved, `
          + `availability ${avail?.current || 99.94}%. Two P1s restored within SLA.\n\n`
          + (urgent
            ? `**Needs you:** ${urgent.id} (${urgent.title}) has an SLA clock with **${urgent.slaRemaining}** left — `
              + `approving ${urgent.runbook} clears it in about 22 minutes. `
            : '**Needs you:** nothing on an SLA clock right now. ')
          + `Solera Tier-1 storage also needs a capacity decision this week.\n\nAsk me anything, or tap a suggestion below.`,
        agentsRan: (_ai.agents || []).length,
        actionsTaken: _ai.summary.autonomousActions,
        decisionsNeeded: _attentionQueue().length,
      };
    },

    suggestions: () => Promise.resolve({
      suggestions: [
        'Show recurring incidents',
        'Which incidents may breach SLA?',
        'Show patch compliance risks',
        'How accurate have the agents been?',
        'Generate shift handover',
        'Create executive summary',
        'What should I prioritise?',
        'Solera capacity outlook',
      ],
    }),

    panels: async () => {
      await _load();
      const panels = Object.values(ACTION_PANELS).map(p => ({ id: p.id, label: p.label, sub: p.sub, badge: p.badge }));
      return { count: panels.length, panels };
    },

    panel: async (id) => {
      await _load();
      return ACTION_PANELS[id] || null;
    },

    ask: async (question) => {
      await _load();

      // ── Full knowledge.js intent engine ─────────────────────────────
      const INTENTS = [
        {
          id: 'recurrence',
          keywords: ['recur', 'repeat', 'recurring', 'pattern', 'cluster'],
          resolve: () => {
            const clusters = _itsm.recurrenceClusters || [];
            if (!clusters.length) return 'No recurrence clusters detected in the current window.';
            const lines = clusters.map((c, i) =>
              `${i + 1}. **${c.title}** — ${c.count} incidents / ${c.windowDays} days. Root cause: ${c.rootCause}.`);
            return `I found **${clusters.length} recurrence clusters**:\n\n${lines.join('\n')}\n\n`
              + 'Together these are **41% of all P2/P3 volume**. Want me to draft problem records for all three?';
          }
        },
        {
          id: 'problem-record',
          keywords: ['problem ticket', 'problem record', 'prb'],
          answer: `I've drafted **PRB0004418 — Citrix Farm B logon latency**, linking all 9 incidents.\n\n`
            + `Root cause: FSLogix container load contention (6,200 IOPS ceiling vs ~9,400 demand at shift start).\n`
            + `Permanent fix: Cloud Cache + profile share split + staggered logon bands.\n`
            + `Expected: 45s → under 12s, removing ~23 incidents/quarter.\n\n`
            + `Use the **Create Problem Ticket** button — you'll see each step the agent takes as it creates and links the record.`
        },
        {
          id: 'sla',
          keywords: ['sla', 'breach', 'breaching', 'clock'],
          resolve: () => {
            const atRisk = (_itsm.incidents || []).filter(i => (i.slaRiskPct || 0) >= 70);
            if (!atRisk.length) return 'No SLA clocks are inside the risk threshold right now.';
            const lines = atRisk.map(i =>
              `• **${i.id}** — ${i.title}, ${i.priority}. ${i.slaRemaining} remaining, breach probability ${i.breachProbability}%.`);
            return `**${atRisk.length} SLA${atRisk.length > 1 ? 's' : ''} at risk right now.**\n\n${lines.join('\n')}\n\n`
              + 'Fastest path on the Olive incident: approve **RB-OLV-014**, estimated restore 22 minutes. '
              + 'Note this would be the second P2 breach this month, which triggers service credits under the MSA.';
          }
        },
        {
          id: 'patch',
          keywords: ['patch', 'compliance', 'cve', 'vulnerab'],
          answer: `**Patch compliance: 91.3%** against a 95% contractual target — currently amber.\n\n`
            + `63 of 726 servers non-compliant:\n`
            + `• 22 held under the Olive release freeze (expires 2 Aug)\n`
            + `• 19 patched, awaiting reboot window\n`
            + `• 14 legacy Server 2012 R2 — remediation plan in flight\n`
            + `• 8 genuine failures — I've drafted retry jobs\n\n`
            + `**11 servers carry critical CVEs.** Approving the 8 retry jobs plus a reboot wave gets you to 95.1%.`
        },
        {
          id: 'handover',
          keywords: ['handover', 'handoff', 'shift summary'],
          answer: `**Shift handover draft (18:30):**\n\n`
            + `Open items carried forward:\n`
            + `• INC0104882 Olive prior-auth latency — status depends on RB-OLV-014\n`
            + `• INC0104915 RJ Health pricing queue — pods scaled, monitor drain\n`
            + `• Solera Tier-1 at 88% — capacity decision pending\n`
            + `• Backup verification gap — 26h, needs closure tonight\n\n`
            + `Do not touch: CHG0032131 window opens 22:00, DBA owns it.\n`
            + `Escalation: Dell SR-88231 (SAN path flap) expects a vendor callback at 20:00.\n\n`
            + `I'll auto-populate the rest from today's activity at 18:30.`
        },
        {
          id: 'exec',
          keywords: ['exec', 'executive', 'cio', 'service review'],
          resolve: () => {
            const avail = (_mon.slos || []).find(s => s.id === 'availability');
            const s = _itsm.summary || {};
            return `**Executive summary is ready.**\n\n`
              + `Availability ${avail?.current}% vs ${avail?.target}% SLA. ${s.total} incidents, ${s.autoResolvedPct}% auto-resolved, `
              + `MTTR ${s.mttrMinutes} min against a 45-min target. Agents saved roughly ${_ai.summary?.engineerHoursSaved} engineer-hours overnight.\n\n`
              + `Two items need customer decisions:\n`
              + `1. Solera storage expansion PO — 12-week lead time, decision needed this week\n`
              + `2. Olive freeze lift date — unblocks 22 servers for patching\n\n`
              + `Use **Generate Exec Summary** to build and route it.`;
          }
        },
        {
          id: 'capacity',
          keywords: ['storage', 'capacity', 'disk', 'solera', 'san', 'data lake', 'runway'],
          resolve: () => {
            const top = (_mon.capacity || []).find(c => c.id === 'CAP-0071');
            if (!top) return 'No capacity records are currently near threshold.';
            return `**Solera Tier-1 is the pressing one — ${top.usedPct}% used.**\n\n`
              + `Growth ${top.growthTbPerWeek} TB/week, ${top.freeTb} TB free. Crosses 90% in ~${top.daysToThreshold} days, `
              + `full in ~${top.daysToFull} days. Driver is ${top.driver.toLowerCase()}.\n\n`
              + `Three options:\n`
              + `• **Now:** reclaim ${top.reclaimableTb} TB — zero risk, buys ~8 days\n`
              + `• **Short term:** tier 14 TB of extracts >18 months to Azure archive\n`
              + `• **Structural:** expansion shelf — 12-week lead time, needs a PO this week\n\n`
              + `I'd run the reclaim today and start the PO in parallel.`;
          }
        },
        {
          id: 'olive',
          keywords: ['olive', 'prior auth', 'claims', 'latency', 'authoriz'],
          answer: `**INC0104882 — Olive prior-auth API latency.**\n\n`
            + `p95 went 240ms → 1,180ms over 6 hours. EDI 278 intake queuing at 2,300 msg/min against 1,850 drain.\n\n`
            + `Cause: connection pool saturation on PG-OLIVE-PRD-02 (198/200 in use), triggered by a reconciliation job that overran by 47 minutes. Same signature as INC0102117 on 14 May.\n\n`
            + `Impact: decisioning throughput down 34%, ~18,000 authorization requests delayed.\n`
            + `Fix: RB-OLV-014 is staged — pool to 320, rolling recycle, job rescheduled. 22 minutes, 90-second rollback.`
        },
        {
          id: 'rj-health',
          keywords: ['rj health', 'drug', 'pricing', 'ndc'],
          answer: `**INC0104915 — RJ Health pricing feed queue at 8,412 messages** (normal <900).\n\n`
            + `The feed processor is fine; the downstream Pricing Reference API is throwing 503s at a 7.2% error rate. NDC price updates are lagging ~11 minutes into the reference store.\n\n`
            + `Not yet material to adjudication, but past 30 minutes stale pricing risks incorrect member cost share. Fix is a pre-approved standard change: scale the API 6 → 10 pods and enable the circuit breaker.`
        },
        {
          id: 'backup',
          keywords: ['backup', 'restore', 'dr', 'recovery', 'rpo'],
          answer: `Two data-protection items:\n\n`
            + `1. **Olive claims DB verification overdue 26h.** The backup itself succeeded at 02:10 — this is a verification gap, not data loss. Past 48h it becomes an audit finding.\n\n`
            + `2. **DR replication lag 22 min against a 15-min RPO** covering Olive and Teladoc. Caused by bandwidth contention with the Solera archive job. A disaster declared now would lose up to 22 minutes of transactions — outside contract.\n\n`
            + `Both are fixable tonight: launch verification into the recovery VLAN, and throttle the archive job.`
        },
        {
          id: 'citrix',
          keywords: ['citrix', 'vdi', 'logon', 'euc', 'end user', 'care navigator'],
          answer: `**Citrix Farm B** is the recurring pain — 9 incidents in 14 days, always 07:00–07:45. It serves Care Navigator care managers and member service advocates.\n\n`
            + `FSLogix profile containers hit a 6,200 IOPS ceiling while shift-start concurrency demands ~9,400. Restarting hosts clears it but never fixes it.\n\n`
            + `Cost: ~2,700 advocate-minutes per event — about 405 hours of productivity across the 9 incidents.\n\n`
            + `Farms A and C are healthy; 4,860 sessions active right now.`
        },
        {
          id: 'teladoc',
          keywords: ['teladoc', 'virtual', 'visit', 'telehealth'],
          answer: `**Teladoc virtual health is healthy** — 2,100 visits/day, no open incidents.\n\n`
            + `One item from last shift: INC0104839, a 27-minute P1 where virtual-visit joins failed due to a SAN path flap on fabric B affecting the media edge tier. Restored 02:14, Dell case SR-88231 open, vendor callback expected 20:00.\n\n`
            + `One forward risk: Teladoc sits inside the DR replication scope currently running 22 minutes of lag against a 15-minute RPO.`
        },
        {
          id: 'change',
          keywords: ['change', 'cab', 'rfc'],
          resolve: () => {
            const pending = (_itsm.changes || []).filter(c => c.state === 'Awaiting CAB');
            const lines = pending.map(c =>
              `• **${c.id}** — ${c.title}. Risk ${c.risk}. Window ${c.window}.`
              + (c.conflicts.length ? ` ⚠ ${c.conflicts[0]}` : ''));
            return `**${pending.length} changes need validation before the 14:00 CAB:**\n\n${lines.join('\n')}\n\n`
              + 'Both have complete rollback plans and validated test evidence. A third, CHG0032131 (Olive pool uplift), is drafted and awaiting your submission.';
          }
        },
        {
          id: 'agent-activity',
          keywords: ['what did you do', 'ai action', 'agent', 'overnight', 'autonomous'],
          resolve: () => {
            const s = _ai.summary || {};
            return `Overnight my agents took **${s.autonomousActions} autonomous actions**:\n\n`
              + `• ${s.autoRemediations} auto-remediations (disk cleanup, pod restarts, app pool recycles, session host failover)\n`
              + `• ${s.servicesRestarted} service restarts\n`
              + `• ${s.incidentEnrichments} incident enrichments with CMDB dependency maps\n`
              + `• ${s.ticketsAutoDocumented} tickets auto-documented with RCA drafts\n`
              + `• ${s.knowledgeArticlesDrafted} knowledge articles drafted\n\n`
              + `Estimated **${s.engineerHoursSaved} engineer-hours saved**. Everything is in the activity log — nothing outside policy, and all reversible.`;
          }
        },
        {
          id: 'ai-quality',
          keywords: ['trust', 'hallucinat', 'accurat', 'model cost', 'model spend', 'token', 'guardrail', 'ai quality', 'how good'],
          resolve: () => {
            const q = _ai.quality || [];
            const models = _ai.models || [];
            const spend = models.reduce((n, m) => n + m.costUsd, 0).toFixed(2);
            const lines = q.slice(0, 4).map(m => `• ${m.name}: **${m.value}${m.unit}** against a ${m.target}${m.unit} target`);
            return `**Agent quality over the last 12 hours:**\n\n${lines.join('\n')}\n\n`
              + `Model spend across the mesh is $${spend} for ${models.reduce((n, m) => n + m.requests, 0).toLocaleString()} requests. `
              + `Guardrails fired ${(_ai.guardrails || []).reduce((n, g) => n + g.triggered, 0)} times — mostly PHI redaction before model input, plus the patch reboot block.\n\n`
              + `Open the **AI Insights** tab for the full breakdown.`;
          }
        },
        {
          id: 'priorities',
          keywords: ['priorit', 'today', 'focus', 'what should'],
          answer: `**Your top three for today:**\n\n`
            + `1. **Olive prior-auth latency** — SLA clock expires 11:18. Approve RB-OLV-014 and you're clear. Do this first.\n`
            + `2. **Solera capacity** — run the 2.1 TB reclaim now, but the real decision is the expansion PO. 12-week lead time means this week or you're managing a full array.\n`
            + `3. **Backup verification** — 26h gap. Cheap to close tonight, expensive as an audit finding.\n\n`
            + `Everything else can wait until after the 14:00 CAB.`
        },
        {
          id: 'governance',
          keywords: ['audit', 'governance', 'regulat', 'hipaa', 'control'],
          answer: `**Control posture:**\n\n`
            + `• Contingency planning — one gap: Olive claims DB restore verification overdue 26h. Becomes a finding past 48h.\n`
            + `• Audit controls — all agent actions logged immutably with 6-year retention. 31 entries last shift, each tied to an approver identity.\n`
            + `• Patch/malware controls — 91.3% compliance, below the 95% contractual KPI. 11 critical CVEs outstanding.\n`
            + `• Access reviews — current, last certified 3 July.\n\n`
            + `The verification gap and patch compliance are the two I'd close before the next review.`
        },
      ];

      const FALLBACK = `I don't have a specific read on that yet. I can help with:\n\n`
        + `• Incident detail and root cause on anything from last shift\n`
        + `• SLA exposure and breach risk\n`
        + `• Capacity and storage forecasts\n`
        + `• Patch and control compliance posture\n`
        + `• Agent quality, guardrails and model spend\n`
        + `• Change and CAB status\n`
        + `• Drafting problem records, handovers or the executive summary\n\n`
        + `What would you like to dig into?`;

      // Longest matching keyword wins (same algorithm as knowledge.js)
      const q = (question || '').toLowerCase();
      let best = null, bestScore = 0;
      for (const intent of INTENTS) {
        for (const keyword of intent.keywords) {
          if (q.includes(keyword) && keyword.length > bestScore) {
            best = intent;
            bestScore = keyword.length;
          }
        }
      }

      if (!best) return { intent: null, answer: FALLBACK, grounded: false };
      if (best.answer) return { intent: best.id, answer: best.answer, grounded: false };
      return { intent: best.id, answer: best.resolve(), grounded: true, sources: ['mock-itsm', 'mock-monitoring', 'mock-aiops'] };
    },

    action: () => Promise.resolve({ label: 'Action', executes: false, message: 'Recorded in static mode.' }),
  },

  // ── Auth ──────────────────────────────────────────────────────────────
  auth: {
    me: () => Promise.resolve({ name: 'Infra Engineer', id: 'infra.eng', customer: 'GuideWell' }),
    logout: () => Promise.resolve({ success: true }),
  },
};
