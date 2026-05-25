import React, { useState, useMemo } from 'react';

const theme = {
  bg: '#EDE9DF', surface: '#FFFFFF', surfaceAlt: '#E4DFD4',
  ink: '#252525', inkSoft: '#4A4A4A', inkMuted: '#7A7A7A',
  border: '#CBC4AF', borderSoft: '#DDD8CB',
  brass: '#9D8068', brassDark: '#7D6450', brassLight: '#EDE4DB',
  navy: '#252525', navyDark: '#1A1A1A',
  sage: '#5E6A60', sageLight: '#E3E7E3',
  rust: '#F4835A', rustLight: '#FDE8E0',
  amber: '#B89070', amberLight: '#F2E8DE',
};

const uid = (p='id') => p+'_'+Math.random().toString(36).slice(2,9);
const fmtDate = (iso) => { if(!iso) return ''; return new Date(iso).toLocaleDateString('no-NO',{day:'numeric',month:'short',year:'numeric'}); };
const daysFromNow = (iso) => { if(!iso) return 0; const t=new Date(); t.setHours(0,0,0,0); const x=new Date(iso); x.setHours(0,0,0,0); return Math.round((x-t)/86400000); };

const statusLabels = { planlagt:'Planlagt', 'pågår':'Pågår', pause:'Pause', fullført:'Fullført', avlyst:'Avlyst' };
const statusColor = (s) => ({
  planlagt: { bg: theme.amberLight, fg: theme.amber },
  'pågår':  { bg: theme.brassLight, fg: theme.brass },
  pause:    { bg: theme.surfaceAlt, fg: theme.inkMuted },
  fullført: { bg: theme.sageLight, fg: theme.sage },
  avlyst:   { bg: theme.surfaceAlt, fg: theme.inkMuted },
}[s] || { bg: theme.surfaceAlt, fg: theme.inkSoft });
const healthColor = (h) => h==='grønn' ? theme.sage : h==='gul' ? theme.amber : h==='rød' ? theme.rust : theme.inkMuted;
const healthLabel = (h) => h==='grønn' ? 'På sporet' : h==='gul' ? 'Følges nøye' : h==='rød' ? 'I trøbbel' : '–';

const portalNames = { leadership:'Ledelse', marketing:'Marked', sales:'Salg', innkjop:'Innkjøp', produkt:'Produkt' };

const Pill = ({ children, color, bg, style={} }) => (
  <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 9px',borderRadius:999,fontSize:11,fontWeight:600,background:bg,color,whiteSpace:'nowrap',...style}}>{children}</span>
);

const Card = ({ children, onClick, style={} }) => (
  <div onClick={onClick} style={{background:theme.surface,border:`1px solid ${theme.borderSoft}`,borderRadius:12,padding:20,cursor:onClick?'pointer':'default',transition:'box-shadow 120ms, border-color 120ms',...style}}
    onMouseEnter={(e)=>{if(onClick){e.currentTarget.style.borderColor=theme.brass;e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.06)';}}}
    onMouseLeave={(e)=>{e.currentTarget.style.borderColor=theme.borderSoft;e.currentTarget.style.boxShadow='none';}}>
    {children}
  </div>
);

const Avatar = ({ member, size=36 }) => {
  const colors = ['#9D8068','#5E6A60','#252525','#B89070','#F4835A'];
  const idx = (member.id||'').split('').reduce((s,c)=>s+c.charCodeAt(0),0) % colors.length;
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:colors[idx],display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:size*0.38,fontWeight:700,flexShrink:0}}>
      {member.initials || member.name?.slice(0,2).toUpperCase() || '?'}
    </div>
  );
};

const Modal = ({ open, onClose, title, children, width=640 }) => {
  if (!open) return null;
  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'60px 24px',overflowY:'auto'}}
      onClick={(e)=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)'}}/>
      <div style={{position:'relative',width:'100%',maxWidth:width,background:theme.surface,borderRadius:14,boxShadow:'0 24px 60px rgba(0,0,0,0.18)',padding:'28px 28px 24px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <h2 style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:22,fontWeight:400,color:theme.ink,margin:0}}>{title}</h2>
          <button onClick={onClose} style={{background:'transparent',border:'none',cursor:'pointer',color:theme.inkMuted,padding:4,fontSize:20,lineHeight:1}}>&#x2715;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function ProjectsView({ data, save, crossorgData, saveCrossorg, allData, currentUserId, activePortal }) {
  const [editing, setEditing] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [detailScope, setDetailScope] = useState(null);
  const [scopeFilter, setScopeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('aktive');

  const deptProjects = data.projects || [];
  const crossProjects = crossorgData.projects || [];
  const allProjects = [
    ...deptProjects.map(p => ({...p, _scope:'dept', _portalId: activePortal})),
    ...crossProjects.map(p => ({...p, _scope:'crossorg'})),
  ];

  const memberById = (id) => data.members.find(m=>m.id===id);
  const memberFromAny = (id) => {
    for (const pid of Object.keys(allData||{})) {
      const m = (allData[pid].members||[]).find(x=>x.id===id);
      if (m) return m;
    }
    return data.members.find(m=>m.id===id) || null;
  };

  const filtered = useMemo(() => allProjects.filter(p => {
    if (scopeFilter==='dept' && p._scope!=='dept') return false;
    if (scopeFilter==='crossorg' && p._scope!=='crossorg') return false;
    if (statusFilter==='aktive' && (p.status==='fullført'||p.status==='avlyst')) return false;
    if (statusFilter==='fullført' && p.status!=='fullført') return false;
    if (statusFilter==='risiko' && p.health!=='rød' && p.health!=='gul') return false;
    return true;
  }).sort((a,b) => {
    const order = { 'rød':0, gul:1, 'grønn':2 };
    return (order[a.health]??3) - (order[b.health]??3);
  }), [allProjects, scopeFilter, statusFilter]);

  const getProgress = (p) => {
    const tasks = p._scope==='crossorg' ? (p.tasks||[]) : (data.tasks||[]).filter(t=>t.projectId===p.id);
    if (tasks.length > 0) {
      const done = tasks.filter(t=>t.status==='fullført').length;
      return Math.round((done/tasks.length)*100);
    }
    const ms = p.milestones||[];
    if (ms.length > 0) {
      const done = ms.filter(m=>m.status==='fullført').length;
      return Math.round((done/ms.length)*100);
    }
    return 0;
  };

  const saveProject = (proj) => {
    if (proj.scope === 'crossorg') {
      const existing = crossProjects.find(p=>p.id===proj.id);
      if (existing) {
        saveCrossorg({...crossorgData, projects: crossProjects.map(p=>p.id===proj.id?proj:p)});
      } else {
        saveCrossorg({...crossorgData, projects: [...crossProjects, {...proj, id: uid('prj'), createdAt: new Date().toISOString()}]});
      }
    } else {
      const existing = deptProjects.find(p=>p.id===proj.id);
      if (existing) {
        save({...data, projects: deptProjects.map(p=>p.id===proj.id?proj:p)});
      } else {
        save({...data, projects: [...deptProjects, {...proj, id: uid('prj'), portalId: activePortal, createdAt: new Date().toISOString()}]});
      }
    }
    setEditing(null);
  };

  const deleteProject = (proj) => {
    if (proj.scope === 'crossorg') {
      saveCrossorg({...crossorgData, projects: crossProjects.filter(p=>p.id!==proj.id)});
    } else {
      save({...data, projects: deptProjects.filter(p=>p.id!==proj.id)});
    }
    setEditing(null);
    setDetailId(null);
  };

  const openDetail = filtered.find(p=>p.id===detailId && p._scope===detailScope);

  if (openDetail) {
    return <ProjectDetail project={openDetail} data={data} allData={allData} crossorgData={crossorgData}
      saveCrossorg={saveCrossorg} save={save} currentUserId={currentUserId} activePortal={activePortal}
      memberFromAny={memberFromAny} onBack={()=>{setDetailId(null);setDetailScope(null);}}
      onEdit={()=>setEditing(openDetail)} onDelete={()=>deleteProject(openDetail)}/>;
  }

  const activeCount = allProjects.filter(p=>p.status==='pågår').length;
  const crossCount = crossProjects.filter(p=>p.status!=='fullført'&&p.status!=='avlyst').length;
  const lateMilestones = allProjects.flatMap(p=>(p.milestones||[]).filter(m=>m.status!=='fullført'&&m.date&&daysFromNow(m.date)<0)).length;
  const myCount = allProjects.filter(p=>(p.members||[]).some(m=>m.memberId===currentUserId)||p.lead===currentUserId).length;

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:theme.brass,letterSpacing:1.5,textTransform:'uppercase',marginBottom:6}}>Prosjektportefølje</div>
          <h1 style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:32,fontWeight:400,color:theme.ink,margin:0,letterSpacing:-0.5}}>Prosjekter</h1>
        </div>
        <button onClick={()=>setEditing({scope:'dept'})}
          style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:8,background:theme.brass,color:'#fff',border:'none',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
          + Nytt prosjekt
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(170px, 1fr))',gap:14,marginBottom:24}}>
        <KpiCard label="Aktive" value={activeCount} accent={theme.brass}/>
        <KpiCard label="På tvers" value={crossCount} accent={theme.navy}/>
        <KpiCard label="Forsinkede milepæler" value={lateMilestones} accent={lateMilestones>0?theme.rust:theme.sage}/>
        <KpiCard label="Mine prosjekter" value={myCount} accent={theme.sage}/>
      </div>

      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <FilterGroup value={scopeFilter} onChange={setScopeFilter} options={[{value:'all',label:'Alle'},{value:'dept',label:'Avdeling'},{value:'crossorg',label:'På tvers'}]}/>
        <FilterGroup value={statusFilter} onChange={setStatusFilter} options={[{value:'aktive',label:'Aktive'},{value:'risiko',label:'I risiko'},{value:'fullført',label:'Fullførte'},{value:'all',label:'Alle'}]}/>
      </div>

      {filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:'60px 24px',background:theme.surface,borderRadius:12,border:`1px solid ${theme.borderSoft}`}}>
          <div style={{fontSize:18,fontFamily:"'Fraunces', Georgia, serif",color:theme.ink,marginBottom:8}}>Ingen prosjekter i utvalget</div>
          <div style={{fontSize:13,color:theme.inkSoft,lineHeight:1.6,maxWidth:440,margin:'0 auto'}}>Prosjekter lar deg organisere arbeid med deltakere, ansvar og milepæler -- både avdelingsvis og på tvers.</div>
        </div>
      ) : (
        <div style={{display:'grid',gap:12}}>
          {filtered.map(p => {
            const sc = statusColor(p.status);
            const hc = healthColor(p.health);
            const lead = memberFromAny(p.lead);
            const progress = getProgress(p);
            const members = (p.members||[]).slice(0,5);
            return (
              <Card key={p.id+p._scope} onClick={()=>{setDetailId(p.id);setDetailScope(p._scope);}}>
                <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
                  <div style={{width:6,alignSelf:'stretch',background:hc,borderRadius:3,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6,flexWrap:'wrap'}}>
                      <Pill bg={sc.bg} color={sc.fg}>{statusLabels[p.status]}</Pill>
                      <Pill bg={`${hc}22`} color={hc}>● {healthLabel(p.health)}</Pill>
                      <Pill bg={p._scope==='crossorg'?theme.navyDark+'22':theme.brassLight} color={p._scope==='crossorg'?theme.navy:theme.brassDark}>
                        {p._scope==='crossorg'?'På tvers':portalNames[activePortal]||'Avdeling'}
                      </Pill>
                    </div>
                    <h3 style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:20,fontWeight:500,color:theme.ink,margin:'0 0 6px',letterSpacing:-0.3}}>{p.title}</h3>
                    {p.description && <p style={{fontSize:13,color:theme.inkSoft,margin:'0 0 10px',lineHeight:1.55}}>{p.description}</p>}
                    <div style={{marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:11,fontWeight:600,color:theme.inkSoft,marginBottom:5}}>
                        <span>Fremdrift</span><span>{progress}%</span>
                      </div>
                      <div style={{height:6,background:theme.surfaceAlt,borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${progress}%`,background:hc,transition:'width 200ms'}}/>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:18,fontSize:12,color:theme.inkMuted,flexWrap:'wrap',alignItems:'center'}}>
                      {lead && <span style={{display:'inline-flex',alignItems:'center',gap:6}}><Avatar member={lead} size={20}/> {lead.name}</span>}
                      {p.endDate && <span>Frist: {fmtDate(p.endDate)}</span>}
                      {members.length>0 && (
                        <span style={{display:'inline-flex',alignItems:'center'}}>
                          {members.map((m,i) => {const mb=memberFromAny(m.memberId); return mb ? <div key={m.memberId} style={{marginLeft:i?-6:0}}><Avatar member={mb} size={20}/></div> : null;})}
                          {(p.members||[]).length>5 && <span style={{marginLeft:4}}>+{(p.members||[]).length-5}</span>}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Rediger prosjekt':'Nytt prosjekt'} width={720}>
        {editing && <ProjectForm project={editing} data={data} allData={allData} activePortal={activePortal}
          memberFromAny={memberFromAny} onSave={saveProject} onCancel={()=>setEditing(null)}
          onDelete={editing.id?()=>deleteProject(editing):null}/>}
      </Modal>
    </div>
  );
}

function KpiCard({ label, value, accent }) {
  return (
    <div style={{background:theme.surface,border:`1px solid ${theme.borderSoft}`,borderRadius:12,padding:'16px 18px'}}>
      <div style={{width:34,height:34,borderRadius:9,background:accent,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',marginBottom:10,fontSize:14,fontWeight:700}}>
        {typeof value==='number'?value:'-'}
      </div>
      <div style={{fontSize:12,color:theme.inkSoft,fontWeight:600}}>{label}</div>
    </div>
  );
}

function FilterGroup({ value, onChange, options }) {
  return (
    <div style={{display:'flex',background:theme.surfaceAlt,borderRadius:8,padding:3,gap:2}}>
      {options.map(o => (
        <button key={o.value} onClick={()=>onChange(o.value)}
          style={{padding:'7px 14px',borderRadius:6,border:'none',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',
            background:value===o.value?theme.surface:'transparent',color:value===o.value?theme.ink:theme.inkSoft,
            boxShadow:value===o.value?'0 1px 3px rgba(0,0,0,0.08)':'none'}}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ProjectForm({ project, data, allData, activePortal, memberFromAny, onSave, onCancel, onDelete }) {
  const [p, setP] = useState({
    title:'', description:'', scope:'dept', portalId: activePortal, status:'planlagt', health:'grønn',
    startDate:'', endDate:'', lead:'', members:[], milestones:[], category:'', tasks:[],
    ...project
  });
  const update = (k,v) => setP({...p,[k]:v});

  const availableMembers = p.scope==='crossorg'
    ? Object.entries(allData||{}).flatMap(([pid,d])=>(d.members||[]).map(m=>({...m,_portalId:pid})))
    : data.members.map(m=>({...m,_portalId:activePortal}));
  const uniqueMembers = availableMembers.filter((m,i,arr)=>arr.findIndex(x=>x.id===m.id)===i);

  const toggleMember = (memberId, portalId) => {
    const list = p.members||[];
    const existing = list.find(m=>m.memberId===memberId);
    if (existing) setP({...p, members:list.filter(m=>m.memberId!==memberId)});
    else setP({...p, members:[...list, {memberId, portalId, role:'', responsibility:''}]});
  };
  const updateMember = (memberId, patch) => setP({...p, members:(p.members||[]).map(m=>m.memberId===memberId?{...m,...patch}:m)});
  const addMilestone = () => setP({...p, milestones:[...(p.milestones||[]), {id:uid('ms'), title:'', date:'', status:'ikke_startet'}]});
  const updateMilestone = (idx,patch) => { const next=[...(p.milestones||[])]; next[idx]={...next[idx],...patch}; setP({...p, milestones:next}); };
  const removeMilestone = (idx) => setP({...p, milestones:(p.milestones||[]).filter((_,i)=>i!==idx)});

  const input = { width:'100%',padding:'9px 12px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13,background:theme.surface,color:theme.ink,fontFamily:'inherit',boxSizing:'border-box' };
  const label = { fontSize:11,fontWeight:700,color:theme.inkSoft,textTransform:'uppercase',letterSpacing:0.5,marginBottom:6,display:'block' };
  const select = {...input, cursor:'pointer'};

  return (
    <div style={{display:'grid',gap:14}}>
      <div>
        <span style={label}>Scope</span>
        <div style={{display:'flex',gap:8}}>
          {['dept','crossorg'].map(s => (
            <button key={s} type="button" onClick={()=>update('scope',s)}
              style={{padding:'7px 16px',borderRadius:999,border:`1px solid ${p.scope===s?theme.brass:theme.border}`,background:p.scope===s?theme.brassLight:theme.surface,color:p.scope===s?theme.brassDark:theme.inkSoft,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
              {s==='dept'?'Avdeling':'På tvers'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span style={label}>Tittel</span>
        <input style={input} value={p.title} onChange={e=>update('title',e.target.value)} placeholder="Prosjektnavn"/>
      </div>
      <div>
        <span style={label}>Beskrivelse</span>
        <textarea style={{...input,minHeight:60,resize:'vertical'}} value={p.description} onChange={e=>update('description',e.target.value)} placeholder="Kort beskrivelse..."/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        <div>
          <span style={label}>Status</span>
          <select style={select} value={p.status} onChange={e=>update('status',e.target.value)}>
            {Object.entries(statusLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <span style={label}>Helse</span>
          <select style={select} value={p.health} onChange={e=>update('health',e.target.value)}>
            <option value="grønn">Grønn - på sporet</option>
            <option value="gul">Gul - følges nøye</option>
            <option value="rød">Rød - i trøbbel</option>
          </select>
        </div>
        <div>
          <span style={label}>Prosjektleder</span>
          <select style={select} value={p.lead} onChange={e=>update('lead',e.target.value)}>
            <option value="">Velg...</option>
            {uniqueMembers.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div><span style={label}>Startdato</span><input style={input} type="date" value={p.startDate} onChange={e=>update('startDate',e.target.value)}/></div>
        <div><span style={label}>Sluttdato</span><input style={input} type="date" value={p.endDate} onChange={e=>update('endDate',e.target.value)}/></div>
      </div>

      <div>
        <span style={label}>Deltakere</span>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8}}>
          {uniqueMembers.map(m => {
            const on = (p.members||[]).some(x=>x.memberId===m.id);
            return (
              <button key={m.id} type="button" onClick={()=>toggleMember(m.id, m._portalId)}
                style={{display:'flex',alignItems:'center',gap:6,padding:'5px 10px 5px 5px',borderRadius:999,border:`1px solid ${on?theme.brass:theme.border}`,background:on?theme.brassLight:theme.surface,color:theme.ink,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:500}}>
                <Avatar member={m} size={20}/>{m.name.split(' ')[0]}
                {p.scope==='crossorg' && <span style={{fontSize:10,color:theme.inkMuted}}>({portalNames[m._portalId]||m._portalId})</span>}
              </button>
            );
          })}
        </div>
        {(p.members||[]).length > 0 && (
          <div style={{display:'grid',gap:6,marginTop:8}}>
            {(p.members||[]).map(pm => {
              const m = memberFromAny(pm.memberId);
              if (!m) return null;
              return (
                <div key={pm.memberId} style={{display:'flex',gap:8,alignItems:'center',background:theme.surfaceAlt,padding:'8px 12px',borderRadius:8}}>
                  <Avatar member={m} size={24}/>
                  <span style={{fontSize:12,fontWeight:600,color:theme.ink,minWidth:80}}>{m.name.split(' ')[0]}</span>
                  <input style={{...input,flex:1,padding:'5px 8px',fontSize:12}} value={pm.role} onChange={e=>updateMember(pm.memberId,{role:e.target.value})} placeholder="Rolle"/>
                  <input style={{...input,flex:2,padding:'5px 8px',fontSize:12}} value={pm.responsibility} onChange={e=>updateMember(pm.memberId,{responsibility:e.target.value})} placeholder="Ansvarsområde"/>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <span style={label}>Milepæler ({(p.milestones||[]).length})</span>
          <button type="button" onClick={addMilestone} style={{fontSize:12,color:theme.brass,background:'transparent',border:'none',cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>+ Legg til</button>
        </div>
        {(p.milestones||[]).map((ms,i) => (
          <div key={ms.id||i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}>
            <input style={{...input,flex:2,padding:'6px 8px',fontSize:12}} value={ms.title} onChange={e=>updateMilestone(i,{title:e.target.value})} placeholder="Milepæl"/>
            <input style={{...input,width:130,padding:'6px 8px',fontSize:12}} type="date" value={ms.date} onChange={e=>updateMilestone(i,{date:e.target.value})}/>
            <select style={{...select,width:110,padding:'6px 8px',fontSize:12}} value={ms.status} onChange={e=>updateMilestone(i,{status:e.target.value})}>
              <option value="ikke_startet">Ikke startet</option>
              <option value="pågår">Pågår</option>
              <option value="fullført">Fullført</option>
            </select>
            <button type="button" onClick={()=>removeMilestone(i)} style={{background:'transparent',border:'none',cursor:'pointer',color:theme.inkMuted,fontSize:16}}>&#x2715;</button>
          </div>
        ))}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',marginTop:10,paddingTop:16,borderTop:`1px solid ${theme.borderSoft}`}}>
        <div>{onDelete && <button onClick={()=>{if(confirm('Slette prosjektet?'))onDelete();}} style={{padding:'9px 16px',borderRadius:8,border:`1px solid ${theme.rust}44`,background:theme.rustLight,color:theme.rust,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Slett</button>}</div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={onCancel} style={{padding:'9px 16px',borderRadius:8,border:`1px solid ${theme.border}`,background:theme.surface,color:theme.inkSoft,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Avbryt</button>
          <button onClick={()=>{if(!p.title){alert('Tittel mangler');return;} onSave(p);}} style={{padding:'9px 18px',borderRadius:8,border:'none',background:theme.brass,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Lagre</button>
        </div>
      </div>
    </div>
  );
}

function ProjectDetail({ project, data, allData, crossorgData, saveCrossorg, save, currentUserId, activePortal, memberFromAny, onBack, onEdit, onDelete }) {
  const [tab, setTab] = useState('overview');
  const [addingTask, setAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({title:'',owner:'',dueDate:'',priority:'medium'});

  const sc = statusColor(project.status);
  const hc = healthColor(project.health);
  const lead = memberFromAny(project.lead);
  const progress = (() => {
    const tasks = project._scope==='crossorg' ? (project.tasks||[]) : (data.tasks||[]).filter(t=>t.projectId===project.id);
    if (tasks.length>0) return Math.round(tasks.filter(t=>t.status==='fullført').length/tasks.length*100);
    const ms = project.milestones||[];
    if (ms.length>0) return Math.round(ms.filter(m=>m.status==='fullført').length/ms.length*100);
    return 0;
  })();

  const projectTasks = project._scope==='crossorg'
    ? (project.tasks||[])
    : (data.tasks||[]).filter(t=>t.projectId===project.id);

  const addTask = () => {
    if (!newTask.title) return;
    if (project._scope==='crossorg') {
      const task = { id: uid('tsk'), ...newTask, status:'ikke_startet', projectId:project.id, projectScope:'crossorg' };
      const updatedProj = {...project, tasks:[...(project.tasks||[]), task]};
      delete updatedProj._scope; delete updatedProj._portalId;
      saveCrossorg({...crossorgData, projects:(crossorgData.projects||[]).map(p=>p.id===project.id?updatedProj:p)});
    } else {
      const task = { id: uid('tsk'), ...newTask, status:'ikke_startet', projectId:project.id, projectScope:'dept' };
      save({...data, tasks:[...data.tasks, task]});
    }
    setNewTask({title:'',owner:'',dueDate:'',priority:'medium'});
    setAddingTask(false);
  };

  const availableMembers = project._scope==='crossorg'
    ? Object.entries(allData||{}).flatMap(([pid,d])=>(d.members||[])).filter((m,i,arr)=>arr.findIndex(x=>x.id===m.id)===i)
    : data.members;

  const input = { width:'100%',padding:'8px 10px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13,background:theme.surface,color:theme.ink,fontFamily:'inherit',boxSizing:'border-box' };

  return (
    <div>
      <button onClick={onBack} style={{background:'transparent',border:'none',color:theme.inkSoft,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600,marginBottom:16,fontFamily:'inherit',padding:'6px 10px',borderRadius:6}}>
        &#8592; Tilbake til prosjekter
      </button>

      <Card style={{marginBottom:22,padding:0,overflow:'hidden'}}>
        <div style={{padding:'24px 28px',borderBottom:`1px solid ${theme.borderSoft}`,background:theme.surfaceAlt}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,flexWrap:'wrap',marginBottom:14}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap'}}>
                <Pill bg={sc.bg} color={sc.fg}>{statusLabels[project.status]}</Pill>
                <Pill bg={`${hc}22`} color={hc}>● {healthLabel(project.health)}</Pill>
                <Pill bg={project._scope==='crossorg'?theme.navyDark+'22':theme.brassLight} color={project._scope==='crossorg'?theme.navy:theme.brassDark}>
                  {project._scope==='crossorg'?'På tvers':portalNames[activePortal]||'Avdeling'}
                </Pill>
              </div>
              <h1 style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:32,fontWeight:400,color:theme.ink,margin:0,letterSpacing:-0.5}}>{project.title}</h1>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={onEdit} style={{padding:'8px 14px',borderRadius:8,border:`1px solid ${theme.border}`,background:theme.surface,color:theme.ink,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Rediger</button>
              <button onClick={()=>{if(confirm('Slette prosjektet?'))onDelete();}} style={{padding:'8px 14px',borderRadius:8,border:`1px solid ${theme.rust}44`,background:theme.rustLight,color:theme.rust,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Slett</button>
            </div>
          </div>
          {project.description && <p style={{fontSize:14,color:theme.inkSoft,margin:'0 0 14px',lineHeight:1.6}}>{project.description}</p>}
          <div style={{display:'flex',gap:20,flexWrap:'wrap',fontSize:13,color:theme.inkSoft,alignItems:'center'}}>
            {lead && <span style={{display:'inline-flex',alignItems:'center',gap:6}}><Avatar member={lead} size={22}/> Prosjektleder: {lead.name}</span>}
            {project.startDate && <span>Start: {fmtDate(project.startDate)}</span>}
            {project.endDate && <span>Frist: {fmtDate(project.endDate)}</span>}
          </div>
          <div style={{marginTop:14}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,fontWeight:600,color:theme.inkSoft,marginBottom:5}}>
              <span>Fremdrift</span><span>{progress}%</span>
            </div>
            <div style={{height:8,background:'rgba(0,0,0,0.06)',borderRadius:4,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${progress}%`,background:hc,transition:'width 200ms'}}/>
            </div>
          </div>
        </div>

        <div style={{padding:'0 28px',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',gap:4}}>
          {[{k:'overview',l:'Oversikt'},{k:'members',l:'Deltakere & ansvar'},{k:'tasks',l:`Oppgaver (${projectTasks.length})`},{k:'milestones',l:'Milepæler'}].map(t => (
            <button key={t.k} onClick={()=>setTab(t.k)}
              style={{background:'transparent',border:'none',cursor:'pointer',fontFamily:'inherit',padding:'14px 14px 12px',fontSize:13,fontWeight:600,color:tab===t.k?theme.brass:theme.inkSoft,borderBottom:`2px solid ${tab===t.k?theme.brass:'transparent'}`,marginBottom:-1,transition:'all 120ms'}}>
              {t.l}
            </button>
          ))}
        </div>

        <div style={{padding:'24px 28px'}}>
          {tab==='overview' && (
            <div style={{display:'grid',gap:16}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:12}}>
                <div style={{background:theme.surfaceAlt,padding:16,borderRadius:10}}>
                  <div style={{fontSize:11,color:theme.inkMuted,fontWeight:600,marginBottom:4}}>Status</div>
                  <div style={{fontSize:15,fontWeight:600,color:theme.ink}}>{statusLabels[project.status]}</div>
                </div>
                <div style={{background:theme.surfaceAlt,padding:16,borderRadius:10}}>
                  <div style={{fontSize:11,color:theme.inkMuted,fontWeight:600,marginBottom:4}}>Helse</div>
                  <div style={{fontSize:15,fontWeight:600,color:hc}}>{healthLabel(project.health)}</div>
                </div>
                <div style={{background:theme.surfaceAlt,padding:16,borderRadius:10}}>
                  <div style={{fontSize:11,color:theme.inkMuted,fontWeight:600,marginBottom:4}}>Oppgaver</div>
                  <div style={{fontSize:15,fontWeight:600,color:theme.ink}}>{projectTasks.filter(t=>t.status==='fullført').length}/{projectTasks.length} fullført</div>
                </div>
              </div>
            </div>
          )}

          {tab==='members' && (
            <div style={{display:'grid',gap:10}}>
              {(project.members||[]).length===0 && <div style={{color:theme.inkMuted,fontSize:13}}>Ingen deltakere lagt til ennå.</div>}
              {(project.members||[]).map(pm => {
                const m = memberFromAny(pm.memberId);
                if (!m) return null;
                return (
                  <div key={pm.memberId} style={{display:'flex',gap:14,alignItems:'center',padding:'12px 16px',background:theme.surfaceAlt,borderRadius:10}}>
                    <Avatar member={m} size={38}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:600,color:theme.ink}}>{m.name}</div>
                      <div style={{fontSize:12,color:theme.inkSoft}}>{m.role} {pm.portalId && <span style={{color:theme.inkMuted}}>· {portalNames[pm.portalId]||pm.portalId}</span>}</div>
                    </div>
                    {pm.role && <Pill bg={theme.brassLight} color={theme.brassDark}>{pm.role}</Pill>}
                    {pm.responsibility && <div style={{fontSize:12,color:theme.inkSoft,maxWidth:200,textAlign:'right'}}>{pm.responsibility}</div>}
                  </div>
                );
              })}
            </div>
          )}

          {tab==='tasks' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:600,color:theme.inkSoft}}>{projectTasks.length} oppgaver</div>
                <button onClick={()=>setAddingTask(true)} style={{fontSize:12,color:theme.brass,background:'transparent',border:'none',cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>+ Ny oppgave</button>
              </div>
              {addingTask && (
                <div style={{background:theme.surfaceAlt,padding:14,borderRadius:10,marginBottom:14,display:'grid',gap:8}}>
                  <input style={input} value={newTask.title} onChange={e=>setNewTask({...newTask,title:e.target.value})} placeholder="Oppgavetittel"/>
                  <div style={{display:'flex',gap:8}}>
                    <select style={{...input,flex:1}} value={newTask.owner} onChange={e=>setNewTask({...newTask,owner:e.target.value})}>
                      <option value="">Velg ansvarlig</option>
                      {availableMembers.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <input style={{...input,width:140}} type="date" value={newTask.dueDate} onChange={e=>setNewTask({...newTask,dueDate:e.target.value})}/>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={addTask} style={{padding:'7px 14px',borderRadius:6,border:'none',background:theme.brass,color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Legg til</button>
                    <button onClick={()=>setAddingTask(false)} style={{padding:'7px 14px',borderRadius:6,border:`1px solid ${theme.border}`,background:theme.surface,color:theme.inkSoft,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Avbryt</button>
                  </div>
                </div>
              )}
              {['ikke_startet','pågår','fullført'].map(status => {
                const tasks = projectTasks.filter(t=>t.status===status);
                if (tasks.length===0) return null;
                const statusLabel = status==='ikke_startet'?'Ikke startet':status==='pågår'?'Pågår':'Fullført';
                return (
                  <div key={status} style={{marginBottom:16}}>
                    <div style={{fontSize:11,fontWeight:700,color:theme.inkMuted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>{statusLabel} ({tasks.length})</div>
                    <div style={{display:'grid',gap:6}}>
                      {tasks.map(t => {
                        const owner = memberFromAny(t.owner);
                        const overdue = t.dueDate && daysFromNow(t.dueDate)<0 && t.status!=='fullført';
                        return (
                          <div key={t.id} style={{display:'flex',gap:10,alignItems:'center',padding:'10px 14px',background:theme.surface,border:`1px solid ${theme.borderSoft}`,borderRadius:8}}>
                            <div style={{width:8,height:8,borderRadius:'50%',background:t.status==='fullført'?theme.sage:t.status==='pågår'?theme.amber:theme.inkMuted,flexShrink:0}}/>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13,fontWeight:500,color:theme.ink,textDecoration:t.status==='fullført'?'line-through':'none'}}>{t.title}</div>
                              <div style={{fontSize:11,color:theme.inkMuted,marginTop:2}}>
                                {owner&&owner.name} {t.dueDate&&`· ${fmtDate(t.dueDate)}`}
                                {overdue && <span style={{color:theme.rust,fontWeight:600}}> (forsinket)</span>}
                              </div>
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

          {tab==='milestones' && (
            <div style={{display:'grid',gap:10}}>
              {(project.milestones||[]).length===0 && <div style={{color:theme.inkMuted,fontSize:13}}>Ingen milepæler lagt til.</div>}
              {(project.milestones||[]).map((ms,i) => {
                const overdue = ms.date && ms.status!=='fullført' && daysFromNow(ms.date)<0;
                return (
                  <div key={ms.id||i} style={{display:'flex',gap:12,alignItems:'center',padding:'12px 16px',background:theme.surfaceAlt,borderRadius:10}}>
                    <div style={{width:10,height:10,borderRadius:'50%',background:ms.status==='fullført'?theme.sage:ms.status==='pågår'?theme.amber:theme.inkMuted,flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:500,color:theme.ink}}>{ms.title||`Milepæl ${i+1}`}</div>
                      <div style={{fontSize:12,color:overdue?theme.rust:theme.inkMuted}}>{ms.date?fmtDate(ms.date):'Ingen dato'} {overdue&&'(forsinket)'}</div>
                    </div>
                    <Pill bg={ms.status==='fullført'?theme.sageLight:ms.status==='pågår'?theme.amberLight:theme.surfaceAlt} color={ms.status==='fullført'?theme.sage:ms.status==='pågår'?theme.amber:theme.inkMuted}>
                      {ms.status==='fullført'?'Fullført':ms.status==='pågår'?'Pågår':'Ikke startet'}
                    </Pill>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
