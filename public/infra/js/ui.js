/** Shared DOM and formatting helpers. */

export const el = (id) => document.getElementById(id);

/** Escapes text destined for innerHTML. Server strings are data, not markup. */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Renders the subset of markdown the assist answers use: **bold** and newlines. */
export function md(text) {
  return esc(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
}

export const num = (n, digits = 0) =>
  n === null || n === undefined ? '—' : Number(n).toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const compact = (n) =>
  n === null || n === undefined ? '—' : Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export const STATUS_PILL = { healthy: 'grn', warning: 'amb', critical: 'red', unknown: 'blu' };
export const SEV_COLOR = { critical: 'var(--red)', warning: 'var(--amber)', info: 'var(--cyan)', red: 'var(--red)', amber: 'var(--amber)' };

export function pill(text, tone) {
  return `<span class="pill ${tone}">${esc(text)}</span>`;
}

export function setLoading(node, label = 'Loading') {
  node.innerHTML = `<div class="loading">${esc(label)}</div>`;
}

export function setError(node, message) {
  node.innerHTML = `<div class="errbox"><b>Could not load this panel.</b><br>${esc(message)}</div>`;
}

export function setEmpty(node, message) {
  node.innerHTML = `<div class="empty">${esc(message)}</div>`;
}

/** Builds a table from column definitions, keeping markup out of the modules. */
export function table(node, columns, rows, { onRowClick } = {}) {
  if (!rows.length) {
    node.innerHTML = `<tbody><tr><td class="empty">Nothing to show.</td></tr></tbody>`;
    return;
  }
  const head = columns.map((c) => `<th${c.align === 'right' ? ' class="num"' : ''}>${esc(c.label)}</th>`).join('');
  const body = rows.map((row, i) => {
    const cells = columns.map((c) => {
      const cls = [c.align === 'right' ? 'num' : '', c.mono ? 'mono' : ''].filter(Boolean).join(' ');
      return `<td${cls ? ` class="${cls}"` : ''}>${c.render(row)}</td>`;
    }).join('');
    return `<tr data-index="${i}"${onRowClick ? ' class="clickable" tabindex="0"' : ''}>${cells}</tr>`;
  }).join('');

  node.innerHTML = `<thead><tr>${head}</tr></thead><tbody>${body}</tbody>`;

  if (onRowClick) {
    node.querySelectorAll('tbody tr').forEach((tr) => {
      const activate = () => onRowClick(rows[Number(tr.dataset.index)]);
      tr.addEventListener('click', activate);
      tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') activate(); });
    });
  }
}

/** Metric card. `tone` drives the accent colour. */
export function metricCard({ label, value, sub, tone = '' }) {
  return `<div class="mcard ${tone}">
    <div class="ml">${esc(label)}</div>
    <div class="mv">${esc(value)}</div>
    ${sub ? `<div class="mt">${esc(sub)}</div>` : ''}
  </div>`;
}

/** Inline SVG sparkline — no chart library needed for a 7-point series. */
export function sparkline(series, colour = 'var(--accent2)') {
  if (!series || series.length < 2) return '';
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const points = series.map((v, i) => {
    const x = (i / (series.length - 1)) * 100;
    const y = 34 - ((v - min) / span) * 30;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return `<svg class="spark" viewBox="0 0 100 38" preserveAspectRatio="none" aria-hidden="true">
    <polyline points="${points}" fill="none" stroke="${colour}" stroke-width="2"
      vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

export function toast(text, kind = 'ok') {
  const d = document.createElement('div');
  d.className = 'toast ' + (kind === 'ok' ? '' : kind);
  d.textContent = text;
  el('toasts').appendChild(d);
  setTimeout(() => {
    d.style.opacity = 0;
    d.style.transition = '.4s';
    setTimeout(() => d.remove(), 400);
  }, 5200);
}
