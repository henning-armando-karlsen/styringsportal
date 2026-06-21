import React, { useState, useEffect, useMemo } from 'react';

/* ── Palett (IKT — rolig stål/skifer, distinkt fra Vikingbad-sand) ── */
const C = {
  ink: '#1B2430', inkSoft: '#4A5563', inkFaint: '#8A95A3', inkMuted: '#A6B0BC',
  surface: '#FFFFFF', surfaceAlt: '#F4F6F8', line: '#E3E8ED', lineStrong: '#CBD3DC',
  steel: '#2C6E8F', steelDeep: '#1E4E66', steelWash: '#E5EFF3',
  green: '#3F7D58', greenWash: '#E4EFE8',
  amber: '#9A7B1F', amberWash: '#F4EDD7',
  rust: '#C2502B', rustWash: '#F6E6DF',
  violet: '#6B5B95', violetWash: '#ECE8F2',
};
const serif = 'Fraunces, Georgia, serif';
const sans = 'Manrope, system-ui, -apple-system, sans-serif';

const uid = (p = 'ikt') => p + '_' + Math.random().toString(36).slice(2, 9);
const fmtNum = (n) => (n || 0).toLocaleString('no-NO');

const BEHOV_STATUS = ['innmeldt', 'vurdering', 'godkjent', 'avvist', 'parkert'];
const BEHOV_TYPE = ['Ny funksjon', 'Feilretting', 'Integrasjon', 'Infrastruktur', 'Sikkerhet', 'Forbedring'];
const VALUE = ['lav', 'middels', 'høy', 'kritisk'];
const LEV_STATUS = ['backlog', 'planlagt', 'pågår', 'test', 'levert', 'parkert'];
const OPP_STATUS = ['åpen', 'pågår', 'fullført'];
const PERIODER = ['Nå', 'Neste', 'Senere'];

const STATUS_TONE = {
  innmeldt: C.steel, vurdering: C.amber, godkjent: C.green, avvist: C.rust, parkert: C.inkFaint,
  backlog: C.inkFaint, planlagt: C.steel, 'pågår': C.amber, test: C.violet, levert: C.green,
  'åpen': C.inkFaint, fullført: C.green,
};
const STATUS_WASH = {
  innmeldt: C.steelWash, vurdering: C.amberWash, godkjent: C.greenWash, avvist: C.rustWash, parkert: C.surfaceAlt,
  backlog: C.surfaceAlt, planlagt: C.steelWash, 'pågår': C.amberWash, test: C.violetWash, levert: C.greenWash,
  'åpen': C.surfaceAlt, fullført: C.greenWash,
};

/* ── Primitiver ── */
const inputStyle = { width: '100%', padding: '8px 11px', borderRadius: 8, border: `1px solid ${C.lineStrong}`, fontSize: 13.5, fontFamily: sans, color: C.ink, background: C.surface, boxSizing: 'border-box' };
const Btn = ({ children, onClick, variant = 'ghost', small, disabled, style = {} }) => {
  const v = variant === 'primary' ? { bg: C.steel, fg: '#fff', bd: C.steel } : variant === 'danger' ? { bg: C.surface, fg: C.rust, bd: C.lineStrong } : { bg: C.surface, fg: C.ink, bd: C.lineStrong };
  return <button onClick={onClick} disabled={disabled} style={{ fontFamily: sans, fontWeight: 600, fontSize: small ? 12.5 : 13.5, padding: small ? '5px 10px' : '8px 13px', borderRadius: 8, border: `1px solid ${v.bd}`, background: v.bg, color: v.fg, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>{children}</button>;
};
const Card = ({ children, style = {}, onClick }) => <div onClick={onClick} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16, ...style }}>{children}</div>;
const Badge = ({ children, tone = C.inkSoft, wash = C.surfaceAlt }) => <span style={{ fontSize: 11, fontWeight: 700, color: tone, background: wash, borderRadius: 999, padding: '2px 9px', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{children}</span>;
const Field = ({ label, hint, children }) => <label style={{ display: 'block', marginBottom: 12 }}><div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 5 }}>{label}{hint && <span style={{ color: C.inkFaint, fontWeight: 400 }}> · {hint}</span>}</div>{children}</label>;
const Empty = ({ children }) => <div style={{ padding: 28, textAlign: 'center', color: C.inkFaint, fontSize: 13.5, border: `1px dashed ${C.lineStrong}`, borderRadius: 12 }}>{children}</div>;
const Toolbar = ({ title, subtitle, onAdd, addLabel }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
    <div><h2 style={{ margin: 0, fontFamily: serif, fontSize: 22, fontWeight: 600, color: C.ink }}>{title}</h2>{subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: C.inkSoft, maxWidth: 640, lineHeight: 1.5 }}>{subtitle}</p>}</div>
    {onAdd && <Btn variant="primary" onClick={onAdd}>{addLabel || 'Ny'}</Btn>}
  </div>
);
const Modal = ({ title, onClose, children, footer }) => (
  <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(20,30,40,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
    <div onClick={(e) => e.stopPropagation()} style={{ background: C.surface, borderRadius: 14, width: 'min(560px, 100%)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontFamily: serif, fontSize: 18, fontWeight: 600, color: C.ink }}>{title}</h3>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 22, color: C.inkFaint, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
      {footer && <div style={{ padding: '14px 20px', borderTop: `1px solid ${C.line}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>}
    </div>
  </div>
);
const memberSelect = (members, value, onChange, allowEmpty = true) => (
  <select style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)}>
    {allowEmpty && <option value="">— velg ansvarlig —</option>}
    {value && !members.some((m) => m.name === value) && <option value={value}>{value} (ikke i listen)</option>}
    {members.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
  </select>
);

const today = () => new Date().toISOString().slice(0, 10);
const daysFrom = (iso) => { if (!iso) return null; const t = new Date(); t.setHours(0, 0, 0, 0); const x = new Date(iso); if (isNaN(x.getTime())) return null; x.setHours(0, 0, 0, 0); return Math.round((x - t) / 86400000); };
const quadrant = (v, e) => v >= 3 ? (e <= 2 ? 'Quick win' : 'Stor satsning') : (e <= 2 ? 'Fyll-inn' : 'Unngå / vurder');

export default function IktPlanView({ data = {}, onChange = () => {}, members = [], embedded = true }) {
  const d = data || {};
  const [behov, setBehov] = useState(d.behov || []);
  const [leveranser, setLeveranser] = useState(d.leveranser || []);
  const [oppgaver, setOppgaver] = useState(d.oppgaver || []);
  const [view, setView] = useState('oversikt');
  const [modal, setModal] = useState(null);
  const mounted = React.useRef(false);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    onChange({ behov, leveranser, oppgaver });
  }, [behov, leveranser, oppgaver]);

  const memberName = (id) => members.find((m) => m.id === id)?.name || id;
  const oppgaverFor = (lid) => oppgaver.filter((o) => o.leveranseId === lid);

  /* CRUD */
  const saveBehov = (b) => setBehov((xs) => b.id ? xs.map((x) => x.id === b.id ? b : x) : [...xs, { ...b, id: uid('beh'), createdAt: today() }]);
  const delBehov = (id) => setBehov((xs) => xs.filter((x) => x.id !== id));
  const promoteBehov = (b) => {
    setBehov((xs) => xs.map((x) => x.id === b.id ? { ...x, status: 'godkjent' } : x));
    setLeveranser((xs) => [...xs, { id: uid('lev'), title: b.title, desc: b.desc || '', type: b.type, owner: '', status: 'backlog', valueScore: b.value === 'kritisk' ? 5 : b.value === 'høy' ? 4 : b.value === 'middels' ? 3 : 2, effortScore: 3, period: 'Senere', start: '', end: '', estimate: 0, spent: 0, dependencies: [], behovId: b.id, createdAt: today(), updatedAt: today() }]);
    setView('backlog');
  };
  const saveLev = (l) => setLeveranser((xs) => l.id ? xs.map((x) => x.id === l.id ? { ...l, updatedAt: today() } : x) : [...xs, { ...l, id: uid('lev'), createdAt: today(), updatedAt: today() }]);
  const delLev = (id) => { setLeveranser((xs) => xs.filter((x) => x.id !== id)); setOppgaver((xs) => xs.filter((o) => o.leveranseId !== id)); };
  const cycleLev = (l) => { const i = LEV_STATUS.indexOf(l.status); saveLev({ ...l, status: LEV_STATUS[(i + 1) % LEV_STATUS.length] }); };
  const saveOpp = (o) => setOppgaver((xs) => o.id ? xs.map((x) => x.id === o.id ? o : x) : [...xs, { ...o, id: uid('opp') }]);
  const delOpp = (id) => setOppgaver((xs) => xs.filter((x) => x.id !== id));
  const cycleOpp = (o) => { const i = OPP_STATUS.indexOf(o.status); saveOpp({ ...o, status: OPP_STATUS[(i + 1) % OPP_STATUS.length] }); };

  const looseEnds = useMemo(() => {
    const utriert = behov.filter((b) => b.status === 'innmeldt' || b.status === 'vurdering');
    const utenAnsvarlig = leveranser.filter((l) => l.status !== 'levert' && l.status !== 'parkert' && !l.owner);
    const ukoblet = [...leveranser, ...oppgaver].filter((x) => x.owner && !members.some((m) => m.name === x.owner || m.id === x.owner));
    const forfalt = oppgaver.filter((o) => o.status !== 'fullført' && (daysFrom(o.dueDate) ?? 1) < 0);
    const levertIds = new Set(leveranser.filter((l) => l.status === 'levert').map((l) => l.id));
    const blokkert = leveranser.filter((l) => l.status !== 'levert' && (l.dependencies || []).some((dep) => !levertIds.has(dep)));
    return { utriert, utenAnsvarlig, ukoblet, forfalt, blokkert, total: utriert.length + utenAnsvarlig.length + ukoblet.length + forfalt.length + blokkert.length };
  }, [behov, leveranser, oppgaver, members]);

  const tabs = [['oversikt', 'Oversikt'], ['behov', 'Behov'], ['backlog', 'Backlog & prioritering'], ['gjennomforing', 'Gjennomføring'], ['veikart', 'Veikart'], ['tid', 'Tidsoversikt'], ['kontroll', looseEnds.total ? `Flyt & kontroll (${looseEnds.total})` : 'Flyt & kontroll']];

  return (
    <div style={{ fontFamily: sans, color: C.ink }}>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: C.steel }}>IKT · Utvikling og drift</div>
        <h1 style={{ margin: '2px 0 0', fontFamily: serif, fontSize: 26, fontWeight: 600 }}>Planleggingsportal</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: C.inkSoft }}>Behov → prioritering → planlegging → gjennomføring → tidsoversikt</p>
      </div>

      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', borderBottom: `1px solid ${C.line}`, margin: '16px 0 22px' }}>
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} style={{ fontFamily: sans, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none', padding: '10px 14px', color: view === k ? C.ink : C.inkFaint, borderBottom: view === k ? `2px solid ${C.steel}` : '2px solid transparent', marginBottom: -1 }}>{l}</button>
        ))}
      </div>

      {looseEnds.total > 0 && view !== 'kontroll' && (
        <button onClick={() => setView('kontroll')} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: sans, display: 'flex', alignItems: 'center', gap: 12, background: C.rustWash, border: `1px solid ${C.rust}`, borderRadius: 12, padding: '11px 16px', marginBottom: 18 }}>
          <span style={{ fontSize: 17 }}>⚠</span>
          <span style={{ flex: 1, fontSize: 13.5, color: C.ink }}><strong>{looseEnds.total} løse tråder</strong> i IKT-planen — behov uten triering, leveranser uten ansvarlig, forfalt eller blokkert.</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: C.rust }}>Flyt & kontroll →</span>
        </button>
      )}

      {view === 'oversikt' && <Oversikt behov={behov} leveranser={leveranser} oppgaver={oppgaver} setView={setView} />}
      {view === 'behov' && <BehovView behov={behov} onAdd={() => setModal({ kind: 'behov', data: {} })} onEdit={(b) => setModal({ kind: 'behov', data: b })} onPromote={promoteBehov} onSetStatus={(b, s) => saveBehov({ ...b, status: s })} onDelete={delBehov} />}
      {view === 'backlog' && <BacklogView leveranser={leveranser} oppgaverFor={oppgaverFor} onAdd={() => setModal({ kind: 'lev', data: {} })} onEdit={(l) => setModal({ kind: 'lev', data: l })} />}
      {view === 'gjennomforing' && <BoardView leveranser={leveranser} oppgaverFor={oppgaverFor} onAddLev={() => setModal({ kind: 'lev', data: {} })} onEditLev={(l) => setModal({ kind: 'lev', data: l })} onCycleLev={cycleLev} onAddOpp={(lid) => setModal({ kind: 'opp', data: { leveranseId: lid } })} onEditOpp={(o) => setModal({ kind: 'opp', data: o })} onCycleOpp={cycleOpp} />}
      {view === 'veikart' && <VeikartView leveranser={leveranser} onEdit={(l) => setModal({ kind: 'lev', data: l })} />}
      {view === 'tid' && <TidView leveranser={leveranser} oppgaver={oppgaver} members={members} />}
      {view === 'kontroll' && <KontrollView le={looseEnds} onEditBehov={(b) => setModal({ kind: 'behov', data: b })} onEditLev={(l) => setModal({ kind: 'lev', data: l })} onEditOpp={(o) => setModal({ kind: 'opp', data: o })} />}

      {modal?.kind === 'behov' && <BehovModal data={modal.data} onClose={() => setModal(null)} onSave={(b) => { saveBehov(b); setModal(null); }} />}
      {modal?.kind === 'lev' && <LevModal data={modal.data} members={members} leveranser={leveranser} onClose={() => setModal(null)} onSave={(l) => { saveLev(l); setModal(null); }} />}
      {modal?.kind === 'opp' && <OppModal data={modal.data} members={members} leveranser={leveranser} onClose={() => setModal(null)} onSave={(o) => { saveOpp(o); setModal(null); }} onDelete={modal.data.id ? () => { delOpp(modal.data.id); setModal(null); } : null} />}
    </div>
  );
}

/* ── Oversikt ── */
function Oversikt({ behov, leveranser, oppgaver, setView }) {
  const kø = behov.filter((b) => b.status === 'innmeldt' || b.status === 'vurdering').length;
  const backlog = leveranser.filter((l) => l.status === 'backlog').length;
  const pågår = leveranser.filter((l) => l.status === 'pågår' || l.status === 'test').length;
  const levert = leveranser.filter((l) => l.status === 'levert').length;
  const stats = [[kø, 'behov i kø', 'behov'], [backlog, 'i backlog', 'backlog'], [pågår, 'under arbeid', 'gjennomforing'], [levert, 'levert', 'gjennomforing']];
  const aktive = leveranser.filter((l) => l.status === 'pågår' || l.status === 'planlagt').sort((a, b) => (b.valueScore - b.effortScore) - (a.valueScore - a.effortScore)).slice(0, 6);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 22 }}>
        {stats.map(([n, l, v], i) => (
          <Card key={i} onClick={() => setView(v)} style={{ cursor: 'pointer' }}>
            <div style={{ fontFamily: serif, fontSize: 30, fontWeight: 600, color: C.ink, lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4 }}>{l}</div>
          </Card>
        ))}
      </div>
      <h3 style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, margin: '0 0 10px' }}>Prioriterte leveranser under arbeid</h3>
      {aktive.length === 0 ? <Empty>Ingen aktive leveranser ennå. Meld inn behov og prioriter dem i backlog.</Empty> : (
        <div style={{ display: 'grid', gap: 8 }}>
          {aktive.map((l) => (
            <Card key={l.id} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Badge tone={STATUS_TONE[l.status]} wash={STATUS_WASH[l.status]}>{l.status}</Badge>
              <span style={{ flex: 1, fontWeight: 600 }}>{l.title}</span>
              <span style={{ fontSize: 12, color: C.inkFaint }}>{l.owner || 'uten ansvarlig'}</span>
              <Badge tone={C.steelDeep} wash={C.steelWash}>{quadrant(l.valueScore, l.effortScore)}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Behov ── */
function BehovView({ behov, onAdd, onEdit, onPromote, onSetStatus, onDelete }) {
  const lanes = [['innmeldt', 'Innmeldt'], ['vurdering', 'Under vurdering'], ['godkjent', 'Godkjent'], ['avvist', 'Avvist'], ['parkert', 'Parkert']];
  return (
    <div>
      <Toolbar title="Behovsinnmelding" subtitle="Inngangsporten — alle avdelinger melder inn behov. IKT trierer og godkjente behov løftes til backlog." onAdd={onAdd} addLabel="Meld inn behov" />
      {behov.length === 0 && <Empty>Ingen behov innmeldt ennå.</Empty>}
      {lanes.map(([k, label]) => {
        const items = behov.filter((b) => b.status === k);
        if (!items.length) return null;
        return (
          <div key={k} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, paddingBottom: 5, borderBottom: `1px solid ${C.line}` }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: STATUS_TONE[k] }} />
              <span style={{ fontFamily: serif, fontSize: 15, fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 12, color: C.inkFaint }}>{items.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
              {items.map((b) => (
                <Card key={b.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    <Badge tone={C.steelDeep} wash={C.steelWash}>{b.type}</Badge>
                    <Badge tone={C.inkSoft} wash={C.surfaceAlt}>verdi: {b.value}</Badge>
                  </div>
                  <div onClick={() => onEdit(b)} style={{ cursor: 'pointer' }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600 }}>{b.title}</h4>
                    {b.desc && <p style={{ margin: '0 0 8px', fontSize: 12.5, color: C.inkSoft, lineHeight: 1.45 }}>{b.desc}</p>}
                  </div>
                  <div style={{ fontSize: 12, color: C.inkFaint, marginBottom: 10 }}>Innmeldt av {b.requester || '—'}{b.dept ? ` · ${b.dept}` : ''}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                    {(k === 'innmeldt' || k === 'vurdering') && <Btn small variant="primary" onClick={() => onPromote(b)}>Godkjenn → backlog</Btn>}
                    {k === 'innmeldt' && <Btn small onClick={() => onSetStatus(b, 'vurdering')}>Til vurdering</Btn>}
                    {(k === 'innmeldt' || k === 'vurdering') && <Btn small onClick={() => onSetStatus(b, 'avvist')}>Avvis</Btn>}
                    {(k === 'innmeldt' || k === 'vurdering') && <Btn small onClick={() => onSetStatus(b, 'parkert')}>Parker</Btn>}
                    <button onClick={() => onDelete(b.id)} style={{ marginLeft: 'auto', border: 'none', background: 'none', color: C.inkFaint, cursor: 'pointer', fontSize: 12.5 }}>Slett</button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Backlog & prioritering ── */
function BacklogView({ leveranser, oppgaverFor, onAdd, onEdit }) {
  const backlog = leveranser.filter((l) => l.status !== 'levert' && l.status !== 'parkert');
  const sorted = [...backlog].sort((a, b) => (b.valueScore - b.effortScore) - (a.valueScore - a.effortScore));
  const cell = (v, e) => backlog.filter((l) => (v === 'hi' ? l.valueScore >= 3 : l.valueScore < 3) && (e === 'lo' ? l.effortScore <= 2 : l.effortScore > 2));
  const Quad = ({ title, items, tone }) => (
    <Card style={{ padding: 12, minHeight: 90 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: tone, marginBottom: 6 }}>{title} <span style={{ color: C.inkFaint, fontWeight: 400 }}>· {items.length}</span></div>
      <div style={{ display: 'grid', gap: 4 }}>{items.map((l) => <div key={l.id} onClick={() => onEdit(l)} style={{ fontSize: 12, color: C.ink, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>• {l.title}</div>)}</div>
    </Card>
  );
  return (
    <div>
      <Toolbar title="Backlog & prioritering" subtitle="Godkjente behov prioriteres etter verdi mot innsats. Quick wins øverst." onAdd={onAdd} addLabel="Ny leveranse" />
      {backlog.length === 0 ? <Empty>Backlog er tom. Godkjenn behov, eller legg til en leveranse direkte.</Empty> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            <Quad title="Quick win (høy verdi · lav innsats)" items={cell('hi', 'lo')} tone={C.green} />
            <Quad title="Stor satsning (høy verdi · høy innsats)" items={cell('hi', 'hi')} tone={C.steelDeep} />
            <Quad title="Fyll-inn (lav verdi · lav innsats)" items={cell('lo', 'lo')} tone={C.amber} />
            <Quad title="Vurder (lav verdi · høy innsats)" items={cell('lo', 'hi')} tone={C.rust} />
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {sorted.map((l) => (
              <Card key={l.id} onClick={() => onEdit(l)} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <Badge tone={STATUS_TONE[l.status]} wash={STATUS_WASH[l.status]}>{l.status}</Badge>
                <span style={{ flex: 1, fontWeight: 600 }}>{l.title}</span>
                <span style={{ fontSize: 11.5, color: C.inkFaint }}>{oppgaverFor(l.id).length} oppg.</span>
                <span style={{ fontSize: 12, color: C.inkFaint }}>V{l.valueScore}/I{l.effortScore}</span>
                <span style={{ fontSize: 12, color: l.owner ? C.inkSoft : C.rust, fontWeight: l.owner ? 400 : 700 }}>{l.owner || '⚠ uten ansvarlig'}</span>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Gjennomføring (tavle) ── */
function BoardView({ leveranser, oppgaverFor, onAddLev, onEditLev, onCycleLev, onAddOpp, onEditOpp, onCycleOpp }) {
  const cols = ['backlog', 'planlagt', 'pågår', 'test', 'levert'];
  return (
    <div>
      <Toolbar title="Gjennomføring" subtitle="Status fra backlog til levert. Klikk statusmerket for å flytte. Oppgaver med ansvarlig surfacer i Mine oppgaver og Innboks." onAdd={onAddLev} addLabel="Ny leveranse" />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, minmax(200px, 1fr))`, gap: 10, overflowX: 'auto' }}>
        {cols.map((col) => {
          const items = leveranser.filter((l) => l.status === col);
          return (
            <div key={col} style={{ background: C.surfaceAlt, borderRadius: 12, padding: 10, minHeight: 120 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: 3, background: STATUS_TONE[col] }} />
                <span style={{ fontSize: 12.5, fontWeight: 700, textTransform: 'capitalize' }}>{col}</span>
                <span style={{ fontSize: 11.5, color: C.inkFaint, marginLeft: 'auto' }}>{items.length}</span>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {items.map((l) => {
                  const opp = oppgaverFor(l.id);
                  const done = opp.filter((o) => o.status === 'fullført').length;
                  return (
                    <Card key={l.id} style={{ padding: 11 }}>
                      <div onClick={() => onEditLev(l)} style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 6, cursor: 'pointer' }}>{l.title}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span onClick={() => onCycleLev(l)} title="Flytt status" style={{ cursor: 'pointer' }}><Badge tone={STATUS_TONE[l.status]} wash={STATUS_WASH[l.status]}>{l.status} →</Badge></span>
                        {l.owner ? <Badge tone={C.inkSoft} wash={C.surfaceAlt}>{l.owner}</Badge> : <Badge tone={C.rust} wash={C.rustWash}>uten ansvarlig</Badge>}
                      </div>
                      {opp.length > 0 && (
                        <div style={{ display: 'grid', gap: 3, marginBottom: 6 }}>
                          {opp.map((o) => (
                            <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5 }}>
                              <span onClick={() => onCycleOpp(o)} style={{ cursor: 'pointer', width: 12, height: 12, borderRadius: 3, border: `1.5px solid ${STATUS_TONE[o.status]}`, background: o.status === 'fullført' ? STATUS_TONE[o.status] : 'transparent', flexShrink: 0 }} />
                              <span onClick={() => onEditOpp(o)} style={{ cursor: 'pointer', flex: 1, color: o.status === 'fullført' ? C.inkFaint : C.ink, textDecoration: o.status === 'fullført' ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={() => onAddOpp(l.id)} style={{ border: 'none', background: 'none', color: C.steel, fontWeight: 600, fontSize: 11.5, cursor: 'pointer', padding: 0 }}>+ oppgave{opp.length > 0 ? ` (${done}/${opp.length})` : ''}</button>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Veikart ── */
function VeikartView({ leveranser, onEdit }) {
  const active = leveranser.filter((l) => l.status !== 'levert' && l.status !== 'parkert');
  return (
    <div>
      <Toolbar title="Veikart" subtitle="Når kommer hva. Sett periode på hver leveranse i redigeringen." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {PERIODER.map((p) => {
          const items = active.filter((l) => (l.period || 'Senere') === p);
          return (
            <div key={p}>
              <div style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${C.steel}` }}>{p} <span style={{ color: C.inkFaint, fontWeight: 400, fontSize: 13 }}>· {items.length}</span></div>
              <div style={{ display: 'grid', gap: 8 }}>
                {items.length === 0 ? <div style={{ fontSize: 12.5, color: C.inkFaint, fontStyle: 'italic' }}>Ingenting plassert.</div> : items.map((l) => (
                  <Card key={l.id} onClick={() => onEdit(l)} style={{ padding: 12, cursor: 'pointer' }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 6 }}>{l.title}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Badge tone={STATUS_TONE[l.status]} wash={STATUS_WASH[l.status]}>{l.status}</Badge>
                      {l.owner && <Badge tone={C.inkSoft} wash={C.surfaceAlt}>{l.owner}</Badge>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Tidsoversikt / kapasitet ── */
function TidView({ leveranser, oppgaver, members }) {
  const active = leveranser.filter((l) => l.status === 'pågår' || l.status === 'planlagt');
  const rows = members.map((m) => {
    const levs = active.filter((l) => l.owner === m.name || l.owner === m.id);
    const opps = oppgaver.filter((o) => o.status !== 'fullført' && (o.owner === m.name || o.owner === m.id));
    const est = levs.reduce((s, l) => s + (Number(l.estimate) || 0), 0);
    const spent = levs.reduce((s, l) => s + (Number(l.spent) || 0), 0);
    return { m, levs: levs.length, opps: opps.length, est, spent };
  });
  const maxEst = Math.max(1, ...rows.map((r) => r.est));
  return (
    <div>
      <Toolbar title="Tidsoversikt & kapasitet" subtitle="Hvem jobber med hva, estimat mot brukt tid (timer). Estimat settes på leveransen." />
      {members.length === 0 ? <Empty>Ingen IKT-medlemmer ennå.</Empty> : (
        <div style={{ display: 'grid', gap: 8 }}>
          {rows.map((r) => (
            <Card key={r.m.id} style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, flex: 1 }}>{r.m.name}</span>
                <span style={{ fontSize: 12, color: C.inkFaint }}>{r.levs} leveranser · {r.opps} oppgaver</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink }}>{fmtNum(r.spent)} / {fmtNum(r.est)} t</span>
              </div>
              <div style={{ height: 8, background: C.surfaceAlt, borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${(r.est / maxEst) * 100}%`, background: C.steelWash }} />
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${(Math.min(r.spent, r.est) / maxEst) * 100}%`, background: r.spent > r.est ? C.rust : C.steel }} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Flyt & kontroll ── */
function KontrollView({ le, onEditBehov, onEditLev, onEditOpp }) {
  const Section = ({ title, hint, tone, items, render }) => items.length === 0 ? null : (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ width: 9, height: 9, borderRadius: 3, background: tone }} />
        <h3 style={{ margin: 0, fontFamily: serif, fontSize: 16, fontWeight: 600 }}>{title} <span style={{ color: C.inkFaint, fontWeight: 400 }}>· {items.length}</span></h3>
      </div>
      {hint && <p style={{ margin: '0 0 10px 17px', fontSize: 12.5, color: C.inkSoft }}>{hint}</p>}
      <div style={{ paddingLeft: 17, display: 'grid', gap: 6 }}>{items.map(render)}</div>
    </div>
  );
  const Row = ({ title, issue, tone, onClick }) => (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: C.surface, border: `1px solid ${C.line}`, borderLeft: `3px solid ${tone}`, borderRadius: 9, cursor: 'pointer' }}>
      <span style={{ flex: 1, fontSize: 13.5, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
      {issue && <span style={{ fontSize: 12, color: tone, fontWeight: 600, whiteSpace: 'nowrap' }}>{issue}</span>}
      <span style={{ fontSize: 12, color: C.steel, fontWeight: 700 }}>Fiks →</span>
    </div>
  );
  const clean = le.total === 0;
  const stats = [[le.utriert.length, 'uten triering'], [le.utenAnsvarlig.length, 'uten ansvarlig'], [le.forfalt.length, 'forfalt'], [le.blokkert.length, 'blokkert'], [le.ukoblet.length, 'ukoblet ansvarlig']];
  return (
    <div>
      <Toolbar title="Flyt & kontroll" subtitle="Fanger opp alt som kan henge i IKT-planen — uten triering, uten ansvarlig, forfalt, blokkert av avhengigheter, eller ansvarlig som ikke matcher et medlem." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 22 }}>
        {stats.map(([n, l], i) => (
          <Card key={i} style={{ padding: '12px 14px', borderTop: `3px solid ${n > 0 ? C.rust : C.green}` }}>
            <div style={{ fontFamily: serif, fontSize: 26, fontWeight: 600, color: n > 0 ? C.rust : C.green, lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 3 }}>{l}</div>
          </Card>
        ))}
      </div>
      {clean && <Card style={{ textAlign: 'center', background: C.greenWash, border: `1px solid ${C.green}` }}><div style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, marginBottom: 4 }}>✓ Alt henger sammen</div><div style={{ fontSize: 13, color: C.inkSoft }}>Alle behov er triert, alle leveranser har ansvarlig, ingenting forfalt eller blokkert.</div></Card>}
      <Section title="Behov uten triering" tone={C.steel} items={le.utriert} hint="Innmeldt eller under vurdering — ikke besluttet ennå." render={(b) => <Row key={b.id} title={b.title} issue={b.status} tone={C.steel} onClick={() => onEditBehov(b)} />} />
      <Section title="Leveranser uten ansvarlig" tone={C.rust} items={le.utenAnsvarlig} hint="Ingen eier — vises ikke for noen og henger." render={(l) => <Row key={l.id} title={l.title} issue="uten ansvarlig" tone={C.rust} onClick={() => onEditLev(l)} />} />
      <Section title="Forfalte oppgaver" tone={C.rust} items={le.forfalt} hint="Frist passert og ikke fullført." render={(o) => <Row key={o.id} title={o.title} issue={`frist ${o.dueDate || ''}`} tone={C.rust} onClick={() => onEditOpp(o)} />} />
      <Section title="Blokkerte leveranser" tone={C.amber} items={le.blokkert} hint="Venter på en avhengighet som ikke er levert." render={(l) => <Row key={l.id} title={l.title} issue="blokkert" tone={C.amber} onClick={() => onEditLev(l)} />} />
      <Section title="Ansvarlig matcher ikke et medlem" tone={C.rust} items={le.ukoblet} hint="Navnet finnes ikke i IKT-medlemmene, så posten når ingen sitt skrivebord." render={(x) => <Row key={x.id} title={x.title} issue={`«${x.owner}»`} tone={C.rust} onClick={() => x.leveranseId ? onEditOpp(x) : onEditLev(x)} />} />
    </div>
  );
}

/* ── Modaler ── */
function BehovModal({ data, onClose, onSave }) {
  const [f, setF] = useState({ id: data.id, title: data.title || '', desc: data.desc || '', requester: data.requester || '', dept: data.dept || '', type: data.type || BEHOV_TYPE[0], value: data.value || 'middels', status: data.status || 'innmeldt' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal title={data.id ? 'Rediger behov' : 'Meld inn behov'} onClose={onClose} footer={<><Btn onClick={onClose}>Avbryt</Btn><Btn variant="primary" onClick={() => f.title.trim() && onSave(f)}>Lagre</Btn></>}>
      <Field label="Tittel"><input style={inputStyle} value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Hva trengs?" /></Field>
      <Field label="Beskrivelse"><textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={f.desc} onChange={(e) => set('desc', e.target.value)} /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Innmelder"><input style={inputStyle} value={f.requester} onChange={(e) => set('requester', e.target.value)} /></Field>
        <Field label="Avdeling"><input style={inputStyle} value={f.dept} onChange={(e) => set('dept', e.target.value)} /></Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Type"><select style={inputStyle} value={f.type} onChange={(e) => set('type', e.target.value)}>{BEHOV_TYPE.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Forretningsverdi"><select style={inputStyle} value={f.value} onChange={(e) => set('value', e.target.value)}>{VALUE.map((v) => <option key={v}>{v}</option>)}</select></Field>
      </div>
    </Modal>
  );
}

function LevModal({ data, members, leveranser, onClose, onSave }) {
  const [f, setF] = useState({ id: data.id, title: data.title || '', desc: data.desc || '', type: data.type || BEHOV_TYPE[0], status: data.status || 'backlog', owner: data.owner || '', valueScore: data.valueScore || 3, effortScore: data.effortScore || 3, period: data.period || 'Senere', start: data.start || '', end: data.end || '', estimate: data.estimate ?? 0, spent: data.spent ?? 0, dependencies: data.dependencies || [], behovId: data.behovId });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const toggleDep = (id) => setF((p) => ({ ...p, dependencies: p.dependencies.includes(id) ? p.dependencies.filter((x) => x !== id) : [...p.dependencies, id] }));
  const others = leveranser.filter((l) => l.id !== f.id);
  return (
    <Modal title={data.id ? 'Rediger leveranse' : 'Ny leveranse'} onClose={onClose} footer={<><Btn onClick={onClose}>Avbryt</Btn><Btn variant="primary" onClick={() => f.title.trim() && onSave(f)}>Lagre</Btn></>}>
      <Field label="Tittel"><input style={inputStyle} value={f.title} onChange={(e) => set('title', e.target.value)} /></Field>
      <Field label="Beskrivelse"><textarea style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }} value={f.desc} onChange={(e) => set('desc', e.target.value)} /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Status"><select style={inputStyle} value={f.status} onChange={(e) => set('status', e.target.value)}>{LEV_STATUS.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Type"><select style={inputStyle} value={f.type} onChange={(e) => set('type', e.target.value)}>{BEHOV_TYPE.map((t) => <option key={t}>{t}</option>)}</select></Field>
      </div>
      <Field label="Ansvarlig" hint="vises på vedkommendes skrivebord">{memberSelect(members, f.owner, (v) => set('owner', v))}</Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Verdi (1–5)"><input type="number" min="1" max="5" style={inputStyle} value={f.valueScore} onChange={(e) => set('valueScore', Number(e.target.value))} /></Field>
        <Field label="Innsats (1–5)"><input type="number" min="1" max="5" style={inputStyle} value={f.effortScore} onChange={(e) => set('effortScore', Number(e.target.value))} /></Field>
        <Field label="Periode"><select style={inputStyle} value={f.period} onChange={(e) => set('period', e.target.value)}>{PERIODER.map((p) => <option key={p}>{p}</option>)}</select></Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Estimat (timer)"><input type="number" style={inputStyle} value={f.estimate} onChange={(e) => set('estimate', Number(e.target.value))} /></Field>
        <Field label="Brukt (timer)"><input type="number" style={inputStyle} value={f.spent} onChange={(e) => set('spent', Number(e.target.value))} /></Field>
      </div>
      {others.length > 0 && (
        <Field label="Avhengig av" hint="blokkeres til disse er levert">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {others.map((l) => <button key={l.id} type="button" onClick={() => toggleDep(l.id)} style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '4px 9px', borderRadius: 999, border: `1px solid ${f.dependencies.includes(l.id) ? C.steel : C.line}`, background: f.dependencies.includes(l.id) ? C.steelWash : C.surface, color: f.dependencies.includes(l.id) ? C.steelDeep : C.inkSoft }}>{l.title}</button>)}
          </div>
        </Field>
      )}
    </Modal>
  );
}

function OppModal({ data, members, leveranser, onClose, onSave, onDelete }) {
  const [f, setF] = useState({ id: data.id, title: data.title || '', leveranseId: data.leveranseId || (leveranser[0]?.id || ''), owner: data.owner || '', status: data.status || 'åpen', dueDate: data.dueDate || '', estimate: data.estimate ?? 0 });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Modal title={data.id ? 'Rediger oppgave' : 'Ny oppgave'} onClose={onClose} footer={<>{onDelete && <Btn variant="danger" onClick={onDelete} style={{ marginRight: 'auto' }}>Slett</Btn>}<Btn onClick={onClose}>Avbryt</Btn><Btn variant="primary" onClick={() => f.title.trim() && onSave(f)}>Lagre</Btn></>}>
      <Field label="Tittel"><input style={inputStyle} value={f.title} onChange={(e) => set('title', e.target.value)} /></Field>
      <Field label="Leveranse"><select style={inputStyle} value={f.leveranseId} onChange={(e) => set('leveranseId', e.target.value)}><option value="">— ingen —</option>{leveranser.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}</select></Field>
      <Field label="Ansvarlig" hint="vises på vedkommendes skrivebord">{memberSelect(members, f.owner, (v) => set('owner', v))}</Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Status"><select style={inputStyle} value={f.status} onChange={(e) => set('status', e.target.value)}>{OPP_STATUS.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Frist"><input type="date" style={inputStyle} value={f.dueDate} onChange={(e) => set('dueDate', e.target.value)} /></Field>
        <Field label="Estimat (t)"><input type="number" style={inputStyle} value={f.estimate} onChange={(e) => set('estimate', Number(e.target.value))} /></Field>
      </div>
    </Modal>
  );
}
