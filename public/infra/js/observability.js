import { api } from './api.js';
import { el, esc, num, setError, metricCard, sparkline, STATUS_PILL, table } from './ui.js';
import { open, heading } from './modal.js';

/**
 * Observability tab — everything sourced from the monitoring connector.
 * Deliberately shows only monitoring data; joins live on the Overview tab.
 */
export async function renderObservability() {
  try {
    const [overview, alerts, capacity, trends] = await Promise.all([
      api.monitoring.overview(),
      api.monitoring.alerts('?state=open'),
      api.monitoring.capacity(),
      api.monitoring.trends()
    ]);

    renderSource(overview);
    renderServices(overview.services);
    renderSlos(overview.slos);
    renderCapacity(capacity.capacity);
    renderTrends(trends.trends);
    renderAlerts(alerts.alerts);
  } catch (err) {
    setError(el('obsServices'), err.message);
  }
}

function renderSource(o) {
  const s = o.summary;
  el('obsSource').innerHTML =
    `<span class="srcdot${s.byStatus.critical ? ' err' : s.byStatus.warning ? ' warn' : ''}"></span>`
    + `Source <b>${esc(o.provider)}</b> · ${esc(o.window.label)} · `
    + `${s.serviceCount} services · ${s.openAlerts} open alerts · `
    + `${s.suppressedDuplicates} duplicates suppressed by correlation`;
  el('obsSvcBadge').textContent =
    `${s.byStatus.critical} critical · ${s.byStatus.warning} warning · ${s.byStatus.healthy} healthy`;
  el('obsAlertBadge').textContent = `${s.openAlerts} open · ${s.criticalAlerts} critical`;
}

function renderServices(services) {
  table(el('obsServices'), [
    { label: 'Service', render: (s) => `<b>${esc(s.name)}</b><br><span style="color:var(--muted);font-size:11px">${esc(s.description)}</span>` },
    { label: 'Status', render: (s) => `<span class="pill ${STATUS_PILL[s.status]}">${esc(s.statusLabel)}</span>` },
    { label: 'Availability', align: 'right', render: (s) => fmtPct(s.metrics.availability) },
    { label: 'p95 latency', align: 'right', render: (s) => latency(s.metrics) },
    { label: 'Error rate', align: 'right', render: (s) => fmtPct(s.metrics.errorRatePct) },
    { label: 'Saturation', align: 'right', render: (s) => saturationCell(s.metrics.saturationPct) }
  ], services, {
    onRowClick: async (s) => {
      const detail = await api.monitoring.service(s.id);
      open({
        title: detail.name,
        subtitle: `${detail.description} · ${detail.statusLabel}`,
        body: serviceBody(detail),
        actions: [['no', 'Close']]
      });
    }
  });
}

function serviceBody(s) {
  const metrics = Object.entries(s.metrics).map(([k, v]) =>
    `<div class="b"><div class="l">${esc(label(k))}</div><div class="v">${esc(formatMetric(k, v))}</div></div>`).join('');

  const alerts = s.alerts.length
    ? `<ul>${s.alerts.map((a) => `<li><b>${esc(a.severity)}</b> — ${esc(a.message)}${a.correlatedTo ? ` <span style="color:var(--muted)">(→ ${esc(a.correlatedTo)})</span>` : ''}</li>`).join('')}</ul>`
    : '<div class="empty">No alerts on this service.</div>';

  const trends = s.trends.map((t) =>
    `<div style="margin-top:10px"><b>${esc(t.title)}</b>
       <div style="color:var(--muted);font-size:11.5px;margin-top:3px">${esc(t.forecast)}</div>
       ${sparkline(t.series, t.severity === 'critical' ? 'var(--red)' : 'var(--amber)')}</div>`).join('');

  return heading('Live metrics') + `<div class="kvs">${metrics}</div>`
    + heading('Open alerts') + alerts
    + (trends ? heading('Trends') + trends : '');
}

function renderSlos(slos) {
  el('obsSlos').innerHTML = slos.map((s) => metricCard({
    label: s.name,
    value: `${s.current}${s.unit}`,
    sub: `Target ${s.target}${s.unit} · ${s.trend}`,
    tone: s.status === 'breach' ? 'bad' : 'good'
  })).join('');
}

function renderCapacity(capacity) {
  el('obsCapacity').innerHTML = capacity.map((c) => {
    const tone = c.usedPct >= 88 ? 'var(--red)' : c.usedPct >= 75 ? 'var(--amber)' : 'var(--green)';
    return `<div class="item" style="cursor:default">
      <div class="hd">
        <div class="ttl">${esc(c.resource)}</div>
        <span class="pill ${c.usedPct >= 88 ? 'red' : c.usedPct >= 75 ? 'amb' : 'grn'}">${c.usedPct}%</span>
      </div>
      <div class="meta">
        <span>${c.daysToFull ? `${c.daysToFull} days to full` : 'At ceiling'}</span>
        ${c.growthTbPerWeek ? `<span>+${c.growthTbPerWeek} TB/week</span>` : ''}
        ${c.reclaimableTb ? `<span>${c.reclaimableTb} TB reclaimable</span>` : ''}
      </div>
      <div class="meter"><i style="width:${Math.min(100, c.usedPct)}%;background:${tone}"></i></div>
      <div class="meta" style="margin-top:7px"><span>${esc(c.driver)}</span></div>
    </div>`;
  }).join('');
}

function renderTrends(trends) {
  el('obsTrends').innerHTML = trends.map((t) => `
    <div class="mcard ${t.severity === 'critical' ? 'bad' : 'warn'}">
      <div class="ml">${esc(t.title)}</div>
      <div class="mv" style="font-size:15px;line-height:1.35">${esc(t.forecast)}</div>
      ${sparkline(t.series, t.severity === 'critical' ? 'var(--red)' : 'var(--amber)')}
      <div class="mt">${esc(t.detail)}</div>
    </div>`).join('');
}

function renderAlerts(alerts) {
  table(el('obsAlerts'), [
    { label: 'Alert', mono: true, render: (a) => esc(a.id) },
    { label: 'Severity', render: (a) => `<span class="pill ${STATUS_PILL[a.severity] || 'blu'}">${esc(a.severity)}</span>` },
    { label: 'Signal', mono: true, render: (a) => esc(a.signal) },
    { label: 'Message', render: (a) => esc(a.message) },
    { label: 'Correlated to', render: (a) => a.correlatedTo ? `<b>${esc(a.correlatedTo)}</b>` : '<span style="color:var(--muted)">—</span>' },
    { label: 'Dupes', align: 'right', render: (a) => a.suppressedDuplicates || '—' }
  ], alerts);
}

/* ── formatting ──────────────────────────────────────────────── */
const LABELS = {
  availability: 'Availability', latencyP95Ms: 'p95 latency', latencyBaselineMs: 'Baseline latency',
  errorRatePct: 'Error rate', saturationPct: 'Saturation', queueDepth: 'Queue depth', queueNormal: 'Queue normal'
};
const label = (k) => LABELS[k] || k;

function formatMetric(k, v) {
  if (k === 'availability' || k === 'errorRatePct' || k === 'saturationPct') return `${v}%`;
  if (k.endsWith('Ms')) return v >= 1000 ? `${(v / 1000).toFixed(1)}s` : `${num(v)}ms`;
  return num(v);
}

const fmtPct = (v) => (v === undefined || v === null ? '—' : `${v}%`);

function latency(m) {
  if (m.latencyP95Ms === undefined) return '—';
  const current = formatMetric('latencyP95Ms', m.latencyP95Ms);
  if (!m.latencyBaselineMs) return current;
  const ratio = m.latencyP95Ms / m.latencyBaselineMs;
  const colour = ratio > 2 ? 'var(--red)' : ratio > 1.3 ? 'var(--amber)' : 'var(--muted)';
  return `${current} <span style="color:${colour};font-size:11px">×${ratio.toFixed(1)}</span>`;
}

function saturationCell(v) {
  if (v === undefined) return '—';
  const colour = v >= 88 ? 'var(--red)' : v >= 75 ? 'var(--amber)' : 'var(--green)';
  return `${v}%<div class="meter" style="width:58px;margin-left:auto"><i style="width:${Math.min(100, v)}%;background:${colour}"></i></div>`;
}
