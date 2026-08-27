import { esc, md } from './ui.js';
import { heading, note } from './modal.js';

/**
 * Renders one ticket into modal markup.
 *
 * Shared by the Overview attention list and the Tickets table so a ticket
 * looks identical wherever it is opened from.
 */
export function renderIncidentBody(incident) {
  const parts = [];

  if (incident.signal) parts.push(heading('Signal') + md(incident.signal));

  if (incident.analysis?.length) {
    parts.push(heading('Agent analysis')
      + `<ul>${incident.analysis.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>`);
  }

  if (incident.businessImpact) parts.push(heading('Business impact') + md(incident.businessImpact));
  if (incident.recommendation) parts.push(heading('Recommended action') + md(incident.recommendation));
  if (incident.note) parts.push(note(incident.note.tone, incident.note.text));

  parts.push(heading('Record')
    + `<div class="kvs">
        <div class="b"><div class="l">Priority</div><div class="v">${esc(incident.priority)}</div></div>
        <div class="b"><div class="l">State</div><div class="v">${esc(incident.state)}</div></div>
        <div class="b"><div class="l">Assignee</div><div class="v">${esc(incident.assignee)}</div></div>
        <div class="b"><div class="l">SLA</div><div class="v"${slaStyle(incident)}>${esc(incident.slaRemaining || '—')}</div></div>
       </div>`);

  return parts.join('');
}

export function incidentSubtitle(incident) {
  return [incident.id, incident.serviceName, incident.slaRemaining].filter(Boolean).join(' · ');
}

function slaStyle(incident) {
  if (!incident.slaRemaining) return '';
  if (/overdue/i.test(incident.slaRemaining)) return ' style="color:#fca5a5"';
  if ((incident.slaRiskPct || 0) >= 70) return ' style="color:#fcd34d"';
  return '';
}
