import { api } from './api.js';
import { el, esc, md } from './ui.js';

/**
 * Assist chat. Questions go to the server, which matches an intent and
 * resolves numeric answers against the same connectors the dashboard reads —
 * so the chat can never quote a figure the tabs disagree with.
 */
export async function initChat() {
  el('sendBtn').addEventListener('click', send);
  el('q').addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

  const [greeting, suggestions] = await Promise.all([
    api.assist.greeting().catch(() => null),
    api.assist.suggestions().catch(() => ({ suggestions: [] }))
  ]);

  renderSuggestions(suggestions.suggestions);

  push('ai', greeting
    ? md(greeting.text)
    : 'I could not reach the assist service. The dashboard panels above still work.');
}

function renderSuggestions(list) {
  el('sugg').innerHTML = list.map((s) => `<span class="sg" tabindex="0" role="button">${esc(s)}</span>`).join('');
  el('sugg').querySelectorAll('.sg').forEach((node) => {
    const ask = () => { el('q').value = node.textContent; send(); };
    node.addEventListener('click', ask);
    node.addEventListener('keydown', (e) => { if (e.key === 'Enter') ask(); });
  });
}

function push(cls, html) {
  const d = document.createElement('div');
  d.className = 'm ' + cls;
  d.innerHTML = html;
  el('msgs').appendChild(d);
  el('msgs').scrollTop = 1e9;
  return d;
}

async function send() {
  const value = el('q').value.trim();
  if (!value) return;
  el('q').value = '';

  push('me', esc(value));
  const pending = push('ai', '<span class="typing">Reliability Assist is checking ITSM, monitoring and CMDB…</span>');

  try {
    const reply = await api.assist.ask(value);
    pending.innerHTML = md(reply.answer)
      + (reply.grounded
        ? `<div class="mt" style="margin-top:8px;font-size:10.5px;color:var(--muted)">Grounded in ${esc(reply.sources.join(' · '))}</div>`
        : '');
  } catch (err) {
    pending.innerHTML = `<span style="color:#fca5a5">Could not reach the assist service — ${esc(err.message)}</span>`;
  }
}
