import React, { useState, useMemo } from 'react';

/* ============================================================================
   PROSJEKTSTYRING — proaktiv, helintegrert modul for Vikingbad-portalen
   ----------------------------------------------------------------------------
   - Proaktivt oppmerksomhetsfelt som beregnes automatisk (forsinkelser,
     stillstand, manglende oppdatering, helse-signaler).
   - Automatisk helseberegning med begrunnelse + «bruk forslag».
   - Visninger: Oversikt · Tavle (kanban) · Tidslinje (gantt) · Min uke.
   - Rik prosjektdetalj: oppgaver (kanban/liste), milepæler, deltakere & ansvar,
     statuslogg (modulens proaktive hjerteslag) og koblinger til møter,
     beslutninger, risiko, KPI og initiativ.
   - Integrasjon: avdelingsoppgaver lever i data.tasks (vises i Oppgaver,
     Kalender, Min pult). Statuslogg + signaler driver proaktiviteten.
   ========================================================================== */

const theme = {
  bg: '#EDE9DF', surface: '#FFFFFF', surfaceAlt: '#E4DFD4',
  ink: '#252525', inkSoft: '#4A4A4A', inkMuted: '#7A7A7A',
  border: '#CBC4AF', borderSoft: '#DDD8CB',
  brass: '#9D8068', brassDark: '#7D6450', brassLight: '#EDE4DB',
  navy: '#252525', navyDark: '#1A1A1A',
  sage: '#5E6A60', sageLight: '#E3E7E3',
  rust: '#F4835A', rustLight: '#FDE8E0', rustDeep: '#C75B36',
  amber: '#B89070', amberLight: '#F2E8DE', amberDeep: '#8B6914',
};
const serif = "'Fraunces', Georgia, serif";

/* ===== ikoner (inline lucide-stil) ===== */
const ico = (paths) => ({ size = 16, style = {}, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" style={{ flexShrink: 0, ...style }} {...rest}
    dangerouslySetInnerHTML={{ __html: paths }} />
);
const Plus = ico('<path d="M5 12h14"/><path d="M12 5v14"/>');
const X = ico('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');
const ArrowLeft = ico('<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>');
const ChevronRight = ico('<path d="m9 18 6-6-6-6"/>');
const Flag = ico('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>');
const AlertTriangle = ico('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>');
const Clock = ico('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>');
const CheckCircle = ico('<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>');
const Circle = ico('<circle cx="12" cy="12" r="10"/>');
const Users = ico('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>');
const CalIcon = ico('<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>');
const Activity = ico('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>');
const Zap = ico('<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>');
const Target = ico('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>');
const LinkIcon = ico('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>');
const Sparkles = ico('<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>');
const Edit2 = ico('<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>');
const Trash2 = ico('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>');
const Grip = ico('<circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>');
const LayoutGrid = ico('<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>');
const ListIcon = ico('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>');
const GanttIcon = ico('<path d="M8 6h10"/><path d="M6 12h9"/><path d="M11 18h7"/>');
const BellRing = ico('<path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>');
const Briefcase = ico('<rect width="20" height="14" x="2" y="6" rx="2"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>');
const TrendDown = ico('<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>');
const FileText = ico('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/>');
const Gavel = ico('<path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/>');
const ShieldAlert = ico('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>');
const ChartIcon = ico('<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>');

/* ===== dato- og formathelpere ===== */
const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9);
const todayIso = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) => { if (!iso) return ''; return new Date(iso).toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric' }); };
const fmtDayMon = (iso) => { if (!iso) return ''; return new Date(iso).toLocaleDateString('no-NO', { day: 'numeric', month: 'short' }); };
const daysFromNow = (iso) => { if (!iso) return null; const t = new Date(); t.setHours(0, 0, 0, 0); const x = new Date(iso); x.setHours(0, 0, 0, 0); return Math.round((x - t) / 86400000); };
const relativeDate = (iso) => { const d = daysFromNow(iso); if (d === null) return ''; if (d === 0) return 'i dag'; if (d === 1) return 'i morgen'; if (d === -1) return 'i går'; if (d > 0 && d <= 14) return `om ${d} dager`; if (d < 0 && d >= -30) return `for ${Math.abs(d)} dager siden`; return fmtDate(iso); };
const daysSince = (iso) => { if (!iso) return null; const d = daysFromNow(iso); return d === null ? null : -d; };
const getWeek = (date) => { const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())); const n = d.getUTCDay() || 7; d.setUTCDate(d.getUTCDate() + 4 - n); const ys = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)); return Math.ceil((((d - ys) / 86400000) + 1) / 7); };

const statusLabels = { planlagt: 'Planlagt', 'pågår': 'Pågår', pause: 'Pause', fullført: 'Fullført', avlyst: 'Avlyst' };
const statusOrder = ['planlagt', 'pågår', 'pause', 'fullført', 'avlyst'];
const statusColor = (s) => ({
  planlagt: { bg: theme.amberLight, fg: theme.amberDeep },
  'pågår': { bg: theme.brassLight, fg: theme.brassDark },
  pause: { bg: theme.surfaceAlt, fg: theme.inkMuted },
  fullført: { bg: theme.sageLight, fg: theme.sage },
  avlyst: { bg: theme.surfaceAlt, fg: theme.inkMuted },
}[s] || { bg: theme.surfaceAlt, fg: theme.inkSoft });

const taskStatusLabels = { ikke_startet: 'Ikke startet', 'pågår': 'Pågår', blokkert: 'Blokkert', fullført: 'Fullført' };
const taskStatusOrder = ['ikke_startet', 'pågår', 'blokkert', 'fullført'];
const taskStatusDot = (s) => s === 'fullført' ? theme.sage : s === 'pågår' ? theme.amber : s === 'blokkert' ? theme.rust : theme.inkMuted;

const healthColor = (h) => h === 'grønn' ? theme.sage : h === 'gul' ? theme.amberDeep : h === 'rød' ? theme.rustDeep : theme.inkMuted;
const healthLabel = (h) => h === 'grønn' ? 'På sporet' : h === 'gul' ? 'Følges nøye' : h === 'rød' ? 'I trøbbel' : '–';
const healthRank = { 'rød': 0, gul: 1, 'grønn': 2 };

const priorityLabels = { 'høy': 'Høy', medium: 'Medium', lav: 'Lav' };
const priorityColor = (p) => p === 'høy' ? theme.rustDeep : p === 'medium' ? theme.brass : theme.inkMuted;
const portalNames = { leadership: 'Ledelse', marketing: 'Marked', sales: 'Salg', innkjop: 'Innkjøp', produkt: 'Produkt' };

const isActive = (p) => p.status !== 'fullført' && p.status !== 'avlyst';

/* ===== felleskomponenter ===== */
const Pill = ({ children, color, bg, style = {} }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: bg, color, whiteSpace: 'nowrap', ...style }}>{children}</span>
);
const Card = ({ children, onClick, style = {}, hover = true }) => (
  <div onClick={onClick} style={{ background: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: 12, padding: 20, cursor: onClick ? 'pointer' : 'default', transition: 'box-shadow 120ms, border-color 120ms, transform 120ms', ...style }}
    onMouseEnter={(e) => { if (onClick && hover) { e.currentTarget.style.borderColor = theme.brass; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.07)'; } }}
    onMouseLeave={(e) => { if (hover) { e.currentTarget.style.borderColor = theme.borderSoft; e.currentTarget.style.boxShadow = 'none'; } }}>
    {children}
  </div>
);
const Avatar = ({ member, size = 36 }) => {
  const colors = ['#9D8068', '#5E6A60', '#252525', '#B89070', '#C75B36'];
  const idx = (member?.id || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0) % colors.length;
  return (
    <div title={member?.name} style={{ width: size, height: size, borderRadius: '50%', background: colors[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.38, fontWeight: 700, flexShrink: 0 }}>
      {member?.initials || member?.name?.slice(0, 2).toUpperCase() || '?'}
    </div>
  );
};
const Modal = ({ open, onClose, title, children, width = 640 }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '56px 24px', overflowY: 'auto' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.42)' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: width, background: theme.surface, borderRadius: 14, boxShadow: '0 24px 60px rgba(0,0,0,0.20)', padding: '26px 28px 24px', animation: 'modalIn 180ms ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 400, color: theme.ink, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.inkMuted, padding: 4, display: 'flex' }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};
const Btn = ({ children, onClick, variant = 'primary', size = 'md', icon: Icon, style = {}, disabled }) => {
  const pad = size === 'sm' ? '7px 13px' : '10px 18px';
  const fs = size === 'sm' ? 12 : 13;
  const v = {
    primary: { background: theme.brass, color: '#fff', border: 'none' },
    ghost: { background: theme.surface, color: theme.inkSoft, border: `1px solid ${theme.border}` },
    danger: { background: theme.rustLight, color: theme.rustDeep, border: `1px solid ${theme.rust}55` },
    dark: { background: theme.navy, color: '#fff', border: 'none' },
  }[variant] || {};
  return (
    <button onClick={onClick} disabled={disabled} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: pad, borderRadius: 8, fontSize: fs, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: disabled ? 0.5 : 1, ...v, ...style }}>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}{children}
    </button>
  );
};
const inputStyle = { width: '100%', padding: '9px 12px', border: `1px solid ${theme.border}`, borderRadius: 8, fontSize: 13, background: theme.surface, color: theme.ink, fontFamily: 'inherit', boxSizing: 'border-box' };
const labelStyle = { fontSize: 11, fontWeight: 700, color: theme.inkSoft, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, display: 'block' };
const Field = ({ label, children }) => (<div><span style={labelStyle}>{label}</span>{children}</div>);
const ProgressBar = ({ value, color, height = 7 }) => (
  <div style={{ height, background: 'rgba(0,0,0,0.07)', borderRadius: height / 2, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, value))}%`, background: color, transition: 'width 240ms' }} />
  </div>
);
const FilterGroup = ({ value, onChange, options }) => (
  <div style={{ display: 'inline-flex', background: theme.surfaceAlt, borderRadius: 9, padding: 3, gap: 2 }}>
    {options.map(o => (
      <button key={o.value} onClick={() => onChange(o.value)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: value === o.value ? theme.surface : 'transparent', color: value === o.value ? theme.ink : theme.inkSoft, boxShadow: value === o.value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
        {o.icon && <o.icon size={14} />}{o.label}{o.badge != null && o.badge > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: theme.rust, color: '#fff', borderRadius: 999, padding: '1px 6px' }}>{o.badge}</span>}
      </button>
    ))}
  </div>
);

/* ============================================================================
   PROAKTIV MOTOR
   ========================================================================== */

// Henter oppgavene for et prosjekt (avdeling = data.tasks, på tvers = embedded).
function projectTasksOf(project, data) {
  if (project._scope === 'crossorg') return project.tasks || [];
  return (data.tasks || []).filter(t => t.projectId === project.id);
}

function computeProgress(project, tasks) {
  if (tasks.length > 0) {
    const done = tasks.filter(t => t.status === 'fullført').length;
    return Math.round((done / tasks.length) * 100);
  }
  const ms = project.milestones || [];
  if (ms.length > 0) return Math.round(ms.filter(m => m.status === 'fullført').length / ms.length * 100);
  return 0;
}

// % av planlagt tid som har gått (0–100), eller null hvis datoer mangler.
function timeElapsedPct(project) {
  if (!project.startDate || !project.endDate) return null;
  const s = new Date(project.startDate).getTime();
  const e = new Date(project.endDate).getTime();
  if (e <= s) return null;
  const now = Date.now();
  return Math.max(0, Math.min(100, Math.round(((now - s) / (e - s)) * 100)));
}

function lastUpdateIso(project) {
  const ups = project.statusUpdates || [];
  if (!ups.length) return null;
  return ups.map(u => u.date).sort().slice(-1)[0];
}

/* Kjernen i proaktiviteten: leser signaler, beregner foreslått helse + begrunnelse. */
function computeSignals(project, tasks) {
  const active = isActive(project);
  const openTasks = tasks.filter(t => t.status !== 'fullført');
  const overdueTasks = openTasks.filter(t => t.dueDate && daysFromNow(t.dueDate) < 0);
  const dueSoonTasks = openTasks.filter(t => t.dueDate && daysFromNow(t.dueDate) >= 0 && daysFromNow(t.dueDate) <= 5);
  const blockedTasks = tasks.filter(t => t.status === 'blokkert');
  const unassignedTasks = openTasks.filter(t => !t.owner);
  const ms = project.milestones || [];
  const openMs = ms.filter(m => m.status !== 'fullført');
  const overdueMs = openMs.filter(m => m.date && daysFromNow(m.date) < 0);
  const dueSoonMs = openMs.filter(m => m.date && daysFromNow(m.date) >= 0 && daysFromNow(m.date) <= 14);
  const progress = computeProgress(project, tasks);
  const tElapsed = timeElapsedPct(project);
  const variance = tElapsed != null ? tElapsed - progress : null; // positiv = bak skjema
  const lastUp = lastUpdateIso(project);
  const sinceUpdate = lastUp ? daysSince(lastUp) : (project.createdAt ? daysSince(project.createdAt.slice(0, 10)) : null);
  const overdueEnd = active && project.endDate && daysFromNow(project.endDate) < 0;
  const noLead = !project.lead;
  const noMembers = (project.members || []).length === 0;

  const reasons = [];
  if (overdueMs.length) reasons.push({ sev: 3, text: `${overdueMs.length} forsinket ${overdueMs.length === 1 ? 'milepæl' : 'milepæler'}` });
  if (overdueEnd) reasons.push({ sev: 3, text: `Sluttfrist passert (${relativeDate(project.endDate)})` });
  if (active && variance != null && variance >= 25 && progress < 90) reasons.push({ sev: 3, text: `Bak skjema – ${variance}% gap mot tidslinjen` });
  if (overdueTasks.length >= 2) reasons.push({ sev: 2, text: `${overdueTasks.length} forsinkede oppgaver` });
  else if (overdueTasks.length === 1) reasons.push({ sev: 2, text: `1 forsinket oppgave` });
  if (blockedTasks.length) reasons.push({ sev: 2, text: `${blockedTasks.length} blokkert ${blockedTasks.length === 1 ? 'oppgave' : 'oppgaver'}` });
  if (active && sinceUpdate != null && sinceUpdate >= 14) reasons.push({ sev: 2, text: `Ingen statusoppdatering på ${sinceUpdate} dager` });
  if (active && variance != null && variance >= 12 && variance < 25) reasons.push({ sev: 1, text: `Litt bak skjema (${variance}%)` });
  if (dueSoonMs.length) reasons.push({ sev: 1, text: `${dueSoonMs.length} milepæl${dueSoonMs.length === 1 ? '' : 'er'} forfaller snart` });
  if (active && noLead) reasons.push({ sev: 1, text: 'Mangler prosjektleder' });
  if (active && noMembers) reasons.push({ sev: 1, text: 'Ingen deltakere' });
  if (unassignedTasks.length) reasons.push({ sev: 1, text: `${unassignedTasks.length} oppgave${unassignedTasks.length === 1 ? '' : 'r'} uten ansvarlig` });
  if (project.status === 'pause') reasons.push({ sev: 1, text: 'Satt på pause' });

  const maxSev = reasons.reduce((m, r) => Math.max(m, r.sev), 0);
  let suggestedHealth = 'grønn';
  if (!active) suggestedHealth = project.health || 'grønn';
  else if (maxSev >= 3) suggestedHealth = 'rød';
  else if (maxSev === 2) suggestedHealth = 'gul';

  return {
    active, progress, tElapsed, variance, sinceUpdate, lastUp,
    openTasks, overdueTasks, dueSoonTasks, blockedTasks, unassignedTasks,
    overdueMs, dueSoonMs, openMs, noLead, noMembers, overdueEnd,
    reasons, suggestedHealth, maxSev,
    mismatch: active && project.health && project.health !== suggestedHealth,
  };
}

/* Bygger det proaktive oppmerksomhetsfeltet på tvers av porteføljen. */
function buildAttention(projects, data, currentUserId) {
  const items = [];
  projects.forEach(p => {
    if (!isActive(p)) return;
    const tasks = projectTasksOf(p, data);
    const s = computeSignals(p, tasks);
    const mine = p.lead === currentUserId || (p.members || []).some(m => m.memberId === currentUserId);
    s.overdueMs.forEach(m => items.push({ id: p.id + ':ms:' + (m.id || m.title), sev: 3, project: p, mine, kind: 'milestone', icon: Flag, text: `Milepæl forsinket: ${m.title || 'uten navn'}`, meta: relativeDate(m.date) }));
    if (s.overdueEnd) items.push({ id: p.id + ':end', sev: 3, project: p, mine, kind: 'deadline', icon: AlertTriangle, text: 'Sluttfrist passert', meta: relativeDate(p.endDate) });
    if (s.active && s.variance != null && s.variance >= 25 && s.progress < 90) items.push({ id: p.id + ':var', sev: 3, project: p, mine, kind: 'schedule', icon: TrendDown, text: `Bak skjema (${s.variance}% gap)`, meta: `${s.progress}% ferdig` });
    if (s.overdueTasks.length) items.push({ id: p.id + ':otasks', sev: 2, project: p, mine, kind: 'tasks', icon: Clock, text: `${s.overdueTasks.length} forsinkede oppgaver`, meta: 'Trenger oppfølging' });
    if (s.blockedTasks.length) items.push({ id: p.id + ':blocked', sev: 2, project: p, mine, kind: 'tasks', icon: ShieldAlert, text: `${s.blockedTasks.length} blokkert${s.blockedTasks.length === 1 ? '' : 'e'} oppgave${s.blockedTasks.length === 1 ? '' : 'r'}`, meta: 'Frigjør avhengighet' });
    if (s.sinceUpdate != null && s.sinceUpdate >= 14) items.push({ id: p.id + ':stale', sev: 2, project: p, mine, kind: 'update', icon: Activity, text: `Ingen oppdatering på ${s.sinceUpdate} dager`, meta: 'Skriv en statuslinje' });
    s.dueSoonMs.forEach(m => items.push({ id: p.id + ':msnear:' + (m.id || m.title), sev: 1, project: p, mine, kind: 'milestone', icon: Flag, text: `Milepæl snart: ${m.title || 'uten navn'}`, meta: relativeDate(m.date) }));
    if (s.noLead) items.push({ id: p.id + ':nolead', sev: 1, project: p, mine, kind: 'setup', icon: Users, text: 'Mangler prosjektleder', meta: 'Sett en eier' });
    if (s.unassignedTasks.length) items.push({ id: p.id + ':unassigned', sev: 1, project: p, mine, kind: 'tasks', icon: Users, text: `${s.unassignedTasks.length} oppgave${s.unassignedTasks.length === 1 ? '' : 'r'} uten ansvarlig`, meta: 'Fordel ansvar' });
  });
  return items.sort((a, b) => (b.sev - a.sev) || (b.mine - a.mine));
}

/* ============================================================================
   HOVEDKOMPONENT
   ========================================================================== */
export default function ProjectsView({ data, save, crossorgData, saveCrossorg, allData, currentUserId, activePortal, onNavigate }) {
  const [tab, setTab] = useState('oversikt');
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null); // {id, scope}
  const [scopeFilter, setScopeFilter] = useState('all');

  const deptProjects = (data.projects || []).map(p => ({ ...p, _scope: 'dept', _portalId: activePortal }));
  const crossProjects = (crossorgData?.projects || []).map(p => ({ ...p, _scope: 'crossorg' }));
  const allProjects = [...deptProjects, ...crossProjects];

  const memberFromAny = (id) => {
    if (!id) return null;
    for (const pid of Object.keys(allData || {})) {
      const m = (allData[pid].members || []).find(x => x.id === id);
      if (m) return m;
    }
    return (data.members || []).find(m => m.id === id) || null;
  };

  const scoped = useMemo(() => allProjects.filter(p => {
    if (scopeFilter === 'dept' && p._scope !== 'dept') return false;
    if (scopeFilter === 'crossorg' && p._scope !== 'crossorg') return false;
    if (scopeFilter === 'mine' && !(p.lead === currentUserId || (p.members || []).some(m => m.memberId === currentUserId))) return false;
    return true;
  }), [data.projects, crossorgData, scopeFilter, currentUserId]);

  /* ---- persistering ---- */
  const saveProject = (proj) => {
    const clean = { ...proj }; delete clean._scope; delete clean._portalId;
    if (proj._scope === 'crossorg' || proj.scope === 'crossorg') {
      const list = crossorgData?.projects || [];
      const exists = list.some(p => p.id === proj.id);
      const next = exists ? list.map(p => p.id === proj.id ? clean : p)
        : [...list, { ...clean, id: uid('prj'), createdAt: new Date().toISOString() }];
      saveCrossorg({ ...(crossorgData || {}), projects: next });
    } else {
      const list = data.projects || [];
      const exists = list.some(p => p.id === proj.id);
      const next = exists ? list.map(p => p.id === proj.id ? clean : p)
        : [...list, { ...clean, id: uid('prj'), portalId: activePortal, createdAt: new Date().toISOString() }];
      save({ ...data, projects: next });
    }
    setEditing(null);
  };

  const patchProject = (project, patch) => {
    if (project._scope === 'crossorg') {
      const list = crossorgData?.projects || [];
      saveCrossorg({ ...(crossorgData || {}), projects: list.map(p => p.id === project.id ? { ...p, ...patch } : p) });
    } else {
      const list = data.projects || [];
      save({ ...data, projects: list.map(p => p.id === project.id ? { ...p, ...patch } : p) });
    }
  };

  const deleteProject = (project) => {
    if (project._scope === 'crossorg') {
      saveCrossorg({ ...(crossorgData || {}), projects: (crossorgData?.projects || []).filter(p => p.id !== project.id) });
    } else {
      save({ ...data, projects: (data.projects || []).filter(p => p.id !== project.id), tasks: (data.tasks || []).filter(t => t.projectId !== project.id) });
    }
    setDetail(null); setEditing(null);
  };

  /* oppgave-API – ensartet for begge scopes */
  const taskApi = (project) => ({
    list: () => projectTasksOf(project, data),
    add: (t) => {
      const task = { id: uid('t'), status: 'ikke_startet', priority: 'medium', ...t };
      if (project._scope === 'crossorg') {
        patchProject(project, { tasks: [...(project.tasks || []), { ...task, projectId: project.id, projectScope: 'crossorg' }] });
      } else {
        save({ ...data, tasks: [...(data.tasks || []), { ...task, projectId: project.id, projectScope: 'dept' }] });
      }
    },
    update: (id, patch) => {
      if (project._scope === 'crossorg') {
        patchProject(project, { tasks: (project.tasks || []).map(t => t.id === id ? { ...t, ...patch } : t) });
      } else {
        save({ ...data, tasks: (data.tasks || []).map(t => t.id === id ? { ...t, ...patch } : t) });
      }
    },
    remove: (id) => {
      if (project._scope === 'crossorg') {
        patchProject(project, { tasks: (project.tasks || []).filter(t => t.id !== id) });
      } else {
        save({ ...data, tasks: (data.tasks || []).filter(t => t.id !== id) });
      }
    },
  });

  const openProject = scoped.find(p => detail && p.id === detail.id && p._scope === detail.scope);

  if (openProject) {
    return <ProjectDetail project={openProject} data={data} allData={allData} currentUserId={currentUserId}
      activePortal={activePortal} memberFromAny={memberFromAny} taskApi={taskApi(openProject)}
      onPatch={(patch) => patchProject(openProject, patch)} onNavigate={onNavigate}
      onBack={() => setDetail(null)} onEdit={() => setEditing(openProject)} onDelete={() => { if (confirm('Slette prosjektet? Tilknyttede avdelingsoppgaver fjernes også.')) deleteProject(openProject); }} />;
  }

  const tabs = [
    { k: 'oversikt', l: 'Oversikt', icon: BellRing },
    { k: 'tavle', l: 'Tavle', icon: LayoutGrid },
    { k: 'tidslinje', l: 'Tidslinje', icon: GanttIcon },
    { k: 'minuke', l: 'Min uke', icon: Target },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: theme.brass, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Prosjektstyring</div>
          <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 400, color: theme.ink, margin: 0, letterSpacing: -0.5 }}>Prosjekter</h1>
        </div>
        <Btn icon={Plus} onClick={() => setEditing({ scope: scopeFilter === 'crossorg' ? 'crossorg' : 'dept' })}>Nytt prosjekt</Btn>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${theme.borderSoft}`, flex: 1, minWidth: 280 }}>
          {tabs.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '11px 14px 12px', fontSize: 13, fontWeight: 600, color: tab === t.k ? theme.brass : theme.inkSoft, borderBottom: `2px solid ${tab === t.k ? theme.brass : 'transparent'}`, marginBottom: -1 }}>
              <t.icon size={15} />{t.l}
            </button>
          ))}
        </div>
        <FilterGroup value={scopeFilter} onChange={setScopeFilter} options={[
          { value: 'all', label: 'Alle' }, { value: 'mine', label: 'Mine' }, { value: 'dept', label: 'Avdeling' }, { value: 'crossorg', label: 'På tvers' },
        ]} />
      </div>

      {tab === 'oversikt' && <PortfolioOverview projects={scoped} data={data} currentUserId={currentUserId} activePortal={activePortal} memberFromAny={memberFromAny} onOpen={(p) => setDetail({ id: p.id, scope: p._scope })} onNew={() => setEditing({ scope: 'dept' })} />}
      {tab === 'tavle' && <KanbanBoard projects={scoped} data={data} memberFromAny={memberFromAny} onOpen={(p) => setDetail({ id: p.id, scope: p._scope })} onMove={(p, status) => patchProject(p, { status })} />}
      {tab === 'tidslinje' && <TimelineView projects={scoped} data={data} onOpen={(p) => setDetail({ id: p.id, scope: p._scope })} />}
      {tab === 'minuke' && <MyWeekView projects={allProjects} data={data} currentUserId={currentUserId} memberFromAny={memberFromAny} taskApi={taskApi} onOpen={(p) => setDetail({ id: p.id, scope: p._scope })} onNavigate={onNavigate} />}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Rediger prosjekt' : 'Nytt prosjekt'} width={760}>
        {editing && <ProjectForm project={editing} data={data} allData={allData} activePortal={activePortal}
          memberFromAny={memberFromAny} onSave={saveProject} onCancel={() => setEditing(null)}
          onDelete={editing.id ? () => { if (confirm('Slette prosjektet?')) deleteProject(editing); } : null} />}
      </Modal>
    </div>
  );
}

/* ============================================================================
   VISNING: OVERSIKT  (proaktivt oppmerksomhetsfelt + portefølje)
   ========================================================================== */
function PortfolioOverview({ projects, data, currentUserId, activePortal, memberFromAny, onOpen, onNew }) {
  const [attnScope, setAttnScope] = useState('all');
  const active = projects.filter(isActive);
  const attentionAll = useMemo(() => buildAttention(projects, data, currentUserId), [projects, data, currentUserId]);
  const attention = attnScope === 'mine' ? attentionAll.filter(a => a.mine) : attentionAll;

  const kpiActive = active.filter(p => p.status === 'pågår').length;
  const atRisk = active.filter(p => {
    const s = computeSignals(p, projectTasksOf(p, data));
    return s.suggestedHealth !== 'grønn';
  }).length;
  const lateMs = active.reduce((n, p) => n + (p.milestones || []).filter(m => m.status !== 'fullført' && m.date && daysFromNow(m.date) < 0).length, 0);
  const mineCount = active.filter(p => p.lead === currentUserId || (p.members || []).some(m => m.memberId === currentUserId)).length;

  const sevMeta = { 3: { c: theme.rustDeep, bg: theme.rustLight, l: 'Kritisk' }, 2: { c: theme.amberDeep, bg: theme.amberLight, l: 'Følg opp' }, 1: { c: theme.brassDark, bg: theme.brassLight, l: 'Til info' } };

  const sorted = [...projects].sort((a, b) => {
    if (isActive(a) !== isActive(b)) return isActive(a) ? -1 : 1;
    const sa = computeSignals(a, projectTasksOf(a, data));
    const sb = computeSignals(b, projectTasksOf(b, data));
    return (healthRank[sa.suggestedHealth] ?? 3) - (healthRank[sb.suggestedHealth] ?? 3);
  });

  return (
    <div>
      {/* KPI-rad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 22 }}>
        <KpiCard icon={Briefcase} label="Aktive prosjekter" value={kpiActive} accent={theme.brass} />
        <KpiCard icon={AlertTriangle} label="Krever oppfølging" value={atRisk} accent={atRisk > 0 ? theme.rustDeep : theme.sage} />
        <KpiCard icon={Flag} label="Forsinkede milepæler" value={lateMs} accent={lateMs > 0 ? theme.rustDeep : theme.sage} />
        <KpiCard icon={Target} label="Mine prosjekter" value={mineCount} accent={theme.sage} />
      </div>

      {/* Proaktivt oppmerksomhetsfelt */}
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${theme.brass}, ${theme.amber})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Zap size={16} /></div>
            <div>
              <div style={{ fontFamily: serif, fontSize: 19, color: theme.ink }}>Krever oppmerksomhet</div>
              <div style={{ fontSize: 12, color: theme.inkMuted }}>Beregnet automatisk fra frister, fremdrift og statuslogg</div>
            </div>
          </div>
          <FilterGroup value={attnScope} onChange={setAttnScope} options={[{ value: 'all', label: 'Alt' }, { value: 'mine', label: 'Mine', badge: attentionAll.filter(a => a.mine && a.sev >= 2).length }]} />
        </div>

        {attention.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 22px', background: theme.sageLight, border: `1px solid ${theme.sage}33`, borderRadius: 12, color: theme.sage }}>
            <CheckCircle size={22} />
            <div><div style={{ fontWeight: 700, fontSize: 14, color: theme.ink }}>Alt er på sporet</div><div style={{ fontSize: 12.5, color: theme.inkSoft }}>Ingen forsinkelser, blokkeringer eller manglende oppdateringer i utvalget.</div></div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {attention.slice(0, 9).map(a => {
              const sm = sevMeta[a.sev];
              return (
                <button key={a.id} onClick={() => onOpen(a.project)}
                  style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left', padding: '13px 16px', background: theme.surface, border: `1px solid ${theme.borderSoft}`, borderLeft: `4px solid ${sm.c}`, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'transform 100ms, box-shadow 100ms' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: sm.bg, color: sm.c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><a.icon size={17} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: theme.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.text}</div>
                    <div style={{ fontSize: 12, color: theme.inkMuted, marginTop: 1 }}>{a.project.title}{a.meta ? ` · ${a.meta}` : ''}{a.mine ? ' · deg' : ''}</div>
                  </div>
                  <Pill bg={sm.bg} color={sm.c}>{sm.l}</Pill>
                  <ChevronRight size={16} style={{ color: theme.inkMuted }} />
                </button>
              );
            })}
            {attention.length > 9 && <div style={{ fontSize: 12, color: theme.inkMuted, textAlign: 'center', padding: 4 }}>+ {attention.length - 9} flere signaler</div>}
          </div>
        )}
      </div>

      {/* Porteføljekort */}
      <div style={{ fontSize: 11, fontWeight: 700, color: theme.inkSoft, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 12 }}>Portefølje ({projects.length})</div>
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '54px 24px', background: theme.surface, borderRadius: 12, border: `1px solid ${theme.borderSoft}` }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: theme.brassLight, color: theme.brass, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Briefcase size={24} /></div>
          <div style={{ fontSize: 18, fontFamily: serif, color: theme.ink, marginBottom: 8 }}>Ingen prosjekter ennå</div>
          <div style={{ fontSize: 13, color: theme.inkSoft, lineHeight: 1.6, maxWidth: 440, margin: '0 auto 18px' }}>Et prosjekt samler mål, deltakere, oppgaver og milepæler. Modulen følger automatisk med på frister og fremdrift, og varsler deg når noe trenger oppmerksomhet.</div>
          <Btn icon={Plus} onClick={onNew}>Opprett første prosjekt</Btn>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {sorted.map(p => <ProjectCard key={p.id + p._scope} project={p} data={data} activePortal={activePortal} memberFromAny={memberFromAny} onOpen={() => onOpen(p)} />)}
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, accent }) {
  return (
    <div style={{ background: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ fontFamily: serif, fontSize: 30, fontWeight: 500, color: accent, lineHeight: 1 }}>{value}</div>
        <div style={{ color: accent, opacity: 0.85 }}><Icon size={18} /></div>
      </div>
      <div style={{ fontSize: 12, color: theme.inkSoft, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function ProjectCard({ project, data, activePortal, memberFromAny, onOpen }) {
  const tasks = projectTasksOf(project, data);
  const s = computeSignals(project, tasks);
  const sc = statusColor(project.status);
  const hc = healthColor(s.suggestedHealth);
  const lead = memberFromAny(project.lead);
  const members = (project.members || []).slice(0, 5);
  const topReason = s.reasons[0];
  return (
    <Card onClick={onOpen} style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ height: 4, background: hc }} />
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 9, flexWrap: 'wrap' }}>
          <Pill bg={sc.bg} color={sc.fg}>{statusLabels[project.status]}</Pill>
          <Pill bg={`${hc}1F`} color={hc}>● {healthLabel(s.suggestedHealth)}</Pill>
          {project._scope === 'crossorg'
            ? <Pill bg={theme.navy + '18'} color={theme.navy}>På tvers</Pill>
            : <Pill bg={theme.surfaceAlt} color={theme.inkSoft}>{portalNames[activePortal] || 'Avdeling'}</Pill>}
          {project.priority === 'høy' && <Pill bg={theme.rustLight} color={theme.rustDeep}>Høy prioritet</Pill>}
        </div>
        <h3 style={{ fontFamily: serif, fontSize: 19, fontWeight: 500, color: theme.ink, margin: '0 0 4px', letterSpacing: -0.3, lineHeight: 1.2 }}>{project.title}</h3>
        {(project.objective || project.description) && <p style={{ fontSize: 12.5, color: theme.inkSoft, margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.objective || project.description}</p>}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: theme.inkSoft, marginBottom: 5 }}>
          <span>Fremdrift {s.tElapsed != null && <span style={{ color: theme.inkMuted, fontWeight: 500 }}>· {s.tElapsed}% av tiden brukt</span>}</span><span>{s.progress}%</span>
        </div>
        <ProgressBar value={s.progress} color={hc} />

        {topReason && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 11, padding: '7px 10px', background: topReason.sev >= 3 ? theme.rustLight : topReason.sev === 2 ? theme.amberLight : theme.surfaceAlt, borderRadius: 7, fontSize: 12, fontWeight: 600, color: topReason.sev >= 3 ? theme.rustDeep : topReason.sev === 2 ? theme.amberDeep : theme.inkSoft }}>
            <AlertTriangle size={13} />{topReason.text}{s.reasons.length > 1 && <span style={{ fontWeight: 500, opacity: 0.8 }}> +{s.reasons.length - 1}</span>}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 13, paddingTop: 12, borderTop: `1px solid ${theme.borderSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {lead && <div title={`Leder: ${lead.name}`}><Avatar member={lead} size={24} /></div>}
            {members.filter(m => m.memberId !== project.lead).slice(0, 4).map((m, i) => { const mb = memberFromAny(m.memberId); return mb ? <div key={m.memberId} style={{ marginLeft: -7 }}><Avatar member={mb} size={24} /></div> : null; })}
            {(project.members || []).length > 5 && <span style={{ marginLeft: 4, fontSize: 11, color: theme.inkMuted }}>+{(project.members || []).length - 5}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, color: theme.inkMuted }}>
            {tasks.length > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle size={13} />{tasks.filter(t => t.status === 'fullført').length}/{tasks.length}</span>}
            {project.endDate && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: s.overdueEnd ? theme.rustDeep : theme.inkMuted, fontWeight: s.overdueEnd ? 700 : 500 }}><CalIcon size={13} />{fmtDayMon(project.endDate)}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ============================================================================
   VISNING: TAVLE  (kanban over prosjektstatus, dra-og-slipp)
   ========================================================================== */
function KanbanBoard({ projects, data, memberFromAny, onOpen, onMove }) {
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const cols = [
    { k: 'planlagt', l: 'Planlagt' }, { k: 'pågår', l: 'Pågår' }, { k: 'pause', l: 'Pause' }, { k: 'fullført', l: 'Fullført' },
  ];
  const byCol = (k) => projects.filter(p => p.status === k || (k === 'fullført' && p.status === 'avlyst'));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, minmax(220px, 1fr))`, gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
      {cols.map(col => {
        const list = byCol(col.k);
        const sc = statusColor(col.k);
        return (
          <div key={col.k}
            onDragOver={(e) => { e.preventDefault(); setOverCol(col.k); }}
            onDragLeave={() => setOverCol(c => c === col.k ? null : c)}
            onDrop={() => { if (dragId) { const p = projects.find(x => (x.id + x._scope) === dragId); if (p && p.status !== col.k) onMove(p, col.k); } setDragId(null); setOverCol(null); }}
            style={{ background: overCol === col.k ? theme.brassLight : theme.surfaceAlt, borderRadius: 12, padding: 10, minHeight: 200, transition: 'background 120ms', border: `1px solid ${overCol === col.k ? theme.brass : 'transparent'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc.fg }} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: theme.ink }}>{col.l}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: theme.inkMuted, background: theme.surface, borderRadius: 999, padding: '1px 8px' }}>{list.length}</span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {list.map(p => {
                const s = computeSignals(p, projectTasksOf(p, data));
                const hc = healthColor(s.suggestedHealth);
                const lead = memberFromAny(p.lead);
                return (
                  <div key={p.id + p._scope} draggable onDragStart={() => setDragId(p.id + p._scope)} onDragEnd={() => { setDragId(null); setOverCol(null); }}
                    onClick={() => onOpen(p)}
                    style={{ background: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: 10, padding: 12, cursor: 'pointer', opacity: dragId === (p.id + p._scope) ? 0.45 : 1, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 7 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: hc }} />
                      {p._scope === 'crossorg' && <Pill bg={theme.navy + '18'} color={theme.navy} style={{ fontSize: 10, padding: '1px 6px' }}>På tvers</Pill>}
                      {s.maxSev >= 2 && <AlertTriangle size={12} style={{ color: s.maxSev >= 3 ? theme.rustDeep : theme.amberDeep, marginLeft: 'auto' }} />}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: theme.ink, lineHeight: 1.25, marginBottom: 9 }}>{p.title}</div>
                    <ProgressBar value={s.progress} color={hc} height={5} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 }}>
                      {lead ? <Avatar member={lead} size={20} /> : <span style={{ fontSize: 11, color: theme.inkMuted }}>Uten leder</span>}
                      {p.endDate && <span style={{ fontSize: 11, color: s.overdueEnd ? theme.rustDeep : theme.inkMuted, fontWeight: s.overdueEnd ? 700 : 500 }}>{fmtDayMon(p.endDate)}</span>}
                    </div>
                  </div>
                );
              })}
              {list.length === 0 && <div style={{ fontSize: 12, color: theme.inkMuted, textAlign: 'center', padding: '16px 6px', opacity: 0.7 }}>Dra hit</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================================
   VISNING: TIDSLINJE  (enkel gantt med milepæler + «i dag»-linje)
   ========================================================================== */
function TimelineView({ projects, data, onOpen }) {
  const dated = projects.filter(p => p.startDate && p.endDate);
  if (dated.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px 24px', background: theme.surface, borderRadius: 12, border: `1px solid ${theme.borderSoft}`, color: theme.inkSoft, fontSize: 13 }}>
      <GanttIcon size={28} style={{ color: theme.inkMuted, marginBottom: 10 }} /><div style={{ fontFamily: serif, fontSize: 17, color: theme.ink, marginBottom: 6 }}>Ingen daterte prosjekter</div>
      Legg inn start- og sluttdato på prosjektene for å se dem i tidslinjen.
    </div>;
  }
  let min = Math.min(...dated.map(p => new Date(p.startDate).getTime()));
  let max = Math.max(...dated.map(p => new Date(p.endDate).getTime()));
  const span = Math.max(max - min, 86400000);
  const pad = span * 0.04; min -= pad; max += pad;
  const total = max - min;
  const pct = (t) => ((new Date(t).getTime() - min) / total) * 100;
  const nowPct = ((Date.now() - min) / total) * 100;

  // månedsmarkører
  const months = [];
  const d = new Date(min); d.setDate(1);
  while (d.getTime() <= max) { months.push(new Date(d)); d.setMonth(d.getMonth() + 1); }

  return (
    <div style={{ background: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: 12, padding: '18px 20px', overflowX: 'auto' }}>
      <div style={{ minWidth: 720, position: 'relative' }}>
        {/* måned-akse */}
        <div style={{ position: 'relative', height: 22, marginLeft: 200, borderBottom: `1px solid ${theme.borderSoft}`, marginBottom: 6 }}>
          {months.map((m, i) => (
            <div key={i} style={{ position: 'absolute', left: `${pct(m)}%`, fontSize: 10.5, fontWeight: 600, color: theme.inkMuted, transform: 'translateX(2px)' }}>
              {m.toLocaleDateString('no-NO', { month: 'short' })}{m.getMonth() === 0 ? ` ${m.getFullYear()}` : ''}
            </div>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          {/* i dag-linje */}
          {nowPct >= 0 && nowPct <= 100 && (
            <div style={{ position: 'absolute', left: `calc(200px + ${nowPct}% * (100% - 200px) / 100)`, top: -4, bottom: 0, width: 2, background: theme.rust, zIndex: 3 }}>
              <span style={{ position: 'absolute', top: -16, left: -14, fontSize: 9.5, fontWeight: 700, color: theme.rust, background: theme.rustLight, padding: '1px 5px', borderRadius: 4 }}>i dag</span>
            </div>
          )}
          {dated.map(p => {
            const s = computeSignals(p, projectTasksOf(p, data));
            const hc = healthColor(s.suggestedHealth);
            const left = pct(p.startDate), width = Math.max(pct(p.endDate) - pct(p.startDate), 1.5);
            return (
              <div key={p.id + p._scope} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <button onClick={() => onOpen(p)} style={{ width: 200, flexShrink: 0, textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '0 10px 0 0', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: hc, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: theme.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                </button>
                <div style={{ position: 'relative', flex: 1, height: 26 }}>
                  <div onClick={() => onOpen(p)} title={`${fmtDate(p.startDate)} – ${fmtDate(p.endDate)} · ${s.progress}%`}
                    style={{ position: 'absolute', left: `${left}%`, width: `${width}%`, top: 4, height: 18, background: `${hc}2A`, border: `1px solid ${hc}`, borderRadius: 6, cursor: 'pointer', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.progress}%`, background: hc, opacity: 0.55 }} />
                  </div>
                  {(p.milestones || []).filter(m => m.date).map((m, i) => {
                    const mp = pct(m.date); if (mp < 0 || mp > 100) return null;
                    const overdue = m.status !== 'fullført' && daysFromNow(m.date) < 0;
                    return <div key={i} title={`${m.title || 'Milepæl'} · ${fmtDate(m.date)}`}
                      style={{ position: 'absolute', left: `${mp}%`, top: 7, width: 11, height: 11, background: m.status === 'fullført' ? theme.sage : overdue ? theme.rustDeep : '#fff', border: `2px solid ${m.status === 'fullført' ? theme.sage : overdue ? theme.rustDeep : theme.brass}`, transform: 'translateX(-50%) rotate(45deg)', borderRadius: 2, zIndex: 2 }} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.borderSoft}`, fontSize: 11, color: theme.inkMuted, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, background: '#fff', border: `2px solid ${theme.brass}`, transform: 'rotate(45deg)', display: 'inline-block' }} /> Milepæl</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, background: theme.sage, transform: 'rotate(45deg)', display: 'inline-block' }} /> Fullført</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, background: theme.rustDeep, transform: 'rotate(45deg)', display: 'inline-block' }} /> Forsinket</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   VISNING: MIN UKE  (mine oppgaver + milepæler på tvers av prosjekter)
   ========================================================================== */
function MyWeekView({ projects, data, currentUserId, memberFromAny, taskApi, onOpen, onNavigate }) {
  const mineProjects = projects.filter(p => isActive(p) && (p.lead === currentUserId || (p.members || []).some(m => m.memberId === currentUserId)));
  const rows = [];
  projects.forEach(p => {
    projectTasksOf(p, data).forEach(t => {
      if (t.owner === currentUserId && t.status !== 'fullført') rows.push({ task: t, project: p });
    });
  });
  const overdue = rows.filter(r => r.task.dueDate && daysFromNow(r.task.dueDate) < 0).sort((a, b) => (a.task.dueDate || '').localeCompare(b.task.dueDate || ''));
  const thisWeek = rows.filter(r => r.task.dueDate && daysFromNow(r.task.dueDate) >= 0 && daysFromNow(r.task.dueDate) <= 7).sort((a, b) => (a.task.dueDate || '').localeCompare(b.task.dueDate || ''));
  const noDate = rows.filter(r => !r.task.dueDate || daysFromNow(r.task.dueDate) > 7);

  const myMs = [];
  mineProjects.forEach(p => (p.milestones || []).forEach(m => { if (m.status !== 'fullført' && m.date && daysFromNow(m.date) <= 14) myMs.push({ ms: m, project: p }); }));
  myMs.sort((a, b) => (a.ms.date || '').localeCompare(b.ms.date || ''));

  const toggle = (r) => taskApi(r.project).update(r.task.id, { status: r.task.status === 'fullført' ? 'pågår' : 'fullført' });

  const TaskLine = ({ r }) => {
    const od = r.task.dueDate && daysFromNow(r.task.dueDate) < 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', background: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: 9 }}>
        <button onClick={() => toggle(r)} title="Marker fullført" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: taskStatusDot(r.task.status), display: 'flex', padding: 0 }}>
          {r.task.status === 'fullført' ? <CheckCircle size={19} /> : <Circle size={19} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: theme.ink }}>{r.task.title}</div>
          <button onClick={() => onOpen(r.project)} style={{ fontSize: 11.5, color: theme.inkMuted, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>{r.project.title}</button>
        </div>
        {r.task.priority === 'høy' && <Pill bg={theme.rustLight} color={theme.rustDeep}>Høy</Pill>}
        {r.task.dueDate && <span style={{ fontSize: 12, fontWeight: od ? 700 : 500, color: od ? theme.rustDeep : theme.inkSoft }}>{relativeDate(r.task.dueDate)}</span>}
      </div>
    );
  };

  const me = memberFromAny(currentUserId);
  const empty = rows.length === 0 && myMs.length === 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, padding: '14px 18px', background: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: 12 }}>
        {me && <Avatar member={me} size={40} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: serif, fontSize: 18, color: theme.ink }}>Uke {getWeek(new Date())} — ditt prosjektarbeid</div>
          <div style={{ fontSize: 12.5, color: theme.inkMuted }}>{overdue.length} forsinket · {thisWeek.length} denne uka · {mineProjects.length} aktive prosjekter</div>
        </div>
      </div>

      {empty && (
        <div style={{ textAlign: 'center', padding: '40px 24px', background: theme.sageLight, borderRadius: 12, color: theme.sage }}>
          <CheckCircle size={24} style={{ marginBottom: 8 }} /><div style={{ fontWeight: 700, color: theme.ink }}>Ingenting forfaller på deg nå</div>
          <div style={{ fontSize: 12.5, color: theme.inkSoft }}>Du har ingen åpne prosjektoppgaver eller nære milepæler.</div>
        </div>
      )}

      {overdue.length > 0 && (
        <Section title="Forsinket" count={overdue.length} color={theme.rustDeep}>
          {overdue.map((r, i) => <TaskLine key={i} r={r} />)}
        </Section>
      )}
      {thisWeek.length > 0 && (
        <Section title="Denne uka" count={thisWeek.length} color={theme.amberDeep}>
          {thisWeek.map((r, i) => <TaskLine key={i} r={r} />)}
        </Section>
      )}
      {myMs.length > 0 && (
        <Section title="Milepæler jeg leder (14 dager)" count={myMs.length} color={theme.brass}>
          {myMs.map((m, i) => {
            const od = daysFromNow(m.ms.date) < 0;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', background: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: 9 }}>
                <span style={{ width: 11, height: 11, background: od ? theme.rustDeep : '#fff', border: `2px solid ${od ? theme.rustDeep : theme.brass}`, transform: 'rotate(45deg)', display: 'inline-block', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: theme.ink }}>{m.ms.title || 'Milepæl'}</div>
                  <button onClick={() => onOpen(m.project)} style={{ fontSize: 11.5, color: theme.inkMuted, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}>{m.project.title}</button>
                </div>
                <span style={{ fontSize: 12, fontWeight: od ? 700 : 500, color: od ? theme.rustDeep : theme.inkSoft }}>{relativeDate(m.ms.date)}</span>
              </div>
            );
          })}
        </Section>
      )}
      {noDate.length > 0 && (
        <Section title="Uten frist / senere" count={noDate.length} color={theme.inkMuted}>
          {noDate.map((r, i) => <TaskLine key={i} r={r} />)}
        </Section>
      )}
    </div>
  );
}

function Section({ title, count, color, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: color }} />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: theme.inkSoft, letterSpacing: 0.5, textTransform: 'uppercase' }}>{title}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: theme.inkMuted }}>{count}</span>
      </div>
      <div style={{ display: 'grid', gap: 7 }}>{children}</div>
    </div>
  );
}

/* ============================================================================
   PROSJEKTDETALJ
   ========================================================================== */
function ProjectDetail({ project, data, allData, currentUserId, activePortal, memberFromAny, taskApi, onPatch, onNavigate, onBack, onEdit, onDelete }) {
  const [tab, setTab] = useState('oversikt');
  const tasks = taskApi.list();
  const s = computeSignals(project, tasks);
  const hc = healthColor(project.health || s.suggestedHealth);
  const sc = statusColor(project.status);
  const lead = memberFromAny(project.lead);

  const availableMembers = project._scope === 'crossorg'
    ? Object.values(allData || {}).flatMap(d => d.members || []).filter((m, i, a) => a.findIndex(x => x.id === m.id) === i)
    : (data.members || []);

  const tabs = [
    { k: 'oversikt', l: 'Oversikt' },
    { k: 'oppgaver', l: `Oppgaver (${tasks.length})` },
    { k: 'milepaler', l: `Milepæler (${(project.milestones || []).length})` },
    { k: 'team', l: 'Deltakere' },
    { k: 'statuslogg', l: `Statuslogg (${(project.statusUpdates || []).length})` },
    { k: 'koblinger', l: 'Koblinger' },
  ];

  return (
    <div>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: theme.inkSoft, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 16, fontFamily: 'inherit', padding: '6px 10px 6px 0' }}>
        <ArrowLeft size={16} /> Tilbake til prosjekter
      </button>

      <Card style={{ marginBottom: 18, padding: 0, overflow: 'hidden' }} hover={false}>
        <div style={{ height: 4, background: hc }} />
        <div style={{ padding: '22px 26px', borderBottom: `1px solid ${theme.borderSoft}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9, flexWrap: 'wrap' }}>
                <Pill bg={sc.bg} color={sc.fg}>{statusLabels[project.status]}</Pill>
                <Pill bg={`${hc}1F`} color={hc}>● {healthLabel(project.health || s.suggestedHealth)}</Pill>
                <Pill bg={project._scope === 'crossorg' ? theme.navy + '18' : theme.surfaceAlt} color={project._scope === 'crossorg' ? theme.navy : theme.inkSoft}>{project._scope === 'crossorg' ? 'På tvers' : (portalNames[activePortal] || 'Avdeling')}</Pill>
                {project.priority === 'høy' && <Pill bg={theme.rustLight} color={theme.rustDeep}>Høy prioritet</Pill>}
              </div>
              <h1 style={{ fontFamily: serif, fontSize: 29, fontWeight: 400, color: theme.ink, margin: 0, letterSpacing: -0.5 }}>{project.title}</h1>
              {project.objective && <p style={{ fontSize: 14, color: theme.inkSoft, margin: '8px 0 0', lineHeight: 1.55 }}>{project.objective}</p>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="ghost" size="sm" icon={Edit2} onClick={onEdit}>Rediger</Btn>
              <Btn variant="danger" size="sm" icon={Trash2} onClick={onDelete}>Slett</Btn>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: theme.inkSoft, alignItems: 'center', marginBottom: 14 }}>
            {lead && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Avatar member={lead} size={22} /> {lead.name}</span>}
            {project.startDate && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><CalIcon size={14} />{fmtDate(project.startDate)} → {fmtDate(project.endDate) || '–'}</span>}
            {s.lastUp && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Activity size={14} />Oppdatert {relativeDate(s.lastUp)}</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: theme.inkSoft, marginBottom: 5 }}>
            <span>Fremdrift</span><span>{s.progress}%{s.tElapsed != null && <span style={{ color: theme.inkMuted, fontWeight: 500 }}> · {s.tElapsed}% av tiden brukt</span>}</span>
          </div>
          <ProgressBar value={s.progress} color={hc} height={8} />
        </div>

        <div style={{ padding: '0 26px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', gap: 2, overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '13px 13px 12px', fontSize: 12.5, fontWeight: 600, color: tab === t.k ? theme.brass : theme.inkSoft, borderBottom: `2px solid ${tab === t.k ? theme.brass : 'transparent'}`, marginBottom: -1, whiteSpace: 'nowrap' }}>
              {t.l}
            </button>
          ))}
        </div>

        <div style={{ padding: '22px 26px' }}>
          {tab === 'oversikt' && <DetailOverview project={project} signals={s} onPatch={onPatch} onGoTab={setTab} />}
          {tab === 'oppgaver' && <DetailTasks project={project} tasks={tasks} taskApi={taskApi} members={availableMembers} memberFromAny={memberFromAny} />}
          {tab === 'milepaler' && <DetailMilestones project={project} onPatch={onPatch} members={availableMembers} memberFromAny={memberFromAny} />}
          {tab === 'team' && <DetailTeam project={project} memberFromAny={memberFromAny} />}
          {tab === 'statuslogg' && <DetailStatusLog project={project} signals={s} currentUserId={currentUserId} memberFromAny={memberFromAny} onPatch={onPatch} />}
          {tab === 'koblinger' && <DetailLinks project={project} data={data} onPatch={onPatch} onNavigate={onNavigate} />}
        </div>
      </Card>
    </div>
  );
}

/* ---- detalj: oversikt med auto-helsepanel ---- */
function DetailOverview({ project, signals: s, onPatch, onGoTab }) {
  const cur = project.health || s.suggestedHealth;
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {/* automatisk helsevurdering */}
      <div style={{ border: `1px solid ${s.maxSev >= 3 ? theme.rust + '55' : s.maxSev === 2 ? theme.amber + '55' : theme.borderSoft}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 16px', background: theme.surfaceAlt, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Sparkles size={16} style={{ color: theme.brass }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>Automatisk helsevurdering</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: theme.inkMuted }}>Foreslått:</span>
            <Pill bg={`${healthColor(s.suggestedHealth)}1F`} color={healthColor(s.suggestedHealth)}>● {healthLabel(s.suggestedHealth)}</Pill>
            {s.mismatch && <Btn size="sm" variant="ghost" onClick={() => onPatch({ health: s.suggestedHealth })}>Bruk forslag</Btn>}
          </div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          {s.reasons.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.sage, fontSize: 13, fontWeight: 600 }}><CheckCircle size={16} /> Ingen risikosignaler — prosjektet er på sporet.</div>
          ) : (
            <div style={{ display: 'grid', gap: 7 }}>
              {s.reasons.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: theme.inkSoft }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: r.sev >= 3 ? theme.rustDeep : r.sev === 2 ? theme.amberDeep : theme.brass, flexShrink: 0 }} />
                  {r.text}
                </div>
              ))}
            </div>
          )}
          {project.health && project.health !== s.suggestedHealth && (
            <div style={{ marginTop: 12, fontSize: 12, color: theme.inkMuted, fontStyle: 'italic' }}>Manuelt satt til «{healthLabel(project.health)}». Forslaget over er beregnet fra dagens signaler.</div>
          )}
        </div>
      </div>

      {/* nøkkeltall */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <Stat label="Oppgaver" value={`${s.openTasks.length === 0 && s.progress === 100 ? '' : ''}${(s.progress)}%`} sub={`${s.overdueTasks.length} forsinket · ${s.blockedTasks.length} blokkert`} />
        <Stat label="Milepæler" value={`${(project.milestones || []).filter(m => m.status === 'fullført').length}/${(project.milestones || []).length}`} sub={s.overdueMs.length ? `${s.overdueMs.length} forsinket` : 'i rute'} subColor={s.overdueMs.length ? theme.rustDeep : theme.sage} />
        <Stat label="Tidsbruk" value={s.tElapsed != null ? `${s.tElapsed}%` : '–'} sub={s.variance != null ? (s.variance > 0 ? `${s.variance}% bak skjema` : 'foran/i rute') : 'ingen datoer'} subColor={s.variance != null && s.variance >= 12 ? theme.rustDeep : theme.sage} />
        <Stat label="Sist oppdatert" value={s.sinceUpdate != null ? `${s.sinceUpdate}d` : '–'} sub={s.sinceUpdate != null && s.sinceUpdate >= 14 ? 'trenger oppdatering' : 'fersk'} subColor={s.sinceUpdate != null && s.sinceUpdate >= 14 ? theme.amberDeep : theme.sage} />
      </div>

      {project.description && (
        <div>
          <div style={labelStyle}>Beskrivelse</div>
          <p style={{ fontSize: 13.5, color: theme.inkSoft, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{project.description}</p>
        </div>
      )}
      {project.budget && (project.budget.planned || project.budget.spent) && (
        <div>
          <div style={labelStyle}>Budsjett</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: theme.inkSoft }}>
            <span>Planlagt: <b style={{ color: theme.ink }}>{fmtMoney(project.budget.planned)}</b></span>
            <span>Brukt: <b style={{ color: (project.budget.spent || 0) > (project.budget.planned || 0) ? theme.rustDeep : theme.ink }}>{fmtMoney(project.budget.spent)}</b></span>
            {project.budget.planned > 0 && <div style={{ flex: 1, maxWidth: 220 }}><ProgressBar value={(project.budget.spent || 0) / project.budget.planned * 100} color={(project.budget.spent || 0) > project.budget.planned ? theme.rustDeep : theme.brass} height={6} /></div>}
          </div>
        </div>
      )}
    </div>
  );
}
function Stat({ label, value, sub, subColor }) {
  return (
    <div style={{ background: theme.surfaceAlt, padding: 14, borderRadius: 10 }}>
      <div style={{ fontSize: 11, color: theme.inkMuted, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 700, color: theme.ink, fontFamily: serif }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: subColor || theme.inkMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
const fmtMoney = (n) => { if (n == null || n === '') return '–'; const v = Number(n); if (v >= 1000000) return (v / 1000000).toFixed(1).replace('.0', '') + ' MNOK'; if (v >= 1000) return Math.round(v / 1000) + ' kNOK'; return v.toLocaleString('no-NO') + ' NOK'; };

/* ---- detalj: oppgaver (kanban + liste, inline endring) ---- */
function DetailTasks({ project, tasks, taskApi, members, memberFromAny }) {
  const [view, setView] = useState('liste');
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [draft, setDraft] = useState({ title: '', owner: '', dueDate: '', priority: 'medium' });
  const [dragId, setDragId] = useState(null);

  const startAdd = () => { setDraft({ title: '', owner: '', dueDate: '', priority: 'medium' }); setAdding(true); setEditId(null); };
  const commitAdd = () => { if (!draft.title.trim()) return; taskApi.add({ ...draft }); setAdding(false); };
  const startEdit = (t) => { setDraft({ title: t.title, owner: t.owner || '', dueDate: t.dueDate || '', priority: t.priority || 'medium', status: t.status }); setEditId(t.id); setAdding(false); };
  const commitEdit = () => { if (!draft.title.trim()) return; taskApi.update(editId, { title: draft.title, owner: draft.owner, dueDate: draft.dueDate, priority: draft.priority }); setEditId(null); };

  const Editor = ({ onCommit, onCancel }) => (
    <div style={{ background: theme.surfaceAlt, padding: 13, borderRadius: 10, display: 'grid', gap: 8, marginBottom: 12 }}>
      <input autoFocus style={inputStyle} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="Hva skal gjøres?" onKeyDown={e => { if (e.key === 'Enter') onCommit(); }} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select style={{ ...inputStyle, flex: 1, minWidth: 130 }} value={draft.owner} onChange={e => setDraft({ ...draft, owner: e.target.value })}>
          <option value="">Ansvarlig…</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <input style={{ ...inputStyle, width: 150 }} type="date" value={draft.dueDate} onChange={e => setDraft({ ...draft, dueDate: e.target.value })} />
        <select style={{ ...inputStyle, width: 120 }} value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value })}>
          {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn size="sm" onClick={onCommit}>Lagre</Btn>
        <Btn size="sm" variant="ghost" onClick={onCancel}>Avbryt</Btn>
      </div>
    </div>
  );

  const TaskItem = ({ t }) => {
    const owner = memberFromAny(t.owner);
    const od = t.dueDate && daysFromNow(t.dueDate) < 0 && t.status !== 'fullført';
    if (editId === t.id) return <Editor onCommit={commitEdit} onCancel={() => setEditId(null)} />;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', background: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: 8 }}>
        <button onClick={() => taskApi.update(t.id, { status: t.status === 'fullført' ? 'pågår' : 'fullført' })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: taskStatusDot(t.status), display: 'flex', padding: 0 }}>
          {t.status === 'fullført' ? <CheckCircle size={18} /> : <Circle size={18} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: theme.ink, textDecoration: t.status === 'fullført' ? 'line-through' : 'none', opacity: t.status === 'fullført' ? 0.6 : 1 }}>{t.title}</div>
          <div style={{ fontSize: 11, color: theme.inkMuted, marginTop: 1 }}>
            {owner ? owner.name : 'Uten ansvarlig'}{t.dueDate && <span style={{ color: od ? theme.rustDeep : theme.inkMuted, fontWeight: od ? 700 : 500 }}> · {relativeDate(t.dueDate)}{od ? ' (forsinket)' : ''}</span>}
          </div>
        </div>
        <select value={t.status} onChange={e => taskApi.update(t.id, { status: e.target.value })} onClick={e => e.stopPropagation()}
          style={{ fontSize: 11.5, padding: '4px 8px', border: `1px solid ${theme.border}`, borderRadius: 6, background: theme.surface, color: theme.inkSoft, fontFamily: 'inherit', cursor: 'pointer' }}>
          {taskStatusOrder.map(st => <option key={st} value={st}>{taskStatusLabels[st]}</option>)}
        </select>
        {t.priority === 'høy' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: theme.rustDeep }} title="Høy prioritet" />}
        <button onClick={() => startEdit(t)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.inkMuted, display: 'flex', padding: 2 }}><Edit2 size={14} /></button>
        <button onClick={() => { if (confirm('Slette oppgaven?')) taskApi.remove(t.id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.inkMuted, display: 'flex', padding: 2 }}><Trash2 size={14} /></button>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
        <FilterGroup value={view} onChange={setView} options={[{ value: 'liste', label: 'Liste', icon: ListIcon }, { value: 'tavle', label: 'Tavle', icon: LayoutGrid }]} />
        <Btn size="sm" icon={Plus} onClick={startAdd}>Ny oppgave</Btn>
      </div>
      {adding && <Editor onCommit={commitAdd} onCancel={() => setAdding(false)} />}

      {tasks.length === 0 && !adding && <div style={{ color: theme.inkMuted, fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Ingen oppgaver ennå. {project._scope !== 'crossorg' && 'Avdelingsoppgaver vises også i Oppgaver-modulen og Kalender.'}</div>}

      {view === 'liste' && (
        <div style={{ display: 'grid', gap: 14 }}>
          {taskStatusOrder.map(st => {
            const list = tasks.filter(t => t.status === st);
            if (!list.length) return null;
            return (
              <div key={st}>
                <div style={{ fontSize: 11, fontWeight: 700, color: theme.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>{taskStatusLabels[st]} ({list.length})</div>
                <div style={{ display: 'grid', gap: 6 }}>{list.map(t => <TaskItem key={t.id} t={t} />)}</div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'tavle' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))', gap: 10, overflowX: 'auto' }}>
          {taskStatusOrder.map(st => {
            const list = tasks.filter(t => t.status === st);
            return (
              <div key={st} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragId) taskApi.update(dragId, { status: st }); setDragId(null); }}
                style={{ background: theme.surfaceAlt, borderRadius: 10, padding: 9, minHeight: 120 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, padding: '2px 4px' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: taskStatusDot(st) }} />
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: theme.ink }}>{taskStatusLabels[st]}</span>
                  <span style={{ fontSize: 10.5, color: theme.inkMuted, marginLeft: 'auto' }}>{list.length}</span>
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {list.map(t => {
                    const owner = memberFromAny(t.owner);
                    const od = t.dueDate && daysFromNow(t.dueDate) < 0 && t.status !== 'fullført';
                    return (
                      <div key={t.id} draggable onDragStart={() => setDragId(t.id)} onDragEnd={() => setDragId(null)} onClick={() => startEdit(t)}
                        style={{ background: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: 9, cursor: 'pointer', opacity: dragId === t.id ? 0.4 : 1 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 500, color: theme.ink, marginBottom: 6, lineHeight: 1.3 }}>{t.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {owner ? <Avatar member={owner} size={18} /> : <span style={{ fontSize: 10, color: theme.inkMuted }}>—</span>}
                          {t.dueDate && <span style={{ fontSize: 10.5, color: od ? theme.rustDeep : theme.inkMuted, fontWeight: od ? 700 : 500 }}>{fmtDayMon(t.dueDate)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---- detalj: milepæler ---- */
function DetailMilestones({ project, onPatch, members, memberFromAny }) {
  const ms = project.milestones || [];
  const add = () => onPatch({ milestones: [...ms, { id: uid('ms'), title: '', date: '', status: 'ikke_startet', owner: '' }] });
  const upd = (id, patch) => onPatch({ milestones: ms.map(m => m.id === id ? { ...m, ...patch } : m) });
  const del = (id) => onPatch({ milestones: ms.filter(m => m.id !== id) });
  const sorted = [...ms].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}><Btn size="sm" icon={Plus} onClick={add}>Ny milepæl</Btn></div>
      {ms.length === 0 ? <div style={{ color: theme.inkMuted, fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Ingen milepæler ennå. Milepæler driver fremdrift og varsler om forsinkelser.</div> : (
        <div style={{ position: 'relative', paddingLeft: 8 }}>
          {sorted.map((m, i) => {
            const od = m.status !== 'fullført' && m.date && daysFromNow(m.date) < 0;
            const soon = m.status !== 'fullført' && m.date && daysFromNow(m.date) >= 0 && daysFromNow(m.date) <= 14;
            const dot = m.status === 'fullført' ? theme.sage : od ? theme.rustDeep : soon ? theme.amber : theme.inkMuted;
            return (
              <div key={m.id || i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 14, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6 }}>
                  <button onClick={() => upd(m.id, { status: m.status === 'fullført' ? 'pågår' : 'fullført' })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: dot, display: 'flex' }}>
                    {m.status === 'fullført' ? <CheckCircle size={18} /> : <Flag size={16} />}
                  </button>
                  {i < sorted.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 24, background: theme.borderSoft, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1, background: theme.surfaceAlt, borderRadius: 10, padding: 11 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input style={{ ...inputStyle, flex: 2, minWidth: 140, padding: '6px 9px' }} value={m.title} onChange={e => upd(m.id, { title: e.target.value })} placeholder="Milepæl" />
                    <input style={{ ...inputStyle, width: 145, padding: '6px 9px' }} type="date" value={m.date || ''} onChange={e => upd(m.id, { date: e.target.value })} />
                    <select style={{ ...inputStyle, width: 130, padding: '6px 9px' }} value={m.status} onChange={e => upd(m.id, { status: e.target.value })}>
                      <option value="ikke_startet">Ikke startet</option><option value="pågår">Pågår</option><option value="fullført">Fullført</option>
                    </select>
                    <button onClick={() => { if (confirm('Slette milepæl?')) del(m.id); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.inkMuted, display: 'flex', padding: 4 }}><Trash2 size={15} /></button>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                    <select style={{ ...inputStyle, width: 180, padding: '5px 9px', fontSize: 12 }} value={m.owner || ''} onChange={e => upd(m.id, { owner: e.target.value })}>
                      <option value="">Ansvarlig…</option>{members.map(mm => <option key={mm.id} value={mm.id}>{mm.name}</option>)}
                    </select>
                    {od && <Pill bg={theme.rustLight} color={theme.rustDeep}>Forsinket {relativeDate(m.date)}</Pill>}
                    {soon && <Pill bg={theme.amberLight} color={theme.amberDeep}>Forfaller {relativeDate(m.date)}</Pill>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---- detalj: deltakere & ansvar ---- */
function DetailTeam({ project, memberFromAny }) {
  const lead = memberFromAny(project.lead);
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {lead && (
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '13px 16px', background: theme.brassLight, borderRadius: 10, border: `1px solid ${theme.brass}44` }}>
          <Avatar member={lead} size={40} />
          <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: theme.ink }}>{lead.name}</div><div style={{ fontSize: 12, color: theme.inkSoft }}>{lead.role}</div></div>
          <Pill bg={theme.brass} color="#fff">Prosjektleder</Pill>
        </div>
      )}
      {(project.members || []).filter(pm => pm.memberId !== project.lead).map(pm => {
        const m = memberFromAny(pm.memberId); if (!m) return null;
        return (
          <div key={pm.memberId} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 16px', background: theme.surfaceAlt, borderRadius: 10 }}>
            <Avatar member={m} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink }}>{m.name}</div>
              <div style={{ fontSize: 12, color: theme.inkSoft }}>{m.role}{pm.portalId && <span style={{ color: theme.inkMuted }}> · {portalNames[pm.portalId] || pm.portalId}</span>}</div>
            </div>
            {pm.role && <Pill bg={theme.brassLight} color={theme.brassDark}>{pm.role}</Pill>}
            {pm.responsibility && <div style={{ fontSize: 12, color: theme.inkSoft, maxWidth: 220, textAlign: 'right' }}>{pm.responsibility}</div>}
          </div>
        );
      })}
      {(project.members || []).length === 0 && !lead && <div style={{ color: theme.inkMuted, fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Ingen deltakere lagt til. Bruk «Rediger» for å sette leder og team.</div>}
    </div>
  );
}

/* ---- detalj: statuslogg (proaktivt hjerteslag) ---- */
function DetailStatusLog({ project, signals: s, currentUserId, memberFromAny, onPatch }) {
  const ups = [...(project.statusUpdates || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ health: s.suggestedHealth, summary: '', nextSteps: '' });

  const commit = () => {
    if (!draft.summary.trim()) return;
    const entry = { id: uid('su'), date: todayIso(), author: currentUserId, health: draft.health, summary: draft.summary.trim(), nextSteps: draft.nextSteps.trim() };
    onPatch({ statusUpdates: [...(project.statusUpdates || []), entry], health: draft.health });
    setDraft({ health: s.suggestedHealth, summary: '', nextSteps: '' }); setOpen(false);
  };

  return (
    <div>
      {!open ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 16px', background: s.sinceUpdate != null && s.sinceUpdate >= 14 ? theme.amberLight : theme.surfaceAlt, borderRadius: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: theme.inkSoft }}>
            {s.lastUp ? <>Sist oppdatert <b style={{ color: theme.ink }}>{relativeDate(s.lastUp)}</b>{s.sinceUpdate >= 14 && <span style={{ color: theme.amberDeep, fontWeight: 700 }}> — på tide med en ny linje</span>}</> : 'Ingen statusoppdateringer ennå. En kort linje holder porteføljen levende.'}
          </div>
          <Btn size="sm" icon={Plus} onClick={() => { setDraft({ health: s.suggestedHealth, summary: '', nextSteps: '' }); setOpen(true); }}>Ny oppdatering</Btn>
        </div>
      ) : (
        <div style={{ background: theme.surfaceAlt, padding: 16, borderRadius: 10, marginBottom: 16, display: 'grid', gap: 11 }}>
          <Field label="Helse">
            <div style={{ display: 'flex', gap: 8 }}>
              {['grønn', 'gul', 'rød'].map(h => (
                <button key={h} onClick={() => setDraft({ ...draft, health: h })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: `1px solid ${draft.health === h ? healthColor(h) : theme.border}`, background: draft.health === h ? `${healthColor(h)}1A` : theme.surface, color: draft.health === h ? healthColor(h) : theme.inkSoft, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ● {healthLabel(h)}
                </button>
              ))}
              {draft.health !== s.suggestedHealth && <span style={{ fontSize: 11.5, color: theme.inkMuted, alignSelf: 'center' }}>Forslag: {healthLabel(s.suggestedHealth)}</span>}
            </div>
          </Field>
          <Field label="Hva har skjedd?"><textarea autoFocus style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={draft.summary} onChange={e => setDraft({ ...draft, summary: e.target.value })} placeholder="Kort statuslinje…" /></Field>
          <Field label="Neste steg (valgfritt)"><textarea style={{ ...inputStyle, minHeight: 44, resize: 'vertical' }} value={draft.nextSteps} onChange={e => setDraft({ ...draft, nextSteps: e.target.value })} placeholder="Hva er neste …" /></Field>
          <div style={{ display: 'flex', gap: 8 }}><Btn size="sm" onClick={commit}>Lagre oppdatering</Btn><Btn size="sm" variant="ghost" onClick={() => setOpen(false)}>Avbryt</Btn></div>
        </div>
      )}

      {ups.length === 0 ? null : (
        <div style={{ position: 'relative' }}>
          {ups.map((u, i) => {
            const author = memberFromAny(u.author);
            return (
              <div key={u.id || i} style={{ display: 'flex', gap: 12, paddingBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: healthColor(u.health), flexShrink: 0 }} />
                  {i < ups.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 28, background: theme.borderSoft, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1, background: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: 10, padding: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <Pill bg={`${healthColor(u.health)}1F`} color={healthColor(u.health)}>● {healthLabel(u.health)}</Pill>
                    <span style={{ fontSize: 12, color: theme.inkMuted }}>{fmtDate(u.date)}{author && ` · ${author.name}`}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: theme.ink, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{u.summary}</div>
                  {u.nextSteps && <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${theme.borderSoft}`, fontSize: 12.5, color: theme.inkSoft }}><b style={{ color: theme.inkSoft }}>Neste:</b> {u.nextSteps}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---- detalj: koblinger til møter, beslutninger, risiko, KPI, initiativ ---- */
function DetailLinks({ project, data, onPatch, onNavigate }) {
  const groups = [
    { key: 'linkedMeetingIds', label: 'Møter', icon: CalIcon, items: data.meetings || [], nav: 'meetings', getName: m => m.title, sub: m => fmtDate(m.date) },
    { key: 'linkedDecisionIds', label: 'Beslutninger', icon: Gavel, items: data.decisions || [], nav: 'decisions', getName: d => d.title || d.summary, sub: d => fmtDate(d.date) },
    { key: 'linkedRiskIds', label: 'Risiko', icon: ShieldAlert, items: data.risks || [], nav: 'risks', getName: r => r.title, sub: r => r.status },
    { key: 'linkedKpiIds', label: 'KPI-er', icon: ChartIcon, items: data.kpis || [], nav: 'kpis', getName: k => k.name || k.title, sub: k => k.unit || '' },
    { key: 'linkedInitiativeIds', label: 'Initiativer', icon: Target, items: data.initiatives || [], nav: 'initiatives', getName: i => i.title, sub: i => i.status },
  ];
  const toggle = (key, id) => { const cur = project[key] || []; onPatch({ [key]: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] }); };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ fontSize: 12.5, color: theme.inkSoft, lineHeight: 1.5 }}>Knytt prosjektet til relevante møter, beslutninger, risikoer, KPI-er og initiativer i avdelingen. Koblinger gjør prosjektet sporbart på tvers av portalen.</div>
      {groups.map(g => {
        const linked = project[g.key] || [];
        if (g.items.length === 0) return (
          <div key={g.key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}><g.icon size={15} style={{ color: theme.brass }} /><span style={labelStyle}>{g.label}</span></div>
            <div style={{ fontSize: 12, color: theme.inkMuted }}>Ingen {g.label.toLowerCase()} i denne avdelingen ennå.</div>
          </div>
        );
        return (
          <div key={g.key}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><g.icon size={15} style={{ color: theme.brass }} /><span style={labelStyle}>{g.label}{linked.length > 0 && ` (${linked.length})`}</span></div>
              {onNavigate && <button onClick={() => onNavigate(g.nav)} style={{ fontSize: 11.5, color: theme.brass, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 3 }}>Åpne <ChevronRight size={13} /></button>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {g.items.slice(0, 40).map(it => {
                const on = linked.includes(it.id);
                return (
                  <button key={it.id} onClick={() => toggle(g.key, it.id)} title={g.sub(it)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 999, border: `1px solid ${on ? theme.brass : theme.border}`, background: on ? theme.brassLight : theme.surface, color: on ? theme.brassDark : theme.inkSoft, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {on && <CheckCircle size={13} />}{(g.getName(it) || 'Uten navn').slice(0, 42)}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================================
   SKJEMA: OPPRETT / REDIGER PROSJEKT
   ========================================================================== */
function ProjectForm({ project, data, allData, activePortal, memberFromAny, onSave, onCancel, onDelete }) {
  const [p, setP] = useState({
    title: '', objective: '', description: '', scope: 'dept', portalId: activePortal,
    status: 'planlagt', health: 'grønn', priority: 'medium',
    startDate: '', endDate: '', lead: '', members: [], milestones: [], category: '',
    statusUpdates: [], budget: null, tasks: [],
    ...project,
  });
  const update = (k, v) => setP(prev => ({ ...prev, [k]: v }));
  const [showBudget, setShowBudget] = useState(!!(project && project.budget));

  const availableMembers = p.scope === 'crossorg'
    ? Object.entries(allData || {}).flatMap(([pid, d]) => (d.members || []).map(m => ({ ...m, _portalId: pid })))
    : (data.members || []).map(m => ({ ...m, _portalId: activePortal }));
  const uniqueMembers = availableMembers.filter((m, i, arr) => arr.findIndex(x => x.id === m.id) === i);

  const toggleMember = (memberId, portalId) => {
    const list = p.members || [];
    if (list.find(m => m.memberId === memberId)) setP({ ...p, members: list.filter(m => m.memberId !== memberId) });
    else setP({ ...p, members: [...list, { memberId, portalId, role: '', responsibility: '' }] });
  };
  const updateMember = (memberId, patch) => setP({ ...p, members: (p.members || []).map(m => m.memberId === memberId ? { ...m, ...patch } : m) });

  const addMilestone = () => setP({ ...p, milestones: [...(p.milestones || []), { id: uid('ms'), title: '', date: '', status: 'ikke_startet', owner: '' }] });
  const updateMilestone = (idx, patch) => { const next = [...(p.milestones || [])]; next[idx] = { ...next[idx], ...patch }; setP({ ...p, milestones: next }); };
  const removeMilestone = (idx) => setP({ ...p, milestones: (p.milestones || []).filter((_, i) => i !== idx) });

  const setBudget = (patch) => setP(prev => ({ ...prev, budget: { planned: 0, spent: 0, currency: 'NOK', ...(prev.budget || {}), ...patch } }));

  const select = { ...inputStyle, cursor: 'pointer' };
  const sm = { ...inputStyle, padding: '6px 8px', fontSize: 12 };

  const save = () => {
    if (!p.title.trim()) { alert('Tittel mangler'); return; }
    const clean = { ...p };
    if (!showBudget) clean.budget = null;
    onSave(clean);
  };

  return (
    <div style={{ display: 'grid', gap: 15 }}>
      {/* scope + prioritet */}
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <div>
          <span style={labelStyle}>Omfang</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['dept', 'Avdeling'], ['crossorg', 'På tvers']].map(([s, lab]) => (
              <button key={s} type="button" onClick={() => update('scope', s)}
                style={{ padding: '7px 16px', borderRadius: 999, border: `1px solid ${p.scope === s ? theme.brass : theme.border}`, background: p.scope === s ? theme.brassLight : theme.surface, color: p.scope === s ? theme.brassDark : theme.inkSoft, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{lab}</button>
            ))}
          </div>
        </div>
        <div>
          <span style={labelStyle}>Prioritet</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(priorityLabels).map(([k, lab]) => (
              <button key={k} type="button" onClick={() => update('priority', k)}
                style={{ padding: '7px 16px', borderRadius: 999, border: `1px solid ${p.priority === k ? theme.brass : theme.border}`, background: p.priority === k ? theme.brassLight : theme.surface, color: p.priority === k ? theme.brassDark : theme.inkSoft, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{lab}</button>
            ))}
          </div>
        </div>
      </div>

      <Field label="Tittel">
        <input style={inputStyle} value={p.title} onChange={e => update('title', e.target.value)} placeholder="Prosjektnavn" />
      </Field>
      <Field label="Mål / hensikt">
        <input style={inputStyle} value={p.objective || ''} onChange={e => update('objective', e.target.value)} placeholder="Hva skal prosjektet oppnå? (én setning)" />
      </Field>
      <Field label="Beskrivelse">
        <textarea style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} value={p.description} onChange={e => update('description', e.target.value)} placeholder="Kort beskrivelse, bakgrunn, leveranser..." />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Status">
          <select style={select} value={p.status} onChange={e => update('status', e.target.value)}>
            {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Helse">
          <select style={select} value={p.health} onChange={e => update('health', e.target.value)}>
            <option value="grønn">Grønn – på sporet</option>
            <option value="gul">Gul – følges nøye</option>
            <option value="rød">Rød – i trøbbel</option>
          </select>
        </Field>
        <Field label="Prosjektleder">
          <select style={select} value={p.lead} onChange={e => update('lead', e.target.value)}>
            <option value="">Velg...</option>
            {uniqueMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Startdato"><input style={inputStyle} type="date" value={p.startDate || ''} onChange={e => update('startDate', e.target.value)} /></Field>
        <Field label="Sluttdato"><input style={inputStyle} type="date" value={p.endDate || ''} onChange={e => update('endDate', e.target.value)} /></Field>
      </div>

      {/* deltakere */}
      <div>
        <span style={labelStyle}>Deltakere</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {uniqueMembers.map(m => {
            const on = (p.members || []).some(x => x.memberId === m.id);
            return (
              <button key={m.id} type="button" onClick={() => toggleMember(m.id, m._portalId)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px 5px 5px', borderRadius: 999, border: `1px solid ${on ? theme.brass : theme.border}`, background: on ? theme.brassLight : theme.surface, color: theme.ink, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500 }}>
                <Avatar member={m} size={20} />{m.name.split(' ')[0]}
                {p.scope === 'crossorg' && <span style={{ fontSize: 10, color: theme.inkMuted }}>({portalNames[m._portalId] || m._portalId})</span>}
              </button>
            );
          })}
        </div>
        {(p.members || []).length > 0 && (
          <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
            {(p.members || []).map(pm => {
              const m = memberFromAny(pm.memberId);
              if (!m) return null;
              return (
                <div key={pm.memberId} style={{ display: 'flex', gap: 8, alignItems: 'center', background: theme.surfaceAlt, padding: '8px 12px', borderRadius: 8 }}>
                  <Avatar member={m} size={24} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: theme.ink, minWidth: 78 }}>{m.name.split(' ')[0]}</span>
                  <input style={{ ...sm, flex: 1 }} value={pm.role || ''} onChange={e => updateMember(pm.memberId, { role: e.target.value })} placeholder="Rolle" />
                  <input style={{ ...sm, flex: 2 }} value={pm.responsibility || ''} onChange={e => updateMember(pm.memberId, { responsibility: e.target.value })} placeholder="Ansvarsområde" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* milepæler */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={labelStyle}>Milepæler ({(p.milestones || []).length})</span>
          <button type="button" onClick={addMilestone} style={{ fontSize: 12, color: theme.brass, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>+ Legg til</button>
        </div>
        {(p.milestones || []).map((ms, i) => (
          <div key={ms.id || i} style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 6 }}>
            <input style={{ ...sm, flex: 2 }} value={ms.title} onChange={e => updateMilestone(i, { title: e.target.value })} placeholder="Milepæl" />
            <input style={{ ...sm, width: 130 }} type="date" value={ms.date || ''} onChange={e => updateMilestone(i, { date: e.target.value })} />
            <select style={{ ...sm, width: 116, cursor: 'pointer' }} value={ms.owner || ''} onChange={e => updateMilestone(i, { owner: e.target.value })}>
              <option value="">Ansvarlig…</option>
              {uniqueMembers.map(m => <option key={m.id} value={m.id}>{m.name.split(' ')[0]}</option>)}
            </select>
            <select style={{ ...sm, width: 110, cursor: 'pointer' }} value={ms.status} onChange={e => updateMilestone(i, { status: e.target.value })}>
              <option value="ikke_startet">Ikke startet</option>
              <option value="pågår">Pågår</option>
              <option value="fullført">Fullført</option>
            </select>
            <button type="button" onClick={() => removeMilestone(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.inkMuted, fontSize: 16, lineHeight: 1 }}>&#x2715;</button>
          </div>
        ))}
      </div>

      {/* budsjett (valgfritt) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showBudget ? 8 : 0 }}>
          <span style={labelStyle}>Budsjett</span>
          <button type="button" onClick={() => { setShowBudget(v => !v); if (!showBudget && !p.budget) setBudget({}); }}
            style={{ fontSize: 12, color: theme.brass, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
            {showBudget ? 'Fjern' : '+ Legg til budsjett'}
          </button>
        </div>
        {showBudget && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px', gap: 12 }}>
            <Field label="Planlagt"><input style={inputStyle} type="number" value={(p.budget && p.budget.planned) || ''} onChange={e => setBudget({ planned: Number(e.target.value) || 0 })} placeholder="0" /></Field>
            <Field label="Brukt"><input style={inputStyle} type="number" value={(p.budget && p.budget.spent) || ''} onChange={e => setBudget({ spent: Number(e.target.value) || 0 })} placeholder="0" /></Field>
            <Field label="Valuta"><input style={inputStyle} value={(p.budget && p.budget.currency) || 'NOK'} onChange={e => setBudget({ currency: e.target.value })} /></Field>
          </div>
        )}
      </div>

      {/* handlinger */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 16, borderTop: `1px solid ${theme.borderSoft}` }}>
        <div>{onDelete && <button onClick={onDelete} style={{ padding: '9px 16px', borderRadius: 8, border: `1px solid ${theme.rust}44`, background: theme.rustLight, color: theme.rustDeep, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Slett</button>}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ padding: '9px 16px', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.inkSoft, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Avbryt</button>
          <button onClick={save} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: theme.brass, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Lagre prosjekt</button>
        </div>
      </div>
    </div>
  );
}
