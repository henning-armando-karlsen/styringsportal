import React, { useState, useMemo, useEffect, useRef } from 'react';

/* Selvstendig kalender for Styringsportalen.
   - Aggregerer det som allerede har dato: moter, oppgavefrister (inkl. markedsplan + sortiment),
     egne hendelser (personlig) og delte hendelser (avdeling).
   - To visninger: Maned + Agenda. Filter: Mine / Avdelingen.
   - Egne/delte hendelser lagres i den aktive portalens calendarEvents (via onSaveEvents).
   - .ics-eksport av "mine" daterte elementer.
   Matcher portalens palett; ingen eksterne avhengigheter. */

const theme = {
  bg: '#EDE9DF', surface: '#FFFFFF', surfaceAlt: '#E4DFD4',
  ink: '#252525', inkSoft: '#4A4A4A', inkMuted: '#7A7A7A',
  border: '#CBC4AF', borderSoft: '#DDD8CB',
  brass: '#9D8068', brassDark: '#7D6450', brassLight: '#EDE4DB',
  navy: '#252525', navyDark: '#1A1A1A',
  sage: '#5E6A60', sageLight: '#E3E7E3',
  rust: '#B0533F', rustLight: '#FDE8E0',
  amber: '#8B6914', amberLight: '#F2E8DE',
  violet: '#7B4D8C', violetLight: '#EDE3F2',
};

const MONTHS = ['Januar','Februar','Mars','April','Mai','Juni','Juli','August','September','Oktober','November','Desember'];
const DOW = ['Man','Tir','Ons','Tor','Fre','Lør','Søn'];

const TYPE = {
  mote:       { label: 'Møte',         fg: '#fff',          bg: theme.navy,      wash: '#E4E1DA' },
  frist:      { label: 'Frist',        fg: theme.brassDark, bg: theme.brass,     wash: theme.brassLight },
  markedsplan:{ label: 'Markedsplan',  fg: theme.sage,      bg: theme.sage,      wash: theme.sageLight },
  sortiment:  { label: 'Sortiment',    fg: theme.amber,     bg: theme.amber,     wash: theme.amberLight },
  personlig:  { label: 'Personlig',    fg: theme.violet,    bg: theme.violet,    wash: theme.violetLight },
  delt:       { label: 'Delt',         fg: theme.rust,      bg: theme.rust,      wash: theme.rustLight },
};

/* ── ikoner (inline svg) ───────────────────────────────────────────── */
const Ic = ({ d, size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>{d}</svg>
);
const IcLeft = (p) => <Ic {...p} d={<polyline points="15 18 9 12 15 6" />} />;
const IcRight = (p) => <Ic {...p} d={<polyline points="9 18 15 12 9 6" />} />;
const IcPlus = (p) => <Ic {...p} d={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />;
const IcCal = (p) => <Ic {...p} d={<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>} />;
const IcDownload = (p) => <Ic {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>} />;
const IcExt = (p) => <Ic {...p} d={<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>} />;
const IcTrash = (p) => <Ic {...p} d={<><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>} />;
const IcX = (p) => <Ic {...p} d={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />;

/* ── helpers ───────────────────────────────────────────────────────── */
const pad = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = toISO(new Date());
const parseISO = (s) => { const [y, m, d] = (s || '').split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const fmtLong = (iso) => parseISO(iso).toLocaleDateString('no-NO', { weekday: 'long', day: 'numeric', month: 'long' });
const uid = () => 'cal_' + Math.random().toString(36).slice(2, 9);

function monthWeeks(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  const offset = (first.getDay() + 6) % 7; // mandag = 0
  start.setDate(first.getDate() - offset);
  const weeks = [];
  let cur = new Date(start);
  for (let w = 0; w < 6; w++) {
    const days = [];
    for (let i = 0; i < 7; i++) { days.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
    weeks.push(days);
    if (cur.getMonth() !== month && cur > new Date(year, month + 1, 1)) break;
  }
  return weeks;
}

/* ── dagvisning: konstanter + overlapp-layout ──────────────────────── */
const HOUR_PX = 48;
const DAY_GUTTER = 54;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function layoutDay(timed) {
  const sorted = [...timed].sort((a, b) => a.start - b.start || a.end - b.end);
  let cluster = [], clusters = [], curEnd = -1;
  sorted.forEach((ev) => {
    if (cluster.length && ev.start >= curEnd) { clusters.push(cluster); cluster = []; curEnd = -1; }
    cluster.push(ev); curEnd = Math.max(curEnd, ev.end);
  });
  if (cluster.length) clusters.push(cluster);
  clusters.forEach((cl) => {
    const colEnds = [];
    cl.forEach((ev) => {
      let placed = false;
      for (let i = 0; i < colEnds.length; i++) { if (ev.start >= colEnds[i]) { ev._col = i; colEnds[i] = ev.end; placed = true; break; } }
      if (!placed) { ev._col = colEnds.length; colEnds.push(ev.end); }
    });
    cl.forEach((ev) => { ev._ncol = colEnds.length; });
  });
  return sorted;
}

const Btn = ({ children, onClick, variant = 'ghost', icon: Icon, style = {} }) => {
  const v = variant === 'brass'
    ? { bg: theme.brass, fg: '#fff', bd: theme.brass }
    : variant === 'primary'
    ? { bg: theme.navy, fg: '#fff', bd: theme.navy }
    : { bg: 'transparent', fg: theme.ink, bd: theme.border };
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 13px',
      fontSize: 13, fontWeight: 600, background: v.bg, color: v.fg, border: `1px solid ${v.bd}`, borderRadius: 8,
      cursor: 'pointer', fontFamily: 'inherit', ...style }}>
      {Icon && <Icon size={15} />}{children}
    </button>
  );
};

export default function CalendarView({
  data = {}, allData = {}, currentUserId, markedsplanTasks = [], sortimentTasks = [],
  onNavigate = () => {}, onSaveEvents = () => {}, activePortal,
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [scope, setScope] = useState('mine');     // 'mine' | 'avdeling'
  const [mode, setMode] = useState('maned');       // 'maned' | 'dag' | 'agenda'
  const [editing, setEditing] = useState(null);    // event-objekt under redigering
  const [selectedDay, setSelectedDay] = useState(todayISO);
  const [, setNowTick] = useState(0);
  const dayRef = useRef(null);
  useEffect(() => { if (mode === 'dag' && dayRef.current) dayRef.current.scrollTop = 7 * HOUR_PX - 12; }, [mode, selectedDay]);
  useEffect(() => { const id = setInterval(() => setNowTick((t) => t + 1), 60000); return () => clearInterval(id); }, []);

  const members = data.members || [];
  const memberById = (id) => members.find((m) => m.id === id);
  const portalMemberIds = new Set(members.map((m) => m.id));

  // Egne hendelser pa tvers av portaler (folger personen); delte hentes fra aktiv portal
  const allCalEvents = useMemo(() => {
    const out = [];
    Object.keys(allData).forEach((pid) => (allData[pid]?.calendarEvents || []).forEach((e) => out.push({ ...e, _portal: pid })));
    (data.calendarEvents || []).forEach((e) => { if (!out.some((x) => x.id === e.id)) out.push({ ...e, _portal: activePortal }); });
    return out;
  }, [allData, data, activePortal]);

  const events = useMemo(() => {
    const mine = scope === 'mine';
    const list = [];
    const add = (o) => { if (o.date) list.push(o); };

    // Moter
    (data.meetings || []).forEach((m) => {
      if (m.status === 'avlyst') return;
      if (mine && !(m.attendees || []).includes(currentUserId)) return;
      add({ key: 'm:' + m.id, date: m.date, time: m.time, dur: m.duration || 60, title: m.title, type: 'mote',
        sub: m.location || '', onClick: () => onNavigate('meetings', m.id) });
    });

    // Oppgavefrister i portalen
    (data.tasks || []).forEach((t) => {
      if (!t.dueDate || t.status === 'fullført') return;
      if (mine && t.owner !== currentUserId) return;
      add({ key: 't:' + t.id, date: t.dueDate, title: t.title, type: 'frist',
        sub: memberById(t.owner)?.name || '', onClick: () => onNavigate('tasks') });
    });

    // Markedsplan + sortiment (utledede oppgaver, kun de med dato)
    const ext = [
      ...markedsplanTasks.map((a) => ({ ...a, _t: 'markedsplan', _go: () => onNavigate('markedsplan') })),
      ...sortimentTasks.map((a) => ({ ...a, _t: 'sortiment', _go: () => (a.link ? window.open(a.link, '_blank') : null) })),
    ];
    ext.forEach((a) => {
      if (!a.dueDate || a.status === 'fullført') return;
      if (mine ? a.owner !== currentUserId : !(a.owner && portalMemberIds.has(a.owner))) return;
      add({ key: a._t + ':' + a.id, date: a.dueDate, title: a.title, type: a._t,
        sub: memberById(a.owner)?.name || a.ownerName || '', onClick: a._go });
    });

    // Egne (personlig) + delte hendelser
    allCalEvents.forEach((e) => {
      const isMine = e.scope === 'personlig' && e.owner === currentUserId;
      const isDelt = e.scope === 'delt' && (e._portal === activePortal);
      if (mine ? !isMine : !isDelt) return;
      add({ key: 'e:' + e.id, date: e.date, endDate: e.endDate, time: e.allDay ? '' : e.time, dur: 60,
        title: e.title, type: e.scope === 'personlig' ? 'personlig' : 'delt', sub: e.location || '',
        editable: true, raw: e, onClick: () => setEditing(e) });
    });

    return list.sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  }, [data, scope, currentUserId, markedsplanTasks, sortimentTasks, allCalEvents, activePortal]);

  const byDate = useMemo(() => {
    const m = {};
    events.forEach((e) => { (m[e.date] = m[e.date] || []).push(e); });
    return m;
  }, [events]);

  const weeks = useMemo(() => monthWeeks(year, month), [year, month]);
  const stepMonth = (d) => {
    let mm = month + d, yy = year;
    if (mm < 0) { mm = 11; yy--; } if (mm > 11) { mm = 0; yy++; }
    setMonth(mm); setYear(yy);
  };
  const stepDay = (d) => { const x = parseISO(selectedDay); x.setDate(x.getDate() + d); setSelectedDay(toISO(x)); };

  /* ── lagring av hendelser (i aktiv portal) ──────────────────────── */
  const saveEvent = (ev) => {
    const existing = data.calendarEvents || [];
    const next = existing.some((x) => x.id === ev.id)
      ? existing.map((x) => (x.id === ev.id ? ev : x))
      : [...existing, ev];
    onSaveEvents(next);
    setEditing(null);
  };
  const deleteEvent = (id) => { onSaveEvents((data.calendarEvents || []).filter((x) => x.id !== id)); setEditing(null); };

  /* ── .ics-eksport av "mine" daterte elementer ───────────────────── */
  const exportICS = () => {
    const prevScope = scope;
    // bygg "mine"-lista uavhengig av valgt filter
    const mineEvents = events; // hvis filter er 'mine' brukes den; ellers eksporter likevel synlige
    const esc = (s) => String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vikingbad//Styringsportal//NO', 'CALSCALE:GREGORIAN'];
    mineEvents.forEach((e) => {
      const dt = e.date.replace(/-/g, '');
      lines.push('BEGIN:VEVENT', `UID:${e.key}@styringsportal`, `DTSTART;VALUE=DATE:${dt}`,
        `SUMMARY:${esc((TYPE[e.type]?.label || '') + ': ' + e.title)}`,
        e.sub ? `DESCRIPTION:${esc(e.sub)}` : 'DESCRIPTION:', 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `styringsportal-kalender-${scope}.ics`; a.click();
    URL.revokeObjectURL(url);
  };

  const heading = { fontFamily: 'Fraunces, Georgia, serif', fontWeight: 500, color: theme.ink };

  return (
    <div>
      {/* Topp */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, color: theme.brass, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Tid og frister</div>
        <h1 style={{ ...heading, fontSize: 28, margin: 0 }}>Kalender</h1>
        <p style={{ fontSize: 13.5, color: theme.inkSoft, margin: '4px 0 0' }}>Møter og frister samlet — fra portalen, markedsplanen og sortimentsarbeidet. Klikk for å åpne kilden.</p>
      </div>

      {/* Kontroller */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ display: 'flex', background: theme.surfaceAlt, borderRadius: 9, padding: 3 }}>
          {[['mine', 'Mine'], ['avdeling', 'Avdelingen']].map(([k, l]) => (
            <button key={k} onClick={() => setScope(k)} style={{ padding: '7px 14px', borderRadius: 7, border: 'none',
              background: scope === k ? theme.surface : 'transparent', color: scope === k ? theme.ink : theme.inkSoft,
              fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', boxShadow: scope === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', background: theme.surfaceAlt, borderRadius: 9, padding: 3 }}>
          {[['maned', 'Måned'], ['dag', 'Dag'], ['agenda', 'Agenda']].map(([k, l]) => (
            <button key={k} onClick={() => setMode(k)} style={{ padding: '7px 14px', borderRadius: 7, border: 'none',
              background: mode === k ? theme.surface : 'transparent', color: mode === k ? theme.ink : theme.inkSoft,
              fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <Btn icon={IcDownload} onClick={exportICS}>Eksporter (.ics)</Btn>
        <Btn icon={IcPlus} variant="brass" onClick={() => setEditing({ id: uid(), title: '', date: todayISO, endDate: '', allDay: true, time: '09:00', scope: 'personlig', owner: currentUserId, location: '', notes: '' })}>Ny hendelse</Btn>
      </div>

      {/* Manednavigasjon (kun manedsvisning) */}
      {mode === 'maned' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <button onClick={() => stepMonth(-1)} style={navBtn}><IcLeft /></button>
          <div style={{ ...heading, fontSize: 19, minWidth: 190 }}>{MONTHS[month]} {year}</div>
          <button onClick={() => stepMonth(1)} style={navBtn}><IcRight /></button>
          <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}
            style={{ ...navBtn, width: 'auto', padding: '0 12px', fontSize: 12.5, fontWeight: 600 }}>I dag</button>
        </div>
      )}

      {/* MANEDSGRID */}
      {mode === 'maned' && (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: theme.surfaceAlt }}>
            {DOW.map((d) => <div key={d} style={{ padding: '9px 10px', fontSize: 11, fontWeight: 700, color: theme.inkSoft, letterSpacing: 0.5, textTransform: 'uppercase' }}>{d}</div>)}
          </div>
          {weeks.map((wk, wi) => (
            <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
              {wk.map((d) => {
                const iso = toISO(d);
                const inMonth = d.getMonth() === month;
                const isToday = iso === todayISO;
                const evs = byDate[iso] || [];
                return (
                  <div key={iso} style={{ minHeight: 104, borderTop: `1px solid ${theme.borderSoft}`, borderLeft: `1px solid ${theme.borderSoft}`,
                    padding: 6, background: inMonth ? theme.surface : '#F6F2E9', opacity: inMonth ? 1 : 0.6 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? '#fff' : theme.inkSoft,
                        background: isToday ? theme.brass : 'transparent', borderRadius: '50%', width: 22, height: 22,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        onClick={() => { setSelectedDay(iso); setMode('dag'); }}>{d.getDate()}</span>
                    </div>
                    {evs.slice(0, 3).map((e) => {
                      const t = TYPE[e.type];
                      return (
                        <div key={e.key} onClick={e.onClick} title={e.title}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 6px', marginBottom: 3, borderRadius: 5,
                            background: t.wash, cursor: 'pointer', overflow: 'hidden' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.bg, flexShrink: 0 }} />
                          {e.time && <span style={{ fontSize: 10, color: theme.inkMuted, flexShrink: 0 }}>{e.time}</span>}
                          <span style={{ fontSize: 11.5, color: theme.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</span>
                        </div>
                      );
                    })}
                    {evs.length > 3 && <div onClick={() => { setSelectedDay(iso); setMode('dag'); }} style={{ fontSize: 10.5, color: theme.brass, fontWeight: 600, cursor: 'pointer', paddingLeft: 4 }}>+{evs.length - 3} til</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* DAGVISNING (Outlook-stil) */}
      {mode === 'dag' && (() => {
        const dayEvs = byDate[selectedDay] || [];
        const allDayEvs = dayEvs.filter((e) => !e.time);
        const timed = layoutDay(dayEvs.filter((e) => e.time).map((e) => {
          const [h, mi] = e.time.split(':').map(Number);
          const start = h * 60 + (mi || 0);
          return { ...e, start, end: start + (e.dur || 60) };
        }));
        const now = new Date();
        const nowMin = selectedDay === todayISO ? now.getHours() * 60 + now.getMinutes() : -1;
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <button onClick={() => stepDay(-1)} style={navBtn}><IcLeft /></button>
              <div style={{ ...heading, fontSize: 19, minWidth: 230, textTransform: 'capitalize' }}>{fmtLong(selectedDay)}</div>
              <button onClick={() => stepDay(1)} style={navBtn}><IcRight /></button>
              <button onClick={() => setSelectedDay(todayISO)} style={{ ...navBtn, width: 'auto', padding: '0 12px', fontSize: 12.5, fontWeight: 600 }}>I dag</button>
            </div>
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {allDayEvs.length > 0 && (
                <div style={{ position: 'relative', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', padding: '10px 14px 10px 60px', borderBottom: `1px solid ${theme.borderSoft}`, background: theme.surfaceAlt }}>
                  <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10.5, color: theme.inkMuted, fontWeight: 600 }}>Hele dagen</span>
                  {allDayEvs.map((e) => { const t = TYPE[e.type]; return (
                    <div key={e.key} onClick={e.onClick} title={e.title} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 9px', borderRadius: 6, background: t.wash, borderLeft: `3px solid ${t.bg}`, cursor: 'pointer', fontSize: 12.5, color: theme.ink }}>{e.title}</div>
                  ); })}
                </div>
              )}
              <div ref={dayRef} style={{ position: 'relative', maxHeight: 560, overflowY: 'auto' }}>
                <div style={{ position: 'relative', height: 24 * HOUR_PX }}>
                  {HOURS.map((h) => (
                    <div key={h} onClick={() => setEditing({ id: uid(), title: '', date: selectedDay, endDate: '', allDay: false, time: pad(h) + ':00', scope: 'personlig', owner: currentUserId, location: '', notes: '' })}
                      style={{ position: 'absolute', top: h * HOUR_PX, left: 0, right: 0, height: HOUR_PX, borderTop: `1px solid ${theme.borderSoft}`, cursor: 'pointer' }}>
                      <span style={{ position: 'absolute', top: -7, left: 8, fontSize: 10.5, color: theme.inkMuted, background: theme.surface, padding: '0 3px' }}>{pad(h)}:00</span>
                    </div>
                  ))}
                  {nowMin >= 0 && (
                    <div style={{ position: 'absolute', top: (nowMin / 60) * HOUR_PX, left: DAY_GUTTER - 4, right: 6, height: 0, borderTop: `2px solid ${theme.rust}`, zIndex: 5 }}>
                      <span style={{ position: 'absolute', left: -6, top: -5, width: 9, height: 9, borderRadius: '50%', background: theme.rust }} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: DAY_GUTTER, right: 6, pointerEvents: 'none' }}>
                    {timed.map((e) => {
                      const t = TYPE[e.type];
                      const top = (e.start / 60) * HOUR_PX;
                      const hgt = Math.max(((e.end - e.start) / 60) * HOUR_PX - 2, 22);
                      return (
                        <div key={e.key} onClick={e.onClick} title={e.title}
                          style={{ position: 'absolute', top, height: hgt, left: `${(e._col / e._ncol) * 100}%`, width: `calc(${(1 / e._ncol) * 100}% - 4px)`,
                            background: t.wash, borderLeft: `3px solid ${t.bg}`, borderRadius: 6, padding: '3px 7px', cursor: 'pointer', pointerEvents: 'auto', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                          <div style={{ fontSize: 11, color: theme.inkMuted }}>{e.time}</div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: theme.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.title}</div>
                          {hgt > 44 && e.sub && <div style={{ fontSize: 11, color: theme.inkMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.sub}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* AGENDA */}
      {mode === 'agenda' && (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
          {events.filter((e) => e.date >= todayISO).length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: theme.inkMuted, fontSize: 14 }}>Ingen kommende hendelser i {scope === 'mine' ? 'din' : 'avdelingens'} kalender.</div>
          ) : Object.entries(events.filter((e) => e.date >= todayISO).reduce((acc, e) => { (acc[e.date] = acc[e.date] || []).push(e); return acc; }, {})).map(([date, evs]) => (
            <div key={date} style={{ borderTop: `1px solid ${theme.borderSoft}` }}>
              <div style={{ padding: '10px 18px', background: theme.surfaceAlt, fontSize: 12.5, fontWeight: 700, color: theme.inkSoft, textTransform: 'capitalize' }}>
                {fmtLong(date)}{date === todayISO ? ' · I dag' : ''}
              </div>
              {evs.map((e) => {
                const t = TYPE[e.type];
                return (
                  <div key={e.key} onClick={e.onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
                    borderTop: `1px solid ${theme.borderSoft}`, cursor: 'pointer' }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: t.bg, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: theme.inkMuted, width: 46, flexShrink: 0 }}>{e.time || 'Hele'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: theme.ink }}>{e.title}</div>
                      {e.sub && <div style={{ fontSize: 12, color: theme.inkMuted }}>{e.sub}</div>}
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', color: t.fg, background: t.wash, padding: '3px 9px', borderRadius: 999 }}>{t.label}</span>
                    {e.type === 'sortiment' && <IcExt size={14} style={{ color: theme.inkMuted }} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Tegnforklaring */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 14 }}>
        {Object.entries(TYPE).map(([k, t]) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.inkSoft }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: t.bg }} />{t.label}
          </span>
        ))}
      </div>

      {/* MODAL: ny/rediger hendelse */}
      {editing && (
        <div onClick={() => setEditing(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,36,51,0.4)', backdropFilter: 'blur(3px)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '8vh' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: theme.surface, width: '100%', maxWidth: 480, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', animation: 'modalIn 180ms ease' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <IcCal style={{ color: theme.brass }} />
              <h2 style={{ ...heading, fontSize: 18, margin: 0, flex: 1 }}>{(data.calendarEvents || []).some((x) => x.id === editing.id) ? 'Rediger hendelse' : 'Ny hendelse'}</h2>
              <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.inkSoft, display: 'flex' }}><IcX /></button>
            </div>
            <div style={{ padding: 20, display: 'grid', gap: 14 }}>
              <Field label="Tittel">
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Hva skjer?" style={inp} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Dato"><input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} style={inp} /></Field>
                <Field label="Til (valgfritt)"><input type="date" value={editing.endDate || ''} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} style={inp} /></Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Hele dagen">
                  <select value={editing.allDay ? 'ja' : 'nei'} onChange={(e) => setEditing({ ...editing, allDay: e.target.value === 'ja' })} style={inp}>
                    <option value="ja">Ja</option><option value="nei">Nei (med tid)</option>
                  </select>
                </Field>
                {!editing.allDay && <Field label="Tid"><input type="time" value={editing.time || '09:00'} onChange={(e) => setEditing({ ...editing, time: e.target.value })} style={inp} /></Field>}
              </div>
              <Field label="Synlighet">
                <select value={editing.scope} onChange={(e) => setEditing({ ...editing, scope: e.target.value })} style={inp}>
                  <option value="personlig">Personlig (kun meg)</option>
                  <option value="delt">Delt med {data.org?.orgName || 'avdelingen'}</option>
                </select>
              </Field>
              <Field label="Sted / notat (valgfritt)">
                <input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Sted, lenke eller kort notat" style={inp} />
              </Field>
            </div>
            <div style={{ padding: '14px 20px', borderTop: `1px solid ${theme.borderSoft}`, display: 'flex', gap: 8, alignItems: 'center' }}>
              {(data.calendarEvents || []).some((x) => x.id === editing.id) &&
                <Btn icon={IcTrash} variant="ghost" style={{ color: theme.rust, borderColor: theme.rustLight }} onClick={() => deleteEvent(editing.id)}>Slett</Btn>}
              <div style={{ flex: 1 }} />
              <Btn onClick={() => setEditing(null)}>Avbryt</Btn>
              <Btn variant="brass" onClick={() => editing.title.trim() && saveEvent({ ...editing, owner: editing.scope === 'personlig' ? currentUserId : (editing.owner || currentUserId) })}>Lagre</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const navBtn = { width: 34, height: 34, borderRadius: 9, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.ink, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const inp = { width: '100%', padding: '9px 11px', borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 14, fontFamily: 'inherit', background: theme.surface, color: theme.ink, boxSizing: 'border-box' };
const Field = ({ label, children }) => (
  <label style={{ display: 'block' }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: theme.inkSoft, marginBottom: 5 }}>{label}</div>
    {children}
  </label>
);
