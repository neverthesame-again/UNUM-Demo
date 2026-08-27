import { el, esc, toast } from './ui.js';
import { setLocked, close, modalParts, note, toneStyle } from './modal.js';

/**
 * Live agent execution console.
 *
 * Steps are paced client-side from the durations the server sends. When you
 * connect a real orchestrator, replace the setTimeout loop with an
 * EventSource on a server-sent-events endpoint — the rendering below does not
 * need to change, only the source of each step transition.
 */
export function runExecution({ label, plan, operator }) {
  setLocked(true);
  const started = Date.now();
  let aborted = false;
  let index = 0;

  modalParts.title().textContent = 'Agent Execution — ' + plan.title;
  modalParts.subtitle().textContent =
    `Approved by ${operator} · ${new Date().toLocaleTimeString()} · executing in the background`;

  modalParts.body().innerHTML = `
    <div class="exec">
      <div class="bar"><i id="exbar"></i></div>
      <div class="exhdr">
        <span class="st run" id="exst">▶ Running</span>
        <span id="excnt">step 0 of ${plan.steps.length}</span>
      </div>
      <div class="rows" id="exrows">${plan.steps.map(([agent, text], i) => `
        <div class="erow" id="er${i}">
          <div class="ic">○</div>
          <div class="ag">${esc(agent)} Agent</div>
          <div class="tx">${esc(text)}</div>
          <div class="el" id="el${i}"></div>
        </div>`).join('')}
      </div>
      <div class="term" id="exterm">$ agent-mesh exec --runbook "${esc(plan.title)}" --approver ${esc(operator)}</div>
    </div>
    <div class="done-box" id="exdone"></div>`;

  modalParts.footer().innerHTML =
    `<button class="bt no" id="exabort">Abort</button><button class="bt ok" id="exclose" disabled>Close</button>`;
  el('ov').classList.add('on');
  el('exabort').addEventListener('click', () => { aborted = true; });

  const tick = () => {
    if (aborted) return abort();
    if (index >= plan.steps.length) return finish();

    const row = el('er' + index);
    row.classList.add('on');
    row.querySelector('.ic').textContent = '◜';
    el('excnt').textContent = `step ${index + 1} of ${plan.steps.length}`;
    el('exbar').style.width = ((index / plan.steps.length) * 100) + '%';
    el('exterm').textContent = `$ [${plan.steps[index][0].toLowerCase()}-agent] ${plan.steps[index][1].toLowerCase()}`;
    el('exrows').scrollTop = Math.max(0, row.offsetTop - 120);

    const duration = plan.steps[index][2];
    setTimeout(() => {
      if (aborted) return abort();
      row.classList.remove('on');
      row.classList.add('done');
      row.querySelector('.ic').textContent = '✓';
      el('el' + index).textContent = (duration / 1000).toFixed(1) + 's';
      index += 1;
      tick();
    }, duration);
  };

  const abort = () => {
    setLocked(false);
    el('exst').textContent = '■ Aborted';
    el('exst').className = 'st';
    el('exterm').textContent = '$ execution aborted by operator — rolling back partial changes';
    el('exdone').className = 'done-box on';
    el('exdone').innerHTML = note('warning',
      'Execution aborted. Any partial changes have been rolled back automatically. The record has been annotated with the abort reason.');
    el('exclose').disabled = false;
    el('exabort').disabled = true;
    el('exclose').addEventListener('click', close);
  };

  const finish = () => {
    setLocked(false);
    const elapsed = ((Date.now() - started) / 1000).toFixed(1);
    el('exbar').style.width = '100%';
    el('exst').textContent = '✓ Completed';
    el('exst').className = 'st ok';
    el('excnt').textContent = `${plan.steps.length} of ${plan.steps.length} steps · ${elapsed}s elapsed`;
    el('exterm').textContent = '$ execution complete — exit 0 · audit entry written · rollback available 24h';
    el('exdone').className = 'done-box on';
    el('exdone').innerHTML = renderOutcome(plan.outcome)
      + note('governance', `Audit entry written: **${operator}** · ${new Date().toLocaleString()} · runbook ${plan.title} · immutable log, 6-year retention.`);
    el('exclose').disabled = false;
    el('exabort').disabled = true;
    el('exclose').addEventListener('click', () => { close(); toast(`✓ ${label} completed successfully.`, 'ok'); });
    toast('✓ Agent finished: ' + plan.title, 'ok');
  };

  setTimeout(tick, 400);
}

function renderOutcome(outcome = {}) {
  const parts = [];
  if (outcome.heading) parts.push(`<h4>${esc(outcome.heading)}</h4>`);
  if (outcome.facts) {
    parts.push(`<div class="kvs">${outcome.facts.map(([l, v, tone]) =>
      `<div class="b"><div class="l">${esc(l)}</div><div class="v"${toneStyle(tone)}>${esc(v)}</div></div>`).join('')}</div>`);
  }
  if (outcome.bullets) {
    parts.push(`<ul>${outcome.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`);
  }
  if (outcome.note) parts.push(note(outcome.note.tone, outcome.note.text));
  return parts.join('');
}
