import { api } from './api.js';
import { el, esc, toast, setError } from './ui.js';
import { initModal, open, close } from './modal.js';
import { runExecution } from './exec.js';
import { renderOverview, consumeApprovedAttention, removeAttentionItem } from './overview.js';
import { renderObservability } from './observability.js';
import { renderTickets } from './tickets.js';
import { renderAi } from './ai.js';
import { initChat } from './chat.js';

/**
 * Entry point. Wires the tabs, loads the Overview eagerly and the other
 * tabs on first open, and routes every approval button through the server.
 */

let operator = 'Operator';
let activeTab = 'overview';
const loaded = new Set();

const TABS = {
  overview: { panel: 'panel-overview', render: null },      // rendered at boot
  observability: { panel: 'panel-observability', render: renderObservability },
  tickets: { panel: 'panel-tickets', render: renderTickets },
  ai: { panel: 'panel-ai', render: renderAi }
};

async function boot() {
  initModal({ onAction: handleAction });
  initTabs();
  initChat();
  initLogout();
  initRefreshButtons();
  loadHealth();

  try {
    const dashboard = await api.dashboard();
    operator = dashboard.operator.name;
    await renderOverview(dashboard);
    loaded.add('overview');
    updateTabCounts(dashboard);
    startAutoRefresh();
  } catch (err) {
    setError(el('svcList'), err.message);
    el('greetLine').textContent = 'Could not reach the server.';
    el('greetSub').textContent = err.message;
  }
}

/* ── Tabs ──────────────────────────────────────────────────── */
function initTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => activate(tab.dataset.tab));
    tab.addEventListener('keydown', (e) => {
      const tabs = [...document.querySelectorAll('.tab')];
      const i = tabs.indexOf(tab);
      if (e.key === 'ArrowRight') tabs[(i + 1) % tabs.length].focus();
      if (e.key === 'ArrowLeft') tabs[(i - 1 + tabs.length) % tabs.length].focus();
    });
  });
}

async function activate(name) {
  activeTab = name;
  for (const [key, cfg] of Object.entries(TABS)) {
    const selected = key === name;
    el(`tab-${key}`).setAttribute('aria-selected', String(selected));
    el(cfg.panel).hidden = !selected;
  }

  const cfg = TABS[name];
  if (cfg.render && !loaded.has(name)) {
    loaded.add(name);
    try {
      await cfg.render();
    } catch (err) {
      loaded.delete(name);
      toast(`Could not load ${name}: ${err.message}`, 'info');
    }
  }
}

function updateTabCounts(dashboard) {
  el('cnt-obs').textContent = dashboard.services.length;
  el('cnt-tix').textContent = dashboard.summary.incidents.total;
  el('cnt-ai').textContent = dashboard.ai.summary.autonomousActions;
}

/* ── Session ───────────────────────────────────────────────── */
  function initLogout() {
    const btn = document.getElementById('logoutBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        window.parent.postMessage({ type: 'INFRA_LOGOUT' }, '*');
      });
    }
  }

/* ── Approvals ─────────────────────────────────────────────── */
/**
 * Every action button in the app funnels through here. The server decides
 * whether a label executes a runbook or just records a decision — the client
 * never makes that call itself.
 */
async function handleAction(label, tone) {
  const attentionId = consumeApprovedAttention();
  const ticketId = tone === 'ok' ? attentionId : null;
  try {
    const result = await api.assist.action(label, ticketId);
    if (!result.executes) {
      close();
      toast(result.message, 'info');
    } else {
      runExecution({ label: result.label, plan: result.plan, operator });
    }
    if (ticketId) removeAttentionItem(ticketId);
  } catch (err) {
    close();
    toast(`Action failed: ${err.message}`, 'info');
  }
}

/* ── Refresh ───────────────────────────────────────────────── */
/**
 * Pulls fresh numbers for every section. The mock connectors re-roll their
 * live-gauge jitter on every read once the cache is invalidated, so this is
 * what makes the dashboard's numbers actually move — re-fetches the Overview
 * plus whichever tab is currently on screen, since a hidden tab will pick up
 * the new numbers the next time it is opened anyway.
 */
let refreshing = false;
async function refreshAll({ silent = false } = {}) {
  if (refreshing) return;
  refreshing = true;
  const buttons = document.querySelectorAll('.refresh-btn');
  if (!silent) buttons.forEach((b) => { b.textContent = '…'; b.setAttribute('aria-busy', 'true'); });

  try {
    await api.refresh();
    const dashboard = await api.dashboard();
    await renderOverview(dashboard);
    loaded.add('overview');
    updateTabCounts(dashboard);

    if (activeTab !== 'overview') {
      await TABS[activeTab].render();
      loaded.add(activeTab);
    }
    if (!silent) toast('Sources refreshed.', 'ok');
  } catch (err) {
    if (!silent) toast(`Refresh failed: ${err.message}`, 'info');
  } finally {
    if (!silent) buttons.forEach((b) => { b.textContent = 'Refresh'; b.removeAttribute('aria-busy'); });
    refreshing = false;
  }
}

function initRefreshButtons() {
  document.querySelectorAll('.refresh-btn').forEach((btn) => {
    btn.addEventListener('click', () => refreshAll());
    btn.addEventListener('keydown', (e) => { if (e.key === 'Enter') refreshAll(); });
  });
}

/**
 * Keeps the dashboard ticking on its own — the state of environment tiles,
 * service gauges and KPIs move over time even if nobody touches Refresh.
 * Skipped while a modal is open (don't yank content out from under an
 * approval the operator is mid-review on) or the tab is in the background.
 */
function startAutoRefresh(intervalMs = 20000) {
  setInterval(() => {
    if (document.hidden) return;
    if (el('ov').classList.contains('on')) return;
    refreshAll({ silent: true });
  }, intervalMs);
}

/* ── Connector health sidebar ──────────────────────────────── */
async function loadHealth() {
  try {
    const health = await api.health();
    const domain = { monitoring: 'Monitoring', itsm: 'ITSM', aiops: 'AI observability' };
    el('healthList').innerHTML = health.connectors.map((c) =>
      `<div class="wrow">
         <span>${esc(domain[c.domain] || c.domain)}<br>
           <span style="color:var(--muted);font-size:11px">${esc(c.label)}</span></span>
         <span class="pill ${c.status === 'ok' ? 'grn' : 'amb'}">${esc(c.status)}</span>
       </div>`).join('')
      + `<div class="wrow"><span>Refresh all sources</span>
           <span class="pill blu refresh-btn" style="cursor:pointer" tabindex="0" role="button">Refresh</span></div>`;
    initRefreshButtons();
  } catch (err) {
    setError(el('healthList'), err.message);
  }
}

boot();
