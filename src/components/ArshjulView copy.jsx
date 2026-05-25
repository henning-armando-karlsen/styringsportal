import React, { useState, useMemo } from 'react';

/* Et syklisk arshjul for Styringsportalen — Plandisc-inspirert (lett versjon).
   - Sirkulaert hjul: 12 manedssektorer (Jan ovrest, med klokka).
   - Kategori-ringer (konsentriske spor) fra org.planCategories, MED ring-navn pa hjulet.
   - Hver aktivitet vises som bue MED tittel som buetekst langs buen.
   - Filtrering: vis/skjul ringer + sok pa tittel.
   - "Na"-viser, arvelger, opprett/rediger/slett, manedsliste.
   - Manedsopplosning. Hendelser uten ar = arlig rytme; med ar = arsspesifikke.
   - Lagres i aktiv portals JSONB som data.arshjulEvents. Selvstendig komponent. */

const theme = {
  bg: '#EDE9DF', surface: '#FFFFFF', surfaceAlt: '#E4DFD4',
  ink: '#252525', inkSoft: '#4A4A4A', inkMuted: '#7A7A7A',
  border: '#CBC4AF', borderSoft: '#DDD8CB',
  brass: '#9D8068', brassDark: '#7D6450', brassLight: '#EDE4DB',
  navy: '#252525', sage: '#5E6A60', rust: '#B0533F', rustLight: '#FDE8E0',
};

const MND_LANG = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
const MND_KORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

const DEFAULT_CATS = {
  styring: { label: 'Styring', color: '#5C4A3A' },
  okonomi: { label: 'Økonomi', color: '#9B7230' },
  marked: { label: 'Marked', color: '#7B4D8C' },
  folk: { label: 'Folk & org', color: '#557758' },
};

/* ── geometri ──────────────────────────────────────────────────────── */
const SIZE = 520, C = SIZE / 2;
const R_LABEL_OUT = 244, R_LABEL_IN = 206, R_RING_OUT = 200, R_HUB = 66;
const TAU = Math.PI * 2;
const polar = (r, f) => { const a = -Math.PI / 2 + f * TAU; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
function ann(r1, r2, f0, f1) {
  const large = (f1 - f0) > 0.5 ? 1 : 0;
  const [aox, aoy] = polar(r2, f0), [box, boy] = polar(r2, f1);
  const [cix, ciy] = polar(r1, f1), [dix, diy] = polar(r1, f0);
  return `M ${aox} ${aoy} A ${r2} ${r2} 0 ${large} 1 ${box} ${boy} L ${cix} ${ciy} A ${r1} ${r1} 0 ${large} 0 ${dix} ${diy} Z`;
}
// senterlinje-bue for buetekst; rev=true snur retningen sa teksten star riktig vei nederst
function centerArc(r, f0, f1, rev) {
  if (rev) { const t = f0; f0 = f1; f1 = t; }
  const large = Math.abs(f1 - f0) > 0.5 ? 1 : 0;
  const sweep = rev ? 0 : 1;
  const [x0, y0] = polar(r, f0), [x1, y1] = polar(r, f1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;
}
const trunc = (s, n) => (s && s.length > n ? s.slice(0, Math.max(1, n - 1)) + '…' : (s || ''));

/* ── ikoner ────────────────────────────────────────────────────────── */
const Ic = ({ d, size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>{d}</svg>
);
const IcLeft = (p) => <Ic {...p} d={<polyline points="15 18 9 12 15 6" />} />;
const IcRight = (p) => <Ic {...p} d={<polyline points="9 18 15 12 9 6" />} />;
const IcPlus = (p) => <Ic {...p} d={<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>} />;
const IcTrash = (p) => <Ic {...p} d={<><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>} />;
const IcX = (p) => <Ic {...p} d={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />;
const IcSearch = (p) => <Ic {...p} d={<><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />;

const uid = () => 'ah_' + Math.random().toString(36).slice(2, 9);
const heading = { fontFamily: 'Fraunces, Georgia, serif', fontWeight: 500, color: theme.ink };

const Btn = ({ children, onClick, variant = 'ghost', icon: Icon, style = {} }) => {
  const v = variant === 'brass' ? { bg: theme.brass, fg: '#fff', bd: theme.brass } : { bg: 'transparent', fg: theme.ink, bd: theme.border };
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 13px', fontSize: 13, fontWeight: 600, background: v.bg, color: v.fg, border: `1px solid ${v.bd}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', ...style }}>
      {Icon && <Icon size={15} />}{children}
    </button>
  );
};

export default function ArshjulView({ data = {}, save = () => {}, currentUserId }) {
  const nowYear = new Date().getFullYear();
  const [year, setYear] = useState(nowYear);
  const [hover, setHover] = useState(null);
  const [focusMonth, setFocusMonth] = useState(null);
  const [editing, setEditing] = useState(null);
  const [hiddenCats, setHiddenCats] = useState(() => new Set());
  const [query, setQuery] = useState('');

  const members = data.members || [];
  const memberById = (id) => members.find((m) => m.id === id);

  const catMap = (data.org?.planCategories && Object.keys(data.org.planCategories).length) ? data.org.planCategories : DEFAULT_CATS;
  const cats = useMemo(() => Object.keys(catMap).map((k) => ({ key: k, label: catMap[k].label || k, color: catMap[k].color || theme.brass })), [catMap]);
  const catByKey = (k) => cats.find((c) => c.key === k) || { color: theme.brass, label: k };
  const ringIndex = (key) => { const i = cats.findIndex((c) => c.key === key); return i < 0 ? 0 : i; };
  const band = (R_RING_OUT - R_HUB) / Math.max(cats.length, 1);
  const ringR = (idx) => { const r2 = R_RING_OUT - idx * band; return { r1: r2 - band, r2 }; };

  const allEvents = data.arshjulEvents || [];
  const events = useMemo(() => allEvents
    .filter((e) => !e.year || e.year === year)
    .map((e) => { const s = Math.min(Math.max(e.startMonth || 1, 1), 12); return { ...e, startMonth: s, endMonth: Math.max(Math.min(Math.max(e.endMonth || s, 1), 12), s) }; }), [allEvents, year]);

  const toggleCat = (k) => setHiddenCats((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const visibleEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => !hiddenCats.has(e.category) && (!q || (e.title || '').toLowerCase().includes(q)));
  }, [events, hiddenCats, query]);

  const saveEvents = (next) => save({ ...data, arshjulEvents: next });
  const upsert = (ev) => { const list = allEvents.some((x) => x.id === ev.id) ? allEvents.map((x) => (x.id === ev.id ? ev : x)) : [...allEvents, ev]; saveEvents(list); setEditing(null); };
  const remove = (id) => { saveEvents(allEvents.filter((x) => x.id !== id)); setEditing(null); };
  const newEvent = (startMonth = 1) => setEditing({ id: uid(), title: '', category: cats[0]?.key || 'styring', startMonth, endMonth: startMonth, year: null, owner: null, notes: '' });

  const now = new Date();
  const fNow = year === nowYear ? ((now.getMonth()) + (now.getDate() - 1) / 31) / 12 : -1;
  const hoverEv = hover ? events.find((e) => e.id === hover) : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.brass, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Syklisk årsrytme</div>
          <h1 style={{ ...heading, fontSize: 28, margin: 0 }}>Årshjul</h1>
          <p style={{ fontSize: 13.5, color: theme.inkSoft, margin: '4px 0 0' }}>De faste rytmene gjennom året — fordelt på måned og spor. Hendelser uten årstall gjentas hvert år.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 9, padding: '4px 6px' }}>
            <button onClick={() => setYear((y) => y - 1)} style={navBtn}><IcLeft size={15} /></button>
            <span style={{ ...heading, fontSize: 17, minWidth: 54, textAlign: 'center' }}>{year}</span>
            <button onClick={() => setYear((y) => y + 1)} style={navBtn}><IcRight size={15} /></button>
          </div>
          <Btn icon={IcPlus} variant="brass" onClick={() => newEvent(focusMonth || 1)}>Ny hendelse</Btn>
        </div>
      </div>

      {/* FILTER: ring-brytere + sok */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {cats.map((c) => { const off = hiddenCats.has(c.key); return (
          <button key={c.key} onClick={() => toggleCat(c.key)} title={off ? 'Vis spor' : 'Skjul spor'}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, border: `1px solid ${off ? theme.border : c.color}`, background: off ? 'transparent' : c.color + '1A', color: off ? theme.inkMuted : theme.ink, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: off ? 0.6 : 1 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: c.color, opacity: off ? 0.4 : 1 }} />{c.label}
          </button>
        ); })}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '6px 10px' }}>
          <IcSearch size={14} style={{ color: theme.inkMuted }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Søk i hjulet…" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontFamily: 'inherit', color: theme.ink, width: 150 }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* HJULET */}
        <div style={{ flex: '1 1 460px', minWidth: 320, maxWidth: 560 }}>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            {/* ringspor */}
            {cats.map((c, i) => { const { r1, r2 } = ringR(i); return (
              <path key={'ring' + c.key} d={ann(r1 + 1, r2 - 1, 0, 1)} fill={c.color} opacity={hiddenCats.has(c.key) ? 0.03 : 0.07} />
            ); })}

            {/* manedssektorer (zebra) + klikk for ny hendelse */}
            {MND_KORT.map((_, i) => (
              <path key={'mz' + i} d={ann(R_LABEL_IN, R_LABEL_OUT, i / 12, (i + 1) / 12)} fill={i % 2 ? theme.surfaceAlt : theme.brassLight} stroke={theme.surface} strokeWidth="1" style={{ cursor: 'pointer' }} onClick={() => newEvent(i + 1)} />
            ))}
            {MND_KORT.map((_, i) => { const [x1, y1] = polar(R_HUB, i / 12); const [x2, y2] = polar(R_LABEL_OUT, i / 12); return (
              <line key={'gl' + i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme.borderSoft} strokeWidth="1" />
            ); })}
            {MND_KORT.map((m, i) => { const [x, y] = polar((R_LABEL_IN + R_LABEL_OUT) / 2, (i + 0.5) / 12); return (
              <text key={'ml' + i} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="12.5" fontWeight={focusMonth === i + 1 ? 700 : 600} fill={focusMonth === i + 1 ? theme.brass : theme.inkSoft} fontFamily="Manrope, sans-serif" style={{ cursor: 'pointer' }} onClick={() => setFocusMonth(focusMonth === i + 1 ? null : i + 1)}>{m}</text>
            ); })}

            {/* ring-navn pa hjulet (buetekst langs ringens innerkant, ovrest) */}
            {cats.map((c, i) => {
              if (band < 16 || hiddenCats.has(c.key)) return null;
              const { r1 } = ringR(i);
              const rTxt = r1 + 7;
              const hw = 0.085;
              const id = `ringhdr-${i}`;
              return (
                <g key={'rh' + c.key} opacity={0.6}>
                  <path id={id} d={centerArc(rTxt, -hw, hw, false)} fill="none" />
                  <text fontSize="9.5" fontWeight="700" fill={c.color} letterSpacing="0.5" fontFamily="Manrope, sans-serif">
                    <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">{trunc(c.label.toUpperCase(), 16)}</textPath>
                  </text>
                </g>
              );
            })}

            {/* hendelsesbuer + buetekst */}
            {visibleEvents.map((e) => {
              const { r1, r2 } = ringR(ringIndex(e.category));
              const f0 = (e.startMonth - 1) / 12 + 0.004;
              const f1 = e.endMonth / 12 - 0.004;
              const col = catByKey(e.category).color;
              const on = hover === e.id;
              const rMid = (r1 + r2) / 2;
              const midf = (f0 + f1) / 2;
              const rev = midf > 0.25 && midf < 0.75;
              const arcLen = (f1 - f0) * TAU * rMid;
              const maxChars = Math.floor(arcLen / 6.4);
              const label = maxChars >= 3 ? trunc(e.title, maxChars) : '';
              const lid = `lbl-${e.id}`;
              return (
                <g key={e.id} style={{ cursor: 'pointer' }} onMouseEnter={() => setHover(e.id)} onMouseLeave={() => setHover(null)} onClick={() => setEditing(e)}>
                  <path d={ann(r1 + 3, r2 - 3, f0, f1)} fill={col} opacity={on ? 1 : 0.85} stroke={theme.surface} strokeWidth={on ? 2 : 1} />
                  {label && <>
                    <path id={lid} d={centerArc(rMid, f0, f1, rev)} fill="none" />
                    <text fontSize="10.5" fontWeight="600" fill="#fff" fontFamily="Manrope, sans-serif" style={{ pointerEvents: 'none' }}>
                      <textPath href={`#${lid}`} startOffset="50%" textAnchor="middle">{label}</textPath>
                    </text>
                  </>}
                </g>
              );
            })}

            {/* na-viser */}
            {fNow >= 0 && (() => { const [x2, y2] = polar(R_LABEL_OUT, fNow); const [x1, y1] = polar(R_HUB - 2, fNow); return (
              <g key="now"><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={theme.rust} strokeWidth="2" /><circle cx={x2} cy={y2} r="4" fill={theme.rust} /></g>
            ); })()}

            {/* nav */}
            <circle cx={C} cy={C} r={R_HUB} fill={theme.surface} stroke={theme.border} strokeWidth="1" />
            {hoverEv ? (
              <>
                <text x={C} y={C - 12} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={theme.brass} fontFamily="Manrope, sans-serif">{catByKey(hoverEv.category).label}</text>
                <foreignObject x={C - 56} y={C - 4} width="112" height="44">
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: theme.ink, textAlign: 'center', lineHeight: 1.2, fontFamily: 'Manrope, sans-serif', overflow: 'hidden' }}>{hoverEv.title}</div>
                </foreignObject>
              </>
            ) : (
              <>
                <text x={C} y={C - 8} textAnchor="middle" fontSize="24" fontWeight="500" fill={theme.ink} fontFamily="Fraunces, serif">{year}</text>
                <text x={C} y={C + 16} textAnchor="middle" fontSize="11" fontWeight="600" fill={theme.inkMuted} letterSpacing="1.5" fontFamily="Manrope, sans-serif">ÅRSHJUL</text>
              </>
            )}
          </svg>
        </div>

        {/* MANEDSLISTE */}
        <div style={{ flex: '1 1 300px', minWidth: 280 }}>
          <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {MND_LANG.map((mnd, i) => {
              const m = i + 1;
              const evs = visibleEvents.filter((e) => e.startMonth <= m && e.endMonth >= m);
              const isFocus = focusMonth === m;
              return (
                <div key={mnd} style={{ borderTop: i ? `1px solid ${theme.borderSoft}` : 'none', background: isFocus ? theme.brassLight : 'transparent' }}>
                  <div onClick={() => setFocusMonth(isFocus ? null : m)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', cursor: 'pointer' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: m === now.getMonth() + 1 && year === nowYear ? theme.rust : theme.inkSoft }}>{mnd}</span>
                    {evs.length === 0 && <span style={{ fontSize: 11, color: theme.inkMuted }}>—</span>}
                  </div>
                  {evs.map((e) => {
                    const col = catByKey(e.category).color;
                    const span = e.endMonth > e.startMonth;
                    const cont = e.startMonth < m;
                    return (
                      <div key={e.id} onClick={() => setEditing(e)} onMouseEnter={() => setHover(e.id)} onMouseLeave={() => setHover(null)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 14px 7px 18px', cursor: 'pointer', opacity: cont ? 0.55 : 1 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: col, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: theme.ink, flex: 1 }}>{e.title || '(uten tittel)'}{span ? <span style={{ color: theme.inkMuted, fontSize: 11 }}> · {MND_KORT[e.startMonth - 1]}–{MND_KORT[e.endMonth - 1]}</span> : ''}</span>
                        {e.owner && memberById(e.owner) && <span style={{ fontSize: 11, color: theme.inkMuted }}>{memberById(e.owner).initials || ''}</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {editing && <EventModal editing={editing} setEditing={setEditing} cats={cats} members={members} nowYear={nowYear} onSave={upsert} onDelete={remove} exists={allEvents.some((x) => x.id === editing.id)} />}
    </div>
  );
}

function EventModal({ editing, setEditing, cats, members, nowYear, onSave, onDelete, exists }) {
  const [e, setE] = useState(editing);
  const set = (k, v) => setE({ ...e, [k]: v });
  return (
    <div onClick={() => setEditing(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,36,51,0.4)', backdropFilter: 'blur(3px)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '8vh' }}>
      <div onClick={(ev) => ev.stopPropagation()} style={{ background: theme.surface, width: '100%', maxWidth: 480, borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', animation: 'modalIn 180ms ease' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center' }}>
          <h2 style={{ ...heading, fontSize: 18, margin: 0, flex: 1 }}>{exists ? 'Rediger hendelse' : 'Ny hendelse i årshjulet'}</h2>
          <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.inkSoft, display: 'flex' }}><IcX /></button>
        </div>
        <div style={{ padding: 20, display: 'grid', gap: 14 }}>
          <Field label="Tittel"><input value={e.title} onChange={(ev) => set('title', ev.target.value)} placeholder="Hva er rytmen?" style={inp} /></Field>
          <Field label="Spor (ring)">
            <select value={e.category} onChange={(ev) => set('category', ev.target.value)} style={inp}>
              {cats.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Fra måned">
              <select value={e.startMonth} onChange={(ev) => { const s = Number(ev.target.value); set('startMonth', s); if (e.endMonth < s) setE({ ...e, startMonth: s, endMonth: s }); }} style={inp}>
                {MND_LANG.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </Field>
            <Field label="Til måned">
              <select value={e.endMonth} onChange={(ev) => set('endMonth', Number(ev.target.value))} style={inp}>
                {MND_LANG.map((m, i) => <option key={m} value={i + 1} disabled={i + 1 < e.startMonth}>{m}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Gjelder">
              <select value={e.year || ''} onChange={(ev) => set('year', ev.target.value ? Number(ev.target.value) : null)} style={inp}>
                <option value="">Hvert år (fast rytme)</option>
                {[nowYear - 1, nowYear, nowYear + 1, nowYear + 2, nowYear + 3].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
            <Field label="Ansvarlig (valgfritt)">
              <select value={e.owner || ''} onChange={(ev) => set('owner', ev.target.value || null)} style={inp}>
                <option value="">—</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notat (valgfritt)"><input value={e.notes || ''} onChange={(ev) => set('notes', ev.target.value)} placeholder="Kort beskrivelse" style={inp} /></Field>
        </div>
        <div style={{ padding: '14px 20px', borderTop: `1px solid ${theme.borderSoft}`, display: 'flex', gap: 8, alignItems: 'center' }}>
          {exists && <Btn icon={IcTrash} style={{ color: theme.rust, borderColor: theme.rustLight }} onClick={() => onDelete(e.id)}>Slett</Btn>}
          <div style={{ flex: 1 }} />
          <Btn onClick={() => setEditing(null)}>Avbryt</Btn>
          <Btn variant="brass" onClick={() => e.title.trim() && onSave(e)}>Lagre</Btn>
        </div>
      </div>
    </div>
  );
}

const navBtn = { width: 30, height: 30, borderRadius: 7, border: 'none', background: 'transparent', color: theme.ink, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const inp = { width: '100%', padding: '9px 11px', borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 14, fontFamily: 'inherit', background: theme.surface, color: theme.ink, boxSizing: 'border-box' };
const Field = ({ label, children }) => (
  <label style={{ display: 'block' }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: theme.inkSoft, marginBottom: 5 }}>{label}</div>
    {children}
  </label>
);
