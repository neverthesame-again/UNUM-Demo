import { el, esc, md } from './ui.js';

/**
 * Modal controller. Owns the overlay and exposes a `locked` flag the
 * execution console sets so a running runbook cannot be dismissed.
 */
let locked = false;
let onAction = () => {};

export function initModal({ onAction: handler }) {
  onAction = handler;
  el('modalClose').addEventListener('click', close);
  el('ov').addEventListener('click', (e) => { if (e.target === el('ov')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

export function setLocked(value) { locked = value; }

export function close() {
  if (locked) return;
  el('ov').classList.remove('on');
}

export function open({ title, subtitle, body, actions = [] }) {
  el('mt').textContent = title;
  el('ms').textContent = subtitle || '';
  el('mb').innerHTML = body;
  el('mf').innerHTML = actions
    .map(([tone, label], i) => `<button class="bt ${tone}" data-action-index="${i}">${esc(label)}</button>`)
    .join('');

  el('mf').querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [tone, label] = actions[Number(btn.dataset.actionIndex)];
      onAction(label, tone);
    });
  });

  el('ov').classList.add('on');
}

/** Direct access for the execution console, which rewrites the modal in place. */
export const modalParts = {
  title: () => el('mt'),
  subtitle: () => el('ms'),
  body: () => el('mb'),
  footer: () => el('mf')
};

/** Renders the server's structured panel sections into modal markup. */
export function renderSections(sections = []) {
  return sections.map((s) => {
    switch (s.type) {
      case 'facts':
        return `${heading(s.heading)}<div class="kvs">${s.facts.map(([l, v, tone]) =>
          `<div class="b"><div class="l">${esc(l)}</div><div class="v"${toneStyle(tone)}>${esc(v)}</div></div>`).join('')}</div>`;
      case 'list':
        return `${heading(s.heading)}<ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
      case 'code':
        return `${heading(s.heading)}<pre class="code">${esc(s.code)}</pre>`;
      case 'text':
        return `${heading(s.heading)}${md(s.text)}`;
      case 'note':
        return note(s.tone, s.text);
      default:
        return '';
    }
  }).join('');
}

export function heading(text) {
  return text ? `<h4>${esc(text)}</h4>` : '';
}

export function note(tone, text) {
  const cls = { warning: 'note warn', governance: 'note gov', info: 'note' }[tone] || 'note';
  return `<div class="${cls}">${md(text)}</div>`;
}

export function toneStyle(tone) {
  if (tone === 'good') return ' style="color:#86efac"';
  if (tone === 'warn') return ' style="color:#fcd34d"';
  if (tone === 'bad') return ' style="color:#fca5a5"';
  return '';
}
