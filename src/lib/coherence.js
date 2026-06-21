// src/lib/coherence.js
// ─────────────────────────────────────────────────────────────────────────────
// Sammenhengsmotoren ("coherence engine").
//
// Én normalisering av ALT ansvar i appen — på tvers av alle portaler, forum,
// tverrgående prosjekter og verktøyene markedsplan/sortiment. Tre linser leser
// fra den samme lista:
//   • myWork(items, userId)  → A: alt en person eier (komplett, kryssportal)
//   • looseEnds(items, ids)  → B: alt som henger (uten eier, ukoblet, forfalt …)
// Beslutninger og innmeldte saker registreres her også (C).
//
// Alt er rene funksjoner uten sideeffekter. Defensiv mot manglende felt.
// ─────────────────────────────────────────────────────────────────────────────

const PORTAL_LABEL = {
  leadership: 'Ledelse', marketing: 'Marked', sales: 'Salg',
  innkjop: 'Innkjøp', produkt: 'Produkt',
};

function daysFrom(iso) {
  if (!iso) return null;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const x = new Date(iso); if (isNaN(x.getTime())) return null; x.setHours(0, 0, 0, 0);
  return Math.round((x - t) / 86400000);
}

// Alle kjente medlems-ID-er (alle portaler + forum) — for å oppdage eiere som
// ikke lenger matcher et medlem.
export function globalMemberIds(allData = {}, forumData = {}) {
  const ids = new Set();
  Object.values(allData).forEach((d) => (d?.members || []).forEach((m) => m?.id && ids.add(m.id)));
  Object.values(forumData).forEach((f) => (f?.members || []).forEach((m) => m?.id && ids.add(m.id)));
  return ids;
}

function nameFor(allData, id) {
  if (!id) return '';
  for (const d of Object.values(allData)) {
    const m = (d?.members || []).find((x) => x.id === id);
    if (m) return m.name;
  }
  return '';
}

// Normalisert enhet:
// { uid, kind, label, title, owner, ownerName, done, status, dueDate,
//   portal, portalLabel, view, source, ...flagg }
export function collectOwnership({
  allData = {}, forumData = {}, crossorgData = {},
  markedsplanAssignments = [], sortimentAssignments = [],
} = {}) {
  const out = [];
  const add = (o) => out.push(o);
  const isTaskDone = (s) => s === 'fullført';

  // ── Avdelingsinterne enheter (per portal) ──
  Object.entries(allData).forEach(([pid, d]) => {
    if (!d) return;
    const pl = PORTAL_LABEL[pid] || pid;
    (d.tasks || []).forEach((t) => add({
      uid: `${pid}:task:${t.id}`, kind: 'oppgave', label: 'Oppgave', title: t.title,
      owner: t.owner || null, status: t.status, done: isTaskDone(t.status),
      dueDate: t.dueDate || '', priority: t.priority || 'medium',
      portal: pid, portalLabel: pl, view: 'tasks', source: 'portal',
    }));
    (d.decisions || []).forEach((x) => add({
      uid: `${pid}:dec:${x.id}`, kind: 'beslutning', label: 'Beslutning', title: x.title,
      owner: x.owner || null, status: x.reviewStatus || x.status, done: x.reviewStatus === 'ferdig',
      dueDate: x.reviewDate || '', portal: pid, portalLabel: pl, view: 'decisions', source: 'portal',
      noReview: !x.reviewDate,
    }));
    (d.risks || []).forEach((x) => add({
      uid: `${pid}:risk:${x.id}`, kind: 'risiko', label: 'Risiko', title: x.title || x.name,
      owner: x.owner || null, status: x.status, done: !!x.status && x.status !== 'aktiv',
      dueDate: x.reviewDate || '', portal: pid, portalLabel: pl, view: 'risks', source: 'portal',
    }));
    (d.initiatives || []).forEach((x) => add({
      uid: `${pid}:init:${x.id}`, kind: 'initiativ', label: 'Initiativ', title: x.title || x.name,
      owner: x.owner || null, status: x.status, done: x.status === 'fullført' || x.status === 'avlyst',
      dueDate: x.targetDate || x.deadline || '', portal: pid, portalLabel: pl, view: 'initiatives', source: 'portal',
    }));
    (d.kpis || []).forEach((x) => add({
      uid: `${pid}:kpi:${x.id}`, kind: 'kpi', label: 'Nøkkeltall', title: x.title || x.name,
      owner: x.owner || null, status: x.status, done: false,
      dueDate: x.dueDate || '', portal: pid, portalLabel: pl, view: 'kpis', source: 'portal',
    }));
    (d.plans || []).forEach((x) => add({
      uid: `${pid}:plan:${x.id}`, kind: 'plan', label: 'Plan', title: x.title || x.name,
      owner: x.owner || null, status: x.status, done: false,
      dueDate: '', portal: pid, portalLabel: pl, view: 'plans', source: 'portal',
    }));
    (d.projects || []).forEach((x) => add({
      uid: `${pid}:proj:${x.id}`, kind: 'prosjekt', label: 'Prosjekt', title: x.title || x.name,
      owner: x.lead || x.owner || null, status: x.status, done: x.status === 'fullført' || x.status === 'avlyst',
      dueDate: x.deadline || x.dueDate || '', portal: pid, portalLabel: pl, view: 'projects', source: 'portal',
    }));
    (d.agendaProposals || []).forEach((x) => add({
      uid: `${pid}:prop:${x.id}`, kind: 'sak', label: 'Innmeldt sak', title: x.title,
      owner: x.proposer || null, status: x.status, done: !!x.status && x.status !== 'foreslått',
      dueDate: '', portal: pid, portalLabel: pl, view: 'proposals', source: 'portal',
      noMeeting: !x.meetingId,
    }));
  });

  // ── Forum-oppgaver ──
  Object.entries(forumData).forEach(([fid, f]) => {
    if (!f) return;
    (f.tasks || []).forEach((t) => add({
      uid: `forum:${fid}:task:${t.id}`, kind: 'oppgave', label: 'Forum-oppgave', title: t.title,
      owner: t.owner || null, status: t.status, done: isTaskDone(t.status),
      dueDate: t.dueDate || '', portal: `forum:${fid}`, portalLabel: 'Forum', view: 'tasks', source: 'forum', forumId: fid,
    }));
  });

  // ── Tverrgående prosjekter ──
  (crossorgData?.projects || []).forEach((p) => {
    add({
      uid: `crossorg:proj:${p.id}`, kind: 'prosjekt', label: 'Tverrgående prosjekt', title: p.title || p.name,
      owner: p.lead || null, status: p.status, done: p.status === 'fullført' || p.status === 'avlyst',
      dueDate: p.deadline || '', portal: 'crossorg', portalLabel: 'Tverrgående', view: 'crossorg', source: 'crossorg',
    });
    (p.tasks || []).forEach((t) => add({
      uid: `crossorg:task:${t.id}`, kind: 'oppgave', label: 'Prosjektoppgave', title: t.title,
      owner: t.owner || null, status: t.status, done: isTaskDone(t.status),
      dueDate: t.dueDate || '', portal: 'crossorg', portalLabel: 'Tverrgående', view: 'crossorg', source: 'crossorg',
    }));
  });

  // ── Markedsplan (allerede normalisert i App) ──
  (markedsplanAssignments || []).forEach((a) => add({
    uid: `mp:${a.external_id || a.id}`, kind: a.mpKind || 'oppgave', label: 'Markedsplan', title: a.title,
    owner: a.owner || null, ownerName: a.ownerName || '', status: a.status, done: a.status === 'fullført',
    dueDate: a.dueDate || '', portal: a.portal || 'marketing', portalLabel: PORTAL_LABEL[a.portal] || 'Marked',
    view: 'markedsplan', source: 'markedsplan', unresolvedName: !a.owner && !!a.ownerName,
  }));

  // ── Sortiment (allerede normalisert i App) ──
  (sortimentAssignments || []).forEach((a) => add({
    uid: `sort:${a.external_id || a.id}`, kind: 'sortiment', label: 'Sortiment', title: a.title,
    owner: a.owner || null, ownerName: a.ownerName || '', status: a.status, done: a.status === 'fullført',
    dueDate: a.dueDate || '', portal: 'produkt', portalLabel: 'Produkt',
    view: 'sortiment', source: 'sortiment', unresolvedName: !a.owner && !!a.ownerName, link: a.link || '',
  }));

  // Fyll inn eiernavn der det mangler.
  out.forEach((o) => { if (!o.ownerName) o.ownerName = nameFor(allData, o.owner); });
  return out;
}

// Oppgave-lignende enheter som hører hjemme i "Mine oppgaver".
const TASK_KINDS = new Set(['oppgave', 'aktivitet', 'kampanje', 'overlevering', 'sortiment']);

// A — alt en person eier som fortsatt er åpent, komplett og på tvers.
export function myWork(items = [], currentUserId) {
  if (!currentUserId) return [];
  return items
    .filter((o) => TASK_KINDS.has(o.kind) && o.owner === currentUserId && !o.done)
    .map((o) => ({
      id: o.uid, srcId: String(o.uid).split(':').pop(), title: o.title, dueDate: o.dueDate, status: o.status,
      owner: o.owner, priority: o.priority || 'medium', source: o.source, view: o.view,
      portal: o.portal, portalLabel: o.portalLabel, kind: o.kind,
    }))
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
}

// B — alt som henger eller kan ligge gjemt, hele appen.
export function looseEnds(items = [], knownIds) {
  const ownerless = [], unresolved = [], overdue = [], decNoReview = [], propNoMeeting = [];
  items.forEach((o) => {
    if (o.done) return;
    if (!o.owner && !o.ownerName) ownerless.push(o);
    else if (o.unresolvedName || (o.owner && knownIds && !knownIds.has(o.owner))) unresolved.push(o);
    const d = daysFrom(o.dueDate);
    if (d !== null && d < 0) overdue.push(o);
    if (o.kind === 'beslutning' && o.noReview) decNoReview.push(o);
    if (o.kind === 'sak' && o.noMeeting) propNoMeeting.push(o);
  });
  const total = ownerless.length + unresolved.length + overdue.length + decNoReview.length + propNoMeeting.length;
  return { ownerless, unresolved, overdue, decNoReview, propNoMeeting, total };
}
