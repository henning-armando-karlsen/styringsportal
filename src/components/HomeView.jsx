import React from 'react';

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

const portalMeta = {
  leadership: { name:'Ledergruppen', color: theme.navy },
  marketing:  { name:'Markedsavdelingen', color: theme.brass },
  sales:      { name:'Salgsavdelingen', color: theme.sage },
  innkjop:    { name:'Innkjøpsavdelingen', color: theme.amber },
  produkt:    { name:'Produkt & Sourcing', color: theme.brassDark },
};

const fmtDateLong = (d) => d.toLocaleDateString('no-NO',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const getWeek = (date) => { const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())); const n=d.getUTCDay()||7; d.setUTCDate(d.getUTCDate()+4-n); const ys=new Date(Date.UTC(d.getUTCFullYear(),0,1)); return Math.ceil((((d-ys)/86400000)+1)/7); };
const daysFromNow = (iso) => { if(!iso) return 0; const t=new Date(); t.setHours(0,0,0,0); const x=new Date(iso); x.setHours(0,0,0,0); return Math.round((x-t)/86400000); };
const relativeDate = (iso) => { const d=daysFromNow(iso); if(d===0) return 'I dag'; if(d===1) return 'I morgen'; if(d===-1) return 'I gar'; if(d>0&&d<=7) return `Om ${d} dager`; return ''; };
const healthColor = (h) => h==='grønn'?theme.sage:h==='gul'?theme.amber:h==='rød'?theme.rust:theme.inkMuted;
const healthLabel = (h) => h==='grønn'?'Pa sporet':h==='gul'?'Folges noye':h==='rød'?'I trobbel':'';

export default function HomeView({ data, currentUserId, onNavigate, save, allData, crossorgData, availablePortals, activePortal, onSwitchPortal, onAsk, identity, forumData={}, onOpenForum, unifiedTasks=null }) {
  const me = data.members?.find(m => m.id === currentUserId);
  if (!me) return null;

  const now = new Date();
  const greeting = now.getHours() < 10 ? 'God morgen' : now.getHours() < 18 ? 'God dag' : 'God kveld';
  const firstName = me.name;

  // KPI data
  const forumTasks = Object.values(forumData||{}).flatMap(fd=>(fd.tasks||[]).filter(t=>t.owner===me.id&&t.status!=='fullført'));
  const myTasks = unifiedTasks || [...(data.tasks||[]).filter(t=>t.owner===me.id&&t.status!=='fullført'), ...(crossorgData?.projects||[]).flatMap(p=>(p.tasks||[]).filter(t=>t.owner===me.id&&t.status!=='fullført')), ...forumTasks];
  const overdueTasks = myTasks.filter(t=>t.dueDate&&daysFromNow(t.dueDate)<0);
  const tomorrowTasks = myTasks.filter(t=>t.dueDate&&daysFromNow(t.dueDate)===1);

  const weekStart = new Date(now); weekStart.setDate(now.getDate()-now.getDay()+1); weekStart.setHours(0,0,0,0);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate()+6);
  const myMeetings = (data.meetings||[]).filter(m=>m.attendees?.includes(me.id)&&m.status==='planlagt'&&new Date(m.date)>=weekStart&&new Date(m.date)<=weekEnd);
  const nextMeeting = (data.meetings||[]).filter(m=>m.attendees?.includes(me.id)&&m.status==='planlagt'&&daysFromNow(m.date)>=0).sort((a,b)=>a.date.localeCompare(b.date))[0];

  const myProjects = [
    ...(data.projects||[]).filter(p=>((p.members||[]).some(m=>m.memberId===me.id)||p.lead===me.id)&&p.status!=='fullført'&&p.status!=='avlyst'),
    ...(crossorgData?.projects||[]).filter(p=>((p.members||[]).some(m=>m.memberId===me.id)||p.lead===me.id)&&p.status!=='fullført'&&p.status!=='avlyst'),
  ];
  const crossProjectCount = (crossorgData?.projects||[]).filter(p=>((p.members||[]).some(m=>m.memberId===me.id)||p.lead===me.id)&&p.status!=='fullført'&&p.status!=='avlyst').length;

  // Attention items
  const attentionItems = [];
  overdueTasks.forEach(t => attentionItems.push({type:'task',icon:'!',color:theme.rust,title:t.title,meta:`Oppgave · Forfalt ${relativeDate(t.dueDate)||''}`,nav:'tasks'}));
  myTasks.filter(t=>t.priority==='høy'&&!overdueTasks.includes(t)).slice(0,3).forEach(t => attentionItems.push({type:'task',icon:'!',color:theme.amber,title:t.title,meta:`Oppgave · Hoy prioritet${t.dueDate?' · '+relativeDate(t.dueDate):''}`,nav:'tasks'}));
  (data.agendaProposals||[]).filter(p=>p.proposer===me.id&&p.status==='foreslått').slice(0,2).forEach(p => attentionItems.push({type:'proposal',icon:'?',color:theme.inkMuted,title:p.title,meta:'Innmeldt sak · Venter',nav:'proposals'}));
  (data.decisions||[]).filter(d=>d.owner===me.id&&d.reviewDate&&d.reviewStatus!=='ferdig'&&daysFromNow(d.reviewDate)<=7).slice(0,2).forEach(d => attentionItems.push({type:'decision',icon:'R',color:theme.brass,title:d.title,meta:`Beslutning · Review ${relativeDate(d.reviewDate)||'snart'}`,nav:'decisions'}));

  // Portal pulse
  const getPortalPulse = (pid) => {
    const pData = allData[pid];
    if (!pData) return [];
    const items = [];
    const proposals = (pData.agendaProposals||[]).filter(p=>p.status==='foreslått').length;
    if (proposals > 0) items.push(`${proposals} saker til behandling`);
    const openTasks = (pData.tasks||[]).filter(t=>t.status!=='fullført').length;
    if (openTasks > 0) items.push(`${openTasks} apne oppgaver`);
    return items;
  };

  return (
    <div>
      {/* HERO */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:36}}>
        <div>
          <h1 style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:46,fontWeight:400,color:theme.ink,margin:'0 0 6px',letterSpacing:-1.5,lineHeight:1.05}}>
            {greeting}, {firstName}
          </h1>
          <div style={{fontSize:13,color:theme.inkMuted,marginBottom:14}}>
            {fmtDateLong(now)} · Uke {getWeek(now)}
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <span style={{padding:'5px 12px',borderRadius:999,fontSize:11,fontWeight:600,background:theme.brassLight,color:theme.brassDark}}>{me.role}</span>
            {(availablePortals||[]).map(pid => (
              <span key={pid} style={{padding:'5px 12px',borderRadius:999,fontSize:11,fontWeight:600,background:theme.surfaceAlt,color:theme.inkSoft,display:'inline-flex',alignItems:'center',gap:5}}>
                <span style={{width:7,height:7,borderRadius:'50%',background:portalMeta[pid]?.color||theme.inkMuted}}/>
                {portalMeta[pid]?.name||pid}
              </span>
            ))}
          </div>
        </div>
        <div style={{width:72,height:72,borderRadius:'50%',background:theme.brass,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:26,fontWeight:700,flexShrink:0}}>
          {me.initials || ((p) => p.length > 1 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : me.name.slice(0,2).toUpperCase())(me.name.trim().split(/\s+/))}
        </div>
      </div>

      {/* VED ET BLIKK */}
      <div style={{fontSize:11,fontWeight:700,color:theme.brass,letterSpacing:1.5,textTransform:'uppercase',marginBottom:12}}>Ved et blikk</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:14,marginBottom:32}}>
        <KpiTile label="Mine apne oppgaver" value={myTasks.length}
          sub={tomorrowTasks.length>0?`${tomorrowTasks.length} forfaller i morgen`:overdueTasks.length>0?`${overdueTasks.length} forfalt`:'Pa sporet'}
          subColor={overdueTasks.length>0?theme.rust:theme.sage} onClick={()=>onNavigate('tasks')}/>
        {activePortal !== 'leadership' ? (
          <KpiTile label="Moter denne uka" value={myMeetings.length}
            sub={nextMeeting?`Neste: ${nextMeeting.title.slice(0,25)}`:'Ingen planlagt'}
            onClick={()=>onNavigate('meetings')}/>
        ) : (
          <KpiTile label="Ledergruppemoter" value="LG"
            sub="Apne i Motefora"
            subColor={theme.brass}
            onClick={()=>onOpenForum&&onOpenForum('forum:lg')}/>
        )}
        <KpiTile label="Venter pa meg" value={attentionItems.length}
          sub={attentionItems.length>0?`${overdueTasks.length} forfalt`:'Ingenting venter'}
          subColor={attentionItems.length>0?theme.rust:theme.sage}
          accentBorder={attentionItems.length>0?theme.rustLight:null} onClick={()=>onNavigate('tasks')}/>
        <KpiTile label="Mine prosjekter" value={myProjects.length}
          sub={crossProjectCount>0?`${crossProjectCount} pa tvers`:'Kun avdeling'}
          onClick={()=>onNavigate('projects')}/>
      </div>

      {/* Two columns */}
      <div style={{display:'grid',gridTemplateColumns:'1.45fr 1fr',gap:20,marginBottom:32}}>
        {/* LEFT: Krever din oppmerksomhet */}
        <div style={{background:theme.surface,borderRadius:13,border:`1px solid ${theme.borderSoft}`,overflow:'hidden'}}>
          <div style={{padding:'18px 22px',borderBottom:`1px solid ${theme.borderSoft}`}}>
            <div style={{fontSize:11,fontWeight:700,color:theme.brass,letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>Krever din oppmerksomhet</div>
            <div style={{fontSize:12,color:theme.inkMuted}}>{attentionItems.length} saker</div>
          </div>
          {attentionItems.length===0 ? (
            <div style={{padding:'40px 20px',textAlign:'center',color:theme.inkMuted,fontSize:14}}>Alt er i orden. Ingen saker venter.</div>
          ) : (
            <div>
              {attentionItems.slice(0,8).map((item,i) => (
                <div key={i} onClick={()=>onNavigate(item.nav)}
                  style={{padding:'14px 22px',borderBottom:i<attentionItems.length-1?`1px solid ${theme.borderSoft}`:'none',display:'flex',gap:12,alignItems:'center',cursor:'pointer',transition:'background 100ms'}}
                  onMouseEnter={e=>e.currentTarget.style.background=theme.surfaceAlt}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{width:30,height:30,borderRadius:8,background:`${item.color}18`,color:item.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0}}>
                    {item.icon}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13.5,fontWeight:600,color:theme.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{item.title}</div>
                    <div style={{fontSize:11.5,color:theme.inkMuted,marginTop:2}}>{item.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Min tilhorighet */}
        <div style={{display:'grid',gap:14,alignContent:'start'}}>
          <div style={{fontSize:11,fontWeight:700,color:theme.brass,letterSpacing:1,textTransform:'uppercase'}}>Min tilhorighet</div>
          {(availablePortals||[]).map(pid => {
            const meta = portalMeta[pid] || { name: pid, color: theme.inkMuted };
            const isActive = pid === activePortal;
            const pulse = getPortalPulse(pid);
            return (
              <div key={pid} style={{background:theme.surface,borderRadius:13,border:`1px solid ${isActive?theme.brass:theme.borderSoft}`,overflow:'hidden',transition:'border-color 150ms'}}>
                <div style={{padding:'14px 18px',background:meta.color,color:'#fff',display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:14,fontWeight:700}}>{meta.name}</span>
                  {isActive && <span style={{fontSize:10,fontWeight:700,letterSpacing:0.5,background:'rgba(255,255,255,0.2)',padding:'2px 8px',borderRadius:999}}>AKTIV</span>}
                </div>
                <div style={{padding:'14px 18px'}}>
                  {pulse.length>0 ? (
                    <div style={{fontSize:12,color:theme.inkSoft,marginBottom:10,lineHeight:1.6}}>{pulse.join(' · ')}</div>
                  ) : (
                    <div style={{fontSize:12,color:theme.inkMuted,marginBottom:10}}>Ingen nye saker</div>
                  )}
                  <button onClick={()=>{if(isActive)onNavigate('desk');else onSwitchPortal(pid);}}
                    style={{fontSize:12,fontWeight:600,color:theme.brass,background:'transparent',border:'none',cursor:'pointer',fontFamily:'inherit',padding:0,display:'inline-flex',alignItems:'center',gap:4}}>
                    {isActive?'Ga til skrivebordet':'Ga til portalen'} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PA TVERS AKKURAT NA */}
      {myProjects.length > 0 && (
        <div style={{marginBottom:32}}>
          <div style={{fontSize:11,fontWeight:700,color:theme.brass,letterSpacing:1.5,textTransform:'uppercase',marginBottom:12}}>Pa tvers akkurat na</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',gap:14}}>
            {myProjects.slice(0,4).map(p => {
              const hc = healthColor(p.health);
              const tasks = p.scope==='crossorg'?(p.tasks||[]):(data.tasks||[]).filter(t=>t.projectId===p.id);
              const progress = tasks.length>0?Math.round(tasks.filter(t=>t.status==='fullført').length/tasks.length*100):0;
              return (
                <div key={p.id} onClick={()=>onNavigate('projects')}
                  style={{background:theme.surface,borderRadius:13,border:`1px solid ${theme.borderSoft}`,padding:'16px 18px',cursor:'pointer',transition:'border-color 150ms'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=theme.brass}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=theme.borderSoft}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                    <div style={{fontSize:14,fontWeight:600,color:theme.ink,flex:1,minWidth:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.title}</div>
                    <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:999,background:`${hc}22`,color:hc}}>{healthLabel(p.health)}</span>
                  </div>
                  <div style={{height:6,background:theme.surfaceAlt,borderRadius:3,overflow:'hidden',marginBottom:8}}>
                    <div style={{height:'100%',width:`${progress}%`,background:hc,transition:'width 200ms'}}/>
                  </div>
                  <div style={{fontSize:11,color:theme.inkMuted}}>{progress}% fullfort</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HURTIGHANDLINGER */}
      <div style={{fontSize:11,fontWeight:700,color:theme.brass,letterSpacing:1.5,textTransform:'uppercase',marginBottom:12}}>Hurtighandlinger</div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        <ActionBtn label="Meld inn sak" dark onClick={()=>onNavigate('proposals')}/>
        <ActionBtn label="Ny oppgave" onClick={()=>onNavigate('tasks')}/>
        <ActionBtn label="Nytt prosjekt" onClick={()=>onNavigate('projects')}/>
        <ActionBtn label="Apne assistenten" ghost onClick={onAsk}/>
      </div>
    </div>
  );
}

function KpiTile({ label, value, sub, subColor, accentBorder, onClick }) {
  return (
    <div onClick={onClick}
      style={{background:theme.surface,borderRadius:13,border:`1px solid ${accentBorder||theme.borderSoft}`,padding:'20px 20px 16px',cursor:'pointer',transition:'border-color 150ms'}}
      onMouseEnter={e=>e.currentTarget.style.borderColor=theme.brass}
      onMouseLeave={e=>e.currentTarget.style.borderColor=accentBorder||theme.borderSoft}>
      <div style={{fontFamily:"'Fraunces', Georgia, serif",fontSize:38,fontWeight:400,color:theme.ink,lineHeight:1,marginBottom:6}}>{value}</div>
      <div style={{fontSize:12,fontWeight:600,color:theme.inkSoft,marginBottom:4}}>{label}</div>
      {sub && <div style={{fontSize:11,color:subColor||theme.inkMuted}}>{sub}</div>}
    </div>
  );
}

function ActionBtn({ label, dark, ghost, onClick }) {
  const style = dark
    ? {padding:'10px 18px',borderRadius:8,background:theme.navy,color:'#fff',border:'none',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}
    : ghost
    ? {padding:'10px 18px',borderRadius:8,background:'transparent',color:theme.brass,border:`1px solid ${theme.border}`,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}
    : {padding:'10px 18px',borderRadius:8,background:theme.surface,color:theme.ink,border:`1px solid ${theme.border}`,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'};
  return <button onClick={onClick} style={style}>{label}</button>;
}
