
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SUPABASE_ENABLED, loadAllPortals, savePortalContent } from './lib/dataSource';
import AdminPanel, { checkIsAdmin } from './components/AdminPanel';
import ProjectsView from './components/ProjectsView';
import { supabase } from './lib/supabase.js';

/* ===== ICONS (inline lucide-style SVGs) ===== */
const ico = (paths) => ({ size = 16, style = {}, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
       strokeLinejoin="round" style={{ flexShrink: 0, ...style }} {...rest}
       dangerouslySetInnerHTML={{ __html: paths }} />
);

const LayoutDashboard = ico('<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>');
const Calendar = ico('<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>');
const CheckSquare = ico('<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>');
const FileText = ico('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>');
const Users = ico('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>');
const Folder = ico('<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>');
const Plus = ico('<path d="M5 12h14"/><path d="M12 5v14"/>');
const X = ico('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');
const Edit2 = ico('<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>');
const Trash2 = ico('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>');
const Clock = ico('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>');
const MapPin = ico('<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>');
const ChevronRight = ico('<path d="m9 18 6-6-6-6"/>');
const Search = ico('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>');
const Printer = ico('<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>');
const AlertCircle = ico('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>');
const CheckCircle2 = ico('<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>');
const Circle = ico('<circle cx="12" cy="12" r="10"/>');
const ArrowRight = ico('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>');
const Anchor = ico('<path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/>');
const Mail = ico('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>');
const Sparkles = ico('<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>');
const ListTodo = ico('<rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>');
const Gavel = ico('<path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/>');
const CalendarClock = ico('<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.3V14"/><circle cx="16" cy="16" r="6"/>');
const UserCheck = ico('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>');
const ChevronLeft = ico('<path d="m15 18-6-6 6-6"/>');
const ExternalLink = ico('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>');
const Save = ico('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>');
const Compass = ico('<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>');
const Repeat = ico('<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>');
const Briefcase = ico('<rect width="20" height="14" x="2" y="6" rx="2"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>');
const TrendingUp = ico('<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>');
const TrendingDown = ico('<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>');
const ShieldAlert = ico('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>');
const ClipboardList = ico('<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>');
const Download = ico('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>');
const Bell = ico('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>');
const Target = ico('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>');
const Activity = ico('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>');
const Megaphone = ico('<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>');
const Home = ico('<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>');
const MessageSquare = ico('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>');
const Send = ico('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>');
const Command = ico('<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>');
const Inbox = ico('<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>');
const MessageCircle = ico('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>');
const Hash = ico('<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>');
const Reply = ico('<polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>');
const AtSign = ico('<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>');
const Smile = ico('<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>');
const PinIcon = ico('<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 2-2V3H6v1a2 2 0 0 0 2 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>');
const ThumbsUp = ico('<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>');
const Send2 = ico('<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>');
const Video = ico('<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect x="2" y="7" width="14" height="10" rx="2"/>');
const FolderKanban = ico('<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/><path d="M8 10v4"/><path d="M12 10v2"/><path d="M16 10v6"/>');

/* ===== VIKINGBAD LOGO (inline SVG) ===== */
const VikingbadLogo = ({ width = 200, color = '#fff', style = {} }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 566.93 85.07"
       style={{ width, height: 'auto', display: 'block', flexShrink: 0, ...style }}
       fill={color} aria-label="Vikingbad">
    <path d="m143.11,47.04h0l32.88-31.76h-16.3l-29.2,28.24V15.28h-11.8v68.6h11.8v-24.63c9.17-6.26,15.47.77,18.11,4.31l14.72,20.32h14.71l-19.06-26.06c-1.82-2.49-7.61-10.6-15.86-10.78Z"/>
    <polygon points="267.95 65.53 235.22 15.59 235.01 15.28 221.76 15.28 221.76 83.89 233.52 83.89 233.52 33.35 266.56 83.89 279.72 83.89 279.72 15.28 267.95 15.28 267.95 65.53"/>
    <path d="M413.76,45.19c3.78-2.87,6.08-7.42,6.08-12.2,0-8.7-7.29-17.7-19.49-17.7h-24.7v68.61h27.56c12.95,0,22.71-9.21,22.71-21.43,0-7.66-4.73-14.3-12.16-17.27Zm-26.84-19.7h13.14c4.92,0,8.49,3.31,8.49,7.88s-3.65,7.88-8.49,7.88h-13.14v-15.75Zm15.9,48.2h-15.9v-22.34h15.9c6.84,0,11.82,4.68,11.82,11.12s-4.97,11.22-11.82,11.22Z"/>
    <path d="M459.24,15.28l-28.73,68.61h12.42l7.25-17.46h29.96l7.24,17.46h12.32l-28.63-68.61h-11.83Zm-4.56,40.28l10.48-25.12,10.47,25.12h-20.95Z"/>
    <path d="M531.6,15.28h-22.63v68.61h22.63c20.8,0,35.33-14.15,35.33-34.39s-14.53-34.21-35.33-34.21Zm0,57.74h-10.87V26.14h10.87c14.1,0,23.57,9.38,23.57,23.35s-9.48,23.53-23.57,23.53Z"/>
    <rect x="86.49" y="15.28" width="11.83" height="68.61"/>
    <rect x="188.28" y="15.28" width="11.83" height="68.61"/>
    <path d="M331.05,54.89h16.51v14.23c-3.98,3.12-9.91,4.98-15.94,4.98-14.33,0-25.12-10.53-25.12-24.51s10.76-24.51,25.03-24.51c6.69,0,13.21,1.82,18.42,5.14l.6.38,5.33-8.45-.46-.4c-5.62-4.94-14.27-7.66-24.37-7.66-20.91,0-36.69,15.26-36.69,35.49s15.81,35.49,36.79,35.49c11.69,0,21.4-3.67,28.07-10.63l.2-.2v-30.23h-28.37v10.89Z"/>
    <polygon points="48.5 9.24 37.95 0 27.42 9.24 37.95 31.31 48.5 9.24"/>
    <polygon points="37.96 67.65 12.88 15.28 0 15.28 31.91 83.89 32.02 83.89 43.89 83.89 44.01 83.89 75.92 15.28 63.04 15.28 37.96 67.65"/>
  </svg>
);

/* ===== THEME ===== */
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

/* ===== HELPERS ===== */
const uid = (p='id') => p+'_'+Math.random().toString(36).slice(2,9);
const fmtDate = (iso) => { if(!iso) return ''; return new Date(iso).toLocaleDateString('no-NO',{day:'numeric',month:'short',year:'numeric'}); };
const fmtDateLong = (iso) => { if(!iso) return ''; return new Date(iso).toLocaleDateString('no-NO',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); };
const daysFromNow = (iso) => { if(!iso) return 0; const t=new Date(); t.setHours(0,0,0,0); const x=new Date(iso); x.setHours(0,0,0,0); return Math.round((x-t)/86400000); };
const relativeDate = (iso) => { const d=daysFromNow(iso); if(d===0) return 'I dag'; if(d===1) return 'I morgen'; if(d===-1) return 'I går'; if(d>0&&d<=7) return `Om ${d} dager`; if(d<0&&d>=-7) return `For ${Math.abs(d)} dager siden`; return fmtDate(iso); };
const getWeek = (date) => { const d=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())); const n=d.getUTCDay()||7; d.setUTCDate(d.getUTCDate()+4-n); const ys=new Date(Date.UTC(d.getUTCFullYear(),0,1)); return Math.ceil((((d-ys)/86400000)+1)/7); };

const statusLabels = { planlagt:'Planlagt', gjennomført:'Gjennomført', avlyst:'Avlyst', vedtatt:'Vedtatt', utsatt:'Utsatt', forkastet:'Forkastet', ikke_startet:'Ikke startet', pågår:'Pågår', fullført:'Fullført', blokkert:'Blokkert', foreslått:'Innmeldt', akseptert:'Akseptert', avvist:'Avvist' };
const priorityLabels = { høy:'Høy', medium:'Medium', lav:'Lav' };

/* Sakskategorier for innmeldte saker */
const proposalCategoryLabels = { orientering:'Orientering', diskusjon:'Diskusjon', beslutning:'Beslutning', informasjon:'Informasjon' };
const proposalCategoryColor = (c) => ({
  orientering:{bg:theme.brassLight,fg:theme.brassDark},
  diskusjon:{bg:'#E0E5EB',fg:theme.navy},
  beslutning:{bg:theme.rustLight,fg:theme.rust},
  informasjon:{bg:theme.sageLight,fg:theme.sage},
}[c] || {bg:theme.surfaceAlt,fg:theme.inkSoft});

/* Relativ tid for chat-meldinger */
const fmtRelativeTime = (iso) => {
  if (!iso) return '';
  const now = new Date();
  const t = new Date(iso);
  const diff = Math.round((now - t) / 1000);
  if (diff < 30) return 'akkurat nå';
  if (diff < 60) return `${diff}s siden`;
  if (diff < 3600) return `${Math.floor(diff/60)}m siden`;
  if (diff < 86400) return `${Math.floor(diff/3600)}t siden`;
  const days = Math.floor(diff/86400);
  if (days === 1) return 'i går';
  if (days < 7) return `${days}d siden`;
  return t.toLocaleDateString('no-NO',{day:'numeric',month:'short'});
};
const fmtTime = (iso) => { if(!iso) return ''; return new Date(iso).toLocaleTimeString('no-NO',{hour:'2-digit',minute:'2-digit'}); };
const statusColor = (s) => ({
  planlagt:{bg:theme.brassLight,fg:theme.brassDark}, gjennomført:{bg:theme.sageLight,fg:theme.sage}, avlyst:{bg:theme.rustLight,fg:theme.rust},
  vedtatt:{bg:theme.sageLight,fg:theme.sage}, utsatt:{bg:theme.amberLight,fg:'#8B6914'}, forkastet:{bg:theme.rustLight,fg:theme.rust},
  ikke_startet:{bg:theme.surfaceAlt,fg:theme.inkSoft}, pågår:{bg:theme.amberLight,fg:'#8B6914'}, fullført:{bg:theme.sageLight,fg:theme.sage}, blokkert:{bg:theme.rustLight,fg:theme.rust},
  foreslått:{bg:theme.brassLight,fg:theme.brassDark}, akseptert:{bg:theme.sageLight,fg:theme.sage}, avvist:{bg:theme.rustLight,fg:theme.rust},
}[s] || {bg:theme.surfaceAlt,fg:theme.inkSoft});
const priorityColor = (p) => p==='høy'?theme.rust : p==='medium'?theme.brass : theme.inkMuted;

/* ===== SEED DATA ===== */
const seedData = () => {
  const today = new Date();
  const inDays = (d) => { const x=new Date(today); x.setDate(x.getDate()+d); return x.toISOString().slice(0,10); };
  return {
    initialized:true,
    org: {
      portalId:'leadership',
      portalName:'Ledergruppeportal',
      orgName:'Ledergruppen',
      teamLabel:'Ledergruppen',
      teamOverline:'Personene bak beslutningene',
      groupNoun:'ledergruppen',
      meetingNoun:'ledermøte',
      meetingNounDef:'ledermøtene',
      sectionStrategy:'Strategi & Plan',
      navPlans:'Årshjul',
      navInitiatives:'Initiativer',
      navTeam:'Ledergruppen',
      plansTitle:'Årshjul',
      plansOverline:'Rullerende 12 måneder fremover',
      initiativeTitle:'Initiativer',
      initiativeOverline:'Strategisk portefølje',
      initiativeNewBtn:'Nytt initiativ',
      initiativeNoun:'initiativ',
      initiativeEmpty:'Strategiske satsninger – større prosjekter med tydelig eier, fase og milepæler. Holder styr på det som beveger organisasjonen fremover.',
      proposalsOverline:'Saker til ledergruppemøtene',
      messagesOverline:'Internt rom for ledergruppen',
      decisionsSub:'Logg over vedtak fra ledergruppen',
      deskFooter:'Vikingbad ledergruppe',
      assistantScope:'Vikingbads ledergruppeportal',
      assistantContextHeader:'LEDERGRUPPEN',
      tip:'La hver leder fylle inn forberedelse 24t før møtet. Bruk «Brief meg» for å være klar.',
      planCategories: {
        strategi: { label: 'Strategi', color: '#1E3247', bg: '#E0E5EB' },
        økonomi:  { label: 'Økonomi',  color: '#9B7230', bg: '#F4E9D2' },
        hr:       { label: 'HR',       color: '#557758', bg: '#E5EEE3' },
        produkt:  { label: 'Produkt',  color: '#9B4836', bg: '#F3E0D8' },
        marked:   { label: 'Marked',   color: '#7B4D8C', bg: '#EDE3F2' },
        styre:    { label: 'Styre',    color: '#5C4A3A', bg: '#EBE4D9' },
        drift:    { label: 'Drift',    color: '#5C7B8A', bg: '#E0E8EB' },
      },
    },
    members: [
      { id:'svk', name:'Stein Viggo Karlsen',    role:'CEO',                email:'svk@vikingbad.no',              initials:'SV' },
      { id:'tm',  name:'Tonny Morewood',         role:'CIO',                email:'tonny@vikingbad.no',            initials:'TM' },
      { id:'ak',  name:'Arild Kaale',            role:'CMO',                email:'arild.kaale@vikingbad.no',      initials:'AK' },
      { id:'ghl', name:'Geir Håkon Lindhjem',    role:'Leder Salg',         email:'ghl@vikingbad.no',              initials:'GH' },
      { id:'om',  name:'Ørjan Moi',              role:'Strategisk ressurs', email:'orjan@vikingbad.no',            initials:'ØM' },
      { id:'sl',  name:'Snorre Larstad',         role:'CPO',                email:'snorre@vikingbad.no',           initials:'SL' },
      { id:'ee',  name:'Elisabeth Engler',       role:'Leder Innkjøp',      email:'elisabeth.engler@vikingbad.no', initials:'EE' },
    ],
    meetings: [],
    decisions: [],
    tasks: [],
    documents: [],
    plans: [],
    initiatives: [],
    projects: [],
    kpis: [],
    risks: [],
    agendaProposals: [],
    channels: [],
    messages: [],
    readState: {}
  };
};

/* ===== SEED DATA – MARKEDSAVDELINGEN ===== */
const seedMarketing = () => {
  const today = new Date();
  const inDays = (d) => { const x=new Date(today); x.setDate(x.getDate()+d); return x.toISOString().slice(0,10); };
  return {
    initialized:true,
    org: {
      portalId:'marketing',
      portalName:'Markedsportal',
      orgName:'Markedsavdelingen',
      teamLabel:'Markedsteamet',
      teamOverline:'Personene bak merkevaren',
      groupNoun:'markedsteamet',
      meetingNoun:'markedsmøte',
      meetingNounDef:'markedsmøtene',
      sectionStrategy:'Plan & Kampanjer',
      navPlans:'Markedsplan',
      navInitiatives:'Kampanjer',
      navTeam:'Markedsteamet',
      plansTitle:'Markedsplan',
      plansOverline:'Innholds- og kampanjekalender · 12 måneder',
      initiativeTitle:'Kampanjer',
      initiativeOverline:'Kampanjeportefølje',
      initiativeNewBtn:'Ny kampanje',
      initiativeNoun:'kampanje',
      initiativeEmpty:'Kampanjer er større markedssatsninger med eget budsjett, tidslinje og milepæler – fra brief til evaluering. Her holder dere oversikt over alt som er i gang.',
      proposalsOverline:'Saker til markedsmøtene',
      messagesOverline:'Internt rom for markedsteamet',
      decisionsSub:'Logg over vedtak i markedsteamet',
      deskFooter:'Vikingbad markedsavdeling',
      assistantScope:'Vikingbads markedsportal',
      assistantContextHeader:'MARKEDSTEAMET',
      tip:'Planlegg innhold i god tid. Bruk «Brief meg» før kampanje- og byråmøter.',
      planCategories: {
        kampanje: { label: 'Kampanje',         color: '#9B4836', bg: '#F3E0D8' },
        innhold:  { label: 'Innhold',          color: '#1E3247', bg: '#E0E5EB' },
        some:     { label: 'Sosiale medier',   color: '#7B4D8C', bg: '#EDE3F2' },
        epost:    { label: 'E-post',           color: '#9B7230', bg: '#F4E9D2' },
        pr:       { label: 'PR & presse',      color: '#557758', bg: '#E5EEE3' },
        event:    { label: 'Event & messe',    color: '#5C7B8A', bg: '#E0E8EB' },
        produkt:  { label: 'Produktlansering', color: '#5C4A3A', bg: '#EBE4D9' },
      },
    },
    members: [
      { id:'ak', name:'Arild Kaale',       role:'Markedssjef',            email:'arild.kaale@vikingbad.no',  initials:'AK' },
      { id:'ms', name:'Marte Sundby',      role:'Digital & performance',  email:'marte.sundby@vikingbad.no', initials:'MS' },
      { id:'ht', name:'Henrik Tangen',     role:'Innhold & sosiale medier',email:'henrik.tangen@vikingbad.no',initials:'HT' },
      { id:'is', name:'Ingrid Solheim',    role:'Merkevare & design',     email:'ingrid.solheim@vikingbad.no',initials:'IS' },
      { id:'je', name:'Jonas Eriksen',     role:'Markedskoordinator',     email:'jonas.eriksen@vikingbad.no',initials:'JE' },
      { id:'ka', name:'Kristine Aas',      role:'PR & kommunikasjon',     email:'kristine.aas@vikingbad.no', initials:'KA' },
      { id:'sb', name:'Sofie Berg',        role:'Web & e-handel',         email:'sofie.berg@vikingbad.no',   initials:'SB' },
    ],
    meetings: [],
    decisions: [],
    tasks: [],
    documents: [],
    plans: [],
    initiatives: [],
    projects: [],
    kpis: [],
    risks: [],
    agendaProposals: [],
    channels: [],
    messages: [],
    readState: {}
  };
};

/* ===== SEED DATA – SALGSAVDELINGEN ===== */
const seedSales = () => {
  const today = new Date();
  const inDays = (d) => { const x=new Date(today); x.setDate(x.getDate()+d); return x.toISOString().slice(0,10); };
  return {
    initialized:true,
    org: {
      portalId:'sales',
      portalName:'Salgsportal',
      orgName:'Salgsavdelingen',
      teamLabel:'Salgsteamet',
      teamOverline:'Personene som lukker salgene',
      groupNoun:'salgsteamet',
      meetingNoun:'salgsmøte',
      meetingNounDef:'salgsmøtene',
      sectionStrategy:'Plan & Pipeline',
      navPlans:'Salgskalender',
      navInitiatives:'Satsninger',
      navTeam:'Salgsteamet',
      plansTitle:'Salgskalender',
      plansOverline:'Aktiviteter, besøk og frister · 12 måneder',
      initiativeTitle:'Satsninger',
      initiativeOverline:'Salgssatsninger',
      initiativeNewBtn:'Ny satsning',
      initiativeNoun:'satsning',
      initiativeEmpty:'Satsninger er større salgsløft med eget mål, budsjett og milepæler – nye distrikter, key account-program, forhandlerrekruttering. Her holder dere oversikt over alt som er i gang.',
      proposalsOverline:'Saker til salgsmøtene',
      messagesOverline:'Internt rom for salgsteamet',
      decisionsSub:'Logg over vedtak i salgsteamet',
      deskFooter:'Vikingbad salgsavdeling',
      assistantScope:'Vikingbads salgsportal',
      assistantContextHeader:'SALGSTEAMET',
      tip:'Hold pipelinen fersk. Bruk «Brief meg» før kundebesøk og forhandlersamlinger.',
      planCategories: {
        kundebesøk: { label: 'Kundebesøk',      color: '#1E3247', bg: '#E0E5EB' },
        tilbud:     { label: 'Tilbud & anbud',  color: '#9B4836', bg: '#F3E0D8' },
        forhandler: { label: 'Forhandler',      color: '#557758', bg: '#E5EEE3' },
        kampanje:   { label: 'Salgskampanje',   color: '#9B7230', bg: '#F4E9D2' },
        messe:      { label: 'Messe & event',   color: '#7B4D8C', bg: '#EDE3F2' },
        opplæring:  { label: 'Opplæring',       color: '#5C7B8A', bg: '#E0E8EB' },
        rapport:    { label: 'Rapportering',    color: '#5C4A3A', bg: '#EBE4D9' },
      },
    },
    members: [
      { id:'ghl', name:'Geir Håkon Lindhjem', role:'Salgssjef',              email:'ghl@vikingbad.no',           initials:'GH' },
      { id:'tb',  name:'Thomas Berg',         role:'Key Account Manager',    email:'thomas.berg@vikingbad.no',   initials:'TB' },
      { id:'cn',  name:'Camilla Nguyen',      role:'Salgskonsulent Øst',     email:'camilla.nguyen@vikingbad.no',initials:'CN' },
      { id:'ah',  name:'Anders Holt',         role:'Salgskonsulent Vest',    email:'anders.holt@vikingbad.no',   initials:'AH' },
      { id:'lv',  name:'Lene Vik',            role:'Salgskonsulent Nord',    email:'lene.vik@vikingbad.no',      initials:'LV' },
      { id:'ps',  name:'Pål Strand',          role:'Innesalg & ordre',       email:'pal.strand@vikingbad.no',    initials:'PS' },
      { id:'md',  name:'Mona Dahl',           role:'Salgssupport',           email:'mona.dahl@vikingbad.no',     initials:'MD' },
    ],
    meetings: [],
    decisions: [],
    tasks: [],
    documents: [],
    plans: [],
    initiatives: [],
    projects: [],
    kpis: [],
    risks: [],
    agendaProposals: [],
    channels: [],
    messages: [],
    readState: {}
  };
};

/* ===== SEED DATA – INNKJØPSAVDELINGEN ===== */
const seedInnkjop = () => {
  const today = new Date();
  const inDays = (d) => { const x=new Date(today); x.setDate(x.getDate()+d); return x.toISOString().slice(0,10); };
  return {
    initialized:true,
    org: {
      portalId:'innkjop', portalName:'Innkjøpsportal', orgName:'Innkjøpsavdelingen',
      teamLabel:'Innkjøpsteamet', teamOverline:'Personene som sikrer leveransene',
      groupNoun:'innkjøpsteamet', meetingNoun:'innkjøpsmøte', meetingNounDef:'innkjøpsmøtene',
      sectionStrategy:'Plan & Forsyning', navPlans:'Innkjøpskalender', navInitiatives:'Satsninger', navTeam:'Innkjøpsteamet',
      plansTitle:'Innkjøpskalender', plansOverline:'Bestillinger, kontrakter og frister · 12 måneder',
      initiativeTitle:'Satsninger', initiativeOverline:'Innkjøpssatsninger', initiativeNewBtn:'Ny satsning', initiativeNoun:'satsning',
      initiativeEmpty:'Satsninger er større innkjøpsprosjekter med eget mål, budsjett og milepæler – kostnadsprogram, leverandørkonsolidering, nye rammeavtaler. Her holder dere oversikt over alt som er i gang.',
      proposalsOverline:'Saker til innkjøpsmøtene', messagesOverline:'Internt rom for innkjøpsteamet',
      decisionsSub:'Logg over vedtak i innkjøpsteamet', deskFooter:'Vikingbad innkjøp',
      assistantScope:'Vikingbads innkjøpsportal', assistantContextHeader:'INNKJØPSTEAMET',
      tip:'Hold kontraktsfrister og leverandørstatus oppdatert. Bruk «Brief meg» før forhandlinger.',
      planCategories: {
        bestilling:  { label:'Bestilling',           color:'#1E3247', bg:'#E0E5EB' },
        kontrakt:    { label:'Kontrakt & avtale',     color:'#9B7230', bg:'#F4E9D2' },
        forhandling: { label:'Forhandling',           color:'#9B4836', bg:'#F3E0D8' },
        leverandor:  { label:'Leverandøroppfølging',  color:'#557758', bg:'#E5EEE3' },
        lager:       { label:'Lager & logistikk',     color:'#5C7B8A', bg:'#E0E8EB' },
        kvalitet:    { label:'Kvalitet & revisjon',   color:'#7B4D8C', bg:'#EDE3F2' },
        rapport:     { label:'Rapportering',          color:'#5C4A3A', bg:'#EBE4D9' },
      },
    },
    members: [
      { id:'ee', name:'Elisabeth Engler', role:'Innkjøpsleder',                email:'elisabeth.engler@vikingbad.no', initials:'EE' },
      { id:'ho', name:'Hanne Os',         role:'Operativ innkjøper',           email:'hanne.os@vikingbad.no',         initials:'HO' },
      { id:'rj', name:'Rune Jakobsen',    role:'Kategoriansvarlig komponenter',email:'rune.jakobsen@vikingbad.no',    initials:'RJ' },
      { id:'ti', name:'Tone Iversen',     role:'Innkjøper emballasje & forbruk',email:'tone.iversen@vikingbad.no',    initials:'TI' },
      { id:'bk', name:'Bjørn Krogh',      role:'Sourcing Manager',             email:'bjorn.krogh@vikingbad.no',      initials:'BK' },
      { id:'sa', name:'Siri Aune',        role:'Innkjøpskoordinator',          email:'siri.aune@vikingbad.no',        initials:'SA' },
      { id:'fm', name:'Fredrik Moen',     role:'Kontrakt & avtaler',           email:'fredrik.moen@vikingbad.no',     initials:'FM' },
    ],
    meetings: [],
    decisions: [],
    tasks: [],
    documents: [],
    plans: [],
    initiatives: [],
    projects: [],
    kpis: [],
    risks: [],
    agendaProposals: [],
    channels: [],
    messages: [],
    readState: {}
  };
};

/* ===== SEED DATA – PRODUKT & SOURCING ===== */
const seedProdukt = () => {
  const today = new Date();
  const inDays = (d) => { const x=new Date(today); x.setDate(x.getDate()+d); return x.toISOString().slice(0,10); };
  return {
    initialized:true,
    org: {
      portalId:'produkt', portalName:'Produkt & Sourcing', orgName:'Produkt & Sourcing',
      teamLabel:'Produkt & Sourcing', teamOverline:'Produktutvikling og leverandørkjede',
      groupNoun:'teamet', meetingNoun:'avdelingsmøte', meetingNounDef:'avdelingsmøtene',
      sectionStrategy:'Plan & Portefølje', navPlans:'Kalender', navInitiatives:'Prosjekter', navTeam:'Produkt & Sourcing',
      plansTitle:'Produkt- & sourcingkalender', plansOverline:'Utvikling, lansering og leverandørarbeid · 12 måneder',
      initiativeTitle:'Prosjekter', initiativeOverline:'Prosjektportefølje', initiativeNewBtn:'Nytt prosjekt', initiativeNoun:'prosjekt',
      initiativeEmpty:'Prosjekter er produktsatsninger og sourcing-prosesser med egen tidslinje, budsjett og milepæler – fra konsept og design til lansering, og fra kvalifisering til ferdig leverandør. Her holder dere oversikt over alt som er i gang.',
      proposalsOverline:'Saker til avdelingsmøtene', messagesOverline:'Internt rom for produkt- og sourcing-teamet',
      decisionsSub:'Logg over vedtak i produkt- og sourcing-teamet', deskFooter:'Vikingbad produkt & sourcing',
      assistantScope:'Vikingbads portal for produkt og sourcing', assistantContextHeader:'PRODUKT & SOURCING-TEAMET',
      tip:'Hold milepæler, kvalitetskrav og leverandørstatus oppdatert. Bruk «Brief meg» før design-, sourcing- og lanseringsmøter.',
      planCategories: {
        konsept:       { label:'Konsept & idé',          color:'#9B7230', bg:'#F4E9D2' },
        design:        { label:'Design',                 color:'#7B4D8C', bg:'#EDE3F2' },
        utvikling:     { label:'Utvikling',              color:'#1E3247', bg:'#E0E5EB' },
        test:          { label:'Test & kvalitet',        color:'#557758', bg:'#E5EEE3' },
        lansering:     { label:'Lansering',              color:'#9B4836', bg:'#F3E0D8' },
        kvalifisering: { label:'Leverandørkvalifisering',color:'#5C7B8A', bg:'#E0E8EB' },
        revisjon:      { label:'Leverandørrevisjon',     color:'#B0533F', bg:'#F3E0D8' },
        baerekraft:    { label:'Bærekraft / ESG',        color:'#6B8A6E', bg:'#E5EEE3' },
        rapport:       { label:'Rapportering & portefølje',color:'#5C4A3A', bg:'#EBE4D9' },
      },
    },
    members: [
      { id:'sl', name:'Snorre Larstad',     role:'Produkt- & sourcingsjef',   email:'snorre@vikingbad.no',          initials:'SL' },
      { id:'kw', name:'Kari Wold',          role:'Produktutvikler (R&D)',     email:'kari.wold@vikingbad.no',       initials:'KW' },
      { id:'eo', name:'Erik Olsen',         role:'Industridesigner',          email:'erik.olsen@vikingbad.no',      initials:'EO' },
      { id:'nh', name:'Nina Haug',          role:'Kategoriansvarlig dusj',    email:'nina.haug@vikingbad.no',       initials:'NH' },
      { id:'tg', name:'Trond Gabrielsen',   role:'Kvalitet & test',           email:'trond.gabrielsen@vikingbad.no',initials:'TG' },
      { id:'ml', name:'Mari Lund',          role:'Teknisk dokumentasjon',     email:'mari.lund@vikingbad.no',       initials:'ML' },
      { id:'vs', name:'Vegard Sæther',      role:'Produktkoordinator',        email:'vegard.sather@vikingbad.no',   initials:'VS' },
      { id:'bk', name:'Bjørn Krogh',        role:'Leder Sourcing',            email:'bjorn.krogh@vikingbad.no',     initials:'BK' },
      { id:'gm', name:'Geir Madsen',        role:'Strategisk sourcing',       email:'geir.madsen@vikingbad.no',     initials:'GM' },
      { id:'aw', name:'Astrid Wang',        role:'Leverandørrevisor',         email:'astrid.wang@vikingbad.no',     initials:'AW' },
      { id:'dl', name:'Daniel Lie',         role:'Sourcing-analytiker',       email:'daniel.lie@vikingbad.no',      initials:'DL' },
      { id:'yk', name:'Yusuf Karim',        role:'International sourcing (Asia)',email:'yusuf.karim@vikingbad.no',   initials:'YK' },
      { id:'hb', name:'Heidi Borg',         role:'Bærekraft i leverandørkjede',email:'heidi.borg@vikingbad.no',     initials:'HB' },
      { id:'pn', name:'Petter Nordahl',     role:'Sourcing-koordinator',      email:'petter.nordahl@vikingbad.no',  initials:'PN' },
    ],
    meetings: [],
    decisions: [],
    tasks: [],
    documents: [],
    plans: [],
    initiatives: [],
    projects: [],
    kpis: [],
    risks: [],
    agendaProposals: [],
    channels: [],
    messages: [],
    readState: {}
  };
};

/* ===== PORTALREGISTER & TILGANGSSTYRING ===== */
/* Hvilke portaler hver person har tilgang til. Broer: CMO (ak)→marked, salgssjef (ghl)→salg,
   innkjøpsleder (ee)→innkjøp, produktsjef (sl)→produkt&sourcing, sourcingleder (bk): innkjøp↔produkt&sourcing. */
const portalAccess = {
  svk:['leadership'], tm:['leadership'], om:['leadership'],
  ak:['leadership','marketing'],
  ghl:['leadership','sales'],
  ee:['leadership','innkjop'],
  sl:['leadership','produkt'],
  ms:['marketing'], ht:['marketing'], is:['marketing'], je:['marketing'], ka:['marketing'], sb:['marketing'],
  tb:['sales'], cn:['sales'], ah:['sales'], lv:['sales'], ps:['sales'], md:['sales'],
  ho:['innkjop'], rj:['innkjop'], ti:['innkjop'], sa:['innkjop'], fm:['innkjop'],
  bk:['innkjop','produkt'],
  kw:['produkt'], eo:['produkt'], nh:['produkt'], tg:['produkt'], ml:['produkt'], vs:['produkt'],
  gm:['produkt'], aw:['produkt'], dl:['produkt'], yk:['produkt'], hb:['produkt'], pn:['produkt'],
};
const portalMeta = {
  leadership: { id:'leadership', name:'Ledergruppen',     subtitle:'Ledergruppeportal', desc:'Strategi, beslutninger og styring', icon:'shield',    restricted:true  },
  marketing:  { id:'marketing',  name:'Markedsavdelingen', subtitle:'Markedsportal',     desc:'Kampanjer, innhold og merkevare',   icon:'megaphone', restricted:false },
  sales:      { id:'sales',      name:'Salgsavdelingen',   subtitle:'Salgsportal',       desc:'Pipeline, forhandlere og ordre',    icon:'trending',  restricted:false },
  innkjop:    { id:'innkjop',    name:'Innkjøpsavdelingen',subtitle:'Innkjøpsportal',    desc:'Leverandører, kontrakter og forsyning', icon:'clipboard', restricted:false },
  produkt:    { id:'produkt',    name:'Produkt & Sourcing',subtitle:'Produkt & Sourcing',desc:'Utvikling, design, lansering og leverandørkjede', icon:'compass', restricted:false },
};

/* ===== TVERRGÅENDE PROGRAMMER (kobler avdelingene sammen) ===== */
/* Felles satsninger som flere avdelinger bidrar til. Items i hver portal er merket med program-id. */
const programs = [];
const programById = (id) => programs.find(p => p.id === id);

/* Overleveringer / avhengigheter MELLOM avdelinger – selve koordineringen.
   from/to = portal-id, owner ∈ from-avdeling, recipient ∈ to-avdeling. dueOffset = dager fra i dag. */
const programHandoffs = [];
const isoFromOffset = (n) => { const d=new Date(); d.setDate(d.getDate()+(n||0)); return d.toISOString().slice(0,10); };
const handoffMeta = (h) => {
  const overdue = h.status!=='levert' && daysFromNow(isoFromOffset(h.dueOffset)) < 0;
  if (h.status==='levert')   return { label:'Levert',    bg:theme.sageLight,  fg:theme.sage,     overdue:false };
  if (overdue || h.status==='forsinket') return { label:'Forsinket', bg:theme.rustLight, fg:theme.rust, overdue:true };
  if (h.status==='pågår')    return { label:'Pågår',     bg:theme.amberLight, fg:'#8B6914',      overdue:false };
  return { label:'Venter',   bg:theme.brassLight, fg:theme.brassDark, overdue:false };
};
const portalShort = (pid) => (portalMeta[pid]?.name||pid).replace('avdelingen','').replace('gruppen','gruppe').replace('Produkt & Sourcing','Produkt');

/* ===== PRIMITIVES ===== */
const Pill = ({ children, color, bg, style={} }) => (
  <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:999,fontSize:11,fontWeight:600,letterSpacing:0.3,textTransform:'uppercase',color:color||theme.inkSoft,background:bg||theme.surfaceAlt,...style}}>{children}</span>
);

const Btn = ({ children, onClick, variant='primary', size='md', icon:Icon, type='button', style={}, disabled }) => {
  const variants = {
    primary:{bg:theme.navy,fg:'#fff',border:theme.navy,hov:theme.navyDark},
    brass:  {bg:theme.brass,fg:'#fff',border:theme.brass,hov:theme.brassDark},
    ghost:  {bg:'transparent',fg:theme.ink,border:theme.border,hov:theme.surfaceAlt},
    danger: {bg:'transparent',fg:theme.rust,border:theme.rustLight,hov:theme.rustLight},
    text:   {bg:'transparent',fg:theme.inkSoft,border:'transparent',hov:theme.surfaceAlt},
  };
  const sizes = { sm:{px:10,py:6,fs:12}, md:{px:16,py:9,fs:13}, lg:{px:22,py:12,fs:14} };
  const v=variants[variant], s=sizes[size];
  const [hov,setHov]=useState(false);
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:'inline-flex',alignItems:'center',gap:6,padding:`${s.py}px ${s.px}px`,fontSize:s.fs,fontWeight:600,
        background:hov&&!disabled?v.hov:v.bg,color:v.fg,border:`1px solid ${v.border}`,borderRadius:8,
        cursor:disabled?'not-allowed':'pointer',opacity:disabled?0.5:1,fontFamily:'inherit',transition:'all 120ms ease',letterSpacing:0.2,...style}}>
      {Icon && <Icon size={s.fs+2}/>}{children}
    </button>
  );
};

const TextField = ({ label, value, onChange, type='text', placeholder, required, multiline, rows=3, style={} }) => (
  <label style={{display:'block',marginBottom:14,...style}}>
    {label && <div style={{fontSize:11,fontWeight:700,color:theme.inkSoft,textTransform:'uppercase',letterSpacing:0.6,marginBottom:6}}>
      {label}{required && <span style={{color:theme.rust}}> *</span>}
    </div>}
    {multiline ? (
      <textarea value={value||''} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{width:'100%',padding:'10px 12px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:14,fontFamily:'inherit',background:theme.surface,color:theme.ink,resize:'vertical',outline:'none',transition:'border 120ms',boxSizing:'border-box'}}
        onFocus={(e)=>e.target.style.borderColor=theme.brass} onBlur={(e)=>e.target.style.borderColor=theme.border}/>
    ) : (
      <input type={type} value={value||''} onChange={(e)=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',padding:'10px 12px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:14,fontFamily:'inherit',background:theme.surface,color:theme.ink,outline:'none',boxSizing:'border-box'}}
        onFocus={(e)=>e.target.style.borderColor=theme.brass} onBlur={(e)=>e.target.style.borderColor=theme.border}/>
    )}
  </label>
);

const Sel = ({ label, value, onChange, options, required }) => (
  <label style={{display:'block',marginBottom:14}}>
    {label && <div style={{fontSize:11,fontWeight:700,color:theme.inkSoft,textTransform:'uppercase',letterSpacing:0.6,marginBottom:6}}>
      {label}{required && <span style={{color:theme.rust}}> *</span>}
    </div>}
    <select value={value||''} onChange={(e)=>onChange(e.target.value)}
      style={{width:'100%',padding:'10px 12px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:14,fontFamily:'inherit',background:theme.surface,color:theme.ink,outline:'none',cursor:'pointer',boxSizing:'border-box'}}>
      <option value="">— Velg —</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </label>
);

const Modal = ({ open, onClose, title, children, width=640 }) => {
  if (!open) return null;
  return (
    <div onClick={onClose}
      style={{position:'fixed',inset:0,background:'rgba(26,36,51,0.45)',backdropFilter:'blur(4px)',zIndex:100,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'60px 20px 20px',overflow:'auto'}}>
      <div onClick={(e)=>e.stopPropagation()}
        style={{background:theme.surface,borderRadius:14,width:'100%',maxWidth:width,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',overflow:'hidden',animation:'modalIn 220ms ease'}}>
        <div style={{padding:'20px 28px',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',alignItems:'center',justifyContent:'space-between',background:theme.surfaceAlt}}>
          <h2 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:22,fontWeight:500,color:theme.ink,margin:0,letterSpacing:-0.3}}>{title}</h2>
          <button onClick={onClose} style={{background:'transparent',border:'none',cursor:'pointer',padding:6,borderRadius:6,display:'flex',color:theme.inkSoft}}>
            <X size={20}/>
          </button>
        </div>
        <div style={{padding:'24px 28px'}}>{children}</div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon:Icon, title, message, action }) => (
  <div style={{textAlign:'center',padding:'60px 20px',color:theme.inkMuted}}>
    <div style={{width:64,height:64,borderRadius:'50%',background:theme.surfaceAlt,display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:16,color:theme.brass}}>
      <Icon size={28}/>
    </div>
    <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:22,fontWeight:500,color:theme.ink,margin:'0 0 8px'}}>{title}</h3>
    <p style={{fontSize:14,margin:'0 0 20px',maxWidth:380,marginLeft:'auto',marginRight:'auto'}}>{message}</p>
    {action}
  </div>
);

const SectionHeading = ({ overline, title, children }) => (
  <div style={{marginBottom:28,display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
    <div>
      {overline && <div style={{fontSize:11,fontWeight:700,color:theme.brass,letterSpacing:1.5,textTransform:'uppercase',marginBottom:6}}>{overline}</div>}
      <h1 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:38,fontWeight:400,color:theme.ink,margin:0,letterSpacing:-0.8,lineHeight:1.1}}>{title}</h1>
    </div>
    <div style={{display:'flex',gap:8,alignItems:'center'}}>{children}</div>
  </div>
);

const Card = ({ children, onClick, style={}, padded=true }) => {
  const [hov,setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:12,padding:padded?20:0,
        cursor:onClick?'pointer':'default',transition:'all 150ms ease',
        boxShadow:hov&&onClick?'0 6px 20px rgba(26,36,51,0.08)':'0 1px 2px rgba(26,36,51,0.03)',
        transform:hov&&onClick?'translateY(-1px)':'none',...style}}>
      {children}
    </div>
  );
};

const Avatar = ({ member, size=36 }) => {
  if (!member) return (
    <div style={{width:size,height:size,borderRadius:'50%',background:theme.surfaceAlt,display:'flex',alignItems:'center',justifyContent:'center',color:theme.inkMuted,fontSize:size*0.4,fontWeight:600}}>?</div>
  );
  const palette = ['#1E3247','#B8893B','#6B8A6E','#B0533F','#8B6914','#5C7B8A'];
  const idx = member.id ? member.id.charCodeAt(member.id.length-1) % palette.length : 0;
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:palette[idx],display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:size*0.38,fontWeight:600,letterSpacing:0.5,flexShrink:0}}
      title={`${member.name} – ${member.role}`}>
      {member.initials || member.name?.slice(0,2).toUpperCase()}
    </div>
  );
};

const FilterTabs = ({ value, onChange, options }) => (
  <div style={{display:'inline-flex',background:theme.surfaceAlt,padding:4,borderRadius:9,border:`1px solid ${theme.borderSoft}`}}>
    {options.map(o => (
      <button key={o.value} onClick={()=>onChange(o.value)}
        style={{padding:'7px 14px',fontSize:13,fontWeight:600,fontFamily:'inherit',
          background:value===o.value?theme.surface:'transparent',color:value===o.value?theme.ink:theme.inkSoft,
          border:'none',borderRadius:6,cursor:'pointer',
          boxShadow:value===o.value?'0 1px 3px rgba(0,0,0,0.08)':'none',transition:'all 120ms'}}>
        {o.label}
      </button>
    ))}
  </div>
);

/* ===== SIDEBAR ===== */
const Sidebar = ({ active, onChange, counts, currentUserId, members, onSwitchUser, onSearch, org={}, availablePortals=[], activePortal, onSwitchPortal, onLogout, showAdmin }) => {
  const me = members.find(m => m.id === currentUserId);
  const sections = [
    { label: null, items: [
      { key:'desk',       label:'Mitt skrivebord', icon:Home },
      { key:'dashboard',  label:'Oversikt',        icon:LayoutDashboard },
      { key:'crossorg',   label:'På tvers',        icon:Command, count:counts.crossorg },
    ]},
    { label: org.sectionStrategy || 'Strategi & Plan', items: [
      { key:'plans',       label:org.navPlans || 'Årshjul',           icon:Compass,    count:counts.plans },
      { key:'initiatives', label:org.navInitiatives || 'Initiativer', icon:Briefcase,  count:counts.initiatives },
      { key:'projects',    label:'Prosjekter',   icon:FolderKanban, count:counts.projects },
      { key:'kpis',        label:'Nøkkeltall',   icon:TrendingUp, count:counts.kpis },
      { key:'risks',       label:'Risiko',       icon:ShieldAlert,count:counts.risks },
    ]},
    { label: 'Møter & Beslutninger', items: [
      { key:'meetings',    label:'Møter',          icon:Calendar,   count:counts.meetings },
      { key:'proposals',   label:'Innmeldte saker',icon:Inbox,      count:counts.proposals },
      { key:'decisions',   label:'Beslutninger',   icon:Gavel,      count:counts.decisions },
      { key:'tasks',       label:'Oppgaver',       icon:ListTodo,   count:counts.tasks },
    ]},
    { label: 'Samarbeid', items: [
      { key:'messages',    label:'Samtaler',     icon:MessageCircle, count:counts.unreadMessages },
    ]},
    { label: 'Ressurser', items: [
      { key:'documents',   label:'Dokumenter',   icon:Folder,     count:counts.documents },
      { key:'team',        label:org.navTeam || 'Ledergruppen', icon:Users, count:counts.team },
    ]},
    ...(showAdmin ? [{ label: 'System', items: [
      { key:'admin', label:'Admin', icon:ShieldAlert },
    ]}] : []),
  ];
  const canSwitch = availablePortals.length > 1;
  return (
    <aside style={{width:260,background:theme.navyDark,color:'#E8DFC8',minHeight:'100vh',padding:'24px 0 0',position:'sticky',top:0,alignSelf:'flex-start',flexShrink:0,display:'flex',flexDirection:'column',borderRight:`1px solid ${theme.navyDark}`}}>
      <div style={{padding:'0 24px 18px',borderBottom:'1px solid rgba(232,223,200,0.1)'}}>
        <VikingbadLogo width={200} color="#fff"/>
        <div style={{fontSize:11,color:'#A89978',letterSpacing:1.8,textTransform:'uppercase',fontWeight:600,marginTop:10,paddingLeft:2}}>
          {org.portalName || 'Ledergruppeportal'}
        </div>
      </div>

      {/* Portalbytter – kun for de som har tilgang til flere portaler */}
      {canSwitch && (
        <div style={{padding:'12px 14px 0'}}>
          <div style={{display:'flex',gap:6,background:'rgba(0,0,0,0.18)',borderRadius:9,padding:4}}>
            {availablePortals.map(pid => {
              const isOn = pid === activePortal;
              const nav = { leadership:{Icon:ShieldAlert,label:'Ledelse'}, marketing:{Icon:Megaphone,label:'Marked'}, sales:{Icon:TrendingUp,label:'Salg'}, innkjop:{Icon:ClipboardList,label:'Innkjøp'}, produkt:{Icon:Compass,label:'Produkt'} }[pid] || {Icon:LayoutDashboard,label:portalMeta[pid]?.name||pid};
              const NavIcon = nav.Icon;
              return (
                <button key={pid} onClick={()=>{ if(!isOn) onSwitchPortal?.(pid); }}
                  style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'7px 6px',borderRadius:6,
                    background:isOn?theme.brass:'transparent',color:isOn?'#fff':'#C8BB99',
                    border:'none',cursor:isOn?'default':'pointer',fontFamily:'inherit',fontSize:11.5,fontWeight:700,letterSpacing:0.2,transition:'all 120ms'}}
                  onMouseEnter={(e)=>{ if(!isOn) e.currentTarget.style.background='rgba(184,137,59,0.18)'; }}
                  onMouseLeave={(e)=>{ if(!isOn) e.currentTarget.style.background='transparent'; }}>
                  <NavIcon size={13}/>
                  {nav.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bruker-velger */}
      <div style={{padding:'14px 14px 10px',borderBottom:'1px solid rgba(232,223,200,0.08)'}}>
        <button onClick={onSwitchUser}
          style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',width:'100%',borderRadius:8,background:'rgba(184,137,59,0.08)',border:'1px solid rgba(184,137,59,0.15)',cursor:'pointer',fontFamily:'inherit',textAlign:'left',transition:'all 120ms'}}
          onMouseEnter={(e)=>e.currentTarget.style.background='rgba(184,137,59,0.15)'}
          onMouseLeave={(e)=>e.currentTarget.style.background='rgba(184,137,59,0.08)'}>
          {me ? <Avatar member={me} size={32}/> : <div style={{width:32,height:32,borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',color:'#A89978'}}><Users size={14}/></div>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:10,color:'#A89978',letterSpacing:0.6,textTransform:'uppercase',fontWeight:600}}>Pålogget som</div>
            <div style={{fontSize:13,color:'#fff',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{me?me.name.split(' ').slice(0,2).join(' '):'Velg bruker'}</div>
          </div>
          <ChevronRight size={14} style={{color:'#A89978'}}/>
        </button>
      </div>

      {/* Søk */}
      <div style={{padding:'10px 14px'}}>
        <button onClick={onSearch}
          style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',width:'100%',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',cursor:'pointer',fontFamily:'inherit',color:'#A89978',fontSize:13,fontWeight:500,transition:'all 120ms'}}
          onMouseEnter={(e)=>{e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff';}}
          onMouseLeave={(e)=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#A89978';}}>
          <Search size={14}/>
          <span style={{flex:1,textAlign:'left'}}>Søk i portalen…</span>
          <span style={{fontSize:10,fontFamily:'monospace',padding:'1px 5px',background:'rgba(255,255,255,0.08)',borderRadius:3,letterSpacing:0.5}}>⌘K</span>
        </button>
      </div>

      <nav style={{padding:'8px 14px',flex:1,overflowY:'auto'}}>
        {sections.map((sec,si) => (
          <div key={si} style={{marginBottom: si === sections.length-1 ? 0 : 14}}>
            {sec.label && (
              <div style={{fontSize:10,color:'#7B6F50',letterSpacing:1.5,textTransform:'uppercase',fontWeight:700,padding:'8px 10px 6px'}}>
                {sec.label}
              </div>
            )}
            {sec.items.map(it => {
              const isActive = active === it.key;
              return (
                <button key={it.key} onClick={()=>onChange(it.key)}
                  style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',width:'100%',borderRadius:8,
                    background:isActive?theme.brass:'transparent',color:isActive?'#fff':'#D0C4A4',
                    border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:13.5,fontWeight:isActive?600:500,
                    marginBottom:1,textAlign:'left',transition:'all 120ms',letterSpacing:0.1}}
                  onMouseEnter={(e)=>{ if(!isActive) e.currentTarget.style.background='rgba(184,137,59,0.12)'; }}
                  onMouseLeave={(e)=>{ if(!isActive) e.currentTarget.style.background='transparent'; }}>
                  <it.icon size={16}/>
                  <span style={{flex:1}}>{it.label}</span>
                  {it.count!=null && it.count>0 && (
                    <span style={{background:isActive?'rgba(255,255,255,0.22)':'rgba(184,137,59,0.2)',color:isActive?'#fff':'#D0AC6E',fontSize:11,fontWeight:700,padding:'2px 7px',borderRadius:999,minWidth:20,textAlign:'center'}}>
                      {it.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div style={{padding:'0 14px 14px'}}>
        <div style={{background:'rgba(184,137,59,0.08)',border:'1px solid rgba(184,137,59,0.15)',borderRadius:10,padding:'14px 16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            <Sparkles size={14} style={{color:theme.brass}}/>
            <div style={{fontSize:11,color:theme.brass,letterSpacing:1,textTransform:'uppercase',fontWeight:700}}>Tips</div>
          </div>
          <div style={{fontSize:12.5,color:'#C8BB99',lineHeight:1.5}}>
            {org.tip || 'La hver leder fylle inn forberedelse 24t før møtet. Bruk «Brief meg» for å være klar.'}
          </div>
        </div>
        <button onClick={onLogout}
          style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',marginTop:10,padding:'9px 12px',borderRadius:8,background:'transparent',border:'1px solid rgba(232,223,200,0.12)',color:'#A89978',cursor:'pointer',fontFamily:'inherit',fontSize:12.5,fontWeight:600,transition:'all 120ms'}}
          onMouseEnter={(e)=>{ e.currentTarget.style.background='rgba(176,83,63,0.15)'; e.currentTarget.style.color='#E6B5A8'; }}
          onMouseLeave={(e)=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#A89978'; }}>
          <ExternalLink size={14}/> Logg ut
        </button>
      </div>
    </aside>
  );
};

/* ===== KPI CARD ===== */
const KPI = ({ label, value, sub, accent, icon:Icon, onClick, subColor }) => (
  <Card onClick={onClick}>
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:12}}>
      <div style={{width:38,height:38,borderRadius:10,background:accent,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}>
        <Icon size={18}/>
      </div>
    </div>
    <div style={{fontFamily:'Fraunces, Georgia, serif',fontSize:36,fontWeight:400,color:theme.ink,lineHeight:1,marginBottom:4,letterSpacing:-1}}>{value}</div>
    <div style={{fontSize:13,color:theme.inkSoft,fontWeight:600}}>{label}</div>
    {sub && <div style={{fontSize:11.5,color:subColor||theme.inkMuted,marginTop:4}}>{sub}</div>}
  </Card>
);

/* ===== TASK ROW ===== */
const TaskRow = ({ task, member, compact, onToggle, onClick }) => {
  const overdue = task.status !== 'fullført' && daysFromNow(task.dueDate) < 0;
  const sc = statusColor(task.status);
  return (
    <div onClick={onClick}
      style={{padding:compact?'12px 22px':'16px 22px',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',alignItems:'flex-start',gap:12,cursor:onClick?'pointer':'default',transition:'background 100ms'}}
      onMouseEnter={(e)=>{ if(onClick) e.currentTarget.style.background=theme.surfaceAlt; }}
      onMouseLeave={(e)=>{ if(onClick) e.currentTarget.style.background='transparent'; }}>
      <button onClick={(e)=>{ e.stopPropagation(); onToggle?.(); }}
        style={{background:'transparent',border:'none',cursor:'pointer',padding:0,marginTop:1,color:task.status==='fullført'?theme.sage:theme.inkMuted,flexShrink:0}}>
        {task.status === 'fullført' ? <CheckCircle2 size={20}/> : <Circle size={20}/>}
      </button>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:600,color:theme.ink,marginBottom:4,
          textDecoration:task.status==='fullført'?'line-through':'none',
          opacity:task.status==='fullført'?0.55:1}}>{task.title}</div>
        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap',fontSize:12,color:theme.inkMuted}}>
          {task.dueDate && (
            <span style={{color:overdue?theme.rust:theme.inkMuted,fontWeight:overdue?600:500,display:'inline-flex',alignItems:'center',gap:4}}>
              {overdue && <AlertCircle size={12}/>}{relativeDate(task.dueDate)}
            </span>
          )}
          {task.priority && task.priority !== 'medium' && (
            <span style={{color:priorityColor(task.priority),fontWeight:600,textTransform:'uppercase',letterSpacing:0.5,fontSize:10}}>
              {priorityLabels[task.priority]} prio
            </span>
          )}
          {!compact && <Pill bg={sc.bg} color={sc.fg}>{statusLabels[task.status]}</Pill>}
        </div>
      </div>
      {member && <Avatar member={member} size={28}/>}
    </div>
  );
};

/* ===== DASHBOARD ===== */
const Dashboard = ({ data, onNavigate, save }) => {
  const upcomingMeetings = data.meetings.filter(m=>m.status==='planlagt'&&daysFromNow(m.date)>=0).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
  const pendingTasks = data.tasks.filter(t=>t.status!=='fullført').sort((a,b)=>(a.dueDate||'').localeCompare(b.dueDate||''));
  const overdueTasks = pendingTasks.filter(t=>daysFromNow(t.dueDate)<0);
  const recentDecisions = [...data.decisions].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,4);
  const nextMeeting = upcomingMeetings[0];
  const memberById = (id) => data.members.find(m=>m.id===id);

  return (
    <div>
      <SectionHeading overline="Velkommen tilbake" title="Oversikt"/>
      {nextMeeting && (
        <Card style={{marginBottom:24,padding:0,overflow:'hidden',background:`linear-gradient(135deg, ${theme.navy} 0%, ${theme.navyDark} 100%)`,color:'#fff',border:'none'}}>
          <div style={{padding:28,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:'rgba(184,137,59,0.12)'}}/>
            <div style={{position:'absolute',bottom:-60,right:80,width:140,height:140,borderRadius:'50%',background:'rgba(184,137,59,0.06)'}}/>
            <div style={{position:'relative'}}>
              <div style={{fontSize:11,color:theme.brass,letterSpacing:1.5,textTransform:'uppercase',fontWeight:700,marginBottom:8}}>
                Neste møte · {relativeDate(nextMeeting.date)}
              </div>
              <h2 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:30,fontWeight:400,margin:'0 0 16px',letterSpacing:-0.5}}>
                {nextMeeting.title}
              </h2>
              <div style={{display:'flex',gap:24,flexWrap:'wrap',marginBottom:20,opacity:0.85,fontSize:14}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}><CalendarClock size={16}/> {fmtDateLong(nextMeeting.date)} · {nextMeeting.time}</div>
                <div style={{display:'flex',alignItems:'center',gap:8}}><MapPin size={16}/> {nextMeeting.location}</div>
                <div style={{display:'flex',alignItems:'center',gap:8}}><Clock size={16}/> {nextMeeting.duration} min</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
                <Btn onClick={()=>onNavigate('meetings',nextMeeting.id)} variant="brass" icon={ArrowRight}>Åpne møtet</Btn>
                <div style={{display:'flex'}}>
                  {nextMeeting.attendees.slice(0,6).map((id,i) => {
                    const m = memberById(id);
                    return <div key={id} style={{marginLeft:i===0?0:-8,border:`2px solid ${theme.navyDark}`,borderRadius:'50%'}}><Avatar member={m} size={32}/></div>;
                  })}
                </div>
                <span style={{fontSize:13,color:'rgba(255,255,255,0.7)'}}>{nextMeeting.attendees.length} deltakere</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:16,marginBottom:32}}>
        <KPI label="Åpne oppgaver" value={pendingTasks.length} accent={theme.brass} icon={ListTodo}
          sub={overdueTasks.length>0?`${overdueTasks.length} forfalt`:'Alt på sporet'}
          subColor={overdueTasks.length>0?theme.rust:theme.sage}
          onClick={()=>onNavigate('tasks')}/>
        <KPI label="Kommende møter" value={upcomingMeetings.length} accent={theme.navy} icon={Calendar}
          sub={nextMeeting?relativeDate(nextMeeting.date):'Ingen planlagt'} onClick={()=>onNavigate('meetings')}/>
        <KPI label="Beslutninger" value={data.decisions.length} accent={theme.sage} icon={Gavel}
          sub={data.decisions.filter(d=>d.status==='vedtatt').length+' vedtatt'} onClick={()=>onNavigate('decisions')}/>
        <KPI label="Dokumenter" value={data.documents.length} accent={theme.amber} icon={Folder}
          sub="I delt arkiv" onClick={()=>onNavigate('documents')}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(360px, 1fr))',gap:24}}>
        <Card padded={false}>
          <div style={{padding:'18px 22px',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:20,fontWeight:500,color:theme.ink,margin:0}}>Prioriterte oppgaver</h3>
              <div style={{fontSize:12,color:theme.inkMuted,marginTop:2}}>{pendingTasks.length} åpne · {overdueTasks.length} forfalt</div>
            </div>
            <button onClick={()=>onNavigate('tasks')} style={{background:'transparent',border:'none',color:theme.brass,fontSize:12,fontWeight:600,letterSpacing:0.4,textTransform:'uppercase',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontFamily:'inherit'}}>
              Vis alle <ChevronRight size={14}/>
            </button>
          </div>
          <div>
            {pendingTasks.slice(0,5).map(task => (
              <TaskRow key={task.id} task={task} member={memberById(task.owner)} compact
                onToggle={()=>{ const n=task.status==='fullført'?'pågår':'fullført'; save({...data,tasks:data.tasks.map(t=>t.id===task.id?{...t,status:n}:t)}); }}/>
            ))}
            {pendingTasks.length===0 && <div style={{padding:30,textAlign:'center',color:theme.inkMuted,fontSize:14}}>Ingen åpne oppgaver – godt jobbet 🎉</div>}
          </div>
        </Card>

        <Card padded={false}>
          <div style={{padding:'18px 22px',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:20,fontWeight:500,color:theme.ink,margin:0}}>Siste beslutninger</h3>
              <div style={{fontSize:12,color:theme.inkMuted,marginTop:2}}>{data.org?.decisionsSub || 'Logg over vedtak fra ledergruppen'}</div>
            </div>
            <button onClick={()=>onNavigate('decisions')} style={{background:'transparent',border:'none',color:theme.brass,fontSize:12,fontWeight:600,letterSpacing:0.4,textTransform:'uppercase',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontFamily:'inherit'}}>
              Vis alle <ChevronRight size={14}/>
            </button>
          </div>
          <div>
            {recentDecisions.map((d,i) => {
              const m = memberById(d.owner); const sc = statusColor(d.status);
              return (
                <div key={d.id} style={{padding:'14px 22px',borderBottom:i<recentDecisions.length-1?`1px solid ${theme.borderSoft}`:'none',display:'flex',alignItems:'flex-start',gap:12}}>
                  <div style={{width:4,alignSelf:'stretch',background:sc.fg,borderRadius:2,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,color:theme.ink,marginBottom:4}}>{d.title}</div>
                    <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',fontSize:12,color:theme.inkMuted}}>
                      <span>{fmtDate(d.date)}</span>{m && <span>· Eier: {m.name}</span>}
                      <Pill bg={sc.bg} color={sc.fg}>{statusLabels[d.status]||d.status}</Pill>
                    </div>
                  </div>
                </div>
              );
            })}
            {recentDecisions.length===0 && <div style={{padding:30,textAlign:'center',color:theme.inkMuted,fontSize:14}}>Ingen beslutninger registrert ennå</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ===== MEETING CARD ===== */
const MeetingCard = ({ meeting, data, onClick }) => {
  const sc = statusColor(meeting.status);
  const attendeeMembers = meeting.attendees.map(id=>data.members.find(m=>m.id===id)).filter(Boolean);
  const totalDuration = meeting.agenda?.reduce((sum,a)=>sum+(a.duration||0),0) || 0;
  return (
    <Card onClick={onClick}>
      <div style={{display:'flex',alignItems:'flex-start',gap:20}}>
        <div style={{background:theme.surfaceAlt,padding:'12px 18px',borderRadius:10,textAlign:'center',minWidth:78,border:`1px solid ${theme.borderSoft}`}}>
          <div style={{fontSize:11,color:theme.brass,textTransform:'uppercase',fontWeight:700,letterSpacing:1,marginBottom:2}}>
            {new Date(meeting.date).toLocaleDateString('no-NO',{month:'short'})}
          </div>
          <div style={{fontFamily:'Fraunces, Georgia, serif',fontSize:28,fontWeight:500,color:theme.ink,lineHeight:1,letterSpacing:-0.5}}>
            {new Date(meeting.date).getDate()}
          </div>
          <div style={{fontSize:11,color:theme.inkMuted,marginTop:4}}>{meeting.time}</div>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:8,flexWrap:'wrap'}}>
            <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:20,fontWeight:500,color:theme.ink,margin:0,letterSpacing:-0.3,flex:1,minWidth:0}}>
              {meeting.title}
            </h3>
            <Pill bg={sc.bg} color={sc.fg}>{statusLabels[meeting.status]}</Pill>
          </div>
          <div style={{display:'flex',gap:18,flexWrap:'wrap',fontSize:13,color:theme.inkSoft,marginBottom:12}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:5}}><MapPin size={14}/> {meeting.location||'Ikke satt'}</span>
            <span style={{display:'inline-flex',alignItems:'center',gap:5}}><Clock size={14}/> {totalDuration||meeting.duration} min</span>
            <span style={{display:'inline-flex',alignItems:'center',gap:5}}><ListTodo size={14}/> {meeting.agenda?.length||0} agendapunkter</span>
            {meeting.video?.provider && (
              <span style={{display:'inline-flex',alignItems:'center',gap:5,color:theme.sage}}><Video size={14}/> Digitalt møte · {meeting.video.provider==='teams'?'Teams':'Zoom'}</span>
            )}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{display:'flex'}}>
              {attendeeMembers.slice(0,5).map((m,i) => (
                <div key={m.id} style={{marginLeft:i===0?0:-8,border:`2px solid ${theme.surface}`,borderRadius:'50%'}}>
                  <Avatar member={m} size={28}/>
                </div>
              ))}
            </div>
            <span style={{fontSize:12,color:theme.inkMuted}}>{attendeeMembers.length} deltakere</span>
          </div>
        </div>
        <ChevronRight size={20} style={{color:theme.inkMuted,alignSelf:'center'}}/>
      </div>
    </Card>
  );
};

/* ===== MEETING FORM ===== */
const meetingTemplates = {
  ukentlig: { type:'Ukentlig', duration:60, agenda:[
    { title:'Statusrunde – nøkkeltall', duration:10 },
    { title:'Hovedsak (uken)', duration:25 },
    { title:'Risikoer / blokkeringer', duration:10 },
    { title:'Beslutninger som trengs', duration:10 },
    { title:'Eventuelt', duration:5 },
  ]},
  strategi: { type:'Strategi', duration:180, agenda:[
    { title:'Ramme og mål for møtet', duration:15 },
    { title:'Markedssituasjon og innsikter', duration:30 },
    { title:'Strategisk diskusjon (åpent)', duration:60 },
    { title:'Valg og prioriteringer', duration:45 },
    { title:'Neste steg og ansvarsfordeling', duration:30 },
  ]},
  beslutning: { type:'Beslutning', duration:60, agenda:[
    { title:'Saksforhold og bakgrunn', duration:10 },
    { title:'Alternativer og konsekvenser', duration:20 },
    { title:'Diskusjon', duration:20 },
    { title:'Vedtak og kommunikasjonsplan', duration:10 },
  ]},
  workshop: { type:'Workshop', duration:120, agenda:[
    { title:'Åpning og kontekst', duration:15 },
    { title:'Divergens – idégenerering', duration:35 },
    { title:'Konvergens – prioritering', duration:35 },
    { title:'Konkretisering og eierskap', duration:25 },
    { title:'Oppsummering', duration:10 },
  ]},
};

const detectVideoProvider = (url) => {
  if (!url) return null;
  if (/teams\.(microsoft|live)\.com/i.test(url)) return 'teams';
  if (/zoom\.us/i.test(url)) return 'zoom';
  return null;
};

const MeetingForm = ({ meeting, data, onSave, onCancel, onDelete }) => {
  const [m,setM] = useState({ title:'', date:new Date().toISOString().slice(0,10), time:'09:00', duration:60, location:'', type:'Ukentlig', status:'planlagt', attendees:[], agenda:[], summary:'', ...meeting });
  const update = (k,v) => setM({...m,[k]:v});
  const videoProvider = m.video?.provider || '';
  const videoUrl = m.video?.url || '';
  const [videoMismatch, setVideoMismatch] = useState(false);
  const setVideoProvider = (p) => { setM({...m, video: p ? { provider:p, url: videoUrl } : null }); setVideoMismatch(false); };
  const setVideoUrl = (url) => {
    const detected = detectVideoProvider(url);
    const mismatch = detected && videoProvider && detected !== videoProvider;
    setVideoMismatch(mismatch);
    if (detected && !videoProvider) setM({...m, video: { provider: detected, url }});
    else setM({...m, video: { ...m.video, url }});
  };
  const addAgenda = () => setM({...m, agenda:[...(m.agenda||[]), { id:uid('a'), title:'', presenter:'', duration:10, notes:'' }]});
  const updateAgenda = (idx,patch) => { const next=[...m.agenda]; next[idx]={...next[idx],...patch}; setM({...m,agenda:next}); };
  const removeAgenda = (idx) => setM({...m, agenda:m.agenda.filter((_,i)=>i!==idx)});
  const toggleAttendee = (id) => { const list=m.attendees||[]; setM({...m, attendees:list.includes(id)?list.filter(x=>x!==id):[...list,id]}); };
  const applyTemplate = (key) => {
    if (!key) return;
    const tpl = meetingTemplates[key]; if (!tpl) return;
    if (m.agenda?.length > 0 && !confirm('Erstatte eksisterende agenda med malen?')) return;
    setM({ ...m, type: tpl.type, duration: tpl.duration, agenda: tpl.agenda.map(a => ({ ...a, id: uid('a'), presenter:'', notes:'' })) });
  };
  return (
    <div>
      {!m.id && (
        <div style={{background:theme.brassLight,border:`1px solid ${theme.brass}33`,borderRadius:10,padding:'10px 14px',marginBottom:16,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          <Sparkles size={14} style={{color:theme.brass}}/>
          <span style={{fontSize:12,color:theme.ink,fontWeight:600}}>Start fra mal:</span>
          {Object.entries(meetingTemplates).map(([k,v]) => (
            <button key={k} type="button" onClick={()=>applyTemplate(k)}
              style={{padding:'5px 10px',borderRadius:999,border:`1px solid ${theme.brass}55`,background:theme.surface,color:theme.ink,fontSize:12,fontFamily:'inherit',cursor:'pointer',fontWeight:500}}>
              {v.type}
            </button>
          ))}
        </div>
      )}
      <TextField label="Tittel" value={m.title} onChange={(v)=>update('title',v)} required placeholder="F.eks. Ukentlig møte uke 19"/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:12}}>
        <TextField label="Dato" value={m.date} onChange={(v)=>update('date',v)} type="date" required/>
        <TextField label="Tidspunkt" value={m.time} onChange={(v)=>update('time',v)} type="time" required/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:12}}>
        <TextField label="Sted" value={m.location} onChange={(v)=>update('location',v)} placeholder="Møterom Fjorden"/>
        <TextField label="Varighet (min)" value={m.duration} onChange={(v)=>update('duration',parseInt(v)||0)} type="number"/>
        <Sel label="Type" value={m.type} onChange={(v)=>update('type',v)} options={[
          {value:'Ukentlig',label:'Ukentlig'},{value:'Strategi',label:'Strategi'},{value:'Beslutning',label:'Beslutning'},{value:'Workshop',label:'Workshop'},{value:'Annet',label:'Annet'}
        ]}/>
      </div>
      <Sel label="Status" value={m.status} onChange={(v)=>update('status',v)} options={[
        {value:'planlagt',label:'Planlagt'},{value:'gjennomført',label:'Gjennomført'},{value:'avlyst',label:'Avlyst'}
      ]}/>
      <div style={{marginTop:14}}>
        <div style={{fontSize:11,fontWeight:700,color:theme.inkSoft,textTransform:'uppercase',letterSpacing:0.6,marginBottom:8}}>Videomøte</div>
        <div style={{display:'flex',gap:8,marginBottom:videoProvider?8:0}}>
          {['','teams','zoom'].map(p => (
            <button key={p} type="button" onClick={()=>setVideoProvider(p||null)}
              style={{padding:'6px 14px',borderRadius:999,border:`1px solid ${(videoProvider||'')=== p?theme.brass:theme.border}`,background:(videoProvider||'')===p?theme.brassLight:theme.surface,color:(videoProvider||'')===p?theme.brassDark:theme.inkSoft,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:6}}>
              {p==='' && 'Ingen'}
              {p==='teams' && <><Video size={13}/> Teams</>}
              {p==='zoom' && <><Video size={13}/> Zoom</>}
            </button>
          ))}
        </div>
        {videoProvider && (
          <div>
            <input value={videoUrl} onChange={(e)=>setVideoUrl(e.target.value)} placeholder={videoProvider==='teams'?'Lim inn Teams-lenke':'Lim inn Zoom-lenke'}
              style={{width:'100%',padding:'9px 12px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13,background:theme.surface,color:theme.ink,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}}/>
            {videoMismatch && (
              <div style={{marginTop:6,fontSize:12,color:theme.rust,display:'flex',alignItems:'center',gap:6}}>
                <AlertCircle size={13}/> Lenken ser ut til å tilhøre en annen tjeneste enn valgt.
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{marginTop:6}}>
        <div style={{fontSize:11,fontWeight:700,color:theme.inkSoft,textTransform:'uppercase',letterSpacing:0.6,marginBottom:8}}>Deltakere</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
          {data.members.map(mb => {
            const on = m.attendees?.includes(mb.id);
            return (
              <button key={mb.id} type="button" onClick={()=>toggleAttendee(mb.id)}
                style={{display:'flex',alignItems:'center',gap:8,padding:'6px 12px 6px 6px',borderRadius:999,border:`1px solid ${on?theme.brass:theme.border}`,background:on?theme.brassLight:theme.surface,color:theme.ink,cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:500}}>
                <Avatar member={mb} size={22}/>{mb.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{marginTop:22}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,color:theme.inkSoft,textTransform:'uppercase',letterSpacing:0.6}}>
            Agenda ({m.agenda?.length||0} punkter · {(m.agenda||[]).reduce((s,a)=>s+(a.duration||0),0)} min)
          </div>
          <Btn size="sm" icon={Plus} variant="ghost" onClick={addAgenda}>Legg til punkt</Btn>
        </div>
        {(m.agenda||[]).length===0 ? (
          <div style={{padding:20,textAlign:'center',background:theme.surfaceAlt,borderRadius:8,color:theme.inkMuted,fontSize:13}}>Ingen agendapunkter ennå</div>
        ) : (
          <div style={{display:'grid',gap:8}}>
            {m.agenda.map((a,i) => (
              <div key={a.id} style={{background:theme.surfaceAlt,padding:12,borderRadius:8,border:`1px solid ${theme.borderSoft}`}}>
                <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                  <div style={{fontFamily:'Fraunces, Georgia, serif',fontSize:18,color:theme.brass,width:26,fontWeight:500,textAlign:'center'}}>{i+1}</div>
                  <input value={a.title} onChange={(e)=>updateAgenda(i,{title:e.target.value})} placeholder="Tittel på agendapunkt"
                    style={{flex:1,padding:'7px 10px',border:`1px solid ${theme.border}`,borderRadius:6,fontSize:13,fontFamily:'inherit',background:theme.surface}}/>
                  <button type="button" onClick={()=>removeAgenda(i)} style={{background:'transparent',border:'none',cursor:'pointer',color:theme.inkMuted,padding:4}}>
                    <X size={16}/>
                  </button>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <select value={a.presenter||''} onChange={(e)=>updateAgenda(i,{presenter:e.target.value})}
                    style={{flex:1,padding:'6px 8px',border:`1px solid ${theme.border}`,borderRadius:6,fontSize:12,fontFamily:'inherit',background:theme.surface}}>
                    <option value="">Velg ansvarlig</option>
                    {data.members.map(mb => <option key={mb.id} value={mb.id}>{mb.name}</option>)}
                  </select>
                  <input type="number" value={a.duration} onChange={(e)=>updateAgenda(i,{duration:parseInt(e.target.value)||0})}
                    style={{width:70,padding:'6px 8px',border:`1px solid ${theme.border}`,borderRadius:6,fontSize:12,fontFamily:'inherit',background:theme.surface}}/>
                  <span style={{fontSize:12,color:theme.inkMuted}}>min</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {m.status==='gjennomført' && (
        <TextField label="Møtesammendrag" value={m.summary} onChange={(v)=>update('summary',v)} multiline rows={4} placeholder="Kort oppsummering av møtet..." style={{marginTop:22}}/>
      )}
      <div style={{display:'flex',gap:8,justifyContent:'space-between',marginTop:24,paddingTop:20,borderTop:`1px solid ${theme.borderSoft}`}}>
        <div>{onDelete && <Btn variant="danger" icon={Trash2} onClick={()=>{ if(confirm('Slette dette møtet?')) onDelete(); }}>Slett</Btn>}</div>
        <div style={{display:'flex',gap:8}}>
          <Btn variant="ghost" onClick={onCancel}>Avbryt</Btn>
          <Btn variant="brass" icon={Save} onClick={()=>{ if(!m.title||!m.date){ alert('Fyll inn tittel og dato'); return; } onSave(m); }}>Lagre</Btn>
        </div>
      </div>
    </div>
  );
};

/* ===== DECISION CARD SMALL ===== */
const DecisionCardSmall = ({ decision, member }) => {
  const sc = statusColor(decision.status);
  return (
    <div style={{padding:14,border:`1px solid ${theme.borderSoft}`,borderRadius:10,display:'flex',gap:12,alignItems:'flex-start'}}>
      <div style={{width:4,alignSelf:'stretch',background:sc.fg,borderRadius:2,flexShrink:0}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:600,color:theme.ink,marginBottom:4}}>{decision.title}</div>
        {decision.description && <div style={{fontSize:13,color:theme.inkSoft,marginBottom:8,lineHeight:1.5}}>{decision.description}</div>}
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',fontSize:12,color:theme.inkMuted}}>
          <span>{fmtDate(decision.date)}</span>{member && <span>· {member.name}</span>}
          <Pill bg={sc.bg} color={sc.fg}>{statusLabels[decision.status]}</Pill>
        </div>
      </div>
    </div>
  );
};

/* ===== AI-REFERAT (transkripsjon → forslag via Claude) ===== */
const analyzeTranscriptWithClaude = async (transcript, meeting, members) => {
  const memberLines = members.map(m => `- ${m.id}: ${m.name} (${m.role})`).join('\n');
  const agendaLines = (meeting.agenda || []).map(a => `- ${a.id}: ${a.title}`).join('\n');

  const systemPrompt = `Du er møtereferent for Vikingbad. Du skal analysere en møtetranskripsjon og foreslå strukturerte referatpunkter.

Returner KUN gyldig JSON (uten markdown-formatering, uten forklaring), med denne strukturen:
{
  "summary": "2-4 setninger på norsk som oppsummerer møtet",
  "agendaNotes": [{ "agendaId": "<id>", "notes": "Konsis oppsummering av diskusjon og konklusjon" }],
  "decisions": [{ "title": "Kort tittel", "description": "Hva ble besluttet og hvorfor", "ownerId": "<member id eller null>", "status": "vedtatt" }],
  "tasks": [{ "title": "Konkret handling", "description": "Detaljer", "ownerId": "<member id>", "dueDate": "YYYY-MM-DD eller null", "priority": "høy" }]
}

Regler:
- Bruk KUN ID-er fra de oppgitte listene over deltakere og agendapunkter
- Foreslå kun ting som faktisk fremkommer i transkripsjonen
- Vær konservativ – ikke overtolk, ikke dikt opp frister
- Hvis frist ikke nevnes, sett dueDate til null
- Skriv all tekst på norsk
- Hvis transkripsjonen er kort/uklar, returner færre forslag heller enn flere
- Beslutninger er noe som er konkludert. Oppgaver er noe noen skal gjøre etterpå.`;

  const userMessage = `MØTE: ${meeting.title}
DATO: ${meeting.date}
TYPE: ${meeting.type}

DELTAKERE:
${memberLines}

AGENDA:
${agendaLines}

TRANSKRIPSJON:
${transcript}`;

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }]
    })
  });
  if (!response.ok) throw new Error(`API svarte ${response.status}`);
  const data = await response.json();
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join('\n');
  const cleaned = text.replace(/```json\s*|\s*```/g, '').trim();
  return JSON.parse(cleaned);
};

const mockProposals = (meeting, members) => ({
  summary: 'Konstruktivt møte med god dialog rundt salgsutvikling og lansering. Bred enighet om hovedretning, men noen detaljer ble utsatt til neste møte.',
  agendaNotes: (meeting.agenda || []).slice(0, 3).map((a, i) => ({
    agendaId: a.id,
    notes: i === 0 ? 'Nøkkeltallene viser positiv utvikling i Q2 sammenlignet med samme periode i fjor. Marginen holder seg stabil.'
         : i === 1 ? 'Salgsresultatene overgikk budsjett med 7%. Sterk vekst i prosjektmarkedet, mens privatmarkedet er flatt.'
         :          'Lansering planlagt til september. Markedsmateriell ferdigstilles i juli, fotograf bookes i august.'
  })),
  decisions: [
    { title: 'Forsterke prosjektsalgs-teamet', description: 'Beslutning om å rekruttere én ekstra prosjektselger i Oslo-regionen for å håndtere økt etterspørsel.', ownerId: members[4]?.id || null, status: 'vedtatt' }
  ],
  tasks: [
    { title: 'Utarbeid stillingsannonse for prosjektselger', description: 'Bruk standard mal, fokuser på erfaring fra VVS-bransjen.', ownerId: members[4]?.id || null, dueDate: null, priority: 'høy' },
    { title: 'Oppdater forecast med nye salgstall', description: 'Inkluder Q2-tall og oppdater Q3-prognose.', ownerId: members[1]?.id || null, dueDate: null, priority: 'medium' }
  ]
});

const TranscriptModal = ({ open, onClose, meeting, data, onApply }) => {
  const [step, setStep] = useState('input');
  const [transcript, setTranscript] = useState('');
  const [proposals, setProposals] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState({ summary: true, agendaNotes: {}, decisions: {}, tasks: {} });
  const [editedTasks, setEditedTasks] = useState({});

  const memberById = (id) => data.members.find(m => m.id === id);
  const agendaById = (id) => meeting.agenda?.find(a => a.id === id);

  const reset = () => {
    setStep('input'); setTranscript(''); setProposals(null); setError(null);
    setSelected({ summary: true, agendaNotes: {}, decisions: {}, tasks: {} });
    setEditedTasks({});
  };
  const close = () => { reset(); onClose(); };

  const initSelection = (result) => {
    const sel = { summary: true, agendaNotes: {}, decisions: {}, tasks: {} };
    (result.agendaNotes || []).forEach((_, i) => sel.agendaNotes[i] = true);
    (result.decisions || []).forEach((_, i) => sel.decisions[i] = true);
    (result.tasks || []).forEach((_, i) => sel.tasks[i] = true);
    setSelected(sel);
  };

  const runAnalysis = async () => {
    if (!transcript.trim()) return;
    setStep('loading'); setError(null);
    try {
      const result = await analyzeTranscriptWithClaude(transcript, meeting, data.members);
      initSelection(result); setProposals(result); setStep('review');
    } catch (e) {
      setError(e.message || 'Ukjent feil');
      setStep('error');
    }
  };

  const useDemo = () => {
    const result = mockProposals(meeting, data.members);
    initSelection(result); setProposals(result); setStep('review');
  };

  const apply = () => {
    const updates = {};
    if (selected.summary && proposals.summary) updates.summary = proposals.summary;
    let newAgenda = meeting.agenda || [];
    (proposals.agendaNotes || []).forEach((n, i) => {
      if (selected.agendaNotes[i]) {
        newAgenda = newAgenda.map(a => a.id === n.agendaId ? { ...a, notes: a.notes ? a.notes + '\n\n' + n.notes : n.notes } : a);
      }
    });
    updates.agenda = newAgenda;

    const newDecisions = (proposals.decisions || [])
      .filter((_, i) => selected.decisions[i])
      .map(d => ({ id: uid('d'), title: d.title, description: d.description || '', date: meeting.date, meetingId: meeting.id, owner: d.ownerId || null, status: d.status || 'vedtatt' }));

    const newTasks = (proposals.tasks || [])
      .filter((_, i) => selected.tasks[i])
      .map((t, i) => {
        const e = editedTasks[i] || {};
        return { id: uid('t'), title: t.title, description: t.description || '', owner: e.owner !== undefined ? e.owner : (t.ownerId || null), dueDate: e.dueDate !== undefined ? e.dueDate : (t.dueDate || ''), status: 'ikke_startet', priority: t.priority || 'medium', meetingId: meeting.id };
      });

    onApply(updates, newDecisions, newTasks);
    close();
  };

  const sumApplied = (selected.summary && proposals?.summary ? 1 : 0)
    + Object.values(selected.agendaNotes || {}).filter(Boolean).length
    + Object.values(selected.decisions || {}).filter(Boolean).length
    + Object.values(selected.tasks || {}).filter(Boolean).length;

  return (
    <Modal open={open} onClose={close} title="AI-referat fra transkripsjon" width={780}>
      {step === 'input' && (
        <div>
          <div style={{background:theme.brassLight,border:`1px solid ${theme.brass}33`,borderRadius:10,padding:'14px 16px',marginBottom:18,display:'flex',gap:12,alignItems:'flex-start'}}>
            <Sparkles size={18} style={{color:theme.brass,flexShrink:0,marginTop:2}}/>
            <div style={{fontSize:13,color:theme.ink,lineHeight:1.55}}>
              Lim inn transkripsjon fra <strong>MacWhisper</strong> (eller en annen transkripsjonstjeneste). Claude analyserer mot møtets agenda og deltakere, og foreslår notater, beslutninger og oppgaver som du kan godkjenne.
            </div>
          </div>
          <textarea value={transcript} onChange={(e)=>setTranscript(e.target.value)} rows={14}
            placeholder="Eksempel:&#10;&#10;Anne: Velkommen alle sammen. La oss begynne med Toms statusoppdatering på nøkkeltallene...&#10;&#10;Tom: Takk Anne. Q2 ser sterkt ut – vi ligger 7% over budsjett...&#10;&#10;..."
            style={{width:'100%',padding:'14px 16px',border:`1px solid ${theme.border}`,borderRadius:10,fontSize:13,fontFamily:'inherit',background:theme.surface,color:theme.ink,resize:'vertical',outline:'none',boxSizing:'border-box',lineHeight:1.6}}/>
          <div style={{fontSize:12,color:theme.inkMuted,marginTop:6}}>
            {transcript.length.toLocaleString('no-NO')} tegn{transcript.length>0?` · ca ${Math.ceil(transcript.split(/\s+/).length/130)} min lesetid`:''}
          </div>
          <div style={{display:'flex',gap:8,justifyContent:'space-between',marginTop:20,paddingTop:18,borderTop:`1px solid ${theme.borderSoft}`,flexWrap:'wrap'}}>
            <Btn variant="text" onClick={useDemo}>Vis demo-forslag</Btn>
            <div style={{display:'flex',gap:8}}>
              <Btn variant="ghost" onClick={close}>Avbryt</Btn>
              <Btn variant="brass" icon={Sparkles} onClick={runAnalysis} disabled={!transcript.trim()}>Analyser med Claude</Btn>
            </div>
          </div>
        </div>
      )}

      {step === 'loading' && (
        <div style={{padding:'40px 20px',textAlign:'center'}}>
          <div style={{display:'inline-block',width:48,height:48,borderRadius:'50%',background:`linear-gradient(135deg, ${theme.brass}, ${theme.amber})`,marginBottom:18,display:'inline-flex',alignItems:'center',justifyContent:'center',color:'#fff',animation:'pulse 1.6s ease-in-out infinite'}}>
            <Sparkles size={22}/>
          </div>
          <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:22,fontWeight:500,color:theme.ink,margin:'0 0 8px'}}>Claude analyserer transkripsjonen</h3>
          <p style={{fontSize:13,color:theme.inkMuted,margin:0}}>Identifiserer beslutninger, oppgaver og kobler innhold til agendapunkter…</p>
          <style>{`@keyframes pulse { 0%,100% { transform:scale(1); opacity:1 } 50% { transform:scale(1.08); opacity:0.7 } }`}</style>
        </div>
      )}

      {step === 'error' && (
        <div>
          <div style={{background:theme.rustLight,border:`1px solid ${theme.rust}40`,borderRadius:10,padding:'14px 16px',marginBottom:18}}>
            <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
              <AlertCircle size={18} style={{color:theme.rust,flexShrink:0,marginTop:2}}/>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:theme.ink,marginBottom:6}}>Kunne ikke kontakte Claude API</div>
                <div style={{fontSize:13,color:theme.inkSoft,lineHeight:1.55,marginBottom:6}}>{error}</div>
                <div style={{fontSize:12,color:theme.inkMuted,lineHeight:1.55}}>
                  I produksjonsoppsett kobles dette mot Anthropic API med en server-side proxy. For å se hvordan grensesnittet fungerer, klikk «Vis demo-forslag».
                </div>
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:8}}>
            <Btn variant="ghost" onClick={()=>setStep('input')}>Tilbake</Btn>
            <Btn variant="brass" icon={Sparkles} onClick={useDemo}>Vis demo-forslag</Btn>
          </div>
        </div>
      )}

      {step === 'review' && proposals && (
        <div>
          <div style={{background:theme.sageLight,border:`1px solid ${theme.sage}40`,borderRadius:10,padding:'12px 16px',marginBottom:20,display:'flex',gap:10,alignItems:'center'}}>
            <CheckCircle2 size={18} style={{color:theme.sage,flexShrink:0}}/>
            <div style={{fontSize:13,color:theme.ink,lineHeight:1.5}}>
              <strong>{sumApplied}</strong> forslag valgt. Kryss av/fjern det du vil bruke. Du kan finjustere alt etterpå i fanene.
            </div>
          </div>

          {proposals.summary && (
            <ProposalSection title="Sammendrag" count={selected.summary?1:0}>
              <ProposalCard checked={selected.summary} onCheck={(v)=>setSelected({...selected,summary:v})}>
                <div style={{fontSize:13,color:theme.ink,lineHeight:1.6,fontStyle:'italic'}}>«{proposals.summary}»</div>
              </ProposalCard>
            </ProposalSection>
          )}

          {proposals.agendaNotes && proposals.agendaNotes.length > 0 && (
            <ProposalSection title="Notater per agendapunkt" count={Object.values(selected.agendaNotes).filter(Boolean).length}>
              {proposals.agendaNotes.map((n, i) => {
                const a = agendaById(n.agendaId);
                if (!a) return null;
                return (
                  <ProposalCard key={i} checked={selected.agendaNotes[i]} onCheck={(v)=>setSelected({...selected, agendaNotes:{...selected.agendaNotes,[i]:v}})}>
                    <div style={{fontSize:11,color:theme.brass,fontWeight:700,letterSpacing:0.6,textTransform:'uppercase',marginBottom:4}}>{a.title}</div>
                    <div style={{fontSize:13,color:theme.inkSoft,lineHeight:1.55}}>{n.notes}</div>
                  </ProposalCard>
                );
              })}
            </ProposalSection>
          )}

          {proposals.decisions && proposals.decisions.length > 0 && (
            <ProposalSection title="Beslutninger" count={Object.values(selected.decisions).filter(Boolean).length} icon={Gavel}>
              {proposals.decisions.map((d, i) => {
                const owner = memberById(d.ownerId);
                return (
                  <ProposalCard key={i} checked={selected.decisions[i]} onCheck={(v)=>setSelected({...selected, decisions:{...selected.decisions,[i]:v}})}>
                    <div style={{fontSize:14,fontWeight:600,color:theme.ink,marginBottom:4}}>{d.title}</div>
                    <div style={{fontSize:13,color:theme.inkSoft,lineHeight:1.55,marginBottom:8}}>{d.description}</div>
                    {owner && <div style={{fontSize:12,color:theme.inkMuted,display:'inline-flex',alignItems:'center',gap:6}}>
                      <Avatar member={owner} size={20}/> Ansvarlig: {owner.name}
                    </div>}
                  </ProposalCard>
                );
              })}
            </ProposalSection>
          )}

          {proposals.tasks && proposals.tasks.length > 0 && (
            <ProposalSection title="Oppgaver" count={Object.values(selected.tasks).filter(Boolean).length} icon={ListTodo}>
              {proposals.tasks.map((t, i) => {
                const edit = editedTasks[i] || {};
                const ownerVal = edit.owner !== undefined ? edit.owner : (t.ownerId || '');
                const dateVal = edit.dueDate !== undefined ? edit.dueDate : (t.dueDate || '');
                return (
                  <ProposalCard key={i} checked={selected.tasks[i]} onCheck={(v)=>setSelected({...selected, tasks:{...selected.tasks,[i]:v}})}>
                    <div style={{fontSize:14,fontWeight:600,color:theme.ink,marginBottom:4}}>{t.title}</div>
                    {t.description && <div style={{fontSize:13,color:theme.inkSoft,lineHeight:1.55,marginBottom:10}}>{t.description}</div>}
                    <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                      <select value={ownerVal} onChange={(e)=>setEditedTasks({...editedTasks,[i]:{...edit,owner:e.target.value}})}
                        style={{padding:'6px 8px',border:`1px solid ${theme.border}`,borderRadius:6,fontSize:12,fontFamily:'inherit',background:theme.surface}}>
                        <option value="">Ingen ansvarlig</option>
                        {data.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                      <input type="date" value={dateVal} onChange={(e)=>setEditedTasks({...editedTasks,[i]:{...edit,dueDate:e.target.value}})}
                        style={{padding:'6px 8px',border:`1px solid ${theme.border}`,borderRadius:6,fontSize:12,fontFamily:'inherit',background:theme.surface}}/>
                      <span style={{fontSize:11,color:priorityColor(t.priority),fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>
                        {priorityLabels[t.priority]} prio
                      </span>
                    </div>
                  </ProposalCard>
                );
              })}
            </ProposalSection>
          )}

          <div style={{display:'flex',gap:8,justifyContent:'space-between',marginTop:24,paddingTop:18,borderTop:`1px solid ${theme.borderSoft}`}}>
            <Btn variant="text" onClick={()=>setStep('input')}>← Ny transkripsjon</Btn>
            <div style={{display:'flex',gap:8}}>
              <Btn variant="ghost" onClick={close}>Avbryt</Btn>
              <Btn variant="brass" icon={Save} onClick={apply} disabled={sumApplied===0}>Bruk {sumApplied} valgte forslag</Btn>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

const ProposalSection = ({ title, count, icon:Icon, children }) => (
  <div style={{marginBottom:20}}>
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
      {Icon && <Icon size={14} style={{color:theme.brass}}/>}
      <div style={{fontSize:11,fontWeight:700,color:theme.inkSoft,textTransform:'uppercase',letterSpacing:0.6}}>
        {title}{count!=null && <span style={{color:theme.brass,marginLeft:6}}>· {count} valgt</span>}
      </div>
    </div>
    <div style={{display:'grid',gap:8}}>{children}</div>
  </div>
);

const ProposalCard = ({ checked, onCheck, children }) => (
  <div style={{
    border:`1px solid ${checked?theme.brass:theme.borderSoft}`, background:checked?theme.surface:theme.surfaceAlt,
    borderRadius:10, padding:14, display:'flex', gap:12, alignItems:'flex-start',
    transition:'all 120ms', cursor:'pointer',
  }} onClick={()=>onCheck(!checked)}>
    <button onClick={(e)=>{e.stopPropagation(); onCheck(!checked);}}
      style={{background:'transparent',border:'none',cursor:'pointer',padding:0,marginTop:1,color:checked?theme.brass:theme.inkMuted,flexShrink:0}}>
      {checked ? <CheckCircle2 size={20}/> : <Circle size={20}/>}
    </button>
    <div style={{flex:1,minWidth:0,opacity:checked?1:0.6}}>{children}</div>
  </div>
);

/* ===== AI-BRIEFING (forberedelse før møte) ===== */
const generateBriefing = async (meeting, data) => {
  const memberById = (id) => data.members.find(m => m.id === id);
  const attendees = meeting.attendees.map(id => memberById(id)).filter(Boolean);
  const meetingTasks = data.tasks.filter(t => t.meetingId === meeting.id);
  const openTasksForAttendees = data.tasks.filter(t => attendees.some(a => a.id === t.owner) && t.status !== 'fullført');
  const recentDecisions = data.decisions.filter(d => d.meetingId !== meeting.id).sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5);
  const prep = (meeting.prep || []).filter(p => (p.content||'').trim());

  const ctx = `MØTE: ${meeting.title}
DATO: ${meeting.date} kl ${meeting.time}
TYPE: ${meeting.type}

DELTAKERE:
${attendees.map(m => `- ${m.name} (${m.role})`).join('\n')}

AGENDA:
${(meeting.agenda||[]).map((a,i) => `${i+1}. ${a.title} (${a.duration} min, ansvarlig: ${memberById(a.presenter)?.name||'-'})`).join('\n')}

INNLEVERT FORBEREDELSE:
${prep.length > 0 ? prep.map(p => `${memberById(p.memberId)?.name||'?'}: ${p.content}`).join('\n\n') : 'Ingen forberedelse innlevert ennå.'}

ÅPNE OPPGAVER FOR DELTAKERNE:
${openTasksForAttendees.slice(0,10).map(t => `- ${t.title} (${memberById(t.owner)?.name||'?'}, frist ${t.dueDate||'ingen'}, ${t.status})`).join('\n') || 'Ingen åpne oppgaver.'}

NYLIGE BESLUTNINGER (kontekst):
${recentDecisions.map(d => `- ${d.title} (${d.date}): ${d.description}`).join('\n') || 'Ingen relevante beslutninger.'}`;

  const systemPrompt = `Du er strategisk rådgiver som forbereder en deltaker til et møte i Vikingbad. Skriv en kort, fokusert briefing på norsk (300-500 ord) med disse seksjonene:

**Hovedfokus** – Hva møtet egentlig handler om (ikke bare gjengi agendaen)
**Slik er statusen** – Kort lesning av forberedelsene og åpne oppgaver
**Det viktige spørsmålet** – Hva er det egentlige spørsmålet/dilemma denne gruppen må håndtere?
**Verdt å være obs på** – Mulige spenninger, forsinkelser eller koblinger til tidligere beslutninger
**Forbered ditt eget bidrag** – 2-3 konkrete spørsmål eller poenger deltakeren bør tenke på før møtet

Vær skarp og praktisk, ikke generisk. Bruk markdown med ** for fete overskrifter.`;

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant`, {
    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 1500,
      system: systemPrompt, messages: [{ role: "user", content: ctx }]
    })
  });
  if (!response.ok) throw new Error(`API svarte ${response.status}`);
  const d = await response.json();
  return (d.content || []).filter(b => b.type === "text").map(b => b.text).join('\n');
};

const mockBriefing = (meeting) => `**Hovedfokus**

Selv om agendaen er bred, er det egentlig én ting dette møtet handler om: hvordan ledergruppen velger å prioritere mellom kortsiktig leveranse (Q2-resultater, lansering) og langsiktige strukturelle valg (rekruttering, bærekraft).

**Slik er statusen**

Forberedelsene viser at salgssiden er offensiv mens drift signaliserer kapasitetspress. Tom har levert solide tall, men noterer at marginen er under press. Marit ser muligheter, men trenger ressurser.

**Det viktige spørsmålet**

Skal vi akselerere utad og risikere kapasitet, eller bremse litt og bygge robusthet? Dette er en avveining gruppen har utsatt i to møter på rad.

**Verdt å være obs på**

– Forsinkelsen på Nordic Stone-lanseringen påvirker H2-prognosen mer enn man har snakket høyt om
– Beslutningen om lagerautomatisering forutsetter at salget vokser som planlagt
– Erik har vært stille i forrige møte – verdt å spørre direkte

**Forbered ditt eget bidrag**

1. Hva er ditt syn på balansen mellom vekst og kapasitet?
2. Har du forslag til hvordan vi rigger forberedelsen bedre til neste gang?
3. Er det en beslutning som har vært utsatt for lenge som du vil ta opp?`;

const BriefingModal = ({ open, onClose, meeting, data }) => {
  const [step, setStep] = useState('intro');
  const [briefing, setBriefing] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => { if (open) { setStep('intro'); setBriefing(''); setError(null); } }, [open]);

  const run = async () => {
    setStep('loading'); setError(null);
    try {
      const result = await generateBriefing(meeting, data);
      setBriefing(result); setStep('result');
    } catch (e) {
      setError(e.message); setStep('error');
    }
  };

  const useDemo = () => { setBriefing(mockBriefing(meeting)); setStep('result'); };

  // Convert simple markdown bold + paragraphs to HTML
  const renderBriefing = (text) => {
    const html = text
      .split(/\n\n+/)
      .map(p => {
        if (p.startsWith('**') && p.endsWith('**')) {
          return `<h3 style="font-family:Fraunces,Georgia,serif;font-size:18px;font-weight:500;color:${theme.brass};margin:18px 0 8px;letter-spacing:-0.2px">${p.replace(/\*\*/g,'')}</h3>`;
        }
        return `<p style="margin:0 0 10px;line-height:1.65">${p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
      }).join('');
    return html;
  };

  return (
    <Modal open={open} onClose={onClose} title="AI-briefing før møtet" width={680}>
      {step === 'intro' && (
        <div>
          <div style={{background:theme.brassLight,border:`1px solid ${theme.brass}33`,borderRadius:10,padding:'14px 16px',marginBottom:18,display:'flex',gap:12,alignItems:'flex-start'}}>
            <Sparkles size={18} style={{color:theme.brass,flexShrink:0,marginTop:2}}/>
            <div style={{fontSize:13,color:theme.ink,lineHeight:1.55}}>
              Claude leser møtets agenda, deltakernes forberedelse, åpne oppgaver og nylige beslutninger – og gir deg en skarp 5-minutters briefing før du går inn i rommet.
            </div>
          </div>
          <div style={{display:'flex',gap:8,justifyContent:'space-between',marginTop:8}}>
            <Btn variant="text" onClick={useDemo}>Vis demo-briefing</Btn>
            <div style={{display:'flex',gap:8}}>
              <Btn variant="ghost" onClick={onClose}>Avbryt</Btn>
              <Btn variant="brass" icon={Sparkles} onClick={run}>Generer briefing</Btn>
            </div>
          </div>
        </div>
      )}
      {step === 'loading' && (
        <div style={{padding:'40px 20px',textAlign:'center'}}>
          <div style={{display:'inline-flex',width:48,height:48,borderRadius:'50%',background:`linear-gradient(135deg, ${theme.brass}, ${theme.amber})`,marginBottom:18,alignItems:'center',justifyContent:'center',color:'#fff',animation:'pulse 1.6s ease-in-out infinite'}}>
            <Sparkles size={22}/>
          </div>
          <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:22,fontWeight:500,color:theme.ink,margin:'0 0 8px'}}>Claude forbereder briefingen din</h3>
          <p style={{fontSize:13,color:theme.inkMuted,margin:0}}>Leser agenda, forberedelser og åpne oppgaver…</p>
        </div>
      )}
      {step === 'error' && (
        <div>
          <div style={{background:theme.rustLight,border:`1px solid ${theme.rust}40`,borderRadius:10,padding:'14px 16px',marginBottom:18}}>
            <div style={{fontSize:14,fontWeight:600,color:theme.ink,marginBottom:6}}>Kunne ikke kontakte Claude API</div>
            <div style={{fontSize:13,color:theme.inkSoft}}>{error}</div>
          </div>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn variant="ghost" onClick={()=>setStep('intro')}>Tilbake</Btn>
            <Btn variant="brass" icon={Sparkles} onClick={useDemo}>Vis demo</Btn>
          </div>
        </div>
      )}
      {step === 'result' && (
        <div>
          <div style={{background:theme.surface,border:`1px solid ${theme.borderSoft}`,borderRadius:10,padding:'18px 22px',color:theme.ink,fontSize:14}}
               dangerouslySetInnerHTML={{__html: renderBriefing(briefing)}}/>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:18,paddingTop:14,borderTop:`1px solid ${theme.borderSoft}`}}>
            <Btn variant="ghost" onClick={()=>setStep('intro')}>Generer på nytt</Btn>
            <Btn variant="brass" onClick={onClose}>Lukk</Btn>
          </div>
        </div>
      )}
    </Modal>
  );
};

/* ===== MEETING DETAIL ===== */
const MeetingDetail = ({ meeting, data, save, onBack, onEdit, currentUserId }) => {
  const [tab,setTab] = useState('agenda');
  const [transcriptOpen,setTranscriptOpen] = useState(false);
  const [briefingOpen,setBriefingOpen] = useState(false);
  const memberById = (id) => data.members.find(m=>m.id===id);
  const sc = statusColor(meeting.status);
  const meetingDecisions = data.decisions.filter(d=>d.meetingId===meeting.id);
  const meetingTasks = data.tasks.filter(t=>t.meetingId===meeting.id);
  const totalDuration = meeting.agenda?.reduce((s,a)=>s+(a.duration||0),0) || 0;
  const prep = meeting.prep || [];
  const prepCompleteCount = prep.filter(p => (p.content||'').trim().length > 0).length;

  const updateAgendaNotes = (agendaId,notes) => save({
    ...data,
    meetings: data.meetings.map(mt => mt.id===meeting.id ? {...mt, agenda:mt.agenda.map(a=>a.id===agendaId?{...a,notes}:a)} : mt)
  });

  const updatePrep = (memberId, content) => {
    const existing = (meeting.prep || []).find(p => p.memberId === memberId);
    const newPrep = existing
      ? meeting.prep.map(p => p.memberId === memberId ? { ...p, content, updatedAt: new Date().toISOString() } : p)
      : [...(meeting.prep || []), { memberId, content, updatedAt: new Date().toISOString() }];
    save({
      ...data,
      meetings: data.meetings.map(mt => mt.id===meeting.id ? {...mt, prep: newPrep} : mt)
    });
  };

  const handleApplyProposals = (updates, newDecisions, newTasks) => {
    save({
      ...data,
      meetings: data.meetings.map(mt => mt.id===meeting.id ? {...mt, ...updates} : mt),
      decisions: [...data.decisions, ...newDecisions],
      tasks: [...data.tasks, ...newTasks]
    });
  };

  const exportICS = () => {
    const start = new Date(`${meeting.date}T${meeting.time}:00`);
    const end = new Date(start.getTime() + (meeting.duration || 60) * 60000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const agenda = (meeting.agenda || []).map((a,i) => `${i+1}. ${a.title} (${a.duration} min)`).join('\\n');
    const attendees = meeting.attendees.map(id => {
      const m = memberById(id);
      return m ? `ATTENDEE;CN=${m.name}:mailto:${m.email||'noreply@vikingbad.no'}` : '';
    }).filter(Boolean).join('\r\n');
    const ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Vikingbad//Ledergruppe//NO',
      'BEGIN:VEVENT',
      `UID:${meeting.id}@vikingbad.no`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${meeting.title}`,
      `LOCATION:${meeting.location || ''}`,
      `DESCRIPTION:Agenda:\\n${agenda}`,
      attendees,
      'END:VEVENT','END:VCALENDAR',
    ].filter(Boolean).join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${meeting.title.replace(/[^a-zA-Z0-9æøåÆØÅ ]/g,'').replace(/\s+/g,'_')}.ics`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div>
      <button onClick={onBack} style={{background:'transparent',border:'none',color:theme.inkSoft,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600,marginBottom:16,fontFamily:'inherit',padding:'6px 10px',borderRadius:6}}>
        <ChevronLeft size={16}/> Tilbake til møter
      </button>
      <Card style={{marginBottom:22,padding:0,overflow:'hidden'}}>
        <div style={{padding:'24px 28px',borderBottom:`1px solid ${theme.borderSoft}`,background:theme.surfaceAlt}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,flexWrap:'wrap',marginBottom:14}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <Pill bg={sc.bg} color={sc.fg}>{statusLabels[meeting.status]}</Pill>
                <Pill bg={theme.brassLight} color={theme.brassDark}>{meeting.type}</Pill>
              </div>
              <h1 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:32,fontWeight:400,color:theme.ink,margin:0,letterSpacing:-0.5,lineHeight:1.15}}>
                {meeting.title}
              </h1>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <Btn variant="ghost" icon={Download} size="sm" onClick={exportICS}>.ics</Btn>
              <Btn variant="ghost" icon={Printer} size="sm" onClick={()=>window.print()}>Skriv ut</Btn>
              <Btn variant="ghost" icon={Edit2} size="sm" onClick={onEdit}>Rediger</Btn>
              <Btn variant="ghost" icon={Sparkles} size="sm" onClick={()=>setBriefingOpen(true)}>Brief meg</Btn>
              <Btn variant="brass" icon={Sparkles} size="sm" onClick={()=>setTranscriptOpen(true)}>AI-referat</Btn>
            </div>
          </div>
          <div style={{display:'flex',gap:24,flexWrap:'wrap',fontSize:13,color:theme.inkSoft}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:6}}><CalendarClock size={15}/> {fmtDateLong(meeting.date)} kl {meeting.time}</span>
            <span style={{display:'inline-flex',alignItems:'center',gap:6}}><MapPin size={15}/> {meeting.location||'Ikke satt'}</span>
            <span style={{display:'inline-flex',alignItems:'center',gap:6}}><Clock size={15}/> {totalDuration||meeting.duration} min</span>
            <span style={{display:'inline-flex',alignItems:'center',gap:6}}><Users size={15}/> {meeting.attendees.length} deltakere</span>
            {meeting.video?.provider && (
              <span style={{display:'inline-flex',alignItems:'center',gap:6,color:theme.sage}}><Video size={15}/> Digitalt møte · {meeting.video.provider==='teams'?'Teams':'Zoom'}</span>
            )}
          </div>
          {meeting.video?.url && (
            <div style={{marginTop:14}}>
              <a href={meeting.video.url} target="_blank" rel="noopener noreferrer"
                style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:8,background:theme.sage,color:'#fff',fontSize:13,fontWeight:600,textDecoration:'none',fontFamily:'inherit',transition:'opacity 150ms'}}
                onMouseEnter={(e)=>e.currentTarget.style.opacity='0.85'} onMouseLeave={(e)=>e.currentTarget.style.opacity='1'}>
                <Video size={16}/> Bli med i {meeting.video.provider==='teams'?'Teams':'Zoom'}
              </a>
            </div>
          )}
        </div>
        <div style={{padding:'0 28px',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',gap:4,overflowX:'auto'}}>
          {[
            {k:'agenda',l:'Agenda',i:ListTodo,c:meeting.agenda?.length},
            {k:'proposals',l:'Innmeldte saker',i:Inbox,c:(data.agendaProposals||[]).filter(p=>p.meetingId===meeting.id && p.status==='foreslått').length},
            {k:'prep',l:'Forberedelse',i:ClipboardList,c:prepCompleteCount},
            {k:'attendees',l:'Deltakere',i:Users,c:meeting.attendees.length},
            {k:'summary',l:'Møtereferat',i:FileText},
            {k:'decisions',l:'Beslutninger',i:Gavel,c:meetingDecisions.length},
            {k:'tasks',l:'Oppgaver',i:CheckSquare,c:meetingTasks.length},
          ].map(t => {
            const on = tab === t.k;
            return (
              <button key={t.k} onClick={()=>setTab(t.k)}
                style={{background:'transparent',border:'none',cursor:'pointer',fontFamily:'inherit',padding:'14px 14px 12px',fontSize:13,fontWeight:600,color:on?theme.brass:theme.inkSoft,borderBottom:`2px solid ${on?theme.brass:'transparent'}`,display:'inline-flex',alignItems:'center',gap:7,marginBottom:-1,transition:'all 120ms'}}>
                <t.i size={14}/> {t.l}
                {t.c!=null && t.c>0 && (
                  <span style={{background:on?theme.brass:theme.surfaceAlt,color:on?'#fff':theme.inkSoft,fontSize:10,padding:'1px 6px',borderRadius:999,fontWeight:700}}>{t.c}</span>
                )}
              </button>
            );
          })}
        </div>
        <div style={{padding:'24px 28px'}}>
          {tab==='agenda' && (
            <div style={{display:'grid',gap:14}}>
              {(meeting.agenda||[]).map((a,i) => {
                const presenter = memberById(a.presenter);
                return (
                  <div key={a.id} style={{border:`1px solid ${theme.borderSoft}`,borderRadius:10,padding:18,background:theme.surface}}>
                    <div style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:10}}>
                      <div style={{fontFamily:'Fraunces, Georgia, serif',fontSize:28,color:theme.brass,fontWeight:500,lineHeight:1,minWidth:36}}>{String(i+1).padStart(2,'0')}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:16,fontWeight:600,color:theme.ink,marginBottom:6}}>{a.title||'(uten tittel)'}</div>
                        <div style={{display:'flex',gap:14,fontSize:12,color:theme.inkMuted,flexWrap:'wrap'}}>
                          {presenter && <span style={{display:'inline-flex',alignItems:'center',gap:4}}><UserCheck size={13}/> {presenter.name}</span>}
                          <span style={{display:'inline-flex',alignItems:'center',gap:4}}><Clock size={13}/> {a.duration} min</span>
                        </div>
                      </div>
                    </div>
                    <textarea value={a.notes||''} onChange={(e)=>updateAgendaNotes(a.id,e.target.value)} placeholder="Notater fra diskusjon, konklusjoner, åpne spørsmål..." rows={3}
                      style={{width:'100%',padding:'10px 12px',border:`1px solid ${theme.borderSoft}`,borderRadius:8,fontSize:13,fontFamily:'inherit',background:theme.surfaceAlt,color:theme.ink,resize:'vertical',outline:'none',boxSizing:'border-box',lineHeight:1.6}}/>
                  </div>
                );
              })}
              {(!meeting.agenda||meeting.agenda.length===0) && <div style={{padding:30,textAlign:'center',color:theme.inkMuted,fontSize:14}}>Ingen agendapunkter. Klikk «Rediger» for å legge til.</div>}
            </div>
          )}
          {tab==='proposals' && (
            <MeetingProposalsPanel meeting={meeting} data={data} save={save} currentUserId={currentUserId}/>
          )}
          {tab==='prep' && (
            <div>
              <div style={{background:theme.brassLight,border:`1px solid ${theme.brass}33`,borderRadius:10,padding:'12px 16px',marginBottom:18,display:'flex',gap:10,alignItems:'flex-start'}}>
                <ClipboardList size={18} style={{color:theme.brass,flexShrink:0,marginTop:2}}/>
                <div style={{fontSize:13,color:theme.ink,lineHeight:1.55}}>
                  Hver deltaker fyller inn en kort statusoppdatering før møtet: <em>nøkkeltall, viktige hendelser, hva du trenger fra de andre, bekymringer</em>. Slik blir møtet diskusjon, ikke rapportering.
                </div>
              </div>
              <div style={{display:'grid',gap:12}}>
                {meeting.attendees.map(id => {
                  const m = memberById(id); if (!m) return null;
                  const p = prep.find(pr => pr.memberId === id);
                  const filled = p && (p.content||'').trim().length > 0;
                  return (
                    <div key={id} style={{
                      border:`1px solid ${filled?theme.borderSoft:theme.border}`, borderRadius:10, padding:14,
                      background: filled ? theme.surface : theme.surfaceAlt,
                    }}>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                        <Avatar member={m} size={36}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:14,fontWeight:600,color:theme.ink}}>{m.name}</div>
                          <div style={{fontSize:12,color:theme.inkMuted}}>{m.role}</div>
                        </div>
                        {filled
                          ? <Pill bg={theme.sageLight} color={theme.sage}><CheckCircle2 size={11}/> Levert</Pill>
                          : <Pill bg={theme.surfaceAlt} color={theme.inkMuted}>Ikke levert</Pill>}
                      </div>
                      <textarea value={p?.content||''} onChange={(e)=>updatePrep(id, e.target.value)}
                        placeholder={`Forberedelse fra ${m.name.split(' ')[0]}...`} rows={3}
                        style={{width:'100%',padding:'10px 12px',border:`1px solid ${theme.borderSoft}`,borderRadius:8,fontSize:13,fontFamily:'inherit',background:theme.surface,color:theme.ink,resize:'vertical',outline:'none',boxSizing:'border-box',lineHeight:1.55}}/>
                      {p?.updatedAt && (
                        <div style={{fontSize:11,color:theme.inkMuted,marginTop:6}}>
                          Oppdatert {new Date(p.updatedAt).toLocaleString('no-NO',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab==='attendees' && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))',gap:12}}>
              {meeting.attendees.map(id => {
                const m = memberById(id); if (!m) return null;
                return (
                  <div key={id} style={{display:'flex',alignItems:'center',gap:12,padding:12,border:`1px solid ${theme.borderSoft}`,borderRadius:10}}>
                    <Avatar member={m} size={40}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:600,color:theme.ink}}>{m.name}</div>
                      <div style={{fontSize:12,color:theme.inkMuted}}>{m.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {tab==='summary' && (
            <div>
              <textarea value={meeting.summary||''} onChange={(e)=>save({...data, meetings:data.meetings.map(mt=>mt.id===meeting.id?{...mt,summary:e.target.value}:mt)})}
                placeholder="Skriv et samlet referat fra møtet her. Hovedpunkter, konklusjoner, stemning..." rows={14}
                style={{width:'100%',padding:'14px 16px',border:`1px solid ${theme.borderSoft}`,borderRadius:8,fontSize:14,fontFamily:'Fraunces, Georgia, serif',background:theme.surface,color:theme.ink,resize:'vertical',outline:'none',lineHeight:1.7,boxSizing:'border-box'}}/>
              <div style={{marginTop:8,fontSize:12,color:theme.inkMuted}}>Lagres automatisk. Bruk denne til en kort oversikt – detaljerte notater hører hjemme under hvert agendapunkt.</div>
            </div>
          )}
          {tab==='decisions' && (
            <div>
              {meetingDecisions.length===0 ? (
                <div style={{padding:30,textAlign:'center',color:theme.inkMuted,fontSize:14}}>Ingen beslutninger registrert for dette møtet ennå.</div>
              ) : (
                <div style={{display:'grid',gap:10}}>
                  {meetingDecisions.map(d => <DecisionCardSmall key={d.id} decision={d} member={memberById(d.owner)}/>)}
                </div>
              )}
              <div style={{marginTop:14}}>
                <Btn variant="ghost" icon={Plus} size="sm" onClick={()=>{
                  const title = prompt('Beslutning (kort tittel):');
                  if (!title) return;
                  save({...data, decisions:[...data.decisions, { id:uid('d'), title, description:'', date:meeting.date, meetingId:meeting.id, owner:meeting.attendees[0]||null, status:'vedtatt' }]});
                }}>Registrer beslutning</Btn>
              </div>
            </div>
          )}
          {tab==='tasks' && (
            <div>
              {meetingTasks.length===0 ? (
                <div style={{padding:30,textAlign:'center',color:theme.inkMuted,fontSize:14}}>Ingen oppgaver knyttet til dette møtet ennå.</div>
              ) : (
                <div style={{display:'grid',gap:8,border:`1px solid ${theme.borderSoft}`,borderRadius:10,overflow:'hidden'}}>
                  {meetingTasks.map(t => (
                    <TaskRow key={t.id} task={t} member={memberById(t.owner)}
                      onToggle={()=>save({...data, tasks:data.tasks.map(x=>x.id===t.id?{...x,status:x.status==='fullført'?'pågår':'fullført'}:x)})}/>
                  ))}
                </div>
              )}
              <div style={{marginTop:14}}>
                <Btn variant="ghost" icon={Plus} size="sm" onClick={()=>{
                  const title = prompt('Ny oppgave:');
                  if (!title) return;
                  save({...data, tasks:[...data.tasks, { id:uid('t'), title, description:'', owner:meeting.attendees[0]||null, dueDate:'', status:'ikke_startet', priority:'medium', meetingId:meeting.id }]});
                }}>Legg til oppgave</Btn>
              </div>
            </div>
          )}
        </div>
      </Card>
      <TranscriptModal
        open={transcriptOpen}
        onClose={()=>setTranscriptOpen(false)}
        meeting={meeting}
        data={data}
        onApply={handleApplyProposals}
      />
      <BriefingModal
        open={briefingOpen}
        onClose={()=>setBriefingOpen(false)}
        meeting={meeting}
        data={data}
      />
    </div>
  );
};

/* ===== MEETINGS VIEW ===== */
const MeetingsView = ({ data, save, focusMeetingId, onClearFocus, currentUserId }) => {
  const [filter,setFilter] = useState('all');
  const [search,setSearch] = useState('');
  const [editing,setEditing] = useState(null);
  const [openId,setOpenId] = useState(focusMeetingId||null);

  useEffect(()=>{ if(focusMeetingId){ setOpenId(focusMeetingId); onClearFocus?.(); } }, [focusMeetingId]);

  const filtered = useMemo(() => data.meetings.filter(m => {
    if (filter==='upcoming' && (m.status!=='planlagt' || daysFromNow(m.date)<0)) return false;
    if (filter==='past' && m.status!=='gjennomført') return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a,b)=>(b.date||'').localeCompare(a.date||'')), [data.meetings,filter,search]);

  const openMeeting = data.meetings.find(m=>m.id===openId);

  // Always render the Modal — uansett om vi er i detalj- eller listevisning
  const editModal = (
    <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Rediger møte':'Nytt møte'} width={720}>
      {editing && <MeetingForm meeting={editing} data={data}
        onSave={(m)=>{
          if (m.id) save({...data, meetings:data.meetings.map(x=>x.id===m.id?m:x)});
          else save({...data, meetings:[...data.meetings, {...m, id:uid('mt')}]});
          setEditing(null);
        }}
        onCancel={()=>setEditing(null)}
        onDelete={editing.id?()=>{
          save({...data, meetings:data.meetings.filter(x=>x.id!==editing.id)});
          setEditing(null);
          setOpenId(null);
        }:null}/>}
    </Modal>
  );

  if (openMeeting) {
    return (
      <React.Fragment>
        <MeetingDetail meeting={openMeeting} data={data} save={save} onBack={()=>setOpenId(null)} onEdit={()=>setEditing(openMeeting)} currentUserId={currentUserId}/>
        {editModal}
      </React.Fragment>
    );
  }

  return (
    <div>
      <SectionHeading overline="Møteoversikt" title="Møter">
        <Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Nytt møte</Btn>
      </SectionHeading>
      <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap',alignItems:'center'}}>
        <FilterTabs value={filter} onChange={setFilter} options={[
          {value:'all',label:'Alle'},{value:'upcoming',label:'Kommende'},{value:'past',label:'Gjennomførte'}
        ]}/>
        <div style={{position:'relative',flex:1,maxWidth:320}}>
          <Search size={15} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:theme.inkMuted}}/>
          <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Søk i møter..."
            style={{width:'100%',padding:'9px 12px 9px 36px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13,background:theme.surface,color:theme.ink,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}}/>
        </div>
      </div>
      {filtered.length===0 ? (
        <EmptyState icon={Calendar} title="Ingen møter ennå" message="Opprett ditt første møte og legg til agenda, deltakere og forventede beslutninger."
          action={<Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Legg til møte</Btn>}/>
      ) : (
        <div style={{display:'grid',gap:12}}>
          {filtered.map(m => <MeetingCard key={m.id} meeting={m} data={data} onClick={()=>setOpenId(m.id)}/>)}
        </div>
      )}
      {editModal}
    </div>
  );
};

/* ===== DECISIONS VIEW + FORM ===== */
const DecisionForm = ({ decision, data, onSave, onCancel, onDelete }) => {
  const [d,setD] = useState({ title:'', description:'', date:new Date().toISOString().slice(0,10), meetingId:null, owner:null, status:'vedtatt', reviewDate:'', reviewStatus:'venter', communicationPlan:'', ...decision });
  return (
    <div>
      <TextField label="Tittel" value={d.title} onChange={(v)=>setD({...d,title:v})} required placeholder="Hva er beslutningen?"/>
      <TextField label="Beskrivelse / begrunnelse" value={d.description} onChange={(v)=>setD({...d,description:v})} multiline rows={4} placeholder="Detaljer, vurderinger, alternativer..."/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <TextField label="Dato" value={d.date} onChange={(v)=>setD({...d,date:v})} type="date"/>
        <Sel label="Status" value={d.status} onChange={(v)=>setD({...d,status:v})} options={[
          {value:'vedtatt',label:'Vedtatt'},{value:'utsatt',label:'Utsatt'},{value:'forkastet',label:'Forkastet'}
        ]}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Sel label="Ansvarlig" value={d.owner} onChange={(v)=>setD({...d,owner:v})} options={data.members.map(m=>({value:m.id,label:m.name}))}/>
        <Sel label="Tilknyttet møte" value={d.meetingId} onChange={(v)=>setD({...d,meetingId:v})} options={data.meetings.map(m=>({value:m.id,label:m.title}))}/>
      </div>

      <div style={{marginTop:8,paddingTop:14,borderTop:`1px dashed ${theme.borderSoft}`}}>
        <div style={{fontSize:11,fontWeight:700,color:theme.brass,letterSpacing:0.6,textTransform:'uppercase',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
          <Bell size={12}/> Oppfølging og kommunikasjon
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <TextField label="Vurder på nytt (dato)" value={d.reviewDate} onChange={(v)=>setD({...d,reviewDate:v})} type="date"/>
          <Sel label="Oppfølgingsstatus" value={d.reviewStatus} onChange={(v)=>setD({...d,reviewStatus:v})} options={[
            {value:'venter',label:'Venter på review'},
            {value:'i_rute',label:'I rute'},
            {value:'avvik',label:'Avvik – må justeres'},
            {value:'ferdig',label:'Ferdig fulgt opp'},
          ]}/>
        </div>
        <TextField label="Kommunikasjonsplan" value={d.communicationPlan} onChange={(v)=>setD({...d,communicationPlan:v})} multiline rows={2} placeholder="Hvordan og når formidles dette ut i organisasjonen?"/>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',marginTop:18,paddingTop:16,borderTop:`1px solid ${theme.borderSoft}`}}>
        <div>{onDelete && <Btn variant="danger" icon={Trash2} onClick={()=>{ if(confirm('Slette beslutningen?')) onDelete(); }}>Slett</Btn>}</div>
        <div style={{display:'flex',gap:8}}>
          <Btn variant="ghost" onClick={onCancel}>Avbryt</Btn>
          <Btn variant="brass" icon={Save} onClick={()=>{ if(!d.title){ alert('Tittel mangler'); return; } onSave(d); }}>Lagre</Btn>
        </div>
      </div>
    </div>
  );
};

const DecisionsView = ({ data, save }) => {
  const [editing,setEditing] = useState(null);
  const [filter,setFilter] = useState('all');
  const [search,setSearch] = useState('');
  const memberById = (id) => data.members.find(m=>m.id===id);
  const filtered = useMemo(() => data.decisions.filter(d => {
    if (filter!=='all' && d.status!==filter) return false;
    if (search && !(d.title.toLowerCase().includes(search.toLowerCase()) || (d.description||'').toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }).sort((a,b)=>(b.date||'').localeCompare(a.date||'')), [data.decisions,filter,search]);
  return (
    <div>
      <SectionHeading overline="Vedtaksregister" title="Beslutninger">
        <Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Ny beslutning</Btn>
      </SectionHeading>
      <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap',alignItems:'center'}}>
        <FilterTabs value={filter} onChange={setFilter} options={[
          {value:'all',label:'Alle'},{value:'vedtatt',label:'Vedtatt'},{value:'utsatt',label:'Utsatt'},{value:'forkastet',label:'Forkastet'}
        ]}/>
        <div style={{position:'relative',flex:1,maxWidth:320}}>
          <Search size={15} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:theme.inkMuted}}/>
          <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Søk..."
            style={{width:'100%',padding:'9px 12px 9px 36px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13,background:theme.surface,color:theme.ink,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}}/>
        </div>
      </div>
      {filtered.length===0 ? (
        <EmptyState icon={Gavel} title="Ingen beslutninger registrert" message={`Hver beslutning ${data.org?.groupNoun || 'ledergruppen'} tar bør registreres her med ansvarlig og status. Det skaper sporbarhet.`}
          action={<Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Ny beslutning</Btn>}/>
      ) : (
        <div style={{display:'grid',gap:12}}>
          {filtered.map(d => {
            const sc = statusColor(d.status); const m = memberById(d.owner);
            const meeting = data.meetings.find(mt=>mt.id===d.meetingId);
            return (
              <Card key={d.id} onClick={()=>setEditing(d)}>
                <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
                  <div style={{width:4,alignSelf:'stretch',background:sc.fg,borderRadius:2,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',gap:12,marginBottom:8,flexWrap:'wrap'}}>
                      <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:18,fontWeight:500,color:theme.ink,margin:0,letterSpacing:-0.2}}>{d.title}</h3>
                      <Pill bg={sc.bg} color={sc.fg}>{statusLabels[d.status]}</Pill>
                    </div>
                    {d.description && <p style={{fontSize:14,color:theme.inkSoft,margin:'0 0 12px',lineHeight:1.55}}>{d.description}</p>}
                    <div style={{display:'flex',gap:16,flexWrap:'wrap',fontSize:12,color:theme.inkMuted,alignItems:'center'}}>
                      <span style={{display:'inline-flex',alignItems:'center',gap:5}}><Calendar size={13}/> {fmtDate(d.date)}</span>
                      {m && <span style={{display:'inline-flex',alignItems:'center',gap:6}}><Avatar member={m} size={20}/> {m.name}</span>}
                      {meeting && <span style={{display:'inline-flex',alignItems:'center',gap:5}}><Calendar size={13}/> Fra møte: {meeting.title}</span>}
                      {d.reviewDate && (() => {
                        const dn = daysFromNow(d.reviewDate);
                        const overdue = dn < 0 && d.reviewStatus !== 'ferdig';
                        const upcoming = dn >= 0 && dn <= 14 && d.reviewStatus === 'venter';
                        if (d.reviewStatus === 'ferdig') return <Pill bg={theme.sageLight} color={theme.sage}><CheckCircle2 size={11}/> Fulgt opp</Pill>;
                        if (overdue) return <Pill bg={theme.rustLight} color={theme.rust}><Bell size={11}/> Review forfalt</Pill>;
                        if (upcoming) return <Pill bg={theme.amberLight} color="#8B6914"><Bell size={11}/> Review {relativeDate(d.reviewDate)}</Pill>;
                        return <span style={{fontSize:11,color:theme.inkMuted}}>Review {fmtDate(d.reviewDate)}</span>;
                      })()}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Rediger beslutning':'Ny beslutning'}>
        {editing && <DecisionForm decision={editing} data={data}
          onSave={(d)=>{
            if (d.id) save({...data, decisions:data.decisions.map(x=>x.id===d.id?d:x)});
            else save({...data, decisions:[...data.decisions, {...d, id:uid('d')}]});
            setEditing(null);
          }}
          onCancel={()=>setEditing(null)}
          onDelete={editing.id?()=>{ save({...data, decisions:data.decisions.filter(x=>x.id!==editing.id)}); setEditing(null); }:null}/>}
      </Modal>
    </div>
  );
};

/* ===== TASKS VIEW + FORM ===== */
const TaskForm = ({ task, data, onSave, onCancel, onDelete }) => {
  const [t,setT] = useState({ title:'', description:'', owner:null, dueDate:'', status:'ikke_startet', priority:'medium', meetingId:null, ...task });
  return (
    <div>
      <TextField label="Hva skal gjøres?" value={t.title} onChange={(v)=>setT({...t,title:v})} required/>
      <TextField label="Beskrivelse" value={t.description} onChange={(v)=>setT({...t,description:v})} multiline rows={3}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Sel label="Ansvarlig" value={t.owner} onChange={(v)=>setT({...t,owner:v})} required options={data.members.map(m=>({value:m.id,label:m.name}))}/>
        <TextField label="Frist" value={t.dueDate} onChange={(v)=>setT({...t,dueDate:v})} type="date"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Sel label="Prioritet" value={t.priority} onChange={(v)=>setT({...t,priority:v})} options={[
          {value:'høy',label:'Høy'},{value:'medium',label:'Medium'},{value:'lav',label:'Lav'}
        ]}/>
        <Sel label="Status" value={t.status} onChange={(v)=>setT({...t,status:v})} options={[
          {value:'ikke_startet',label:'Ikke startet'},{value:'pågår',label:'Pågår'},{value:'blokkert',label:'Blokkert'},{value:'fullført',label:'Fullført'}
        ]}/>
      </div>
      <Sel label="Tilknyttet møte" value={t.meetingId} onChange={(v)=>setT({...t,meetingId:v})} options={data.meetings.map(m=>({value:m.id,label:m.title}))}/>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:18,paddingTop:16,borderTop:`1px solid ${theme.borderSoft}`}}>
        <div>{onDelete && <Btn variant="danger" icon={Trash2} onClick={()=>{ if(confirm('Slette oppgaven?')) onDelete(); }}>Slett</Btn>}</div>
        <div style={{display:'flex',gap:8}}>
          <Btn variant="ghost" onClick={onCancel}>Avbryt</Btn>
          <Btn variant="brass" icon={Save} onClick={()=>{ if(!t.title||!t.owner){ alert('Tittel og ansvarlig kreves'); return; } onSave(t); }}>Lagre</Btn>
        </div>
      </div>
    </div>
  );
};

const TasksView = ({ data, save }) => {
  const [editing,setEditing] = useState(null);
  const [filter,setFilter] = useState('open');
  const [ownerFilter,setOwnerFilter] = useState('all');
  const memberById = (id) => data.members.find(m=>m.id===id);
  const filtered = useMemo(() => data.tasks.filter(t => {
    if (filter==='open' && t.status==='fullført') return false;
    if (filter==='done' && t.status!=='fullført') return false;
    if (filter==='overdue' && (t.status==='fullført' || daysFromNow(t.dueDate)>=0)) return false;
    if (ownerFilter!=='all' && t.owner!==ownerFilter) return false;
    return true;
  }).sort((a,b)=>{
    if (a.status==='fullført' && b.status!=='fullført') return 1;
    if (a.status!=='fullført' && b.status==='fullført') return -1;
    return (a.dueDate||'9999').localeCompare(b.dueDate||'9999');
  }), [data.tasks,filter,ownerFilter]);
  return (
    <div>
      <SectionHeading overline="Oppgaver og ansvar" title="Oppgaver">
        <Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Ny oppgave</Btn>
      </SectionHeading>
      <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <FilterTabs value={filter} onChange={setFilter} options={[
          {value:'open',label:'Åpne'},{value:'overdue',label:'Forfalt'},{value:'done',label:'Fullførte'},{value:'all',label:'Alle'}
        ]}/>
        <select value={ownerFilter} onChange={(e)=>setOwnerFilter(e.target.value)}
          style={{padding:'8px 12px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13,background:theme.surface,color:theme.ink,fontFamily:'inherit',cursor:'pointer'}}>
          <option value="all">Alle ansvarlige</option>
          {data.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      {filtered.length===0 ? (
        <EmptyState icon={ListTodo} title="Ingen oppgaver" message={`Oppgaver fra ${data.org?.meetingNoun || 'ledermøte'}r samles her med ansvarlig og frist.`}
          action={<Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Ny oppgave</Btn>}/>
      ) : (
        <Card padded={false}>
          {filtered.map(t => (
            <TaskRow key={t.id} task={t} member={memberById(t.owner)}
              onToggle={()=>save({...data, tasks:data.tasks.map(x=>x.id===t.id?{...x,status:x.status==='fullført'?'pågår':'fullført'}:x)})}
              onClick={()=>setEditing(t)}/>
          ))}
        </Card>
      )}
      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Rediger oppgave':'Ny oppgave'}>
        {editing && <TaskForm task={editing} data={data}
          onSave={(t)=>{
            if (t.id) save({...data, tasks:data.tasks.map(x=>x.id===t.id?t:x)});
            else save({...data, tasks:[...data.tasks, {...t, id:uid('t')}]});
            setEditing(null);
          }}
          onCancel={()=>setEditing(null)}
          onDelete={editing.id?()=>{ save({...data, tasks:data.tasks.filter(x=>x.id!==editing.id)}); setEditing(null); }:null}/>}
      </Modal>
    </div>
  );
};

/* ===== DOCUMENTS VIEW + FORM ===== */
const DocumentForm = ({ doc, onSave, onCancel, onDelete }) => {
  const [d,setD] = useState({ title:'', category:'', url:'', notes:'', ...doc });
  return (
    <div>
      <TextField label="Tittel" value={d.title} onChange={(v)=>setD({...d,title:v})} required/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <TextField label="Kategori" value={d.category} onChange={(v)=>setD({...d,category:v})} placeholder="Strategi, Økonomi, HR..."/>
        <TextField label="Lenke (URL)" value={d.url} onChange={(v)=>setD({...d,url:v})} placeholder="https://..."/>
      </div>
      <TextField label="Notater" value={d.notes} onChange={(v)=>setD({...d,notes:v})} multiline rows={3}/>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:18,paddingTop:16,borderTop:`1px solid ${theme.borderSoft}`}}>
        <div>{onDelete && <Btn variant="danger" icon={Trash2} onClick={()=>{ if(confirm('Slette dokumentet?')) onDelete(); }}>Slett</Btn>}</div>
        <div style={{display:'flex',gap:8}}>
          <Btn variant="ghost" onClick={onCancel}>Avbryt</Btn>
          <Btn variant="brass" icon={Save} onClick={()=>{ if(!d.title){ alert('Tittel mangler'); return; } onSave(d); }}>Lagre</Btn>
        </div>
      </div>
    </div>
  );
};

const DocumentsView = ({ data, save }) => {
  const [editing,setEditing] = useState(null);
  const [search,setSearch] = useState('');
  const [category,setCategory] = useState('all');
  const categories = useMemo(()=>{ const set=new Set(data.documents.map(d=>d.category).filter(Boolean)); return ['all',...Array.from(set)]; },[data.documents]);
  const filtered = useMemo(() => data.documents.filter(d => {
    if (category!=='all' && d.category!==category) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a,b)=>(b.addedDate||'').localeCompare(a.addedDate||'')), [data.documents,category,search]);
  return (
    <div>
      <SectionHeading overline="Delt arkiv" title="Dokumenter">
        <Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Legg til dokument</Btn>
      </SectionHeading>
      <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap'}}>
        <select value={category} onChange={(e)=>setCategory(e.target.value)}
          style={{padding:'8px 12px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13,background:theme.surface,color:theme.ink,fontFamily:'inherit',cursor:'pointer'}}>
          {categories.map(c => <option key={c} value={c}>{c==='all'?'Alle kategorier':c}</option>)}
        </select>
        <div style={{position:'relative',flex:1,maxWidth:320}}>
          <Search size={15} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:theme.inkMuted}}/>
          <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Søk..."
            style={{width:'100%',padding:'9px 12px 9px 36px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13,background:theme.surface,color:theme.ink,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}}/>
        </div>
      </div>
      {filtered.length===0 ? (
        <EmptyState icon={Folder} title="Ingen dokumenter" message="Legg til lenker til strategidokumenter, rapporter, presentasjoner og avtaler."
          action={<Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Legg til dokument</Btn>}/>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:14}}>
          {filtered.map(d => (
            <Card key={d.id} onClick={()=>setEditing(d)}>
              <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:10}}>
                <div style={{width:38,height:38,borderRadius:9,background:theme.brassLight,display:'flex',alignItems:'center',justifyContent:'center',color:theme.brass,flexShrink:0}}>
                  <FileText size={18}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,color:theme.brass,fontWeight:700,textTransform:'uppercase',letterSpacing:0.6,marginBottom:2}}>{d.category||'Generelt'}</div>
                  <div style={{fontSize:15,fontWeight:600,color:theme.ink,lineHeight:1.3}}>{d.title}</div>
                </div>
              </div>
              {d.notes && <div style={{fontSize:13,color:theme.inkSoft,marginBottom:10,lineHeight:1.5}}>{d.notes}</div>}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,color:theme.inkMuted}}>
                <span>{fmtDate(d.addedDate)}</span>
                {d.url && (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" onClick={(e)=>e.stopPropagation()}
                    style={{color:theme.brass,textDecoration:'none',fontWeight:600,display:'inline-flex',alignItems:'center',gap:4}}>
                    Åpne <ExternalLink size={11}/>
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Rediger dokument':'Nytt dokument'}>
        {editing && <DocumentForm doc={editing}
          onSave={(d)=>{
            if (d.id) save({...data, documents:data.documents.map(x=>x.id===d.id?d:x)});
            else save({...data, documents:[...data.documents, {...d, id:uid('doc'), addedDate:new Date().toISOString().slice(0,10)}]});
            setEditing(null);
          }}
          onCancel={()=>setEditing(null)}
          onDelete={editing.id?()=>{ save({...data, documents:data.documents.filter(x=>x.id!==editing.id)}); setEditing(null); }:null}/>}
      </Modal>
    </div>
  );
};

/* ===== TEAM VIEW + FORM ===== */
const MemberForm = ({ member, onSave, onCancel, onDelete }) => {
  const [m,setM] = useState({ name:'', role:'', email:'', ...member });
  return (
    <div>
      <TextField label="Navn" value={m.name} onChange={(v)=>setM({...m,name:v})} required/>
      <TextField label="Rolle / Tittel" value={m.role} onChange={(v)=>setM({...m,role:v})} required placeholder="F.eks. Daglig leder"/>
      <TextField label="E-post" value={m.email} onChange={(v)=>setM({...m,email:v})} type="email"/>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:18,paddingTop:16,borderTop:`1px solid ${theme.borderSoft}`}}>
        <div>{onDelete && <Btn variant="danger" icon={Trash2} onClick={()=>{ if(confirm('Slette medlemmet?')) onDelete(); }}>Slett</Btn>}</div>
        <div style={{display:'flex',gap:8}}>
          <Btn variant="ghost" onClick={onCancel}>Avbryt</Btn>
          <Btn variant="brass" icon={Save} onClick={()=>{ if(!m.name||!m.role){ alert('Navn og rolle kreves'); return; } onSave(m); }}>Lagre</Btn>
        </div>
      </div>
    </div>
  );
};

const TeamView = ({ data, save }) => {
  const [editing,setEditing] = useState(null);
  return (
    <div>
      <SectionHeading overline={data.org?.teamOverline || 'Personene bak beslutningene'} title={data.org?.teamLabel || 'Ledergruppen'}>
        <Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Legg til medlem</Btn>
      </SectionHeading>
      {data.members.length===0 ? (
        <EmptyState icon={Users} title="Ingen medlemmer" message={`Legg til medlemmene i ${data.org?.groupNoun || 'ledergruppen'} for å kunne fordele oppgaver og spore deltakelse.`}
          action={<Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Legg til medlem</Btn>}/>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',gap:14}}>
          {data.members.map(m => {
            const tasks = data.tasks.filter(t=>t.owner===m.id);
            const open = tasks.filter(t=>t.status!=='fullført').length;
            return (
              <Card key={m.id} onClick={()=>setEditing(m)}>
                <div style={{display:'flex',alignItems:'flex-start',gap:14,marginBottom:14}}>
                  <Avatar member={m} size={52}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:'Fraunces, Georgia, serif',fontSize:19,fontWeight:500,color:theme.ink,letterSpacing:-0.2,marginBottom:2}}>{m.name}</div>
                    <div style={{fontSize:13,color:theme.brass,fontWeight:600}}>{m.role}</div>
                  </div>
                </div>
                {m.email && <div style={{fontSize:12,color:theme.inkMuted,display:'flex',alignItems:'center',gap:5,marginBottom:12}}><Mail size={13}/> {m.email}</div>}
                <div style={{display:'flex',gap:10,paddingTop:10,borderTop:`1px solid ${theme.borderSoft}`,fontSize:12}}>
                  <div>
                    <div style={{fontFamily:'Fraunces, Georgia, serif',fontSize:22,color:theme.ink,lineHeight:1,fontWeight:500}}>{open}</div>
                    <div style={{color:theme.inkMuted,fontSize:11,textTransform:'uppercase',letterSpacing:0.5,fontWeight:600}}>Åpne oppgaver</div>
                  </div>
                  <div style={{width:1,background:theme.borderSoft}}/>
                  <div>
                    <div style={{fontFamily:'Fraunces, Georgia, serif',fontSize:22,color:theme.ink,lineHeight:1,fontWeight:500}}>{tasks.length}</div>
                    <div style={{color:theme.inkMuted,fontSize:11,textTransform:'uppercase',letterSpacing:0.5,fontWeight:600}}>Totalt</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Rediger medlem':'Nytt medlem'}>
        {editing && <MemberForm member={editing}
          onSave={(m)=>{
            const initials = (m.name||'').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase();
            const final = {...m, initials};
            if (m.id) save({...data, members:data.members.map(x=>x.id===m.id?final:x)});
            else save({...data, members:[...data.members, {...final, id:uid('m')}]});
            setEditing(null);
          }}
          onCancel={()=>setEditing(null)}
          onDelete={editing.id?()=>{ save({...data, members:data.members.filter(x=>x.id!==editing.id)}); setEditing(null); }:null}/>}
      </Modal>
    </div>
  );
};

/* ===== SAKSINNMELDING / AGENDA PROPOSALS ===== */
const AgendaProposalForm = ({ proposal, data, defaultMeetingId, defaultProposer, onSave, onCancel, onDelete }) => {
  const [p, setP] = useState({
    title:'', description:'',
    proposer: defaultProposer || null,
    meetingId: defaultMeetingId || null,
    desiredDuration: 15,
    category: 'diskusjon',
    priority: 'medium',
    status: 'foreslått',
    notes:'',
    proposedDate: new Date().toISOString().slice(0,10),
    ...proposal
  });

  // Bare planlagte fremtidige møter er aktuelle som mål for innmelding
  const eligibleMeetings = (data.meetings || [])
    .filter(m => m.status === 'planlagt' && daysFromNow(m.date) >= 0)
    .sort((a,b) => (a.date||'').localeCompare(b.date||''));

  return (
    <div>
      <div style={{background:theme.brassLight,border:`1px solid ${theme.brass}33`,borderRadius:10,padding:'12px 14px',marginBottom:18,display:'flex',gap:10,alignItems:'flex-start'}}>
        <Inbox size={16} style={{color:theme.brass,flexShrink:0,marginTop:2}}/>
        <div style={{fontSize:12.5,color:theme.ink,lineHeight:1.55}}>
          En sak er noe du ønsker at {data.org?.groupNoun || 'ledergruppen'} skal <strong>orienteres om</strong>, <strong>diskutere</strong> eller <strong>beslutte</strong>. Velg et møte hvis du vet hvor saken hører hjemme – ellers legges den i puljen til neste tilgjengelige møte.
        </div>
      </div>

      <TextField label="Sakstittel" value={p.title} onChange={(v)=>setP({...p,title:v})} required placeholder="Kort og presis – som det vil stå på agendaen"/>
      <TextField label="Beskrivelse / bakgrunn" value={p.description} onChange={(v)=>setP({...p,description:v})} multiline rows={4} placeholder="Hva handler saken om? Hvorfor er den viktig? Hva trengs fra gruppen?"/>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Sel label="Type sak" value={p.category} onChange={(v)=>setP({...p,category:v})} required options={[
          {value:'orientering',label:'Orientering – kort statusoppdatering'},
          {value:'diskusjon',label:'Diskusjon – trenger gruppens innspill'},
          {value:'beslutning',label:'Beslutning – krever vedtak'},
          {value:'informasjon',label:'Informasjon – til kjennskap'},
        ]}/>
        <Sel label="Prioritet" value={p.priority} onChange={(v)=>setP({...p,priority:v})} options={[
          {value:'høy',label:'Høy – haster'},
          {value:'medium',label:'Medium – ordinær'},
          {value:'lav',label:'Lav – når det passer'},
        ]}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Sel label="Innmeldt av" value={p.proposer} onChange={(v)=>setP({...p,proposer:v})} required options={data.members.map(m=>({value:m.id,label:m.name}))}/>
        <TextField label="Ønsket varighet (minutter)" value={p.desiredDuration} onChange={(v)=>setP({...p,desiredDuration:parseInt(v)||0})} type="number"/>
      </div>

      <Sel label="Ønsket møte (valgfritt)" value={p.meetingId||''} onChange={(v)=>setP({...p,meetingId:v||null})}
        options={eligibleMeetings.map(m => ({ value:m.id, label:`${m.title} – ${fmtDate(m.date)}` }))}/>
      {!p.meetingId && (
        <div style={{fontSize:12,color:theme.inkMuted,marginTop:-8,marginBottom:14,paddingLeft:2,display:'flex',alignItems:'center',gap:6}}>
          <Inbox size={12}/> Saken legges i puljen og kan plukkes opp av møteleder
        </div>
      )}

      <TextField label="Forberedelse / merknader (valgfritt)" value={p.notes} onChange={(v)=>setP({...p,notes:v})} multiline rows={2} placeholder="Vedlegg-referanser, hvem som bør forberede seg, koblinger til andre saker..."/>

      {p.id && (
        <Sel label="Status" value={p.status} onChange={(v)=>setP({...p,status:v})} options={[
          {value:'foreslått',label:'Innmeldt – venter på godkjenning'},
          {value:'akseptert',label:'Akseptert – satt på agenda'},
          {value:'utsatt',label:'Utsatt – tas på senere møte'},
          {value:'avvist',label:'Avvist – behandles ikke'},
        ]}/>
      )}

      <div style={{display:'flex',justifyContent:'space-between',marginTop:18,paddingTop:16,borderTop:`1px solid ${theme.borderSoft}`}}>
        <div>{onDelete && <Btn variant="danger" icon={Trash2} onClick={()=>{ if(confirm('Slette saksinnmeldingen?')) onDelete(); }}>Slett</Btn>}</div>
        <div style={{display:'flex',gap:8}}>
          <Btn variant="ghost" onClick={onCancel}>Avbryt</Btn>
          <Btn variant="brass" icon={Save} onClick={()=>{
            if (!p.title || !p.proposer) { alert('Tittel og innmelder kreves'); return; }
            onSave(p);
          }}>{p.id ? 'Oppdater' : 'Meld inn sak'}</Btn>
        </div>
      </div>
    </div>
  );
};

const AgendaProposalCard = ({ proposal, data, onEdit, onAccept, onReject, onPostpone, onMoveToMeeting, compact }) => {
  const memberById = (id) => data.members.find(m => m.id === id);
  const proposer = memberById(proposal.proposer);
  const meeting = data.meetings.find(m => m.id === proposal.meetingId);
  const cc = proposalCategoryColor(proposal.category);
  const sc = statusColor(proposal.status);
  const [menuOpen, setMenuOpen] = useState(false);
  const eligibleMeetings = (data.meetings || [])
    .filter(m => m.status === 'planlagt' && daysFromNow(m.date) >= 0 && m.id !== proposal.meetingId)
    .sort((a,b) => (a.date||'').localeCompare(b.date||''));

  return (
    <Card onClick={onEdit} style={{position:'relative'}}>
      <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
        <div style={{width:4,alignSelf:'stretch',background:cc.fg,borderRadius:2,flexShrink:0}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,flexWrap:'wrap'}}>
            <Pill bg={cc.bg} color={cc.fg}>{proposalCategoryLabels[proposal.category]||proposal.category}</Pill>
            <Pill bg={sc.bg} color={sc.fg}>{statusLabels[proposal.status]||proposal.status}</Pill>
            {proposal.priority === 'høy' && (
              <Pill bg={theme.rustLight} color={theme.rust}>⚡ Haster</Pill>
            )}
            <span style={{fontSize:11,color:theme.inkMuted,marginLeft:'auto',display:'inline-flex',alignItems:'center',gap:4}}>
              <Clock size={11}/> {proposal.desiredDuration} min
            </span>
          </div>
          <div style={{fontSize:15,fontWeight:600,color:theme.ink,marginBottom:6,lineHeight:1.3}}>{proposal.title}</div>
          {!compact && proposal.description && (
            <div style={{fontSize:13,color:theme.inkSoft,lineHeight:1.55,marginBottom:10}}>{proposal.description}</div>
          )}
          {!compact && proposal.notes && (
            <div style={{fontSize:12,color:theme.inkSoft,padding:'8px 10px',background:theme.surfaceAlt,borderRadius:6,marginBottom:10,lineHeight:1.5,fontStyle:'italic'}}>
              {proposal.notes}
            </div>
          )}
          <div style={{display:'flex',gap:14,fontSize:12,color:theme.inkMuted,flexWrap:'wrap',alignItems:'center'}}>
            {proposer && (
              <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                <Avatar member={proposer} size={20}/> {proposer.name}
              </span>
            )}
            <span>Innmeldt {relativeDate(proposal.proposedDate)}</span>
            {meeting ? (
              <span style={{display:'inline-flex',alignItems:'center',gap:5,color:theme.brass,fontWeight:600}}>
                <Calendar size={12}/> {meeting.title}
              </span>
            ) : (
              <span style={{display:'inline-flex',alignItems:'center',gap:5,color:theme.amber,fontWeight:600}}>
                <Inbox size={12}/> I puljen
              </span>
            )}
          </div>
        </div>
        {(onAccept || onReject || onPostpone || onMoveToMeeting) && proposal.status === 'foreslått' && (
          <div onClick={(e)=>e.stopPropagation()} style={{display:'flex',gap:6,alignSelf:'flex-start',flexWrap:'wrap',position:'relative'}}>
            {onAccept && (
              <button onClick={onAccept}
                title="Godkjenn og legg på agenda"
                style={{background:theme.sageLight,color:theme.sage,border:`1px solid ${theme.sage}40`,padding:'5px 9px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:4}}>
                <CheckCircle2 size={12}/> Godkjenn
              </button>
            )}
            {onPostpone && (
              <button onClick={onPostpone}
                title="Utsett til senere"
                style={{background:theme.amberLight,color:'#8B6914',border:`1px solid ${theme.amber}40`,padding:'5px 9px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:4}}>
                <Clock size={12}/> Utsett
              </button>
            )}
            {onReject && (
              <button onClick={onReject}
                title="Avvis"
                style={{background:'transparent',color:theme.rust,border:`1px solid ${theme.rustLight}`,padding:'5px 9px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:4}}>
                <X size={12}/> Avvis
              </button>
            )}
            {onMoveToMeeting && eligibleMeetings.length > 0 && (
              <div style={{position:'relative'}}>
                <button onClick={()=>setMenuOpen(!menuOpen)}
                  title="Flytt til annet møte"
                  style={{background:'transparent',color:theme.inkSoft,border:`1px solid ${theme.border}`,padding:'5px 9px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:4}}>
                  <ArrowRight size={12}/> Flytt
                </button>
                {menuOpen && (
                  <div style={{position:'absolute',top:'100%',right:0,marginTop:4,background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:8,boxShadow:'0 8px 20px rgba(0,0,0,0.12)',zIndex:10,minWidth:240,padding:6}}>
                    {eligibleMeetings.slice(0,8).map(m => (
                      <button key={m.id} onClick={()=>{ onMoveToMeeting(m.id); setMenuOpen(false); }}
                        style={{display:'block',width:'100%',textAlign:'left',padding:'8px 10px',background:'transparent',border:'none',cursor:'pointer',fontSize:12,color:theme.ink,fontFamily:'inherit',borderRadius:4}}
                        onMouseEnter={(e)=>e.currentTarget.style.background=theme.surfaceAlt}
                        onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                        <div style={{fontWeight:600,marginBottom:2}}>{m.title}</div>
                        <div style={{fontSize:11,color:theme.inkMuted}}>{fmtDate(m.date)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

/* Visning av innmeldte saker som hører til et bestemt møte – brukes i møtedetaljen */
const MeetingProposalsPanel = ({ meeting, data, save, currentUserId }) => {
  const [editing, setEditing] = useState(null);
  const proposals = (data.agendaProposals || []).filter(p => p.meetingId === meeting.id);
  const pending = proposals.filter(p => p.status === 'foreslått');
  const accepted = proposals.filter(p => p.status === 'akseptert');
  const rejected = proposals.filter(p => p.status === 'avvist' || p.status === 'utsatt');

  const updateStatus = (proposalId, newStatus, extra = {}) => {
    save({ ...data,
      agendaProposals: (data.agendaProposals||[]).map(p =>
        p.id === proposalId ? { ...p, status: newStatus, ...extra } : p
      )
    });
  };

  // Godkjenn: status -> akseptert OG legg som agendapunkt i møtet
  const accept = (proposal) => {
    const newAgendaItem = {
      id: uid('a'),
      title: proposal.title,
      presenter: proposal.proposer,
      duration: proposal.desiredDuration || 15,
      notes: proposal.description ? `[Innmeldt sak] ${proposal.description}` : '',
    };
    save({ ...data,
      meetings: data.meetings.map(m =>
        m.id === meeting.id ? { ...m, agenda:[...(m.agenda||[]), newAgendaItem] } : m
      ),
      agendaProposals: (data.agendaProposals||[]).map(p =>
        p.id === proposal.id ? { ...p, status:'akseptert' } : p
      )
    });
  };

  const moveToMeeting = (proposalId, newMeetingId) => {
    save({ ...data,
      agendaProposals: (data.agendaProposals||[]).map(p =>
        p.id === proposalId ? { ...p, meetingId: newMeetingId } : p
      )
    });
  };

  return (
    <div>
      <div style={{background:theme.brassLight,border:`1px solid ${theme.brass}33`,borderRadius:10,padding:'12px 16px',marginBottom:18,display:'flex',gap:10,alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap'}}>
        <div style={{display:'flex',gap:10,alignItems:'flex-start',flex:1,minWidth:240}}>
          <Inbox size={18} style={{color:theme.brass,flexShrink:0,marginTop:2}}/>
          <div style={{fontSize:13,color:theme.ink,lineHeight:1.55}}>
            Saker som er meldt inn til dette møtet. Godkjente saker legges automatisk på agendaen.
            {pending.length > 0 && <span> Det er <strong>{pending.length}</strong> {pending.length===1?'sak':'saker'} som venter på avklaring.</span>}
          </div>
        </div>
        <Btn icon={Plus} variant="brass" size="sm" onClick={()=>setEditing({})}>Meld inn sak</Btn>
      </div>

      {proposals.length === 0 ? (
        <div style={{padding:30,textAlign:'center',color:theme.inkMuted,fontSize:14,background:theme.surfaceAlt,borderRadius:10}}>
          Ingen innmeldte saker til dette møtet ennå.
          <div style={{marginTop:14}}>
            <Btn icon={Plus} variant="ghost" size="sm" onClick={()=>setEditing({})}>Meld inn første sak</Btn>
          </div>
        </div>
      ) : (
        <div>
          {pending.length > 0 && (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,color:theme.brassDark,letterSpacing:0.6,textTransform:'uppercase',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
                <Bell size={12}/> Venter på avklaring · {pending.length}
              </div>
              <div style={{display:'grid',gap:10}}>
                {pending.map(p => (
                  <AgendaProposalCard key={p.id} proposal={p} data={data}
                    onEdit={()=>setEditing(p)}
                    onAccept={()=>accept(p)}
                    onReject={()=>updateStatus(p.id,'avvist')}
                    onPostpone={()=>updateStatus(p.id,'utsatt',{ meetingId:null })}
                    onMoveToMeeting={(newId)=>moveToMeeting(p.id, newId)}/>
                ))}
              </div>
            </div>
          )}
          {accepted.length > 0 && (
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,color:theme.sage,letterSpacing:0.6,textTransform:'uppercase',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
                <CheckCircle2 size={12}/> Akseptert og på agenda · {accepted.length}
              </div>
              <div style={{display:'grid',gap:10}}>
                {accepted.map(p => (
                  <AgendaProposalCard key={p.id} proposal={p} data={data}
                    onEdit={()=>setEditing(p)}/>
                ))}
              </div>
            </div>
          )}
          {rejected.length > 0 && (
            <div>
              <div style={{fontSize:11,fontWeight:700,color:theme.inkMuted,letterSpacing:0.6,textTransform:'uppercase',marginBottom:10}}>
                Avvist/utsatt · {rejected.length}
              </div>
              <div style={{display:'grid',gap:10}}>
                {rejected.map(p => (
                  <AgendaProposalCard key={p.id} proposal={p} data={data}
                    onEdit={()=>setEditing(p)}/>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Rediger sak':'Meld inn ny sak'} width={680}>
        {editing && <AgendaProposalForm proposal={editing} data={data}
          defaultMeetingId={meeting.id}
          defaultProposer={currentUserId}
          onSave={(p)=>{
            const list = data.agendaProposals || [];
            if (p.id) save({...data, agendaProposals: list.map(x=>x.id===p.id?p:x)});
            else save({...data, agendaProposals: [...list, {...p, id:uid('sak')}]});
            setEditing(null);
          }}
          onCancel={()=>setEditing(null)}
          onDelete={editing.id ? ()=>{ save({...data, agendaProposals:(data.agendaProposals||[]).filter(x=>x.id!==editing.id)}); setEditing(null); } : null}/>}
      </Modal>
    </div>
  );
};

/* Felles visning av alle saker – egen sidebar-side */
const ProposalsView = ({ data, save, currentUserId }) => {
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('åpne');
  const [search, setSearch] = useState('');
  const proposals = data.agendaProposals || [];
  const memberById = (id) => data.members.find(m => m.id === id);

  const filtered = useMemo(() => proposals.filter(p => {
    if (filter === 'åpne' && p.status !== 'foreslått') return false;
    if (filter === 'pool' && (p.status !== 'foreslått' || p.meetingId)) return false;
    if (filter === 'mine' && p.proposer !== currentUserId) return false;
    if (filter === 'behandlet' && (p.status === 'foreslått')) return false;
    if (search && !(p.title.toLowerCase().includes(search.toLowerCase()) || (p.description||'').toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }).sort((a,b) => {
    const priorityOrder = { høy:0, medium:1, lav:2 };
    if ((priorityOrder[a.priority]??1) !== (priorityOrder[b.priority]??1)) return (priorityOrder[a.priority]??1) - (priorityOrder[b.priority]??1);
    return (b.proposedDate||'').localeCompare(a.proposedDate||'');
  }), [proposals, filter, search, currentUserId]);

  const updateStatus = (id, status, extra = {}) => {
    save({ ...data,
      agendaProposals: proposals.map(p => p.id === id ? { ...p, status, ...extra } : p)
    });
  };

  const accept = (proposal) => {
    if (!proposal.meetingId) { alert('Saken må først tildeles et møte før den kan godkjennes.'); return; }
    const meeting = data.meetings.find(m => m.id === proposal.meetingId);
    if (!meeting) return;
    const newAgendaItem = {
      id: uid('a'),
      title: proposal.title,
      presenter: proposal.proposer,
      duration: proposal.desiredDuration || 15,
      notes: proposal.description ? `[Innmeldt sak] ${proposal.description}` : '',
    };
    save({ ...data,
      meetings: data.meetings.map(m => m.id === meeting.id ? { ...m, agenda:[...(m.agenda||[]), newAgendaItem] } : m),
      agendaProposals: proposals.map(p => p.id === proposal.id ? { ...p, status:'akseptert' } : p),
    });
  };

  const counts = {
    åpne: proposals.filter(p => p.status === 'foreslått').length,
    pool: proposals.filter(p => p.status === 'foreslått' && !p.meetingId).length,
    mine: proposals.filter(p => p.proposer === currentUserId).length,
    behandlet: proposals.filter(p => p.status !== 'foreslått').length,
  };

  return (
    <div>
      <SectionHeading overline={data.org?.proposalsOverline || 'Saker til ledergruppemøtene'} title="Innmeldte saker">
        <Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Meld inn sak</Btn>
      </SectionHeading>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:14,marginBottom:24}}>
        <KPI label="Åpne saker"     value={counts.åpne}      accent={theme.brass} icon={Inbox}
          sub={counts.pool>0 ? `${counts.pool} i puljen` : 'Alle tildelt møte'} onClick={()=>setFilter('åpne')}/>
        <KPI label="Mine innmeldte" value={counts.mine}      accent={theme.navy}  icon={UserCheck}
          onClick={()=>setFilter('mine')}/>
        <KPI label="Behandlet"      value={counts.behandlet} accent={theme.sage}  icon={CheckCircle2}
          sub={`${proposals.filter(p=>p.status==='akseptert').length} på agenda`} onClick={()=>setFilter('behandlet')}/>
        <KPI label="I puljen"       value={counts.pool}      accent={theme.amber} icon={Folder}
          sub="Venter på møte" onClick={()=>setFilter('pool')}/>
      </div>

      <div style={{display:'flex',gap:12,marginBottom:24,flexWrap:'wrap',alignItems:'center'}}>
        <FilterTabs value={filter} onChange={setFilter} options={[
          {value:'åpne',label:'Åpne'},
          {value:'pool',label:'I puljen'},
          {value:'mine',label:'Mine'},
          {value:'behandlet',label:'Behandlet'},
          {value:'all',label:'Alle'},
        ]}/>
        <div style={{position:'relative',flex:1,maxWidth:320}}>
          <Search size={15} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:theme.inkMuted}}/>
          <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Søk i saker..."
            style={{width:'100%',padding:'9px 12px 9px 36px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13,background:theme.surface,color:theme.ink,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}}/>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Inbox} title="Ingen saker i utvalget"
          message={`Meld inn saker du ønsker at ${data.org?.groupNoun || 'ledergruppen'} skal diskutere, beslutte eller orienteres om. Saker uten valgt møte havner i puljen.`}
          action={<Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Meld inn sak</Btn>}/>
      ) : (
        <div style={{display:'grid',gap:12}}>
          {filtered.map(p => (
            <AgendaProposalCard key={p.id} proposal={p} data={data}
              onEdit={()=>setEditing(p)}
              onAccept={p.meetingId ? ()=>accept(p) : null}
              onReject={()=>updateStatus(p.id,'avvist')}
              onPostpone={()=>updateStatus(p.id,'utsatt',{ meetingId:null })}/>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Rediger sak':'Meld inn ny sak'} width={680}>
        {editing && <AgendaProposalForm proposal={editing} data={data}
          defaultProposer={currentUserId}
          onSave={(p)=>{
            const list = data.agendaProposals || [];
            if (p.id) save({...data, agendaProposals: list.map(x=>x.id===p.id?p:x)});
            else save({...data, agendaProposals: [...list, {...p, id:uid('sak')}]});
            setEditing(null);
          }}
          onCancel={()=>setEditing(null)}
          onDelete={editing.id ? ()=>{ save({...data, agendaProposals:(data.agendaProposals||[]).filter(x=>x.id!==editing.id)}); setEditing(null); } : null}/>}
      </Modal>
    </div>
  );
};

/* ===== ÅRSHJUL / 12 MÅNEDERS PLANLEGGING ===== */
const planCategories = {
  strategi: { label: 'Strategi', color: '#1E3247', bg: '#E0E5EB' },
  økonomi:  { label: 'Økonomi',  color: '#9B7230', bg: '#F4E9D2' },
  hr:       { label: 'HR',       color: '#557758', bg: '#E5EEE3' },
  produkt:  { label: 'Produkt',  color: '#9B4836', bg: '#F3E0D8' },
  marked:   { label: 'Marked',   color: '#7B4D8C', bg: '#EDE3F2' },
  styre:    { label: 'Styre',    color: '#5C4A3A', bg: '#EBE4D9' },
  drift:    { label: 'Drift',    color: '#5C7B8A', bg: '#E0E8EB' },
};

const recurringLabels = { none:'Engangshendelse', monthly:'Månedlig', quarterly:'Kvartalsvis', yearly:'Årlig' };

const next12Months = () => {
  const out = [];
  const start = new Date();
  start.setDate(1); start.setHours(0,0,0,0);
  for (let i = 0; i < 12; i++) {
    const d = new Date(start); d.setMonth(d.getMonth() + i);
    out.push(d);
  }
  return out;
};

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
const fmtMonthLong = (d) => d.toLocaleDateString('no-NO',{ month:'long', year:'numeric' });
const fmtDayMonth = (iso) => { const d = new Date(iso); return `${d.getDate()}. ${d.toLocaleDateString('no-NO',{month:'short'}).replace('.','')}`; };

const planOccurrencesInWindow = (plan, windowStart, windowEnd) => {
  const out = [];
  if (!plan.startDate) return out;
  const start = new Date(plan.startDate); start.setHours(0,0,0,0);
  const recurring = plan.recurring && plan.recurring !== 'none' ? plan.recurring : null;
  if (!recurring) {
    const planEnd = plan.endDate ? new Date(plan.endDate) : start;
    if (start <= windowEnd && planEnd >= windowStart) {
      out.push({ start: plan.startDate, end: plan.endDate || '' });
    }
    return out;
  }
  let d = new Date(start);
  while (d < windowStart) {
    if (recurring === 'monthly')      d.setMonth(d.getMonth() + 1);
    else if (recurring === 'quarterly') d.setMonth(d.getMonth() + 3);
    else if (recurring === 'yearly')    d.setFullYear(d.getFullYear() + 1);
    else break;
  }
  let safety = 0;
  while (d <= windowEnd && safety < 50) {
    out.push({ start: d.toISOString().slice(0,10), end: '' });
    if (recurring === 'monthly')      d.setMonth(d.getMonth() + 1);
    else if (recurring === 'quarterly') d.setMonth(d.getMonth() + 3);
    else if (recurring === 'yearly')    d.setFullYear(d.getFullYear() + 1);
    else break;
    safety++;
  }
  return out;
};

const PlansView = ({ data, save, currentUserId, onNavigate }) => {
  const [editing, setEditing] = useState(null);
  const [proposalEditing, setProposalEditing] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');

  const months = useMemo(() => next12Months(), []);
  const windowStart = months[0];
  const windowEnd = useMemo(() => {
    const e = new Date(months[11]); e.setMonth(e.getMonth()+1); e.setDate(0); e.setHours(23,59,59,999);
    return e;
  }, [months]);

  const memberById = (id) => data.members.find(m => m.id === id);
  const plans = data.plans || [];

  // Build all occurrences with filtering
  const itemsByMonth = useMemo(() => {
    const map = {};
    months.forEach(m => { map[monthKey(m)] = []; });
    plans.forEach(p => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return;
      if (ownerFilter !== 'all' && p.owner !== ownerFilter) return;
      const occs = planOccurrencesInWindow(p, windowStart, windowEnd);
      occs.forEach(o => {
        const startD = new Date(o.start);
        const endD = o.end ? new Date(o.end) : startD;
        // Add to first month and any continuation months
        let cur = new Date(startD); cur.setDate(1); cur.setHours(0,0,0,0);
        const lastMonth = new Date(endD); lastMonth.setDate(1); lastMonth.setHours(0,0,0,0);
        let segIdx = 0;
        while (cur <= lastMonth) {
          const k = monthKey(cur);
          if (map[k]) {
            map[k].push({ plan: p, occurrence: o, isContinuation: segIdx > 0 });
          }
          cur.setMonth(cur.getMonth() + 1);
          segIdx++;
        }
      });
    });
    // Sort each month: start dates first (non-continuation), then by start
    Object.keys(map).forEach(k => {
      map[k].sort((a,b) => {
        if (a.isContinuation !== b.isContinuation) return a.isContinuation ? 1 : -1;
        return a.occurrence.start.localeCompare(b.occurrence.start);
      });
    });
    return map;
  }, [plans, categoryFilter, ownerFilter, months, windowStart, windowEnd]);

  const totalCount = Object.values(itemsByMonth).reduce((s,arr)=>s+arr.filter(it=>!it.isContinuation).length, 0);

  // Tellinger for innmeldte saker
  const openProposals = (data.agendaProposals || []).filter(p => p.status === 'foreslått');
  const myOpenProposals = openProposals.filter(p => p.proposer === currentUserId);
  const catMap = data.org?.planCategories || planCategories;

  return (
    <div>
      <SectionHeading overline={data.org?.plansOverline || 'Rullerende 12 måneder fremover'} title={data.org?.plansTitle || 'Årshjul'}>
        <Btn icon={Inbox} variant="ghost" onClick={()=>setProposalEditing({})}>Meld inn sak</Btn>
        <Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Ny plan</Btn>
      </SectionHeading>

      {/* Info-banner om innmeldte saker */}
      {openProposals.length > 0 && (
        <div style={{display:'flex',gap:14,alignItems:'center',padding:'12px 16px',marginBottom:20,
          background:theme.brassLight, border:`1px solid ${theme.brass}33`, borderRadius:10}}>
          <div style={{width:36,height:36,borderRadius:9,background:'#fff',color:theme.brass,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Inbox size={16}/>
          </div>
          <div style={{flex:1,minWidth:0,fontSize:13,color:theme.ink,lineHeight:1.5}}>
            <strong>{openProposals.length}</strong> {openProposals.length===1?'sak er':'saker er'} meldt inn til {data.org?.meetingNounDef || 'ledergruppemøtene'}
            {myOpenProposals.length > 0 && <span> – <strong>{myOpenProposals.length}</strong> av dine</span>}.
            Disse vises som agendapunkter når møteleder godkjenner dem.
          </div>
          <Btn size="sm" variant="ghost" onClick={()=>onNavigate?.('proposals')} icon={ArrowRight}>Se saker</Btn>
        </div>
      )}

      {/* Filter rad */}
      <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',marginBottom:20}}>
        <select value={categoryFilter} onChange={(e)=>setCategoryFilter(e.target.value)}
          style={{padding:'8px 12px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13,background:theme.surface,color:theme.ink,fontFamily:'inherit',cursor:'pointer'}}>
          <option value="all">Alle kategorier</option>
          {Object.entries(catMap).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={ownerFilter} onChange={(e)=>setOwnerFilter(e.target.value)}
          style={{padding:'8px 12px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13,background:theme.surface,color:theme.ink,fontFamily:'inherit',cursor:'pointer'}}>
          <option value="all">Alle ansvarlige</option>
          {data.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <div style={{fontSize:12,color:theme.inkMuted,marginLeft:'auto'}}>
          {totalCount} {totalCount===1?'aktivitet':'aktiviteter'} de neste 12 månedene
        </div>
      </div>

      {/* Mini-tidslinje med navigasjon */}
      <div style={{display:'flex',gap:6,marginBottom:32,overflowX:'auto',padding:'4px 0 14px',borderBottom:`1px solid ${theme.borderSoft}`}}>
        {months.map((m,idx) => {
          const k = monthKey(m);
          const items = itemsByMonth[k] || [];
          const newItems = items.filter(it => !it.isContinuation);
          const isFirst = idx === 0;
          // Aggregate categories present this month
          const cats = new Set(newItems.map(it => it.plan.category));
          return (
            <button key={k} onClick={()=>{
              const el = document.getElementById(`month-${k}`);
              if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
            }} style={{
              flex:'0 0 auto', padding:'10px 14px', minWidth:88,
              background: isFirst ? theme.brassLight : theme.surface,
              border:`1px solid ${isFirst ? theme.brass : theme.borderSoft}`,
              borderRadius:10, cursor:'pointer', fontFamily:'inherit', textAlign:'center',
              transition:'all 120ms', position:'relative',
            }}
            onMouseEnter={(e)=>{ if(!isFirst) e.currentTarget.style.background=theme.surfaceAlt; }}
            onMouseLeave={(e)=>{ if(!isFirst) e.currentTarget.style.background=theme.surface; }}>
              <div style={{fontSize:11,fontWeight:700,color:theme.brass,letterSpacing:0.6,textTransform:'uppercase'}}>
                {m.toLocaleDateString('no-NO',{month:'short'}).replace('.','')}
              </div>
              <div style={{fontSize:10,color:theme.inkMuted,marginTop:2}}>{m.getFullYear()}</div>
              <div style={{display:'flex',gap:3,marginTop:8,justifyContent:'center',minHeight:6}}>
                {Array.from(cats).slice(0,5).map(c => (
                  <div key={c} style={{width:6,height:6,borderRadius:'50%',background:catMap[c]?.color || theme.inkMuted}}/>
                ))}
              </div>
              {newItems.length>0 && (
                <div style={{fontSize:10,color:theme.inkSoft,marginTop:6,fontWeight:600}}>
                  {newItems.length}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Månedlige kort */}
      {totalCount === 0 ? (
        <EmptyState icon={Compass} title="Ingen planer i valgt utvalg"
          message="Legg til strategiske initiativer, repeterende prosesser og viktige milepæler for de kommende 12 månedene."
          action={<Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Ny plan</Btn>}/>
      ) : (
        <div style={{display:'grid',gap:18}}>
          {months.map((m,idx) => {
            const k = monthKey(m);
            const items = itemsByMonth[k] || [];
            return (
              <div key={k} id={`month-${k}`}>
                <div style={{display:'flex',alignItems:'baseline',gap:14,marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${theme.borderSoft}`}}>
                  <h2 style={{
                    fontFamily:'Fraunces, Georgia, serif', fontSize:22, fontWeight:500,
                    color:theme.ink, margin:0, letterSpacing:-0.3, textTransform:'capitalize',
                  }}>
                    {fmtMonthLong(m)}
                  </h2>
                  {idx === 0 && <Pill bg={theme.brassLight} color={theme.brassDark}>Inneværende</Pill>}
                  <div style={{fontSize:12,color:theme.inkMuted,marginLeft:'auto'}}>
                    {items.filter(it=>!it.isContinuation).length} nye · {items.filter(it=>it.isContinuation).length} pågående
                  </div>
                </div>
                {items.length === 0 ? (
                  <div style={{padding:'18px 16px',background:theme.surfaceAlt,borderRadius:8,color:theme.inkMuted,fontSize:13,textAlign:'center'}}>
                    Ingen planlagte aktiviteter
                  </div>
                ) : (
                  <div style={{display:'grid',gap:8}}>
                    {items.map((it,i) => {
                      const cat = catMap[it.plan.category] || { label:'Annet', color:theme.inkSoft, bg:theme.surfaceAlt };
                      const owner = memberById(it.plan.owner);
                      const startD = new Date(it.occurrence.start);
                      const endD = it.occurrence.end ? new Date(it.occurrence.end) : null;
                      return (
                        <Card key={`${it.plan.id}-${i}`} onClick={()=>setEditing(it.plan)}
                          style={it.isContinuation ? { opacity:0.65, background:theme.surfaceAlt } : {}}>
                          <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                            <div style={{width:4,alignSelf:'stretch',background:cat.color,borderRadius:2,flexShrink:0}}/>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6,flexWrap:'wrap'}}>
                                <Pill bg={cat.bg} color={cat.color}>{cat.label}</Pill>
                                {it.plan.recurring && it.plan.recurring !== 'none' && (
                                  <Pill bg={theme.surfaceAlt} color={theme.inkMuted}>
                                    ↻ {recurringLabels[it.plan.recurring]}
                                  </Pill>
                                )}
                                {it.isContinuation && (
                                  <Pill bg={theme.amberLight} color="#8B6914">↳ Pågår fra forrige måned</Pill>
                                )}
                              </div>
                              <div style={{fontSize:15,fontWeight:600,color:theme.ink,marginBottom:4}}>{it.plan.title}</div>
                              {it.plan.notes && !it.isContinuation && (
                                <div style={{fontSize:13,color:theme.inkSoft,lineHeight:1.5,marginBottom:8}}>{it.plan.notes}</div>
                              )}
                              <div style={{display:'flex',gap:14,fontSize:12,color:theme.inkMuted,flexWrap:'wrap',alignItems:'center'}}>
                                <span style={{display:'inline-flex',alignItems:'center',gap:5}}>
                                  <Calendar size={13}/>
                                  {endD ? `${fmtDayMonth(it.occurrence.start)} – ${fmtDayMonth(it.occurrence.end)}` : fmtDayMonth(it.occurrence.start)}
                                </span>
                                {owner && (
                                  <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                                    <Avatar member={owner} size={20}/> {owner.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight size={18} style={{color:theme.inkMuted,alignSelf:'center'}}/>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Rediger plan':'Ny plan'}>
        {editing && <PlanForm plan={editing} data={data}
          onSave={(p)=>{
            const list = data.plans || [];
            if (p.id) save({...data, plans:list.map(x=>x.id===p.id?p:x)});
            else      save({...data, plans:[...list, {...p, id:uid('p')}]});
            setEditing(null);
          }}
          onCancel={()=>setEditing(null)}
          onDelete={editing.id?()=>{
            save({...data, plans:(data.plans||[]).filter(x=>x.id!==editing.id)});
            setEditing(null);
          }:null}/>}
      </Modal>

      <Modal open={!!proposalEditing} onClose={()=>setProposalEditing(null)} title="Meld inn ny sak fra Årshjulet" width={680}>
        {proposalEditing && <AgendaProposalForm proposal={proposalEditing} data={data}
          defaultProposer={currentUserId}
          onSave={(p)=>{
            const list = data.agendaProposals || [];
            if (p.id) save({...data, agendaProposals: list.map(x=>x.id===p.id?p:x)});
            else save({...data, agendaProposals: [...list, {...p, id:uid('sak')}]});
            setProposalEditing(null);
          }}
          onCancel={()=>setProposalEditing(null)}/>}
      </Modal>
    </div>
  );
};

const PlanForm = ({ plan, data, onSave, onCancel, onDelete }) => {
  const catMap = data.org?.planCategories || planCategories;
  const defaultCat = Object.keys(catMap)[0] || 'strategi';
  const [p, setP] = useState({
    title:'', category:defaultCat, startDate:new Date().toISOString().slice(0,10),
    endDate:'', owner:null, recurring:'none', notes:'', ...plan
  });
  return (
    <div>
      <TextField label="Tittel" value={p.title} onChange={(v)=>setP({...p,title:v})} required placeholder="F.eks. Budsjettprosess 2027"/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Sel label="Kategori" value={p.category} onChange={(v)=>setP({...p,category:v})} required
          options={Object.entries(catMap).map(([k,v])=>({value:k,label:v.label}))}/>
        <Sel label="Ansvarlig" value={p.owner} onChange={(v)=>setP({...p,owner:v})}
          options={data.members.map(m=>({value:m.id,label:m.name}))}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        <TextField label="Start" value={p.startDate} onChange={(v)=>setP({...p,startDate:v})} type="date" required/>
        <TextField label="Slutt (valgfritt)" value={p.endDate} onChange={(v)=>setP({...p,endDate:v})} type="date"/>
        <Sel label="Gjentas" value={p.recurring} onChange={(v)=>setP({...p,recurring:v})} options={[
          {value:'none',label:'Engangshendelse'},
          {value:'monthly',label:'Månedlig'},
          {value:'quarterly',label:'Kvartalsvis'},
          {value:'yearly',label:'Årlig'},
        ]}/>
      </div>
      <TextField label="Notater" value={p.notes} onChange={(v)=>setP({...p,notes:v})} multiline rows={3} placeholder="Beskrivelse, formål, avhengigheter..."/>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:18,paddingTop:16,borderTop:`1px solid ${theme.borderSoft}`}}>
        <div>{onDelete && <Btn variant="danger" icon={Trash2} onClick={()=>{ if(confirm('Slette planen?')) onDelete(); }}>Slett</Btn>}</div>
        <div style={{display:'flex',gap:8}}>
          <Btn variant="ghost" onClick={onCancel}>Avbryt</Btn>
          <Btn variant="brass" icon={Save} onClick={()=>{ if(!p.title || !p.startDate){ alert('Tittel og startdato kreves'); return; } onSave(p); }}>Lagre</Btn>
        </div>
      </div>
    </div>
  );
};

/* ===== INITIATIVPORTEFØLJE ===== */
const initiativeStatusLabels = { idé:'Idé', godkjent:'Godkjent', pågår:'Pågår', pause:'På pause', fullført:'Fullført', avlyst:'Avlyst' };
const initiativeStatusColor = (s) => ({
  idé:      { bg: theme.surfaceAlt, fg: theme.inkSoft },
  godkjent: { bg: theme.brassLight, fg: theme.brassDark },
  pågår:    { bg: theme.amberLight, fg: '#8B6914' },
  pause:    { bg: theme.rustLight, fg: theme.rust },
  fullført: { bg: theme.sageLight, fg: theme.sage },
  avlyst:   { bg: theme.surfaceAlt, fg: theme.inkMuted },
}[s] || { bg: theme.surfaceAlt, fg: theme.inkSoft });
const healthColor = (h) => h==='grønn' ? theme.sage : h==='gul' ? theme.amber : h==='rød' ? theme.rust : theme.inkMuted;
const healthLabel = (h) => h==='grønn' ? 'På sporet' : h==='gul' ? 'Følges nøye' : h==='rød' ? 'I trøbbel' : '–';

const fmtNok = (n) => { if (n == null) return ''; if (n >= 1000000) return (n/1000000).toFixed(1).replace('.0','') + ' MNOK'; if (n >= 1000) return Math.round(n/1000) + ' kNOK'; return n.toLocaleString('no-NO') + ' NOK'; };

const InitiativesView = ({ data, save }) => {
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('aktive');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const memberById = (id) => data.members.find(m => m.id === id);
  const inits = data.initiatives || [];

  const filtered = useMemo(() => inits.filter(i => {
    if (statusFilter === 'aktive' && (i.status === 'fullført' || i.status === 'avlyst')) return false;
    if (statusFilter === 'fullført' && i.status !== 'fullført') return false;
    if (statusFilter === 'risiko' && i.healthStatus !== 'rød' && i.healthStatus !== 'gul') return false;
    if (ownerFilter !== 'all' && i.owner !== ownerFilter) return false;
    return true;
  }).sort((a,b) => {
    const order = { rød: 0, gul: 1, grønn: 2 };
    return (order[a.healthStatus] ?? 3) - (order[b.healthStatus] ?? 3);
  }), [inits, statusFilter, ownerFilter]);

  return (
    <div>
      <SectionHeading overline={data.org?.initiativeOverline || 'Strategisk portefølje'} title={data.org?.initiativeTitle || 'Initiativer'}>
        <Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>{data.org?.initiativeNewBtn || 'Nytt initiativ'}</Btn>
      </SectionHeading>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:14,marginBottom:24}}>
        <KPI label="Pågående" value={inits.filter(i=>i.status==='pågår').length} accent={theme.amber} icon={Briefcase}
          sub={`${inits.filter(i=>i.status==='pågår'&&i.healthStatus==='grønn').length} på sporet`}/>
        <KPI label="I risikosone" value={inits.filter(i=>i.healthStatus==='rød'||i.healthStatus==='gul').length} accent={theme.rust} icon={AlertCircle}
          sub={`${inits.filter(i=>i.healthStatus==='rød').length} kritiske`}/>
        <KPI label="Forbrukt budsjett" value={fmtNok(inits.reduce((s,i)=>s+(i.spent||0),0))} accent={theme.brass} icon={Activity}
          sub={`av ${fmtNok(inits.reduce((s,i)=>s+(i.budget||0),0))} totalt`}/>
        <KPI label="Fullførte 2026" value={inits.filter(i=>i.status==='fullført').length} accent={theme.sage} icon={CheckCircle2}/>
      </div>

      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <FilterTabs value={statusFilter} onChange={setStatusFilter} options={[
          {value:'aktive',label:'Aktive'},{value:'risiko',label:'I risiko'},{value:'fullført',label:'Fullførte'},{value:'all',label:'Alle'}
        ]}/>
        <select value={ownerFilter} onChange={(e)=>setOwnerFilter(e.target.value)}
          style={{padding:'8px 12px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13,background:theme.surface,color:theme.ink,fontFamily:'inherit',cursor:'pointer'}}>
          <option value="all">Alle ansvarlige</option>
          {data.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title={`Ingen ${data.org?.initiativeNoun || 'initiativ'}er i utvalget`}
          message={data.org?.initiativeEmpty || 'Strategiske satsninger – større prosjekter med tydelig eier, fase og milepæler. Holder styr på det som beveger organisasjonen fremover.'}
          action={<Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>{data.org?.initiativeNewBtn || 'Nytt initiativ'}</Btn>}/>
      ) : (
        <div style={{display:'grid',gap:12}}>
          {filtered.map(i => {
            const sc = initiativeStatusColor(i.status);
            const owner = memberById(i.owner);
            const hc = healthColor(i.healthStatus);
            const milestonesDone = (i.milestones||[]).filter(m=>m.completed).length;
            const milestonesTotal = (i.milestones||[]).length;
            const overdue = i.targetDate && daysFromNow(i.targetDate) < 0 && i.status !== 'fullført';
            return (
              <Card key={i.id} onClick={()=>setEditing(i)}>
                <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
                  <div style={{width:6,alignSelf:'stretch',background:hc,borderRadius:3,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',gap:10,alignItems:'flex-start',justifyContent:'space-between',marginBottom:8,flexWrap:'wrap'}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:4,flexWrap:'wrap'}}>
                          <Pill bg={sc.bg} color={sc.fg}>{initiativeStatusLabels[i.status]}</Pill>
                          <Pill bg={`${hc}22`} color={hc}>● {healthLabel(i.healthStatus)}</Pill>
                          {overdue && <Pill bg={theme.rustLight} color={theme.rust}><AlertCircle size={11}/> Frist passert</Pill>}
                        </div>
                        <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:20,fontWeight:500,color:theme.ink,margin:'0 0 4px',letterSpacing:-0.3}}>{i.title}</h3>
                        {i.program && programById(i.program) && (
                          <div style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,color:programById(i.program).accent,background:`${programById(i.program).accent}14`,border:`1px solid ${programById(i.program).accent}33`,padding:'3px 9px',borderRadius:999,marginBottom:8}}>
                            <Anchor size={11}/> Tverrgående: {programById(i.program).name}
                          </div>
                        )}
                        {i.description && <p style={{fontSize:13,color:theme.inkSoft,margin:'0 0 10px',lineHeight:1.55}}>{i.description}</p>}
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:11,fontWeight:600,color:theme.inkSoft,marginBottom:5}}>
                        <span>Fremdrift</span><span>{i.percentComplete||0}%</span>
                      </div>
                      <div style={{height:6,background:theme.surfaceAlt,borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${i.percentComplete||0}%`,background:hc,transition:'width 200ms'}}/>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:18,fontSize:12,color:theme.inkMuted,flexWrap:'wrap',alignItems:'center'}}>
                      {owner && <span style={{display:'inline-flex',alignItems:'center',gap:6}}><Avatar member={owner} size={20}/> {owner.name}</span>}
                      {i.targetDate && <span style={{display:'inline-flex',alignItems:'center',gap:5,color:overdue?theme.rust:theme.inkMuted}}>
                        <Target size={13}/> Mål: {fmtDate(i.targetDate)}
                      </span>}
                      {milestonesTotal > 0 && <span style={{display:'inline-flex',alignItems:'center',gap:5}}>
                        <CheckSquare size={13}/> {milestonesDone}/{milestonesTotal} milepæler
                      </span>}
                      {i.budget > 0 && <span style={{display:'inline-flex',alignItems:'center',gap:5}}>
                        <Activity size={13}/> {fmtNok(i.spent||0)} / {fmtNok(i.budget)}
                      </span>}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?`Rediger ${data.org?.initiativeNoun || 'initiativ'}`:(data.org?.initiativeNewBtn || 'Nytt initiativ')} width={720}>
        {editing && <InitiativeForm initiative={editing} data={data}
          onSave={(it)=>{
            const list = data.initiatives || [];
            if (it.id) save({...data, initiatives:list.map(x=>x.id===it.id?it:x)});
            else      save({...data, initiatives:[...list, {...it, id:uid('i')}]});
            setEditing(null);
          }}
          onCancel={()=>setEditing(null)}
          onDelete={editing.id?()=>{ save({...data, initiatives:(data.initiatives||[]).filter(x=>x.id!==editing.id)}); setEditing(null); }:null}/>}
      </Modal>
    </div>
  );
};

const InitiativeForm = ({ initiative, data, onSave, onCancel, onDelete }) => {
  const [i, setI] = useState({ title:'', description:'', owner:null, status:'idé', phase:'planlegging', startDate:new Date().toISOString().slice(0,10), targetDate:'', percentComplete:0, healthStatus:'grønn', budget:0, spent:0, milestones:[], notes:'', ...initiative });
  const addMs = () => setI({...i, milestones:[...(i.milestones||[]), { id:uid('ms'), title:'', dueDate:'', completed:false }]});
  const updMs = (idx, patch) => { const next = [...(i.milestones||[])]; next[idx] = {...next[idx], ...patch}; setI({...i, milestones:next}); };
  const rmMs = (idx) => setI({...i, milestones:(i.milestones||[]).filter((_,j)=>j!==idx)});
  return (
    <div>
      <TextField label="Tittel" value={i.title} onChange={(v)=>setI({...i,title:v})} required/>
      <TextField label="Beskrivelse" value={i.description} onChange={(v)=>setI({...i,description:v})} multiline rows={3}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        <Sel label="Status" value={i.status} onChange={(v)=>setI({...i,status:v})} options={Object.entries(initiativeStatusLabels).map(([k,l])=>({value:k,label:l}))}/>
        <Sel label="Fase" value={i.phase} onChange={(v)=>setI({...i,phase:v})} options={[
          {value:'planlegging',label:'Planlegging'},{value:'gjennomføring',label:'Gjennomføring'},{value:'avslutning',label:'Avslutning'}
        ]}/>
        <Sel label="Helse" value={i.healthStatus} onChange={(v)=>setI({...i,healthStatus:v})} options={[
          {value:'grønn',label:'🟢 På sporet'},{value:'gul',label:'🟡 Følges nøye'},{value:'rød',label:'🔴 I trøbbel'}
        ]}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        <Sel label="Eier" value={i.owner} onChange={(v)=>setI({...i,owner:v})} required options={data.members.map(m=>({value:m.id,label:m.name}))}/>
        <TextField label="Start" value={i.startDate} onChange={(v)=>setI({...i,startDate:v})} type="date"/>
        <TextField label="Mål-dato" value={i.targetDate} onChange={(v)=>setI({...i,targetDate:v})} type="date"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        <TextField label="Fremdrift (%)" value={i.percentComplete} onChange={(v)=>setI({...i,percentComplete:Math.min(100,Math.max(0,parseInt(v)||0))})} type="number"/>
        <TextField label="Budsjett (NOK)" value={i.budget} onChange={(v)=>setI({...i,budget:parseInt(v)||0})} type="number"/>
        <TextField label="Forbrukt (NOK)" value={i.spent} onChange={(v)=>setI({...i,spent:parseInt(v)||0})} type="number"/>
      </div>
      <TextField label="Notater" value={i.notes} onChange={(v)=>setI({...i,notes:v})} multiline rows={2}/>

      <div style={{marginTop:8,paddingTop:14,borderTop:`1px dashed ${theme.borderSoft}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontSize:11,fontWeight:700,color:theme.brass,letterSpacing:0.6,textTransform:'uppercase'}}>Milepæler</div>
          <Btn size="sm" icon={Plus} variant="ghost" onClick={addMs}>Legg til</Btn>
        </div>
        {(i.milestones||[]).length === 0 ? (
          <div style={{padding:14,textAlign:'center',background:theme.surfaceAlt,borderRadius:8,fontSize:12,color:theme.inkMuted}}>Ingen milepæler</div>
        ) : (
          <div style={{display:'grid',gap:6}}>
            {i.milestones.map((ms, idx) => (
              <div key={ms.id} style={{display:'flex',gap:8,alignItems:'center',padding:8,background:theme.surfaceAlt,borderRadius:6}}>
                <button type="button" onClick={()=>updMs(idx,{completed:!ms.completed})}
                  style={{background:'transparent',border:'none',cursor:'pointer',padding:0,color:ms.completed?theme.sage:theme.inkMuted}}>
                  {ms.completed ? <CheckCircle2 size={18}/> : <Circle size={18}/>}
                </button>
                <input value={ms.title} onChange={(e)=>updMs(idx,{title:e.target.value})} placeholder="Milepæl"
                  style={{flex:1,padding:'5px 8px',border:`1px solid ${theme.border}`,borderRadius:5,fontSize:12,fontFamily:'inherit',background:theme.surface}}/>
                <input type="date" value={ms.dueDate} onChange={(e)=>updMs(idx,{dueDate:e.target.value})}
                  style={{padding:'5px 8px',border:`1px solid ${theme.border}`,borderRadius:5,fontSize:12,fontFamily:'inherit',background:theme.surface}}/>
                <button type="button" onClick={()=>rmMs(idx)} style={{background:'transparent',border:'none',cursor:'pointer',color:theme.inkMuted,padding:4}}><X size={14}/></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',marginTop:18,paddingTop:16,borderTop:`1px solid ${theme.borderSoft}`}}>
        <div>{onDelete && <Btn variant="danger" icon={Trash2} onClick={()=>{ if(confirm('Slette initiativet?')) onDelete(); }}>Slett</Btn>}</div>
        <div style={{display:'flex',gap:8}}>
          <Btn variant="ghost" onClick={onCancel}>Avbryt</Btn>
          <Btn variant="brass" icon={Save} onClick={()=>{ if(!i.title || !i.owner){ alert('Tittel og eier kreves'); return; } onSave(i); }}>Lagre</Btn>
        </div>
      </div>
    </div>
  );
};

/* ===== KPI / NØKKELTALL ===== */
const kpiStatusColor = (s) => s==='grønn'?theme.sage : s==='gul'?theme.amber : s==='rød'?theme.rust : theme.inkMuted;

const calculateKpiStatus = (value, target, direction) => {
  if (target == null || value == null) return 'gul';
  const ratio = value / target;
  if (direction === 'up') {
    if (ratio >= 1) return 'grønn';
    if (ratio >= 0.9) return 'gul';
    return 'rød';
  } else {
    if (ratio <= 1) return 'grønn';
    if (ratio <= 1.15) return 'gul';
    return 'rød';
  }
};

const Sparkline = ({ values, direction = 'up', width = 120, height = 32 }) => {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((v, i) => `${i*stepX},${height - ((v-min)/range)*height}`).join(' ');
  const last = values[values.length-1];
  const prev = values[values.length-2];
  const trend = last >= prev ? 'up' : 'down';
  const isPositive = (direction === 'up' && trend === 'up') || (direction === 'down' && trend === 'down');
  return (
    <svg width={width} height={height} style={{display:'block'}}>
      <polyline points={points} fill="none" stroke={isPositive?theme.sage:theme.rust} strokeWidth="2"/>
      <circle cx={(values.length-1)*stepX} cy={height - ((last-min)/range)*height} r="3" fill={isPositive?theme.sage:theme.rust}/>
    </svg>
  );
};

const KpisView = ({ data, save }) => {
  const [editing, setEditing] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const memberById = (id) => data.members.find(m => m.id === id);
  const kpis = data.kpis || [];
  const categories = ['all', ...new Set(kpis.map(k => k.category))];
  const filtered = kpis.filter(k => categoryFilter === 'all' || k.category === categoryFilter);

  const addUpdate = (kpiId, period, value, status, comment) => {
    const k = kpis.find(x => x.id === kpiId);
    if (!k) return;
    const newHistory = [{ period, value: parseFloat(value), status, comment: comment || '' }, ...k.history.filter(h => h.period !== period)];
    save({ ...data, kpis: kpis.map(x => x.id === kpiId ? { ...x, history: newHistory } : x) });
  };

  return (
    <div>
      <SectionHeading overline="Måling og styring" title="Nøkkeltall">
        <Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Nytt nøkkeltall</Btn>
      </SectionHeading>

      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <select value={categoryFilter} onChange={(e)=>setCategoryFilter(e.target.value)}
          style={{padding:'8px 12px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13,background:theme.surface,color:theme.ink,fontFamily:'inherit',cursor:'pointer'}}>
          {categories.map(c => <option key={c} value={c}>{c==='all'?'Alle kategorier':c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={TrendingUp} title="Ingen nøkkeltall ennå"
          message="Definer 3-7 sentrale tall som måles månedlig eller kvartalsvis. Hold dem få og viktige."
          action={<Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Legg til nøkkeltall</Btn>}/>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))',gap:14}}>
          {filtered.map(k => {
            const latest = k.history?.[0];
            const owner = memberById(k.owner);
            const sc = kpiStatusColor(latest?.status);
            const values = (k.history||[]).slice(0,8).reverse().map(h=>h.value);
            const direction = k.direction || 'up';
            const trend = values.length >= 2 ? (values[values.length-1] - values[values.length-2]) : 0;
            return (
              <Card key={k.id}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,color:theme.brass,fontWeight:700,letterSpacing:0.6,textTransform:'uppercase',marginBottom:2}}>{k.category}</div>
                    <div style={{fontSize:15,fontWeight:600,color:theme.ink,lineHeight:1.3}}>{k.name}</div>
                  </div>
                  <button onClick={()=>setEditing(k)} style={{background:'transparent',border:'none',cursor:'pointer',color:theme.inkMuted,padding:4}}><Edit2 size={14}/></button>
                </div>
                <div style={{display:'flex',alignItems:'flex-end',gap:14,marginBottom:14}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:2}}>
                      <div style={{fontFamily:'Fraunces, Georgia, serif',fontSize:34,fontWeight:500,color:sc,lineHeight:1,letterSpacing:-1}}>
                        {latest?.value?.toLocaleString('no-NO') ?? '–'}
                      </div>
                      <div style={{fontSize:13,color:theme.inkMuted,fontWeight:600}}>{k.unit}</div>
                      {trend !== 0 && (
                        trend > 0 
                          ? <TrendingUp size={14} style={{color: direction==='up'?theme.sage:theme.rust, marginLeft:4}}/>
                          : <TrendingDown size={14} style={{color: direction==='down'?theme.sage:theme.rust, marginLeft:4}}/>
                      )}
                    </div>
                    <div style={{fontSize:11,color:theme.inkMuted}}>
                      Mål: {k.target?.toLocaleString('no-NO')} {k.unit} {direction === 'down' ? '(lavere er bedre)' : ''}
                    </div>
                  </div>
                  {values.length >= 2 && <Sparkline values={values} direction={direction} width={100} height={36}/>}
                </div>
                {latest?.comment && (
                  <div style={{fontSize:12,color:theme.inkSoft,fontStyle:'italic',marginBottom:10,padding:'8px 10px',background:theme.surfaceAlt,borderRadius:6,lineHeight:1.5}}>
                    "{latest.comment}"
                  </div>
                )}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:10,borderTop:`1px solid ${theme.borderSoft}`,fontSize:12,color:theme.inkMuted}}>
                  <span>{owner ? owner.name : ''} · {latest?.period || 'ingen data'}</span>
                  <button onClick={()=>setUpdating(k)} style={{background:'transparent',border:`1px solid ${theme.border}`,color:theme.brass,padding:'4px 10px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                    Oppdater
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* KPI definition modal */}
      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Rediger nøkkeltall':'Nytt nøkkeltall'}>
        {editing && <KpiForm kpi={editing} data={data}
          onSave={(k)=>{
            const list = data.kpis || [];
            if (k.id) save({...data, kpis:list.map(x=>x.id===k.id?k:x)});
            else      save({...data, kpis:[...list, {...k, id:uid('k'), history:[]}]});
            setEditing(null);
          }}
          onCancel={()=>setEditing(null)}
          onDelete={editing.id?()=>{ save({...data, kpis:(data.kpis||[]).filter(x=>x.id!==editing.id)}); setEditing(null); }:null}/>}
      </Modal>

      {/* KPI update modal */}
      <Modal open={!!updating} onClose={()=>setUpdating(null)} title={`Oppdater: ${updating?.name||''}`}>
        {updating && <KpiUpdateForm kpi={updating}
          onSave={(period, value, status, comment)=>{
            addUpdate(updating.id, period, value, status, comment);
            setUpdating(null);
          }}
          onCancel={()=>setUpdating(null)}/>}
      </Modal>
    </div>
  );
};

const KpiForm = ({ kpi, data, onSave, onCancel, onDelete }) => {
  const [k, setK] = useState({ name:'', category:'', owner:null, unit:'', target:0, direction:'up', ...kpi });
  return (
    <div>
      <TextField label="Navn" value={k.name} onChange={(v)=>setK({...k,name:v})} required placeholder="F.eks. Omsetning per måned"/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <TextField label="Kategori" value={k.category} onChange={(v)=>setK({...k,category:v})} placeholder="Økonomi, HR, Marked..."/>
        <Sel label="Eier" value={k.owner} onChange={(v)=>setK({...k,owner:v})} required options={data.members.map(m=>({value:m.id,label:m.name}))}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        <TextField label="Enhet" value={k.unit} onChange={(v)=>setK({...k,unit:v})} placeholder="MNOK, %, stk..."/>
        <TextField label="Mål" value={k.target} onChange={(v)=>setK({...k,target:parseFloat(v)||0})} type="number" required/>
        <Sel label="Retning" value={k.direction} onChange={(v)=>setK({...k,direction:v})} options={[
          {value:'up',label:'Høyere er bedre'},{value:'down',label:'Lavere er bedre'}
        ]}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:18,paddingTop:16,borderTop:`1px solid ${theme.borderSoft}`}}>
        <div>{onDelete && <Btn variant="danger" icon={Trash2} onClick={()=>{ if(confirm('Slette nøkkeltallet?')) onDelete(); }}>Slett</Btn>}</div>
        <div style={{display:'flex',gap:8}}>
          <Btn variant="ghost" onClick={onCancel}>Avbryt</Btn>
          <Btn variant="brass" icon={Save} onClick={()=>{ if(!k.name||!k.owner){ alert('Navn og eier kreves'); return; } onSave(k); }}>Lagre</Btn>
        </div>
      </div>
    </div>
  );
};

const KpiUpdateForm = ({ kpi, onSave, onCancel }) => {
  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const [period, setPeriod] = useState(defaultPeriod);
  const [value, setValue] = useState('');
  const [comment, setComment] = useState('');
  const computedStatus = value ? calculateKpiStatus(parseFloat(value), kpi.target, kpi.direction || 'up') : 'gul';
  const [status, setStatus] = useState(computedStatus);
  useEffect(() => { if (value) setStatus(computedStatus); }, [value]);
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <TextField label="Periode" value={period} onChange={setPeriod} placeholder="2026-04 eller 2026-Q2" required/>
        <TextField label={`Verdi (${kpi.unit})`} value={value} onChange={setValue} type="number" required/>
      </div>
      <Sel label="Status" value={status} onChange={setStatus} options={[
        {value:'grønn',label:'🟢 På sporet'},{value:'gul',label:'🟡 Følges nøye'},{value:'rød',label:'🔴 Avvik'}
      ]}/>
      <TextField label="Kommentar" value={comment} onChange={setComment} multiline rows={2} placeholder="Forklaring av status, hva som påvirket..."/>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:18,paddingTop:14,borderTop:`1px solid ${theme.borderSoft}`}}>
        <Btn variant="ghost" onClick={onCancel}>Avbryt</Btn>
        <Btn variant="brass" icon={Save} onClick={()=>{ if(!period||!value){ alert('Periode og verdi kreves'); return; } onSave(period, value, status, comment); }}>Lagre måling</Btn>
      </div>
    </div>
  );
};

/* ===== RISIKOREGISTER ===== */
const riskScoreColor = (likelihood, impact) => {
  const score = (likelihood||0) * (impact||0);
  if (score >= 16) return theme.rust;
  if (score >= 9) return theme.amber;
  if (score >= 4) return theme.sage;
  return theme.inkMuted;
};
const riskScoreLabel = (likelihood, impact) => {
  const s = (likelihood||0) * (impact||0);
  if (s >= 16) return 'Kritisk';
  if (s >= 9) return 'Høy';
  if (s >= 4) return 'Medium';
  return 'Lav';
};

const RisksView = ({ data, save }) => {
  const [editing, setEditing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('aktiv');
  const memberById = (id) => data.members.find(m => m.id === id);
  const risks = data.risks || [];
  const filtered = risks.filter(r => statusFilter === 'all' ? true : r.status === statusFilter)
    .sort((a,b) => ((b.likelihood||0)*(b.impact||0)) - ((a.likelihood||0)*(a.impact||0)));

  return (
    <div>
      <SectionHeading overline="Risikoovervåking" title="Risikoregister">
        <Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Ny risiko</Btn>
      </SectionHeading>

      {/* Heatmap */}
      <Card style={{marginBottom:24}}>
        <div style={{fontSize:11,fontWeight:700,color:theme.brass,letterSpacing:0.6,textTransform:'uppercase',marginBottom:14}}>Risikobilde</div>
        <div style={{display:'flex',gap:14}}>
          <div style={{display:'flex',flexDirection:'column-reverse',justifyContent:'space-around',fontSize:10,color:theme.inkMuted,fontWeight:600,paddingBottom:18}}>
            {[1,2,3,4,5].map(i => <div key={i}>{i}</div>)}
          </div>
          <div style={{flex:1}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5, 1fr)',gridTemplateRows:'repeat(5, 30px)',gap:3}}>
              {[5,4,3,2,1].flatMap(impact => [1,2,3,4,5].map(lik => {
                const cellRisks = risks.filter(r => r.likelihood===lik && r.impact===impact && r.status!=='lukket');
                const score = lik * impact;
                const bg = score >= 16 ? `${theme.rust}33` : score >= 9 ? `${theme.amber}33` : score >= 4 ? `${theme.sage}22` : theme.surfaceAlt;
                return (
                  <div key={`${lik}-${impact}`} style={{background:bg,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                    {cellRisks.length > 0 && (
                      <span style={{fontSize:11,fontWeight:700,color:riskScoreColor(lik,impact)}}>{cellRisks.length}</span>
                    )}
                  </div>
                );
              }))}
            </div>
            <div style={{display:'flex',justifyContent:'space-around',fontSize:10,color:theme.inkMuted,fontWeight:600,marginTop:6}}>
              {[1,2,3,4,5].map(i => <div key={i}>{i}</div>)}
            </div>
            <div style={{textAlign:'center',fontSize:11,color:theme.inkSoft,marginTop:4,fontWeight:600}}>Sannsynlighet →</div>
          </div>
          <div style={{writingMode:'vertical-rl',transform:'rotate(180deg)',fontSize:11,color:theme.inkSoft,fontWeight:600,paddingTop:18}}>← Konsekvens</div>
        </div>
      </Card>

      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <FilterTabs value={statusFilter} onChange={setStatusFilter} options={[
          {value:'aktiv',label:'Aktive'},{value:'overvåkes',label:'Overvåkes'},{value:'lukket',label:'Lukket'},{value:'all',label:'Alle'}
        ]}/>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="Ingen risikoer registrert"
          message="Hold styr på vesentlige risikoer ledelsen overvåker, med sannsynlighet, konsekvens og tiltak."
          action={<Btn icon={Plus} variant="brass" onClick={()=>setEditing({})}>Ny risiko</Btn>}/>
      ) : (
        <div style={{display:'grid',gap:12}}>
          {filtered.map(r => {
            const owner = memberById(r.owner);
            const color = riskScoreColor(r.likelihood, r.impact);
            const reviewOverdue = r.lastReviewed && daysFromNow(r.lastReviewed) < -90;
            return (
              <Card key={r.id} onClick={()=>setEditing(r)}>
                <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
                  <div style={{
                    width:54,height:54,borderRadius:10,background:`${color}22`,color:color,
                    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flexShrink:0,
                  }}>
                    <div style={{fontFamily:'Fraunces, Georgia, serif',fontSize:22,fontWeight:500,lineHeight:1}}>{(r.likelihood||0)*(r.impact||0)}</div>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:0.5,textTransform:'uppercase'}}>{riskScoreLabel(r.likelihood, r.impact)}</div>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6,flexWrap:'wrap'}}>
                      <Pill bg={theme.surfaceAlt} color={theme.inkSoft}>{r.category}</Pill>
                      <Pill bg={`${color}22`} color={color}>S:{r.likelihood} × K:{r.impact}</Pill>
                      {reviewOverdue && <Pill bg={theme.rustLight} color={theme.rust}><Bell size={11}/> Trenger gjennomgang</Pill>}
                    </div>
                    <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:18,fontWeight:500,color:theme.ink,margin:'0 0 4px',letterSpacing:-0.2}}>{r.title}</h3>
                    {r.description && <p style={{fontSize:13,color:theme.inkSoft,margin:'0 0 8px',lineHeight:1.5}}>{r.description}</p>}
                    {r.mitigation && (
                      <div style={{fontSize:13,color:theme.inkSoft,padding:'8px 10px',background:theme.surfaceAlt,borderRadius:6,marginBottom:8,lineHeight:1.5}}>
                        <strong style={{color:theme.brass,fontSize:11,letterSpacing:0.5,textTransform:'uppercase',marginRight:6}}>Tiltak:</strong>
                        {r.mitigation}
                      </div>
                    )}
                    <div style={{display:'flex',gap:14,fontSize:12,color:theme.inkMuted,flexWrap:'wrap',alignItems:'center'}}>
                      {owner && <span style={{display:'inline-flex',alignItems:'center',gap:6}}><Avatar member={owner} size={20}/> {owner.name}</span>}
                      {r.lastReviewed && <span>Sist vurdert: {fmtDate(r.lastReviewed)}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!editing} onClose={()=>setEditing(null)} title={editing?.id?'Rediger risiko':'Ny risiko'}>
        {editing && <RiskForm risk={editing} data={data}
          onSave={(r)=>{
            const list = data.risks || [];
            if (r.id) save({...data, risks:list.map(x=>x.id===r.id?r:x)});
            else      save({...data, risks:[...list, {...r, id:uid('r')}]});
            setEditing(null);
          }}
          onCancel={()=>setEditing(null)}
          onDelete={editing.id?()=>{ save({...data, risks:(data.risks||[]).filter(x=>x.id!==editing.id)}); setEditing(null); }:null}/>}
      </Modal>
    </div>
  );
};

const RiskForm = ({ risk, data, onSave, onCancel, onDelete }) => {
  const [r, setR] = useState({ title:'', description:'', category:'', likelihood:3, impact:3, mitigation:'', owner:null, lastReviewed:new Date().toISOString().slice(0,10), status:'aktiv', ...risk });
  return (
    <div>
      <TextField label="Tittel" value={r.title} onChange={(v)=>setR({...r,title:v})} required/>
      <TextField label="Beskrivelse" value={r.description} onChange={(v)=>setR({...r,description:v})} multiline rows={3}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <TextField label="Kategori" value={r.category} onChange={(v)=>setR({...r,category:v})} placeholder="Finans, Personell, Teknologi..."/>
        <Sel label="Eier" value={r.owner} onChange={(v)=>setR({...r,owner:v})} options={data.members.map(m=>({value:m.id,label:m.name}))}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        <Sel label="Sannsynlighet (1-5)" value={r.likelihood} onChange={(v)=>setR({...r,likelihood:parseInt(v)})} options={[
          {value:1,label:'1 – Svært usannsynlig'},{value:2,label:'2 – Lav'},{value:3,label:'3 – Mulig'},{value:4,label:'4 – Sannsynlig'},{value:5,label:'5 – Svært sannsynlig'}
        ]}/>
        <Sel label="Konsekvens (1-5)" value={r.impact} onChange={(v)=>setR({...r,impact:parseInt(v)})} options={[
          {value:1,label:'1 – Ubetydelig'},{value:2,label:'2 – Liten'},{value:3,label:'3 – Moderat'},{value:4,label:'4 – Stor'},{value:5,label:'5 – Kritisk'}
        ]}/>
        <Sel label="Status" value={r.status} onChange={(v)=>setR({...r,status:v})} options={[
          {value:'aktiv',label:'Aktiv'},{value:'overvåkes',label:'Overvåkes'},{value:'lukket',label:'Lukket'}
        ]}/>
      </div>
      <TextField label="Tiltak / mitigering" value={r.mitigation} onChange={(v)=>setR({...r,mitigation:v})} multiline rows={3}/>
      <TextField label="Sist vurdert" value={r.lastReviewed} onChange={(v)=>setR({...r,lastReviewed:v})} type="date"/>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:18,paddingTop:16,borderTop:`1px solid ${theme.borderSoft}`}}>
        <div>{onDelete && <Btn variant="danger" icon={Trash2} onClick={()=>{ if(confirm('Slette risikoen?')) onDelete(); }}>Slett</Btn>}</div>
        <div style={{display:'flex',gap:8}}>
          <Btn variant="ghost" onClick={onCancel}>Avbryt</Btn>
          <Btn variant="brass" icon={Save} onClick={()=>{ if(!r.title){ alert('Tittel mangler'); return; } onSave(r); }}>Lagre</Btn>
        </div>
      </div>
    </div>
  );
};

/* ===== GRUPPEKOMMUNIKASJON / MELDINGER ===== */
const channelIconFor = (key) => ({
  hash: Hash, compass: Compass, briefcase: Briefcase, sparkles: Sparkles, message: MessageSquare,
}[key] || Hash);

/* DM-er identifiseres av en sortert par-nøkkel: 'a_b' der a<b */
const dmKeyFor = (a, b) => {
  if (!a || !b || a === b) return null;
  return [a, b].sort().join('_');
};
const otherMemberInDm = (dmKey, currentUserId) => {
  if (!dmKey) return null;
  const [a, b] = dmKey.split('_');
  return a === currentUserId ? b : a;
};

const countUnreadInChannel = (data, channelId, currentUserId) => {
  if (!currentUserId) return 0;
  const lastRead = data.readState?.[channelId]?.[currentUserId];
  return (data.messages || []).filter(m =>
    m.channelId === channelId &&
    m.author !== currentUserId &&
    (!lastRead || new Date(m.timestamp) > new Date(lastRead))
  ).length;
};

const countUnreadInDm = (data, otherMemberId, currentUserId) => {
  if (!currentUserId || !otherMemberId) return 0;
  const key = dmKeyFor(currentUserId, otherMemberId);
  if (!key) return 0;
  const lastRead = data.readState?.[key]?.[currentUserId];
  return (data.messages || []).filter(m =>
    m.dmKey === key &&
    m.author !== currentUserId &&
    (!lastRead || new Date(m.timestamp) > new Date(lastRead))
  ).length;
};

const totalUnread = (data, currentUserId) => {
  if (!currentUserId) return 0;
  const channelUnread = (data.channels || []).reduce((s, c) => s + countUnreadInChannel(data, c.id, currentUserId), 0);
  const dmUnread = (data.members || [])
    .filter(m => m.id !== currentUserId)
    .reduce((s, m) => s + countUnreadInDm(data, m.id, currentUserId), 0);
  return channelUnread + dmUnread;
};

/* Returnerer alle DM-partnere brukeren har hatt kontakt med, sortert etter siste aktivitet */
const dmPartnersFor = (data, currentUserId) => {
  if (!currentUserId) return [];
  const partnerLastMsg = {};
  (data.messages || []).forEach(m => {
    if (!m.dmKey) return;
    const other = otherMemberInDm(m.dmKey, currentUserId);
    if (!other) return;
    if (m.dmKey.split('_').includes(currentUserId)) {
      if (!partnerLastMsg[other] || new Date(m.timestamp) > new Date(partnerLastMsg[other].timestamp)) {
        partnerLastMsg[other] = m;
      }
    }
  });
  return Object.keys(partnerLastMsg)
    .map(id => ({ memberId: id, lastMessage: partnerLastMsg[id] }))
    .sort((a,b) => (b.lastMessage.timestamp||'').localeCompare(a.lastMessage.timestamp||''));
};

/* Parse @-mentions: returnerer array av member-ID-er som er nevnt */
const parseMentions = (content, members) => {
  const out = [];
  members.forEach(m => {
    const firstName = m.name.split(' ')[0];
    const re = new RegExp(`@${firstName}\\b`, 'i');
    if (re.test(content)) out.push(m.id);
  });
  return out;
};

const renderMessageContent = (content, members) => {
  let html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // @mentions
  members.forEach(m => {
    const firstName = m.name.split(' ')[0];
    const re = new RegExp(`@${firstName}\\b`, 'gi');
    html = html.replace(re, `<span style="background:${theme.brassLight};color:${theme.brassDark};padding:1px 6px;border-radius:4px;font-weight:600">@${firstName}</span>`);
  });
  // **bold**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // *italic*
  html = html.replace(/(^|[\s])\*([^\*\n]+?)\*([\s\.,!?]|$)/g, '$1<em>$2</em>$3');
  // Linkify URLs
  html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" style="color:'+theme.brass+';text-decoration:underline">$1</a>');
  // newlines
  html = html.replace(/\n/g, '<br/>');
  return html;
};

const MessageBubble = ({ message, data, currentUserId, onReact, onReply, onDelete, onEdit, replyTarget }) => {
  const author = data.members.find(m => m.id === message.author);
  const isMe = message.author === currentUserId;
  const [showActions, setShowActions] = useState(false);
  const [reactionOpen, setReactionOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  // Reaksjoner gruppert per emoji
  const reactionGroups = useMemo(() => {
    const g = {};
    (message.reactions || []).forEach(r => {
      if (!g[r.emoji]) g[r.emoji] = [];
      g[r.emoji].push(r.memberId);
    });
    return g;
  }, [message.reactions]);

  const toggleReaction = (emoji) => {
    if (!currentUserId) return;
    const existing = (message.reactions || []).find(r => r.memberId === currentUserId && r.emoji === emoji);
    let newReactions;
    if (existing) {
      newReactions = (message.reactions || []).filter(r => !(r.memberId === currentUserId && r.emoji === emoji));
    } else {
      newReactions = [...(message.reactions || []), { memberId: currentUserId, emoji }];
    }
    onReact(message.id, newReactions);
    setReactionOpen(false);
  };

  return (
    <div
      onMouseEnter={()=>setShowActions(true)}
      onMouseLeave={()=>{ setShowActions(false); setReactionOpen(false); }}
      style={{display:'flex',gap:12,padding:'10px 18px',position:'relative',background: showActions ? theme.surfaceAlt : 'transparent',transition:'background 100ms'}}>
      <Avatar member={author} size={36}/>
      <div style={{flex:1,minWidth:0}}>
        {replyTarget && (
          <div style={{fontSize:11,color:theme.inkMuted,marginBottom:4,display:'inline-flex',alignItems:'center',gap:4,paddingLeft:8,borderLeft:`2px solid ${theme.border}`}}>
            <Reply size={10}/>
            <span>Svar til <strong>{data.members.find(m=>m.id===replyTarget.author)?.name?.split(' ')[0]||'?'}</strong>: </span>
            <span style={{fontStyle:'italic',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:300}}>{replyTarget.content.slice(0,80)}{replyTarget.content.length>80?'…':''}</span>
          </div>
        )}
        <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:4,flexWrap:'wrap'}}>
          <span style={{fontSize:14,fontWeight:600,color:theme.ink}}>{author?.name||'Ukjent'}</span>
          <span style={{fontSize:11,color:theme.inkMuted}} title={new Date(message.timestamp).toLocaleString('no-NO')}>
            {fmtRelativeTime(message.timestamp)}
          </span>
          {message.edited && <span style={{fontSize:10,color:theme.inkMuted,fontStyle:'italic'}}>· redigert</span>}
        </div>
        {editing ? (
          <div>
            <textarea value={editText} onChange={(e)=>setEditText(e.target.value)} rows={3}
              autoFocus
              style={{width:'100%',padding:'8px 10px',border:`1px solid ${theme.brass}`,borderRadius:6,fontSize:13.5,fontFamily:'inherit',background:theme.surface,color:theme.ink,resize:'vertical',outline:'none',boxSizing:'border-box',lineHeight:1.5}}/>
            <div style={{display:'flex',gap:6,marginTop:6}}>
              <Btn size="sm" variant="brass" onClick={()=>{ onEdit(message.id, editText); setEditing(false); }}>Lagre</Btn>
              <Btn size="sm" variant="ghost" onClick={()=>{ setEditing(false); setEditText(message.content); }}>Avbryt</Btn>
            </div>
          </div>
        ) : (
          <div style={{fontSize:13.5,color:theme.ink,lineHeight:1.55}}
            dangerouslySetInnerHTML={{__html: renderMessageContent(message.content, data.members)}}/>
        )}
        {Object.keys(reactionGroups).length > 0 && (
          <div style={{display:'flex',gap:5,marginTop:6,flexWrap:'wrap'}}>
            {Object.entries(reactionGroups).map(([emoji, ids]) => {
              const meReacted = currentUserId && ids.includes(currentUserId);
              const names = ids.map(id => data.members.find(m=>m.id===id)?.name?.split(' ')[0]||'?').join(', ');
              return (
                <button key={emoji} onClick={()=>toggleReaction(emoji)}
                  title={`${names} reagerte med ${emoji}`}
                  style={{
                    display:'inline-flex',alignItems:'center',gap:5,padding:'2px 8px',borderRadius:999,
                    background: meReacted ? theme.brassLight : theme.surface,
                    border:`1px solid ${meReacted?theme.brass:theme.border}`,
                    cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:600,
                    color: meReacted ? theme.brassDark : theme.inkSoft,
                  }}>
                  <span style={{fontSize:13}}>{emoji}</span>
                  <span>{ids.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {showActions && !editing && (
        <div style={{position:'absolute',top:6,right:14,display:'flex',gap:2,background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:8,padding:3,boxShadow:'0 2px 6px rgba(0,0,0,0.06)'}}>
          <button onClick={()=>setReactionOpen(!reactionOpen)} title="Reager"
            style={{background:'transparent',border:'none',cursor:'pointer',padding:'4px 6px',color:theme.inkSoft,display:'flex',alignItems:'center',borderRadius:4}}
            onMouseEnter={(e)=>e.currentTarget.style.background=theme.surfaceAlt}
            onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
            <Smile size={14}/>
          </button>
          <button onClick={()=>onReply(message)} title="Svar"
            style={{background:'transparent',border:'none',cursor:'pointer',padding:'4px 6px',color:theme.inkSoft,display:'flex',alignItems:'center',borderRadius:4}}
            onMouseEnter={(e)=>e.currentTarget.style.background=theme.surfaceAlt}
            onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
            <Reply size={14}/>
          </button>
          {isMe && (
            <button onClick={()=>{ setEditText(message.content); setEditing(true); }} title="Rediger"
              style={{background:'transparent',border:'none',cursor:'pointer',padding:'4px 6px',color:theme.inkSoft,display:'flex',alignItems:'center',borderRadius:4}}
              onMouseEnter={(e)=>e.currentTarget.style.background=theme.surfaceAlt}
              onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
              <Edit2 size={13}/>
            </button>
          )}
          {isMe && (
            <button onClick={()=>{ if(confirm('Slette meldingen?')) onDelete(message.id); }} title="Slett"
              style={{background:'transparent',border:'none',cursor:'pointer',padding:'4px 6px',color:theme.rust,display:'flex',alignItems:'center',borderRadius:4}}
              onMouseEnter={(e)=>e.currentTarget.style.background=theme.rustLight}
              onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
              <Trash2 size={13}/>
            </button>
          )}
        </div>
      )}
      {reactionOpen && (
        <div style={{position:'absolute',top:34,right:14,display:'flex',gap:2,background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:8,padding:5,boxShadow:'0 4px 12px rgba(0,0,0,0.08)',zIndex:10}}>
          {['👍','❤️','🎉','😄','🔥','👀','🙏','💡'].map(e => (
            <button key={e} onClick={()=>toggleReaction(e)}
              style={{background:'transparent',border:'none',cursor:'pointer',padding:'4px 6px',fontSize:16,borderRadius:4}}
              onMouseEnter={(ev)=>ev.currentTarget.style.background=theme.surfaceAlt}
              onMouseLeave={(ev)=>ev.currentTarget.style.background='transparent'}>
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MessagesView = ({ data, save, currentUserId, focusChannelId, onClearFocus }) => {
  const channels = data.channels || [];

  /* Active conversation: enten { type:'channel', id } eller { type:'dm', memberId } */
  const initialConv = (() => {
    if (focusChannelId) {
      if (focusChannelId.startsWith?.('dm:')) return { type:'dm', memberId: focusChannelId.slice(3) };
      if (channels.find(c => c.id === focusChannelId)) return { type:'channel', id: focusChannelId };
      // Fallback: behandle som member-id (DM)
      if (data.members.find(m => m.id === focusChannelId)) return { type:'dm', memberId: focusChannelId };
    }
    return { type:'channel', id: channels[0]?.id };
  })();

  const [active, setActive] = useState(initialConv);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [newDmPickerOpen, setNewDmPickerOpen] = useState(false);
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);

  useEffect(() => {
    if (!focusChannelId) return;
    if (focusChannelId.startsWith?.('dm:')) setActive({ type:'dm', memberId: focusChannelId.slice(3) });
    else if (channels.find(c => c.id === focusChannelId)) setActive({ type:'channel', id: focusChannelId });
    else if (data.members.find(m => m.id === focusChannelId)) setActive({ type:'dm', memberId: focusChannelId });
    onClearFocus?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusChannelId]);

  const me = data.members.find(m => m.id === currentUserId);
  const memberById = (id) => data.members.find(m => m.id === id);

  // Resolve "active conversation"
  const channel = active.type === 'channel' ? channels.find(c => c.id === active.id) : null;
  const dmPartner = active.type === 'dm' ? memberById(active.memberId) : null;
  const dmKey = active.type === 'dm' ? dmKeyFor(currentUserId, active.memberId) : null;

  /* Lese-status-nøkkel — channelId for kanaler, dmKey for DM */
  const readStateKey = active.type === 'channel' ? active.id : dmKey;

  // Marker som lest når vi åpner samtalen
  useEffect(() => {
    if (!readStateKey || !currentUserId) return;
    const now = new Date().toISOString();
    const rs = { ...(data.readState || {}) };
    rs[readStateKey] = { ...(rs[readStateKey] || {}), [currentUserId]: now };
    if (rs[readStateKey][currentUserId] !== data.readState?.[readStateKey]?.[currentUserId]) {
      save({ ...data, readState: rs });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readStateKey, currentUserId]);

  const conversationMessages = useMemo(() => {
    if (active.type === 'channel') {
      return (data.messages || []).filter(m => m.channelId === active.id)
        .sort((a,b) => (a.timestamp||'').localeCompare(b.timestamp||''));
    }
    return (data.messages || []).filter(m => m.dmKey === dmKey)
      .sort((a,b) => (a.timestamp||'').localeCompare(b.timestamp||''));
  }, [data.messages, active, dmKey]);

  // Auto-scroll til siste melding
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [conversationMessages.length, active]);

  const sendMessage = () => {
    const content = input.trim();
    if (!content || !currentUserId) return;
    const newMsg = {
      id: uid('m'),
      ...(active.type === 'channel'
        ? { channelId: active.id, dmKey: null }
        : { channelId: null, dmKey }),
      author: currentUserId,
      content,
      timestamp: new Date().toISOString(),
      reactions: [],
      replyTo: replyTo?.id || null,
      edited: false,
    };
    save({ ...data, messages: [...(data.messages || []), newMsg] });
    setInput('');
    setReplyTo(null);
  };

  const updateMessage = (id, content) => {
    save({ ...data,
      messages: (data.messages || []).map(m =>
        m.id === id ? { ...m, content, edited:true } : m
      )
    });
  };
  const deleteMessage = (id) => {
    save({ ...data, messages: (data.messages || []).filter(m => m.id !== id) });
  };
  const updateReactions = (id, reactions) => {
    save({ ...data,
      messages: (data.messages || []).map(m =>
        m.id === id ? { ...m, reactions } : m
      )
    });
  };

  const handleInputChange = (e) => {
    const v = e.target.value;
    setInput(v);
    const cursor = e.target.selectionStart;
    const before = v.slice(0, cursor);
    const m = before.match(/@(\w*)$/);
    if (m && active.type === 'channel') { setShowMentionMenu(true); setMentionQuery(m[1].toLowerCase()); }
    else setShowMentionMenu(false);
  };

  const insertMention = (member) => {
    const cursor = inputRef.current?.selectionStart ?? input.length;
    const before = input.slice(0, cursor).replace(/@\w*$/, '');
    const after = input.slice(cursor);
    const firstName = member.name.split(' ')[0];
    setInput(`${before}@${firstName} ${after}`);
    setShowMentionMenu(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const filteredMembersForMention = data.members.filter(m =>
    m.id !== currentUserId &&
    m.name.toLowerCase().split(' ')[0].startsWith(mentionQuery)
  );

  // DM-listen i sidepanelet: vis medlemmer som har/har hatt samtale først, så resten
  const dmListMembers = useMemo(() => {
    if (!currentUserId) return [];
    const partners = dmPartnersFor(data, currentUserId);
    const partnerIds = new Set(partners.map(p => p.memberId));
    const rest = data.members.filter(m => m.id !== currentUserId && !partnerIds.has(m.id));
    return [
      ...partners.map(p => ({ member: memberById(p.memberId), lastMessage: p.lastMessage })),
      ...rest.map(m => ({ member: m, lastMessage: null })),
    ].filter(x => x.member);
  }, [data, currentUserId]);

  const ChannelIcon = channel ? channelIconFor(channel.icon) : Hash;

  return (
    <div>
      <SectionHeading overline={data.org?.messagesOverline || 'Internt rom for ledergruppen'} title="Samtaler"/>

      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18,minHeight:600}}>
        {/* Sidepanel: kanaler + DM-er */}
        <Card padded={false} style={{height:'fit-content',position:'sticky',top:24,maxHeight:'calc(100vh - 80px)',display:'flex',flexDirection:'column'}}>
          <div style={{padding:'14px 16px',borderBottom:`1px solid ${theme.borderSoft}`}}>
            <div style={{fontSize:11,fontWeight:700,color:theme.brass,letterSpacing:0.6,textTransform:'uppercase',marginBottom:2}}>Kanaler</div>
            <div style={{fontSize:12,color:theme.inkMuted}}>{channels.length} aktive rom</div>
          </div>
          <div style={{padding:6}}>
            {channels.map(c => {
              const Icon = channelIconFor(c.icon);
              const unread = countUnreadInChannel(data, c.id, currentUserId);
              const on = active.type === 'channel' && active.id === c.id;
              return (
                <button key={c.id} onClick={()=>setActive({ type:'channel', id:c.id })}
                  style={{
                    display:'flex',alignItems:'center',gap:10,padding:'10px 12px',width:'100%',
                    borderRadius:8,
                    background: on ? theme.brassLight : 'transparent',
                    color: on ? theme.brassDark : theme.inkSoft,
                    border:'none', cursor:'pointer', fontFamily:'inherit',
                    fontSize:13, fontWeight:on?600:500, textAlign:'left', marginBottom:2,
                    transition:'background 100ms',
                  }}
                  onMouseEnter={(e)=>{ if(!on) e.currentTarget.style.background=theme.surfaceAlt; }}
                  onMouseLeave={(e)=>{ if(!on) e.currentTarget.style.background='transparent'; }}>
                  <Icon size={14}/>
                  <span style={{flex:1,minWidth:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.name}</span>
                  {unread > 0 && (
                    <span style={{background:theme.brass,color:'#fff',fontSize:10,fontWeight:700,padding:'1px 7px',borderRadius:999,minWidth:18,textAlign:'center'}}>
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {currentUserId && (
            <div style={{padding:'14px 16px 8px',borderTop:`1px solid ${theme.borderSoft}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:theme.brass,letterSpacing:0.6,textTransform:'uppercase',marginBottom:2}}>Direktemeldinger</div>
                <div style={{fontSize:12,color:theme.inkMuted}}>1-til-1 med kolleger</div>
              </div>
              <button onClick={()=>setNewDmPickerOpen(!newDmPickerOpen)}
                title="Ny samtale"
                style={{background:newDmPickerOpen?theme.brass:'transparent',color:newDmPickerOpen?'#fff':theme.brass,border:`1px solid ${theme.brass}55`,padding:'4px 6px',borderRadius:6,cursor:'pointer',display:'flex',alignItems:'center',fontFamily:'inherit'}}>
                <Plus size={13}/>
              </button>
            </div>
          )}

          {newDmPickerOpen && currentUserId && (
            <div style={{padding:'4px 12px 8px',borderBottom:`1px solid ${theme.borderSoft}`,background:theme.surfaceAlt}}>
              <div style={{fontSize:11,color:theme.inkMuted,marginBottom:6}}>Velg person å skrive til:</div>
              {data.members.filter(m => m.id !== currentUserId).map(m => (
                <button key={m.id} onClick={()=>{ setActive({ type:'dm', memberId:m.id }); setNewDmPickerOpen(false); }}
                  style={{display:'flex',alignItems:'center',gap:8,padding:'6px 8px',width:'100%',border:'none',background:'transparent',cursor:'pointer',fontFamily:'inherit',fontSize:12.5,color:theme.ink,borderRadius:6,textAlign:'left',marginBottom:2}}
                  onMouseEnter={(e)=>e.currentTarget.style.background=theme.surface}
                  onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                  <Avatar member={m} size={22}/>
                  <span style={{flex:1,minWidth:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{m.name}</span>
                </button>
              ))}
            </div>
          )}

          {currentUserId && (
            <div style={{padding:6,flex:1,overflowY:'auto',minHeight:0}}>
              {dmListMembers.length === 0 ? (
                <div style={{padding:'10px 12px',fontSize:12,color:theme.inkMuted,lineHeight:1.5}}>
                  Ingen kolleger registrert ennå.
                </div>
              ) : dmListMembers.map(({ member, lastMessage }) => {
                const unread = countUnreadInDm(data, member.id, currentUserId);
                const on = active.type === 'dm' && active.memberId === member.id;
                const preview = lastMessage
                  ? (lastMessage.author === currentUserId ? 'Du: ' : '') + lastMessage.content.replace(/\n/g,' ').slice(0, 38) + (lastMessage.content.length>38?'…':'')
                  : 'Start en samtale';
                return (
                  <button key={member.id} onClick={()=>setActive({ type:'dm', memberId:member.id })}
                    style={{
                      display:'flex',alignItems:'center',gap:10,padding:'9px 10px',width:'100%',
                      borderRadius:8, background: on ? theme.brassLight : 'transparent',
                      border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                      marginBottom:1, transition:'background 100ms',
                    }}
                    onMouseEnter={(e)=>{ if(!on) e.currentTarget.style.background=theme.surfaceAlt; }}
                    onMouseLeave={(e)=>{ if(!on) e.currentTarget.style.background='transparent'; }}>
                    <Avatar member={member} size={30}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:6}}>
                        <span style={{fontSize:13,fontWeight: (unread > 0 || on) ? 600 : 500, color: on ? theme.brassDark : theme.ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                          {member.name.split(' ').slice(0,2).join(' ')}
                        </span>
                        {lastMessage && (
                          <span style={{fontSize:10,color:theme.inkMuted,flexShrink:0}}>
                            {fmtRelativeTime(lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      <div style={{fontSize:11.5,color:unread>0?theme.ink:theme.inkMuted,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',fontWeight:unread>0?600:400,marginTop:1}}>
                        {preview}
                      </div>
                    </div>
                    {unread > 0 && (
                      <span style={{background:theme.brass,color:'#fff',fontSize:10,fontWeight:700,padding:'1px 7px',borderRadius:999,minWidth:18,textAlign:'center',flexShrink:0}}>
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {!currentUserId && (
            <div style={{padding:'12px 14px',borderTop:`1px solid ${theme.borderSoft}`,fontSize:12,color:theme.inkMuted,lineHeight:1.5}}>
              Logg inn som et medlem for å sende meldinger.
            </div>
          )}
        </Card>

        {/* Meldingsstrøm */}
        <Card padded={false} style={{display:'flex',flexDirection:'column',minHeight:600,maxHeight:'calc(100vh - 120px)'}}>
          {(channel || dmPartner) && (
            <>
              <div style={{padding:'14px 22px',borderBottom:`1px solid ${theme.borderSoft}`,background:theme.surfaceAlt,display:'flex',alignItems:'center',gap:12}}>
                {channel ? (
                  <>
                    <div style={{width:40,height:40,borderRadius:10,background:theme.brassLight,color:theme.brass,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <ChannelIcon size={18}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:20,fontWeight:500,color:theme.ink,margin:0,letterSpacing:-0.2}}>{channel.name}</h3>
                      <div style={{fontSize:12,color:theme.inkMuted}}>{channel.description}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar member={dmPartner} size={40}/>
                    <div style={{flex:1,minWidth:0}}>
                      <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:20,fontWeight:500,color:theme.ink,margin:0,letterSpacing:-0.2,display:'flex',alignItems:'center',gap:8}}>
                        {dmPartner.name}
                        <span style={{fontSize:10,fontWeight:700,letterSpacing:0.6,textTransform:'uppercase',color:theme.brass,background:theme.brassLight,padding:'2px 7px',borderRadius:4}}>
                          Direktemelding
                        </span>
                      </h3>
                      <div style={{fontSize:12,color:theme.inkMuted}}>
                        {dmPartner.role}{dmPartner.email?' · '+dmPartner.email:''}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {channel?.pinnedMessage && (
                <div style={{padding:'10px 22px',background:theme.brassLight+'80',borderBottom:`1px solid ${theme.brass}22`,display:'flex',gap:10,alignItems:'flex-start',fontSize:12.5,color:theme.ink,lineHeight:1.5}}>
                  <PinIcon size={13} style={{color:theme.brass,flexShrink:0,marginTop:2}}/>
                  <span><strong>Festet:</strong> {channel.pinnedMessage}</span>
                </div>
              )}

              {dmPartner && (
                <div style={{padding:'10px 22px',background:'#F8F4EA',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',gap:8,alignItems:'center',fontSize:12,color:theme.inkSoft,lineHeight:1.5}}>
                  <ShieldAlert size={12} style={{color:theme.brass,flexShrink:0}}/>
                  <span>Privat samtale mellom deg og {dmPartner.name.split(' ')[0]}. Andre i {data.org?.groupNoun || 'ledergruppen'} ser ikke denne tråden.</span>
                </div>
              )}

              <div ref={listRef} style={{flex:1,overflowY:'auto',padding:'12px 0'}}>
                {conversationMessages.length === 0 ? (
                  <div style={{padding:'60px 20px',textAlign:'center',color:theme.inkMuted}}>
                    {channel ? <MessageCircle size={32} style={{color:theme.brass,opacity:0.4,marginBottom:10}}/> 
                             : <Avatar member={dmPartner} size={48} style={{marginBottom:10,opacity:0.6}}/>}
                    <div style={{fontSize:14,fontWeight:600,color:theme.inkSoft,marginBottom:4,marginTop:10}}>
                      {channel ? 'Ingen meldinger ennå' : `Start samtalen med ${dmPartner.name.split(' ')[0]}`}
                    </div>
                    <div style={{fontSize:12.5}}>
                      {channel
                        ? <>Vær den første som starter en samtale i <strong>{channel.name}</strong>.</>
                        : 'Skriv en melding nedenfor – kun dere to ser den.'}
                    </div>
                  </div>
                ) : (
                  conversationMessages.map(msg => {
                    const replyTarget = msg.replyTo ? (data.messages||[]).find(m=>m.id===msg.replyTo) : null;
                    return (
                      <MessageBubble key={msg.id} message={msg} data={data} currentUserId={currentUserId}
                        onReact={updateReactions}
                        onReply={(m)=>{ setReplyTo(m); inputRef.current?.focus(); }}
                        onDelete={deleteMessage}
                        onEdit={updateMessage}
                        replyTarget={replyTarget}/>
                    );
                  })
                )}
              </div>

              <div style={{padding:'12px 18px',borderTop:`1px solid ${theme.borderSoft}`,background:theme.surface,position:'relative'}}>
                {replyTo && (
                  <div style={{display:'flex',alignItems:'center',gap:10,padding:'6px 12px',marginBottom:8,background:theme.surfaceAlt,borderRadius:6,borderLeft:`3px solid ${theme.brass}`}}>
                    <Reply size={13} style={{color:theme.brass,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0,fontSize:12,color:theme.inkSoft}}>
                      Svarer <strong>{memberById(replyTo.author)?.name?.split(' ')[0]||'?'}</strong>: 
                      <span style={{fontStyle:'italic',marginLeft:4}}>{replyTo.content.slice(0,80)}{replyTo.content.length>80?'…':''}</span>
                    </div>
                    <button onClick={()=>setReplyTo(null)} style={{background:'transparent',border:'none',cursor:'pointer',color:theme.inkMuted,padding:2,display:'flex'}}>
                      <X size={14}/>
                    </button>
                  </div>
                )}
                {showMentionMenu && filteredMembersForMention.length > 0 && (
                  <div style={{position:'absolute',bottom:'100%',left:18,marginBottom:6,background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:8,boxShadow:'0 -4px 12px rgba(0,0,0,0.08)',padding:5,maxWidth:240,zIndex:5}}>
                    <div style={{padding:'4px 10px 6px',fontSize:10,fontWeight:700,color:theme.brass,letterSpacing:0.6,textTransform:'uppercase'}}>Nevn person</div>
                    {filteredMembersForMention.slice(0,6).map(m => (
                      <button key={m.id} onClick={()=>insertMention(m)}
                        style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',width:'100%',border:'none',background:'transparent',cursor:'pointer',fontFamily:'inherit',fontSize:13,color:theme.ink,borderRadius:4,textAlign:'left'}}
                        onMouseEnter={(e)=>e.currentTarget.style.background=theme.surfaceAlt}
                        onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
                        <Avatar member={m} size={22}/>
                        <span>{m.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
                  <Avatar member={me} size={32}/>
                  <textarea ref={inputRef} value={input} onChange={handleInputChange}
                    onKeyDown={(e)=>{
                      if (e.key === 'Enter' && !e.shiftKey && !showMentionMenu) { e.preventDefault(); sendMessage(); }
                      if (e.key === 'Escape') { setReplyTo(null); setShowMentionMenu(false); }
                    }}
                    placeholder={
                      !currentUserId ? 'Logg inn for å skrive'
                      : channel ? `Skriv i ${channel.name}… (@navn for å nevne, Shift+Enter for ny linje)`
                      : `Melding til ${dmPartner.name.split(' ')[0]}… (Shift+Enter for ny linje)`
                    }
                    disabled={!currentUserId}
                    rows={1}
                    style={{flex:1,padding:'10px 12px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13.5,fontFamily:'inherit',background:theme.surface,color:theme.ink,resize:'none',outline:'none',minHeight:40,maxHeight:140,boxSizing:'border-box',lineHeight:1.5}}
                    onFocus={(e)=>e.target.style.borderColor=theme.brass}
                    onBlur={(e)=>e.target.style.borderColor=theme.border}/>
                  <Btn variant="brass" icon={Send2} onClick={sendMessage} disabled={!input.trim() || !currentUserId}>Send</Btn>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

/* ===== MITT SKRIVEBORD ===== */
const PersonalDeskView = ({ data, currentUserId, onNavigate, save, onAsk, allData={} }) => {
  const me = data.members.find(m => m.id === currentUserId);
  if (!me) {
    return <EmptyState icon={Users} title="Velg hvem du er pålogget som"
      message="Klikk på bruker-velgeren øverst i sidemenyen for å velge identitet."/>;
  }

  const memberById = (id) => data.members.find(m => m.id === id);
  const myTasks = data.tasks.filter(t => t.owner === me.id && t.status !== 'fullført')
    .sort((a,b) => (a.dueDate||'9999').localeCompare(b.dueDate||'9999'));
  const overdueTasks = myTasks.filter(t => t.dueDate && daysFromNow(t.dueDate) < 0);
  const myMeetings = data.meetings.filter(m =>
    m.attendees?.includes(me.id) && m.status === 'planlagt' && daysFromNow(m.date) >= 0
  ).sort((a,b) => a.date.localeCompare(b.date));
  const myInitiatives = (data.initiatives || []).filter(i =>
    i.owner === me.id && i.status !== 'fullført' && i.status !== 'avlyst'
  ).sort((a,b) => {
    const order = { rød: 0, gul: 1, grønn: 2 };
    return (order[a.healthStatus] ?? 3) - (order[b.healthStatus] ?? 3);
  });
  const myKpis = (data.kpis || []).filter(k => k.owner === me.id);
  const myRisks = (data.risks || []).filter(r => r.owner === me.id && r.status === 'aktiv')
    .sort((a,b) => ((b.likelihood||0)*(b.impact||0)) - ((a.likelihood||0)*(a.impact||0)));
  const myDecisionReviews = data.decisions.filter(d =>
    d.owner === me.id && d.reviewDate && d.reviewStatus !== 'ferdig' &&
    daysFromNow(d.reviewDate) <= 14
  );
  const myPlans = (data.plans || []).filter(p => p.owner === me.id);
  const myUpcomingPlans = myPlans.filter(p => {
    const occs = planOccurrencesInWindow(p, new Date(), (() => { const e = new Date(); e.setDate(e.getDate()+30); return e; })());
    return occs.length > 0;
  });
  const myProposals = (data.agendaProposals || []).filter(p => p.proposer === me.id);
  const myOpenProposals = myProposals.filter(p => p.status === 'foreslått');
  const unreadByChannel = (data.channels || []).map(c => ({
    channel: c,
    unread: countUnreadInChannel(data, c.id, currentUserId)
  })).filter(x => x.unread > 0);
  const unreadByDm = (data.members || [])
    .filter(m => m.id !== currentUserId)
    .map(m => ({ member: m, unread: countUnreadInDm(data, m.id, currentUserId) }))
    .filter(x => x.unread > 0)
    .sort((a,b) => b.unread - a.unread);
  const totalUnreadCount =
    unreadByChannel.reduce((s,x) => s + x.unread, 0) +
    unreadByDm.reduce((s,x) => s + x.unread, 0);
  // Meldinger der jeg blir nevnt (kun i kanaler – DM-er er allerede personlig adressert)
  const myMentions = (data.messages || []).filter(msg => {
    if (msg.dmKey) return false;
    const lastRead = data.readState?.[msg.channelId]?.[currentUserId];
    if (msg.author === currentUserId) return false;
    if (lastRead && new Date(msg.timestamp) <= new Date(lastRead)) return false;
    return parseMentions(msg.content, data.members).includes(currentUserId);
  });

  const now = new Date();
  const greeting = now.getHours() < 10 ? 'God morgen' : now.getHours() < 18 ? 'God dag' : 'God kveld';
  const firstName = me.name.split(' ')[0];

  // Find next meeting + my prep status
  const nextMeeting = myMeetings[0];
  const myPrep = nextMeeting?.prep?.find(p => p.memberId === me.id);
  const prepFilled = myPrep && (myPrep.content||'').trim().length > 0;

  return (
    <div>
      <div style={{marginBottom:32}}>
        <div style={{fontSize:11,fontWeight:700,color:theme.brass,letterSpacing:1.5,textTransform:'uppercase',marginBottom:6}}>
          {fmtDateLong(now)}
        </div>
        <h1 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:42,fontWeight:400,color:theme.ink,margin:'0 0 8px',letterSpacing:-1,lineHeight:1.1}}>
          {greeting}, {firstName}
        </h1>
        <div style={{fontSize:15,color:theme.inkSoft,fontWeight:500}}>
          {me.role} · {data.org?.deskFooter || 'Vikingbad ledergruppe'}
        </div>
      </div>

      {/* Hero: neste møte med forberedelses-CTA */}
      {nextMeeting && (
        <Card style={{
          marginBottom:24,padding:0,overflow:'hidden',
          background:`linear-gradient(135deg, ${theme.navy} 0%, ${theme.navyDark} 100%)`,color:'#fff',border:'none'
        }}>
          <div style={{padding:28,position:'relative'}}>
            <div style={{position:'absolute',top:-30,right:-30,width:160,height:160,borderRadius:'50%',background:'rgba(184,137,59,0.12)'}}/>
            <div style={{position:'relative'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap'}}>
                <div style={{fontSize:11,color:theme.brass,letterSpacing:1.5,textTransform:'uppercase',fontWeight:700}}>Ditt neste møte · {relativeDate(nextMeeting.date)}</div>
                {prepFilled
                  ? <Pill bg="rgba(107,138,110,0.3)" color="#A8C8AA"><CheckCircle2 size={11}/> Forberedelse levert</Pill>
                  : <Pill bg="rgba(212,160,78,0.3)" color="#F5C97D"><AlertCircle size={11}/> Mangler forberedelse</Pill>}
              </div>
              <h2 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:28,fontWeight:400,margin:'0 0 12px',letterSpacing:-0.5}}>
                {nextMeeting.title}
              </h2>
              <div style={{display:'flex',gap:20,flexWrap:'wrap',marginBottom:18,opacity:0.85,fontSize:13}}>
                <span style={{display:'inline-flex',alignItems:'center',gap:6}}><CalendarClock size={14}/> {fmtDateLong(nextMeeting.date)} kl {nextMeeting.time}</span>
                <span style={{display:'inline-flex',alignItems:'center',gap:6}}><MapPin size={14}/> {nextMeeting.location||'—'}</span>
              </div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <Btn onClick={()=>onNavigate('meetings',nextMeeting.id)} variant="brass" icon={ArrowRight}>Åpne møtet</Btn>
                {!prepFilled && <Btn onClick={()=>onNavigate('meetings',nextMeeting.id)} variant="ghost" icon={ClipboardList} style={{background:'rgba(255,255,255,0.1)',color:'#fff',border:'1px solid rgba(255,255,255,0.2)'}}>Lever forberedelse</Btn>}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* KPI strip */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:14,marginBottom:32}}>
        <KPI label="Mine åpne oppgaver" value={myTasks.length} accent={theme.brass} icon={ListTodo}
          sub={overdueTasks.length>0?`${overdueTasks.length} forfalt`:'På sporet'}
          subColor={overdueTasks.length>0?theme.rust:theme.sage}
          onClick={()=>onNavigate('tasks')}/>
        <KPI label="Mine møter fremover" value={myMeetings.length} accent={theme.navy} icon={Calendar}
          sub={nextMeeting?relativeDate(nextMeeting.date):'Ingen'}
          onClick={()=>onNavigate('meetings')}/>
        <KPI label={`Mine ${data.org?.initiativeNoun || 'initiativ'}er`} value={myInitiatives.length} accent={theme.amber} icon={Briefcase}
          sub={`${myInitiatives.filter(i=>i.healthStatus==='rød').length} i trøbbel`}
          onClick={()=>onNavigate('initiatives')}/>
        <KPI label="Mine saker" value={myOpenProposals.length} accent={theme.brassDark} icon={Inbox}
          sub={myOpenProposals.length>0?`${myOpenProposals.filter(p=>!p.meetingId).length} i puljen`:'Ingen ventende'}
          onClick={()=>onNavigate('proposals')}/>
        <KPI label="Uleste samtaler" value={totalUnreadCount} accent={theme.sage} icon={MessageCircle}
          sub={myMentions.length>0?`${myMentions.length} omtaler deg`:'Hold dialogen i gang'}
          subColor={myMentions.length>0?theme.rust:theme.inkMuted}
          onClick={()=>onNavigate('messages')}/>
        <KPI label="Reviewer å gjøre" value={myDecisionReviews.length} accent={theme.rust} icon={Bell}
          sub={myDecisionReviews.length>0?'Krever oppmerksomhet':'Alt fulgt opp'}
          onClick={()=>onNavigate('decisions')}/>
      </div>

      {/* Two columns: tasks + decision reviews */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(360px, 1fr))',gap:20,marginBottom:24}}>
        <Card padded={false}>
          <div style={{padding:'18px 22px',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:18,fontWeight:500,color:theme.ink,margin:0}}>Oppgavene mine</h3>
              <div style={{fontSize:12,color:theme.inkMuted,marginTop:2}}>Sortert etter frist</div>
            </div>
            {myTasks.length > 5 && <button onClick={()=>onNavigate('tasks')} style={{background:'transparent',border:'none',color:theme.brass,fontSize:12,fontWeight:600,letterSpacing:0.4,textTransform:'uppercase',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontFamily:'inherit'}}>Vis alle <ChevronRight size={14}/></button>}
          </div>
          <div>
            {myTasks.length === 0 ? (
              <div style={{padding:30,textAlign:'center',color:theme.inkMuted,fontSize:14}}>Du har ingen åpne oppgaver 🎉</div>
            ) : myTasks.slice(0,6).map(task => (
              <TaskRow key={task.id} task={task} member={memberById(task.owner)} compact
                onToggle={()=>{ const n=task.status==='fullført'?'pågår':'fullført'; save({...data,tasks:data.tasks.map(t=>t.id===task.id?{...t,status:n}:t)}); }}/>
            ))}
          </div>
        </Card>

        <Card padded={false}>
          <div style={{padding:'18px 22px',borderBottom:`1px solid ${theme.borderSoft}`}}>
            <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:18,fontWeight:500,color:theme.ink,margin:0}}>Beslutninger til oppfølging</h3>
            <div style={{fontSize:12,color:theme.inkMuted,marginTop:2}}>Review innen 14 dager</div>
          </div>
          <div>
            {myDecisionReviews.length === 0 ? (
              <div style={{padding:30,textAlign:'center',color:theme.inkMuted,fontSize:14}}>Ingen beslutninger venter på review</div>
            ) : myDecisionReviews.map((d,i) => {
              const overdue = daysFromNow(d.reviewDate) < 0;
              return (
                <div key={d.id} style={{padding:'14px 22px',borderBottom:i<myDecisionReviews.length-1?`1px solid ${theme.borderSoft}`:'none',display:'flex',gap:12,alignItems:'flex-start',cursor:'pointer'}}
                     onClick={()=>onNavigate('decisions')}>
                  <div style={{width:4,alignSelf:'stretch',background:overdue?theme.rust:theme.amber,borderRadius:2,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,color:theme.ink,marginBottom:4}}>{d.title}</div>
                    <div style={{fontSize:12,color:overdue?theme.rust:theme.inkMuted,fontWeight:overdue?600:500,display:'inline-flex',alignItems:'center',gap:4}}>
                      {overdue && <AlertCircle size={12}/>} Review {relativeDate(d.reviewDate)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Koordinering på tvers – hva avdelingen skylder andre / venter på */}
      {(() => {
        const myPortal = data.org?.portalId;
        const memberIn = (pid,id) => (allData[pid]?.members||[]).find(x=>x.id===id);
        const outgoing = programHandoffs.filter(h => h.from===myPortal && h.status!=='levert').sort((a,b)=>a.dueOffset-b.dueOffset);
        const incoming = programHandoffs.filter(h => h.to===myPortal   && h.status!=='levert').sort((a,b)=>a.dueOffset-b.dueOffset);
        if (!outgoing.length && !incoming.length) return null;
        const lateCount = [...outgoing,...incoming].filter(h=>handoffMeta(h).overdue).length;
        const Row = ({ h, dir }) => {
          const meta = handoffMeta(h);
          const other = dir==='out' ? memberIn(h.to,h.recipient) : memberIn(h.from,h.owner);
          const mineMember = dir==='out' ? memberIn(h.from,h.owner) : memberIn(h.to,h.recipient);
          const isMine = mineMember && mineMember.id===currentUserId;
          const prog = programById(h.program);
          return (
            <div onClick={()=>onNavigate('crossorg')}
              style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderBottom:`1px solid ${theme.borderSoft}`,cursor:'pointer'}}
              onMouseEnter={(e)=>e.currentTarget.style.background=theme.surfaceAlt}
              onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13.5,fontWeight:600,color:theme.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                  {h.title}{isMine && <span style={{fontSize:9.5,fontWeight:700,letterSpacing:0.3,textTransform:'uppercase',color:theme.brassDark,background:theme.brassLight,padding:'1px 6px',borderRadius:999,marginLeft:7}}>deg</span>}
                </div>
                <div style={{fontSize:11.5,color:theme.inkMuted,marginTop:2}}>
                  {dir==='out' ? `Til ${portalShort(h.to)}` : `Fra ${portalShort(h.from)}`} · {other?other.name.split(' ')[0]:'?'} · {prog?prog.name:''} · {h.status==='levert'?'Levert':relativeDate(isoFromOffset(h.dueOffset))}
                </div>
              </div>
              <Pill bg={meta.bg} color={meta.fg} style={{flexShrink:0,display:'inline-flex',alignItems:'center',gap:4}}>{meta.overdue && <AlertCircle size={11}/>}{meta.label}</Pill>
            </div>
          );
        };
        return (
          <Card padded={false} style={{marginBottom:24}}>
            <div style={{padding:'18px 22px',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:18,fontWeight:500,color:theme.ink,margin:0,display:'flex',alignItems:'center',gap:8}}>
                  <Repeat size={17} style={{color:theme.brass}}/> Koordinering på tvers
                </h3>
                <div style={{fontSize:12,color:theme.inkMuted,marginTop:2}}>
                  {outgoing.length} å levere · {incoming.length} å vente på{lateCount>0?` · ${lateCount} forsinket`:''}
                </div>
              </div>
              <button onClick={()=>onNavigate('crossorg')} style={{background:'transparent',border:'none',color:theme.brass,fontSize:12,fontWeight:600,letterSpacing:0.4,textTransform:'uppercase',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontFamily:'inherit'}}>
                På tvers <ChevronRight size={14}/>
              </button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))'}}>
              <div style={{borderRight:`1px solid ${theme.borderSoft}`}}>
                <div style={{padding:'12px 14px 6px',fontSize:11,fontWeight:700,color:theme.inkSoft,letterSpacing:0.6,textTransform:'uppercase'}}>Avdelingen skal levere</div>
                {outgoing.length? outgoing.map(h => <Row key={h.id} h={h} dir="out"/>) : <div style={{padding:'14px',fontSize:13,color:theme.inkMuted}}>Ingenting utestående 🎉</div>}
              </div>
              <div>
                <div style={{padding:'12px 14px 6px',fontSize:11,fontWeight:700,color:theme.inkSoft,letterSpacing:0.6,textTransform:'uppercase'}}>Avdelingen venter på</div>
                {incoming.length? incoming.map(h => <Row key={h.id} h={h} dir="in"/>) : <div style={{padding:'14px',fontSize:13,color:theme.inkMuted}}>Venter ikke på noe akkurat nå</div>}
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Initiatives + KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(360px, 1fr))',gap:20,marginBottom:24}}>
        {myInitiatives.length > 0 && (
          <Card padded={false}>
            <div style={{padding:'18px 22px',borderBottom:`1px solid ${theme.borderSoft}`}}>
              <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:18,fontWeight:500,color:theme.ink,margin:0}}>Mine {data.org?.initiativeNoun || 'initiativ'}er</h3>
              <div style={{fontSize:12,color:theme.inkMuted,marginTop:2}}>{myInitiatives.length} pågående</div>
            </div>
            <div>
              {myInitiatives.slice(0,4).map((i,idx) => {
                const hc = healthColor(i.healthStatus);
                return (
                  <div key={i.id} onClick={()=>onNavigate('initiatives')}
                       style={{padding:'14px 22px',borderBottom:idx<Math.min(myInitiatives.length-1,3)?`1px solid ${theme.borderSoft}`:'none',cursor:'pointer'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap'}}>
                      <Pill bg={`${hc}22`} color={hc}>● {healthLabel(i.healthStatus)}</Pill>
                      <span style={{fontSize:14,fontWeight:600,color:theme.ink}}>{i.title}</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{flex:1,height:4,background:theme.surfaceAlt,borderRadius:2,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${i.percentComplete||0}%`,background:hc}}/>
                      </div>
                      <span style={{fontSize:11,color:theme.inkMuted,fontWeight:600,minWidth:32}}>{i.percentComplete||0}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {myKpis.length > 0 && (
          <Card padded={false}>
            <div style={{padding:'18px 22px',borderBottom:`1px solid ${theme.borderSoft}`}}>
              <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:18,fontWeight:500,color:theme.ink,margin:0}}>Mine nøkkeltall</h3>
              <div style={{fontSize:12,color:theme.inkMuted,marginTop:2}}>Siste måling</div>
            </div>
            <div>
              {myKpis.slice(0,4).map((k,idx) => {
                const latest = k.history?.[0];
                const sc = kpiStatusColor(latest?.status);
                return (
                  <div key={k.id} onClick={()=>onNavigate('kpis')}
                       style={{padding:'14px 22px',borderBottom:idx<Math.min(myKpis.length-1,3)?`1px solid ${theme.borderSoft}`:'none',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:theme.ink,marginBottom:2}}>{k.name}</div>
                      <div style={{fontSize:11,color:theme.inkMuted}}>Mål: {k.target} {k.unit}</div>
                    </div>
                    <div style={{textAlign:'right',marginLeft:12}}>
                      <div style={{fontFamily:'Fraunces, Georgia, serif',fontSize:22,fontWeight:500,color:sc,lineHeight:1}}>
                        {latest?.value?.toLocaleString('no-NO') ?? '–'}
                      </div>
                      <div style={{fontSize:11,color:theme.inkMuted,marginTop:2}}>{k.unit}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Risks */}
      {myRisks.length > 0 && (
        <Card padded={false} style={{marginBottom:24}}>
          <div style={{padding:'18px 22px',borderBottom:`1px solid ${theme.borderSoft}`}}>
            <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:18,fontWeight:500,color:theme.ink,margin:0}}>Risikoer jeg eier</h3>
            <div style={{fontSize:12,color:theme.inkMuted,marginTop:2}}>Sortert etter score</div>
          </div>
          <div>
            {myRisks.slice(0,3).map((r,i) => {
              const color = riskScoreColor(r.likelihood, r.impact);
              return (
                <div key={r.id} onClick={()=>onNavigate('risks')}
                     style={{padding:'14px 22px',borderBottom:i<Math.min(myRisks.length-1,2)?`1px solid ${theme.borderSoft}`:'none',display:'flex',gap:12,alignItems:'center',cursor:'pointer'}}>
                  <div style={{width:36,height:36,borderRadius:8,background:`${color}22`,color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:'Fraunces, Georgia, serif',fontSize:16,fontWeight:500}}>
                    {(r.likelihood||0)*(r.impact||0)}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,color:theme.ink,marginBottom:2}}>{r.title}</div>
                    <div style={{fontSize:12,color:theme.inkMuted}}>{r.category} · {riskScoreLabel(r.likelihood,r.impact)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Mine innmeldte saker + uleste meldinger */}
      {(myOpenProposals.length > 0 || totalUnreadCount > 0 || myMentions.length > 0) && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(360px, 1fr))',gap:20,marginBottom:24}}>
          {myOpenProposals.length > 0 && (
            <Card padded={false}>
              <div style={{padding:'18px 22px',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:18,fontWeight:500,color:theme.ink,margin:0}}>Mine innmeldte saker</h3>
                  <div style={{fontSize:12,color:theme.inkMuted,marginTop:2}}>Venter på behandling</div>
                </div>
                <button onClick={()=>onNavigate('proposals')} style={{background:'transparent',border:'none',color:theme.brass,fontSize:12,fontWeight:600,letterSpacing:0.4,textTransform:'uppercase',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontFamily:'inherit'}}>
                  Vis alle <ChevronRight size={14}/>
                </button>
              </div>
              <div>
                {myOpenProposals.slice(0,4).map((p,i) => {
                  const meeting = data.meetings.find(m => m.id === p.meetingId);
                  const cc = proposalCategoryColor(p.category);
                  return (
                    <div key={p.id} onClick={()=>onNavigate('proposals')}
                         style={{padding:'14px 22px',borderBottom:i<Math.min(myOpenProposals.length-1,3)?`1px solid ${theme.borderSoft}`:'none',display:'flex',gap:12,alignItems:'flex-start',cursor:'pointer'}}>
                      <div style={{width:4,alignSelf:'stretch',background:cc.fg,borderRadius:2,flexShrink:0,minHeight:36}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,fontWeight:600,color:theme.ink,marginBottom:3}}>{p.title}</div>
                        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',fontSize:11,color:theme.inkMuted}}>
                          <Pill bg={cc.bg} color={cc.fg} style={{fontSize:10,padding:'2px 8px'}}>{proposalCategoryLabels[p.category]}</Pill>
                          {meeting
                            ? <span style={{display:'inline-flex',alignItems:'center',gap:4,color:theme.brass,fontWeight:600}}><Calendar size={11}/> {meeting.title}</span>
                            : <span style={{display:'inline-flex',alignItems:'center',gap:4,color:theme.amber,fontWeight:600}}><Inbox size={11}/> I puljen</span>
                          }
                          {p.priority === 'høy' && <span style={{color:theme.rust,fontWeight:700,textTransform:'uppercase',letterSpacing:0.4,fontSize:10}}>⚡ Haster</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {(totalUnreadCount > 0 || myMentions.length > 0) && (
            <Card padded={false}>
              <div style={{padding:'18px 22px',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:18,fontWeight:500,color:theme.ink,margin:0}}>Uleste samtaler</h3>
                  <div style={{fontSize:12,color:theme.inkMuted,marginTop:2}}>
                    {totalUnreadCount > 0 ? `${totalUnreadCount} uleste meldinger` : 'Ingen nye'}
                    {myMentions.length > 0 && ` · ${myMentions.length} omtaler deg`}
                  </div>
                </div>
                <button onClick={()=>onNavigate('messages')} style={{background:'transparent',border:'none',color:theme.brass,fontSize:12,fontWeight:600,letterSpacing:0.4,textTransform:'uppercase',cursor:'pointer',display:'flex',alignItems:'center',gap:4,fontFamily:'inherit'}}>
                  Åpne <ChevronRight size={14}/>
                </button>
              </div>
              <div>
                {myMentions.slice(0,3).map((msg) => {
                  const author = memberById(msg.author);
                  const channel = (data.channels || []).find(c => c.id === msg.channelId);
                  return (
                    <div key={msg.id} onClick={()=>onNavigate('messages', msg.channelId)}
                         style={{padding:'12px 22px',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',gap:10,alignItems:'flex-start',cursor:'pointer',background:theme.brassLight+'40'}}>
                      <AtSign size={14} style={{color:theme.brass,flexShrink:0,marginTop:3}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,color:theme.brass,fontWeight:600,marginBottom:2}}>
                          {author?.name?.split(' ')[0]||'?'} nevnte deg i #{channel?.name||'?'} · {fmtRelativeTime(msg.timestamp)}
                        </div>
                        <div style={{fontSize:13,color:theme.ink,lineHeight:1.45,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                          {msg.content.slice(0,120)}{msg.content.length>120?'…':''}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {unreadByDm.slice(0,3).map((ub, i) => {
                  const lastDmMsg = (data.messages||[])
                    .filter(m => m.dmKey === dmKeyFor(currentUserId, ub.member.id))
                    .sort((a,b)=>(b.timestamp||'').localeCompare(a.timestamp||''))[0];
                  return (
                    <div key={'dm-'+ub.member.id} onClick={()=>onNavigate('messages', 'dm:'+ub.member.id)}
                         style={{padding:'12px 22px',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',gap:10,alignItems:'center',cursor:'pointer'}}>
                      <Avatar member={ub.member} size={30}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13.5,fontWeight:600,color:theme.ink,display:'flex',justifyContent:'space-between',gap:8,alignItems:'baseline'}}>
                          <span style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ub.member.name.split(' ').slice(0,2).join(' ')}</span>
                          {lastDmMsg && <span style={{fontSize:10,color:theme.inkMuted,fontWeight:500}}>{fmtRelativeTime(lastDmMsg.timestamp)}</span>}
                        </div>
                        <div style={{fontSize:11.5,color:theme.inkMuted,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',marginTop:1}}>
                          {lastDmMsg ? lastDmMsg.content.slice(0,70)+(lastDmMsg.content.length>70?'…':'') : 'Ny melding'}
                        </div>
                      </div>
                      <span style={{background:theme.brass,color:'#fff',fontSize:11,fontWeight:700,padding:'2px 9px',borderRadius:999,minWidth:22,textAlign:'center',flexShrink:0}}>
                        {ub.unread}
                      </span>
                    </div>
                  );
                })}
                {unreadByChannel.slice(0,3).map((ub,i) => {
                  const Icon = channelIconFor(ub.channel.icon);
                  return (
                    <div key={ub.channel.id} onClick={()=>onNavigate('messages', ub.channel.id)}
                         style={{padding:'12px 22px',borderBottom:i<Math.min(unreadByChannel.length-1,2)?`1px solid ${theme.borderSoft}`:'none',display:'flex',gap:10,alignItems:'center',cursor:'pointer'}}>
                      <div style={{width:30,height:30,borderRadius:8,background:theme.brassLight,color:theme.brass,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <Icon size={14}/>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13.5,fontWeight:600,color:theme.ink}}>{ub.channel.name}</div>
                        <div style={{fontSize:11,color:theme.inkMuted}}>{ub.channel.description}</div>
                      </div>
                      <span style={{background:theme.brass,color:'#fff',fontSize:11,fontWeight:700,padding:'2px 9px',borderRadius:999,minWidth:22,textAlign:'center'}}>
                        {ub.unread}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* AI assistant CTA */}
      <Card style={{
        background:`linear-gradient(135deg, ${theme.brass}15 0%, ${theme.amber}15 100%)`,
        border:`1px solid ${theme.brass}40`,padding:20,
      }}>
        <div style={{display:'flex',gap:14,alignItems:'center',flexWrap:'wrap'}}>
          <div style={{width:42,height:42,borderRadius:10,background:theme.brass,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0}}>
            <Sparkles size={20}/>
          </div>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontSize:14,fontWeight:600,color:theme.ink,marginBottom:2}}>Spør AI-assistenten</div>
            <div style={{fontSize:13,color:theme.inkSoft,lineHeight:1.5}}>«Hva er status på mine initiativer?» eller «Hvilke beslutninger venter på meg?»</div>
          </div>
          <Btn variant="brass" icon={MessageSquare} onClick={onAsk}>Åpne assistent</Btn>
        </div>
      </Card>
    </div>
  );
};

/* ===== UNIVERSAL SØK (⌘K) ===== */
const CommandPalette = ({ open, onClose, data, onNavigate, onAsk, currentUserId }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);

  useEffect(() => { if (open) { setQuery(''); setSelected(0); } }, [open]);

  const memberById = (id) => data.members.find(m => m.id === id);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = [];

    if (!q) return out;

    const matchText = (t) => t && t.toLowerCase().includes(q);

    data.meetings.forEach(m => {
      if (matchText(m.title) || matchText(m.location) || (m.agenda||[]).some(a => matchText(a.title))) {
        out.push({ key: 'mt-'+m.id, type: 'Møte', title: m.title, sub: `${fmtDate(m.date)} · ${m.location||'—'}`, icon: Calendar, view: 'meetings', focusId: m.id, color: theme.brass });
      }
    });
    data.decisions.forEach(d => {
      if (matchText(d.title) || matchText(d.description)) {
        const m = memberById(d.owner);
        out.push({ key: 'd-'+d.id, type: 'Beslutning', title: d.title, sub: `${fmtDate(d.date)}${m?' · '+m.name:''}`, icon: Gavel, view: 'decisions', color: theme.sage });
      }
    });
    data.tasks.forEach(t => {
      if (matchText(t.title) || matchText(t.description)) {
        const m = memberById(t.owner);
        out.push({ key: 't-'+t.id, type: 'Oppgave', title: t.title, sub: `${m?m.name:''}${t.dueDate?' · frist '+fmtDate(t.dueDate):''}`, icon: ListTodo, view: 'tasks', color: theme.brass });
      }
    });
    (data.initiatives||[]).forEach(i => {
      if (matchText(i.title) || matchText(i.description)) {
        const m = memberById(i.owner);
        out.push({ key: 'i-'+i.id, type: 'Initiativ', title: i.title, sub: `${m?m.name:''} · ${i.percentComplete||0}%`, icon: Briefcase, view: 'initiatives', color: theme.amber });
      }
    });
    (data.kpis||[]).forEach(k => {
      if (matchText(k.name) || matchText(k.category)) {
        out.push({ key: 'k-'+k.id, type: 'Nøkkeltall', title: k.name, sub: `${k.category} · mål ${k.target} ${k.unit}`, icon: TrendingUp, view: 'kpis', color: theme.sage });
      }
    });
    (data.risks||[]).forEach(r => {
      if (matchText(r.title) || matchText(r.description) || matchText(r.category)) {
        out.push({ key: 'r-'+r.id, type: 'Risiko', title: r.title, sub: `${r.category} · score ${(r.likelihood||0)*(r.impact||0)}`, icon: ShieldAlert, view: 'risks', color: theme.rust });
      }
    });
    (data.plans||[]).forEach(p => {
      if (matchText(p.title) || matchText(p.notes)) {
        out.push({ key: 'p-'+p.id, type: 'Plan', title: p.title, sub: `${p.category} · ${fmtDate(p.startDate)}`, icon: Compass, view: 'plans', color: theme.navy });
      }
    });
    (data.documents||[]).forEach(doc => {
      if (matchText(doc.title) || matchText(doc.category) || matchText(doc.notes)) {
        out.push({ key: 'doc-'+doc.id, type: 'Dokument', title: doc.title, sub: doc.category||'', icon: FileText, view: 'documents', color: theme.brass });
      }
    });
    data.members.forEach(m => {
      if (matchText(m.name) || matchText(m.role) || matchText(m.email)) {
        out.push({ key: 'm-'+m.id, type: 'Person', title: m.name, sub: m.role, icon: Users, view: 'team', color: theme.navy });
      }
    });
    (data.agendaProposals||[]).forEach(p => {
      if (matchText(p.title) || matchText(p.description) || matchText(p.notes)) {
        const proposer = memberById(p.proposer);
        const meeting = data.meetings.find(m => m.id === p.meetingId);
        out.push({ key: 'sak-'+p.id, type: 'Sak', title: p.title,
          sub: `${proposalCategoryLabels[p.category]||''}${proposer?' · '+proposer.name:''}${meeting?' · '+meeting.title:' · I puljen'}`,
          icon: Inbox, view: 'proposals', color: theme.brassDark });
      }
    });
    (data.messages||[]).forEach(msg => {
      if (matchText(msg.content)) {
        const author = memberById(msg.author);
        if (msg.dmKey) {
          // DM-treff: filter på samtaler brukeren er en del av
          if (currentUserId && !msg.dmKey.split('_').includes(currentUserId)) return;
          const otherId = msg.dmKey.split('_').find(id => id !== msg.author);
          const otherMember = memberById(otherId);
          out.push({ key: 'msg-'+msg.id, type: 'DM',
            title: msg.content.slice(0,80) + (msg.content.length>80?'…':''),
            sub: `${author?.name?.split(' ')[0]||'?'} ↔ ${otherMember?.name?.split(' ')[0]||'?'} · ${fmtRelativeTime(msg.timestamp)}`,
            icon: MessageCircle, view: 'messages',
            focusId: 'dm:' + (msg.author === currentUserId ? otherId : msg.author),
            color: theme.brassDark });
        } else {
          const channel = (data.channels||[]).find(c => c.id === msg.channelId);
          out.push({ key: 'msg-'+msg.id, type: 'Melding',
            title: msg.content.slice(0,80) + (msg.content.length>80?'…':''),
            sub: `${author?.name?.split(' ')[0]||'?'} i ${channel?.name||'?'} · ${fmtRelativeTime(msg.timestamp)}`,
            icon: MessageCircle, view: 'messages', focusId: msg.channelId, color: theme.sage });
        }
      }
    });

    return out.slice(0, 30);
  }, [query, data, currentUserId]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === 'ArrowDown') { setSelected(s => Math.min(s+1, Math.max(0,results.length-1))); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { setSelected(s => Math.max(s-1, 0)); e.preventDefault(); }
      else if (e.key === 'Enter' && results[selected]) {
        const r = results[selected];
        onNavigate(r.view, r.focusId);
        onClose();
        e.preventDefault();
      } else if (e.key === 'Escape') { onClose(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, results, selected, onNavigate, onClose]);

  useEffect(() => { setSelected(0); }, [query]);

  if (!open) return null;

  return (
    <div onClick={onClose}
      style={{position:'fixed',inset:0,background:'rgba(26,36,51,0.5)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'80px 20px 20px'}}>
      <div onClick={(e)=>e.stopPropagation()}
        style={{background:theme.surface,borderRadius:14,width:'100%',maxWidth:640,boxShadow:'0 20px 60px rgba(0,0,0,0.25)',overflow:'hidden',animation:'modalIn 220ms ease'}}>
        <div style={{padding:'14px 18px',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',alignItems:'center',gap:10}}>
          <Search size={18} style={{color:theme.inkMuted,flexShrink:0}}/>
          <input autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Søk i møter, oppgaver, beslutninger, initiativer, KPI-er, risiko..."
            style={{flex:1,padding:'8px 0',border:'none',fontSize:15,fontFamily:'inherit',background:'transparent',color:theme.ink,outline:'none'}}/>
          <span style={{fontSize:11,color:theme.inkMuted,fontFamily:'monospace',background:theme.surfaceAlt,padding:'3px 7px',borderRadius:4,border:`1px solid ${theme.borderSoft}`}}>esc</span>
        </div>
        {query.trim() === '' ? (
          <div style={{padding:'28px 24px',textAlign:'center',color:theme.inkMuted,fontSize:13,lineHeight:1.6}}>
            <div style={{marginBottom:14,fontSize:14,fontWeight:600,color:theme.ink}}>Søk på tvers av hele portalen</div>
            <div>Møter · Beslutninger · Oppgaver · Initiativer · Nøkkeltall · Risiko · Planer · Dokumenter · Personer</div>
            <button onClick={()=>{ onClose(); onAsk?.(); }} style={{
              marginTop:18,background:theme.brass,color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',
              fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:6,
            }}>
              <Sparkles size={14}/> Eller spør AI-assistenten
            </button>
          </div>
        ) : results.length === 0 ? (
          <div style={{padding:'28px 24px',textAlign:'center',color:theme.inkMuted,fontSize:13}}>
            Ingen treff for «{query}»
          </div>
        ) : (
          <div style={{maxHeight:'50vh',overflowY:'auto'}}>
            {results.map((r,i) => {
              const isSel = i === selected;
              return (
                <button key={r.key} onClick={()=>{ onNavigate(r.view, r.focusId); onClose(); }}
                  onMouseEnter={()=>setSelected(i)}
                  style={{
                    display:'flex',alignItems:'center',gap:12,padding:'10px 18px',width:'100%',
                    background:isSel?theme.surfaceAlt:'transparent',border:'none',cursor:'pointer',
                    fontFamily:'inherit',textAlign:'left',borderLeft:`3px solid ${isSel?r.color:'transparent'}`,
                  }}>
                  <div style={{width:32,height:32,borderRadius:7,background:`${r.color}22`,color:r.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <r.icon size={15}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:1}}>
                      <span style={{fontSize:14,fontWeight:600,color:theme.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.title}</span>
                      <span style={{fontSize:10,color:r.color,fontWeight:700,letterSpacing:0.6,textTransform:'uppercase',flexShrink:0}}>{r.type}</span>
                    </div>
                    <div style={{fontSize:12,color:theme.inkMuted,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.sub}</div>
                  </div>
                  {isSel && <ChevronRight size={14} style={{color:theme.brass,flexShrink:0}}/>}
                </button>
              );
            })}
          </div>
        )}
        <div style={{padding:'8px 18px',borderTop:`1px solid ${theme.borderSoft}`,display:'flex',gap:14,fontSize:11,color:theme.inkMuted,background:theme.surfaceAlt}}>
          <span><kbd style={{fontFamily:'monospace',padding:'1px 5px',background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:3}}>↑↓</kbd> Naviger</span>
          <span><kbd style={{fontFamily:'monospace',padding:'1px 5px',background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:3}}>↵</kbd> Åpne</span>
          <span style={{marginLeft:'auto'}}>{results.length>0 && `${results.length} treff`}</span>
        </div>
      </div>
    </div>
  );
};

/* ===== AI-ASSISTENT (chat med portal-data) ===== */
const buildPortalContext = (data, currentUserId) => {
  const memberById = (id) => data.members.find(m => m.id === id);
  const me = memberById(currentUserId);
  let ctx = '';

  ctx += `${data.org?.assistantContextHeader || 'LEDERGRUPPEN'} (${data.members.length} personer):\n`;
  data.members.forEach(m => { ctx += `- ${m.id}: ${m.name} – ${m.role}\n`; });
  ctx += `\n`;

  ctx += `MØTER (${data.meetings.length}):\n`;
  data.meetings.forEach(m => {
    const att = m.attendees.map(id=>memberById(id)?.name).filter(Boolean).join(', ');
    ctx += `- "${m.title}" | ${m.date} ${m.time} | ${m.status} | ${m.location||'—'} | Deltakere: ${att}\n`;
    (m.agenda||[]).forEach((a,i)=>{ ctx += `    Agenda ${i+1}: ${a.title} (${a.duration}min, ${memberById(a.presenter)?.name||'-'})${a.notes?' – Notater: '+a.notes:''}\n`; });
    if (m.summary) ctx += `    Referat: ${m.summary}\n`;
    if (m.prep && m.prep.length) {
      m.prep.forEach(p => { if ((p.content||'').trim()) ctx += `    Forberedelse fra ${memberById(p.memberId)?.name||'?'}: ${p.content}\n`; });
    }
  });
  ctx += `\n`;

  ctx += `BESLUTNINGER (${data.decisions.length}):\n`;
  data.decisions.forEach(d => {
    ctx += `- "${d.title}" | ${d.date} | ${d.status} | Eier: ${memberById(d.owner)?.name||'-'}${d.reviewDate?' | Review: '+d.reviewDate+' ('+(d.reviewStatus||'venter')+')':''}\n`;
    if (d.description) ctx += `    Begrunnelse: ${d.description}\n`;
    if (d.communicationPlan) ctx += `    Kommunikasjon: ${d.communicationPlan}\n`;
  });
  ctx += `\n`;

  ctx += `OPPGAVER (${data.tasks.length}):\n`;
  data.tasks.forEach(t => {
    ctx += `- "${t.title}" | Eier: ${memberById(t.owner)?.name||'-'} | Frist: ${t.dueDate||'ingen'} | Status: ${t.status} | Prioritet: ${t.priority||'medium'}\n`;
    if (t.description) ctx += `    ${t.description}\n`;
  });
  ctx += `\n`;

  ctx += `INITIATIVER (${(data.initiatives||[]).length}):\n`;
  (data.initiatives||[]).forEach(i => {
    ctx += `- "${i.title}" | Eier: ${memberById(i.owner)?.name||'-'} | Status: ${i.status} | Fase: ${i.phase} | Helse: ${i.healthStatus} | Fremdrift: ${i.percentComplete||0}% | Mål: ${i.targetDate||'-'} | Budsjett: ${i.spent||0}/${i.budget||0} NOK\n`;
    if (i.description) ctx += `    ${i.description}\n`;
    if (i.notes) ctx += `    Notat: ${i.notes}\n`;
    (i.milestones||[]).forEach(ms => { ctx += `    Milepæl: ${ms.title} (frist ${ms.dueDate||'-'}, ${ms.completed?'✓':'pågår'})\n`; });
  });
  ctx += `\n`;

  ctx += `NØKKELTALL (${(data.kpis||[]).length}):\n`;
  (data.kpis||[]).forEach(k => {
    const latest = k.history?.[0];
    ctx += `- "${k.name}" | ${k.category} | Eier: ${memberById(k.owner)?.name||'-'} | Mål: ${k.target} ${k.unit} (${k.direction==='up'?'høyere er bedre':'lavere er bedre'})\n`;
    if (latest) ctx += `    Siste måling (${latest.period}): ${latest.value} ${k.unit} – status ${latest.status}${latest.comment?' – '+latest.comment:''}\n`;
    const recent = (k.history||[]).slice(0,4).map(h=>`${h.period}: ${h.value}`).join(', ');
    if (recent) ctx += `    Historikk: ${recent}\n`;
  });
  ctx += `\n`;

  ctx += `RISIKOER (${(data.risks||[]).length}):\n`;
  (data.risks||[]).forEach(r => {
    ctx += `- "${r.title}" | ${r.category} | Eier: ${memberById(r.owner)?.name||'-'} | S:${r.likelihood} K:${r.impact} score:${(r.likelihood||0)*(r.impact||0)} | Status: ${r.status}\n`;
    if (r.description) ctx += `    ${r.description}\n`;
    if (r.mitigation) ctx += `    Tiltak: ${r.mitigation}\n`;
  });
  ctx += `\n`;

  ctx += `ÅRSHJUL/PLANER (${(data.plans||[]).length}):\n`;
  (data.plans||[]).forEach(p => {
    ctx += `- "${p.title}" | ${p.category} | Eier: ${memberById(p.owner)?.name||'-'} | ${p.startDate}${p.endDate?' til '+p.endDate:''}${p.recurring&&p.recurring!=='none'?' | Gjentas: '+p.recurring:''}\n`;
    if (p.notes) ctx += `    ${p.notes}\n`;
  });
  ctx += `\n`;

  ctx += `INNMELDTE SAKER til ${data.org?.meetingNounDef || 'ledergruppemøtene'} (${(data.agendaProposals||[]).length}):\n`;
  (data.agendaProposals||[]).forEach(p => {
    const meeting = data.meetings.find(m=>m.id===p.meetingId);
    ctx += `- "${p.title}" | ${proposalCategoryLabels[p.category]||p.category} | Innmeldt av: ${memberById(p.proposer)?.name||'-'} | Status: ${statusLabels[p.status]||p.status} | Prioritet: ${p.priority} | Ønsket varighet: ${p.desiredDuration}min | ${meeting?'Møte: '+meeting.title+' ('+meeting.date+')':'I puljen (ikke tildelt møte)'} | Innmeldt: ${p.proposedDate}\n`;
    if (p.description) ctx += `    ${p.description}\n`;
    if (p.notes) ctx += `    Merknader: ${p.notes}\n`;
  });
  ctx += `\n`;

  // De 30 siste meldingene fra kanaler – nok kontekst uten å sprenge prompten
  const recentChannelMessages = (data.messages||[])
    .filter(m => !m.dmKey)
    .slice().sort((a,b)=>(b.timestamp||'').localeCompare(a.timestamp||'')).slice(0,30);
  if (recentChannelMessages.length > 0) {
    ctx += `SISTE MELDINGER i gruppekommunikasjonen (${recentChannelMessages.length} av ${(data.messages||[]).filter(m=>!m.dmKey).length}):\n`;
    recentChannelMessages.slice().reverse().forEach(msg => {
      const author = memberById(msg.author);
      const channel = (data.channels||[]).find(c=>c.id===msg.channelId);
      const replyTarget = msg.replyTo ? (data.messages||[]).find(m=>m.id===msg.replyTo) : null;
      const replyInfo = replyTarget ? ` [svar til ${memberById(replyTarget.author)?.name?.split(' ')[0]||'?'}: "${replyTarget.content.slice(0,40)}..."]` : '';
      const reactions = (msg.reactions||[]).length > 0
        ? ` (reaksjoner: ${(msg.reactions||[]).map(r=>r.emoji).join('')})` : '';
      ctx += `- [#${channel?.name||'?'}] ${author?.name||'?'} ${fmtRelativeTime(msg.timestamp)}${replyInfo}: ${msg.content}${reactions}\n`;
    });
    ctx += `\n`;
  }

  // Direktemeldinger - vis kun de som involverer pålogget bruker (de andres er private)
  if (currentUserId) {
    const myDms = (data.messages||[])
      .filter(m => m.dmKey && m.dmKey.split('_').includes(currentUserId))
      .slice().sort((a,b)=>(b.timestamp||'').localeCompare(a.timestamp||'')).slice(0,20);
    if (myDms.length > 0) {
      ctx += `DINE DIREKTEMELDINGER (${myDms.length} siste – kun de du er part i):\n`;
      myDms.slice().reverse().forEach(msg => {
        const author = memberById(msg.author);
        const otherId = msg.dmKey.split('_').find(id => id !== msg.author);
        const other = memberById(otherId);
        const direction = msg.author === currentUserId
          ? `Du → ${other?.name?.split(' ')[0]||'?'}`
          : `${author?.name?.split(' ')[0]||'?'} → Deg`;
        ctx += `- [DM] ${direction} ${fmtRelativeTime(msg.timestamp)}: ${msg.content}\n`;
      });
      ctx += `\n`;
    }
  }

  // Tverrgående programmer som binder avdelingene sammen
  const myProgramItems = (data.initiatives||[]).filter(i => i.program);
  if (typeof programs !== 'undefined' && programs.length) {
    ctx += `TVERRGÅENDE PROGRAMMER (felles satsninger på tvers av avdelingene):\n`;
    programs.forEach(p => {
      const mine = myProgramItems.filter(i => i.program === p.id).map(i => i.title);
      ctx += `- "${p.name}": ${p.desc}${mine.length?` | Denne avdelingens bidrag: ${mine.join(', ')}`:' | Ingen direkte bidrag fra denne avdelingen.'}\n`;
    });
    ctx += `Merk: Hver avdeling har egen portal, men disse programmene deles. Når brukeren spør om et program (f.eks. Nordic Stone), nevn at flere avdelinger bidrar, og bruk «På tvers»-visningen som referanse.\n\n`;
  }

  return ctx;
};

const askAssistant = async (messages, data, currentUserId) => {
  const me = data.members.find(m=>m.id===currentUserId);
  const ctx = buildPortalContext(data, currentUserId);
  const today = new Date().toISOString().slice(0,10);

  const systemPrompt = `Du er AI-assistent for ${data.org?.assistantScope || 'Vikingbads ledergruppeportal'}. Du har full innsikt i alle data i portalen og hjelper med spørsmål om status, prioriteringer og oppfølging.

PÅLOGGET BRUKER: ${me ? `${me.name} (${me.role})` : 'Ukjent'}
DAGENS DATO: ${today}

PORTALDATA:
${ctx}

REGLER:
- Svar alltid på norsk
- Vær konkret: bruk navn, datoer, tall fra dataene
- Når brukeren spør om "mine" eller "meg", filtrer på pålogget bruker
- Bruk markdown med ** for fete tekst og bullet-lister når det egner seg
- Vær konsis – brukeren har lite tid, gå rett på sak
- Hvis spørsmålet ikke kan besvares fra dataene, si det tydelig
- Hvis brukeren spør om strategi eller råd, gi praktiske, handlingsorienterte forslag basert på dataene
- Du kan foreslå konkrete neste steg, men vær åpen om at brukeren bestemmer
- Når brukeren spør om innmeldte saker, viser du både hvilke som er på agenda til kommende møter og hvilke som ligger i puljen
- Når brukeren spør om gruppekommunikasjonen (samtaler, meldinger), bruk de siste 30 meldingene som kontekst, men ikke siter ord-for-ord – oppsummer heller hva som diskuteres
- Direktemeldinger (DM) er private 1-til-1-samtaler. Du ser bare DM-er pålogget bruker selv er part i. Andres private DM-er har du ikke tilgang til og kan ikke kommentere`;

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content }))
    })
  });
  if (!response.ok) throw new Error(`API svarte ${response.status}`);
  const d = await response.json();
  return (d.content || []).filter(b => b.type === "text").map(b => b.text).join('\n');
};

const renderMarkdown = (text) => {
  // Lett markdown: ** bold, paragrafer, lister med - eller *
  let html = text;
  // Process line by line
  const lines = html.split('\n');
  const out = [];
  let inList = false;
  lines.forEach(line => {
    const m = line.match(/^[\s]*[-*]\s+(.+)$/);
    if (m) {
      if (!inList) { out.push('<ul style="margin:8px 0 12px;padding-left:22px">'); inList = true; }
      out.push(`<li style="margin-bottom:4px;line-height:1.55">${m[1].replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}</li>`);
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      if (line.trim()) {
        out.push(`<p style="margin:0 0 10px;line-height:1.6">${line.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}</p>`);
      }
    }
  });
  if (inList) out.push('</ul>');
  return out.join('');
};

const AssistantPanel = ({ open, onClose, data, currentUserId, onNavigate }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const me = data.members.find(m => m.id === currentUserId);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const reply = await askAssistant(newMessages, data, currentUserId);
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: `Beklager, kunne ikke kontakte Claude API:\n\n**Feil:** ${e.message}\n\nI produksjonsoppsett vil dette være ruteet via et server-side API.` }]);
    }
    setLoading(false);
  };

  const initNoun = data.org?.initiativeNoun || 'initiativ';
  const meetingNoun = data.org?.meetingNoun || 'ledermøte';
  const suggestions = me ? [
    `Hva er status på mine åpne oppgaver?`,
    `Hvilke saker er meldt inn til neste ${meetingNoun}?`,
    `Oppsummer hva som diskuteres i samtalene nå`,
    `Hva har jeg snakket med ${data.members.find(m=>m.id!==me.id)?.name?.split(' ')[0]||'noen'} om i det siste?`,
    `Hvilke beslutninger venter på meg?`,
    `Vis meg ${initNoun}er i risikosone`,
  ] : [
    `Hva er status på alle ${initNoun}er?`,
    `Hvilke saker er meldt inn til ${data.org?.meetingNounDef || 'ledermøtene'}?`,
    'Hvilke risikoer er kritiske?',
    'Oppsummer kommende møter',
    'Hva er nylige beslutninger?',
  ];

  if (!open) return null;

  return (
    <div onClick={onClose}
      style={{position:'fixed',inset:0,background:'rgba(26,36,51,0.4)',backdropFilter:'blur(3px)',zIndex:200,display:'flex',justifyContent:'flex-end'}}>
      <div onClick={(e)=>e.stopPropagation()}
        style={{
          background:theme.surface,width:'100%',maxWidth:520,height:'100%',display:'flex',flexDirection:'column',
          boxShadow:'-12px 0 40px rgba(0,0,0,0.18)',animation:'slideInRight 240ms ease',
        }}>
        <div style={{padding:'18px 22px',borderBottom:`1px solid ${theme.borderSoft}`,background:theme.surfaceAlt,display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,borderRadius:9,background:theme.brass,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0}}>
            <Sparkles size={18}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <h2 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:19,fontWeight:500,color:theme.ink,margin:0,letterSpacing:-0.2}}>AI-assistent</h2>
            <div style={{fontSize:12,color:theme.inkMuted}}>Spør om hva som helst i portalen</div>
          </div>
          {messages.length > 0 && (
            <button onClick={()=>setMessages([])} style={{background:'transparent',border:`1px solid ${theme.border}`,color:theme.inkSoft,padding:'5px 10px',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
              Ny samtale
            </button>
          )}
          <button onClick={onClose} style={{background:'transparent',border:'none',cursor:'pointer',padding:6,color:theme.inkSoft,display:'flex'}}><X size={20}/></button>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'20px 22px'}}>
          {messages.length === 0 ? (
            <div>
              <div style={{padding:18,background:theme.brassLight,border:`1px solid ${theme.brass}33`,borderRadius:10,marginBottom:18}}>
                <div style={{fontSize:13,color:theme.ink,lineHeight:1.6}}>
                  Jeg har full innsikt i portalen din – møter, beslutninger, oppgaver, initiativer, KPI-er, risikoer og planer. {me ? `Jeg vet at du er pålogget som ${me.name.split(' ')[0]}, så «mine» refererer til deg.` : 'Logg inn som et medlem for personlige svar.'}
                </div>
              </div>
              <div style={{fontSize:11,fontWeight:700,color:theme.inkSoft,letterSpacing:0.6,textTransform:'uppercase',marginBottom:10}}>Forslag</div>
              <div style={{display:'grid',gap:8}}>
                {suggestions.map((s,i) => (
                  <button key={i} onClick={()=>send(s)}
                    style={{textAlign:'left',padding:'12px 14px',background:theme.surface,border:`1px solid ${theme.border}`,borderRadius:8,cursor:'pointer',fontFamily:'inherit',fontSize:13,color:theme.ink,lineHeight:1.5,transition:'all 120ms'}}
                    onMouseEnter={(e)=>{ e.currentTarget.style.borderColor=theme.brass; e.currentTarget.style.background=theme.brassLight; }}
                    onMouseLeave={(e)=>{ e.currentTarget.style.borderColor=theme.border; e.currentTarget.style.background=theme.surface; }}>
                    <Sparkles size={12} style={{color:theme.brass,marginRight:6}}/>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {messages.map((m,i) => (
                <div key={i} style={{display:'flex',gap:10,flexDirection:m.role==='user'?'row-reverse':'row',alignItems:'flex-start'}}>
                  <div style={{
                    width:30,height:30,borderRadius:'50%',flexShrink:0,
                    background: m.role==='user' ? (me ? '#1E3247' : theme.inkMuted) : theme.brass,
                    color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:11,fontWeight:600,
                  }}>
                    {m.role === 'user' ? (me?.initials || 'U') : <Sparkles size={14}/>}
                  </div>
                  <div style={{
                    maxWidth:'80%',padding:'10px 14px',borderRadius:10,fontSize:13.5,lineHeight:1.55,
                    background: m.role==='user' ? theme.navy : theme.surfaceAlt,
                    color: m.role==='user' ? '#fff' : theme.ink,
                  }}>
                    {m.role === 'user' 
                      ? <div>{m.content}</div>
                      : <div dangerouslySetInnerHTML={{__html: renderMarkdown(m.content)}}/>}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  <div style={{width:30,height:30,borderRadius:'50%',background:theme.brass,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',animation:'pulse 1.6s ease-in-out infinite'}}>
                    <Sparkles size={14}/>
                  </div>
                  <div style={{padding:'10px 14px',background:theme.surfaceAlt,borderRadius:10,fontSize:13,color:theme.inkMuted}}>
                    Tenker...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{padding:'14px 18px',borderTop:`1px solid ${theme.borderSoft}`,background:theme.surface}}>
          <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
            <textarea value={input} onChange={(e)=>setInput(e.target.value)}
              onKeyDown={(e)=>{ if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Still et spørsmål... (Shift+Enter for ny linje)" rows={1}
              style={{flex:1,padding:'10px 12px',border:`1px solid ${theme.border}`,borderRadius:8,fontSize:13.5,fontFamily:'inherit',background:theme.surface,color:theme.ink,resize:'none',outline:'none',minHeight:40,maxHeight:120,boxSizing:'border-box',lineHeight:1.4}}
              onFocus={(e)=>e.target.style.borderColor=theme.brass}
              onBlur={(e)=>e.target.style.borderColor=theme.border}/>
            <Btn variant="brass" icon={Send} onClick={()=>send()} disabled={!input.trim() || loading}>Send</Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== PÅ TVERS – TVERRGÅENDE ORGANISASJONSVISNING ===== */
const CrossOrgView = ({ allData, currentUserId, activePortal, onCrossNavigate }) => {
  const access = portalAccess[currentUserId] || [];
  const portalIds = Object.keys(allData);
  const memberFromAny = (id) => { for (const pid of portalIds) { const m=(allData[pid].members||[]).find(x=>x.id===id); if(m) return m; } return null; };
  const typeOrder = { rød:0, gul:1, grønn:2 };

  const bridges = Object.entries(portalAccess)
    .filter(([id,arr]) => arr.length > 1)
    .map(([id,arr]) => ({ member: memberFromAny(id), portals: arr }))
    .filter(b => b.member);

  const programData = programs.map(prog => {
    const contributions = [];
    portalIds.forEach(pid => {
      const d = allData[pid] || {};
      (d.initiatives||[]).forEach(i => { if (i.program===prog.id) contributions.push({ portalId:pid, type:'initiativ', item:i }); });
      (d.risks||[]).forEach(r => { if (r.program===prog.id) contributions.push({ portalId:pid, type:'risiko', item:r }); });
    });
    const inits = contributions.filter(c=>c.type==='initiativ');
    const depts = [...new Set(contributions.map(c=>c.portalId))];
    const budget = inits.reduce((s,c)=>s+(c.item.budget||0),0);
    const spent  = inits.reduce((s,c)=>s+(c.item.spent||0),0);
    const avg    = inits.length ? Math.round(inits.reduce((s,c)=>s+(c.item.percentComplete||0),0)/inits.length) : 0;
    const worst  = inits.map(c=>c.item.healthStatus).filter(Boolean).sort((a,b)=>(typeOrder[a]??3)-(typeOrder[b]??3))[0] || null;
    return { prog, contributions, inits, depts, budget, spent, avg, worst };
  });

  const ownerOf = (pid, id) => (allData[pid].members||[]).find(m=>m.id===id);

  return (
    <div>
      <SectionHeading overline="Slik henger arbeidet sammen" title="På tvers av organisasjonen"/>

      <Card style={{marginBottom:24,background:`linear-gradient(135deg, ${theme.navy} 0%, ${theme.navyDark} 100%)`,color:'#fff',border:'none'}}>
        <div style={{fontSize:13.5,lineHeight:1.65,color:'rgba(255,255,255,0.9)'}}>
          Avdelingene har egne portaler, men jobber mot de samme målene. Her ser du de <strong style={{color:theme.amber}}>tverrgående programmene</strong> som flere
          avdelinger bidrar til, og <strong style={{color:theme.amber}}>broene</strong> – personene som sitter i to avdelinger og binder dem sammen.
          Du kan åpne en avdelings bidrag direkte hvis du har tilgang.
        </div>
      </Card>

      {/* Koordineringsstatus på tvers */}
      {(() => {
        const open = programHandoffs.filter(h => h.status !== 'levert');
        const late = programHandoffs.filter(h => handoffMeta(h).overdue);
        const delivered = programHandoffs.filter(h => h.status === 'levert');
        return (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(190px, 1fr))',gap:14,marginBottom:30}}>
            <KPI label="Tverrgående programmer" value={programs.length} accent={theme.brass} icon={Command}/>
            <KPI label="Overleveringer å koordinere" value={open.length} accent={theme.navy} icon={Repeat}
              sub={`${delivered.length} levert så langt`} subColor={theme.sage}/>
            <KPI label="Forsinket / blokkerer" value={late.length} accent={late.length>0?theme.rust:theme.sage} icon={AlertCircle}
              sub={late.length>0?'Krever oppfølging':'Ingenting forsinket'} subColor={late.length>0?theme.rust:theme.sage}/>
            <KPI label="Broer mellom avdelinger" value={bridges.length} accent={theme.sage} icon={UserCheck}/>
          </div>
        );
      })()}

      {/* Broene mellom avdelingene */}
      <div style={{marginBottom:14,fontSize:11,fontWeight:700,color:theme.inkSoft,letterSpacing:0.8,textTransform:'uppercase'}}>Broene mellom avdelingene</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(230px, 1fr))',gap:12,marginBottom:34}}>
        {bridges.map(b => (
          <Card key={b.member.id} padded={false} style={{padding:'14px 16px'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <Avatar member={b.member} size={40}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13.5,fontWeight:600,color:theme.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{b.member.name}</div>
                <div style={{display:'flex',alignItems:'center',gap:6,marginTop:5,flexWrap:'wrap'}}>
                  {b.portals.map((pid,idx) => (
                    <React.Fragment key={pid}>
                      {idx>0 && <span style={{color:theme.inkMuted,fontSize:12}}>↔</span>}
                      <span style={{fontSize:10.5,fontWeight:700,letterSpacing:0.2,color:theme.brassDark,background:theme.brassLight,padding:'2px 7px',borderRadius:999}}>
                        {portalMeta[pid]?.name?.replace('avdelingen','').replace('gruppen','gruppe') || pid}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tverrgående programmer */}
      <div style={{marginBottom:14,fontSize:11,fontWeight:700,color:theme.inkSoft,letterSpacing:0.8,textTransform:'uppercase'}}>Tverrgående programmer</div>
      {programData.length === 0 && (
        <Card style={{textAlign:'center',padding:'40px 24px'}}>
          <div style={{width:48,height:48,borderRadius:12,background:theme.surfaceAlt,display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:14,color:theme.inkMuted}}>
            <Command size={22}/>
          </div>
          <div style={{fontFamily:'Fraunces, Georgia, serif',fontSize:18,color:theme.ink,marginBottom:6}}>Ingen tverrgående programmer ennå</div>
          <div style={{fontSize:13,color:theme.inkSoft,lineHeight:1.6,maxWidth:440,margin:'0 auto'}}>
            Tverrgående programmer kobler initiativer, risiko og overleveringer på tvers av avdelingene. Når avdelingene begynner å registrere felles satsninger, vises koordineringen her.
          </div>
        </Card>
      )}
      <div style={{display:'grid',gap:20}}>
        {programData.map(({prog, contributions, depts, budget, spent, avg, worst}) => {
          const PIcon = prog.icon;
          const hc = worst ? healthColor(worst) : theme.inkMuted;
          return (
            <Card key={prog.id} padded={false}>
              <div style={{padding:'20px 22px',borderBottom:`1px solid ${theme.borderSoft}`,display:'flex',gap:16,alignItems:'flex-start'}}>
                <div style={{width:46,height:46,borderRadius:11,background:prog.accent,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <PIcon size={22}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                    <h3 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:21,fontWeight:500,color:theme.ink,margin:0}}>{prog.name}</h3>
                    {worst && <Pill bg={hc+'22'} color={hc}>{healthLabel(worst)}</Pill>}
                  </div>
                  <div style={{fontSize:13,color:theme.inkSoft,marginTop:4,lineHeight:1.55}}>{prog.desc}</div>
                  <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
                    {depts.map(pid => (
                      <span key={pid} style={{fontSize:10.5,fontWeight:700,letterSpacing:0.2,color:theme.inkSoft,background:theme.surfaceAlt,border:`1px solid ${theme.border}`,padding:'3px 9px',borderRadius:999}}>
                        {portalMeta[pid]?.name || pid}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{display:'flex',gap:22,flexShrink:0,textAlign:'right'}}>
                  <div>
                    <div style={{fontFamily:'Fraunces, Georgia, serif',fontSize:24,color:theme.ink,lineHeight:1}}>{depts.length}</div>
                    <div style={{fontSize:10.5,color:theme.inkMuted,marginTop:3,textTransform:'uppercase',letterSpacing:0.4}}>avdelinger</div>
                  </div>
                  <div>
                    <div style={{fontFamily:'Fraunces, Georgia, serif',fontSize:24,color:theme.ink,lineHeight:1}}>{avg}%</div>
                    <div style={{fontSize:10.5,color:theme.inkMuted,marginTop:3,textTransform:'uppercase',letterSpacing:0.4}}>fremdrift</div>
                  </div>
                  {budget>0 && (
                    <div>
                      <div style={{fontFamily:'Fraunces, Georgia, serif',fontSize:24,color:theme.ink,lineHeight:1}}>{fmtNok(spent)}</div>
                      <div style={{fontSize:10.5,color:theme.inkMuted,marginTop:3,textTransform:'uppercase',letterSpacing:0.4}}>av {fmtNok(budget)}</div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                {depts.map(pid => {
                  const items = contributions.filter(c=>c.portalId===pid);
                  const canOpen = access.includes(pid);
                  return (
                    <div key={pid} style={{padding:'14px 22px',borderBottom:`1px solid ${theme.borderSoft}`}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                        <span style={{fontSize:12,fontWeight:700,color:theme.ink}}>{portalMeta[pid]?.name || pid}</span>
                        {canOpen ? (
                          <button onClick={()=>onCrossNavigate(pid)}
                            style={{background:'transparent',border:'none',color:theme.brass,fontSize:11,fontWeight:600,letterSpacing:0.3,textTransform:'uppercase',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:3,fontFamily:'inherit'}}>
                            Åpne <ArrowRight size={12}/>
                          </button>
                        ) : (
                          <span style={{fontSize:10.5,color:theme.inkMuted,display:'inline-flex',alignItems:'center',gap:4}}><ShieldAlert size={11}/> ingen tilgang</span>
                        )}
                      </div>
                      <div style={{display:'grid',gap:8}}>
                        {items.map((c,ci) => {
                          const owner = ownerOf(pid, c.item.owner);
                          const isRisk = c.type==='risiko';
                          const sc = isRisk ? {bg:theme.rustLight,fg:theme.rust} : initiativeStatusColor(c.item.status);
                          const ihc = c.item.healthStatus ? healthColor(c.item.healthStatus) : null;
                          return (
                            <div key={ci} onClick={canOpen?()=>onCrossNavigate(pid):undefined}
                              style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:9,background:theme.surfaceAlt,border:`1px solid ${theme.borderSoft}`,cursor:canOpen?'pointer':'default'}}
                              onMouseEnter={(e)=>{ if(canOpen) e.currentTarget.style.borderColor=theme.brass; }}
                              onMouseLeave={(e)=>{ e.currentTarget.style.borderColor=theme.borderSoft; }}>
                              {ihc && <div style={{width:8,height:8,borderRadius:'50%',background:ihc,flexShrink:0}}/>}
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontSize:13,fontWeight:600,color:theme.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.item.title}</div>
                                <div style={{fontSize:11.5,color:theme.inkMuted,marginTop:2}}>
                                  {isRisk ? 'Risiko' : 'Initiativ'}{owner?` · ${owner.name}`:''}{!isRisk && c.item.percentComplete!=null?` · ${c.item.percentComplete}%`:''}
                                </div>
                              </div>
                              <Pill bg={sc.bg} color={sc.fg} style={{flexShrink:0}}>
                                {isRisk ? 'Risiko' : (initiativeStatusLabels[c.item.status]||c.item.status)}
                              </Pill>
                              {owner && <Avatar member={owner} size={26}/>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {(() => {
                const phs = programHandoffs.filter(h => h.program === prog.id).sort((a,b)=>a.dueOffset-b.dueOffset);
                if (!phs.length) return null;
                return (
                  <div style={{padding:'16px 22px',background:theme.surfaceAlt,borderTop:`1px solid ${theme.border}`}}>
                    <div style={{fontSize:11,fontWeight:700,color:theme.inkSoft,letterSpacing:0.6,textTransform:'uppercase',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
                      <Repeat size={13} style={{color:theme.brass}}/> Overleveringer & avhengigheter mellom avdelinger
                    </div>
                    <div style={{display:'grid',gap:8}}>
                      {phs.map(h => {
                        const meta = handoffMeta(h);
                        const o = ownerOf(h.from, h.owner); const r = ownerOf(h.to, h.recipient);
                        return (
                          <div key={h.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:9,background:theme.surface,border:`1px solid ${meta.overdue?theme.rust+'55':theme.borderSoft}`}}>
                            <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                              <span style={{fontSize:10.5,fontWeight:700,color:theme.inkSoft,background:theme.surfaceAlt,border:`1px solid ${theme.border}`,padding:'2px 7px',borderRadius:999}}>{portalShort(h.from)}</span>
                              <ArrowRight size={13} style={{color:theme.brass}}/>
                              <span style={{fontSize:10.5,fontWeight:700,color:theme.inkSoft,background:theme.surfaceAlt,border:`1px solid ${theme.border}`,padding:'2px 7px',borderRadius:999}}>{portalShort(h.to)}</span>
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13,fontWeight:600,color:theme.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{h.title}</div>
                              <div style={{fontSize:11.5,color:theme.inkMuted,marginTop:2}}>
                                {o?o.name.split(' ')[0]:'?'} → {r?r.name.split(' ')[0]:'?'} · {h.status==='levert'?'Levert':relativeDate(isoFromOffset(h.dueOffset))}
                              </div>
                            </div>
                            <Pill bg={meta.bg} color={meta.fg} style={{flexShrink:0,display:'inline-flex',alignItems:'center',gap:4}}>{meta.overdue && <AlertCircle size={11}/>}{meta.label}</Pill>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

/* ===== INNLOGGING / PORTALVELGER ===== */
const LoginScreen = ({ leadershipMembers, marketingMembers, salesMembers, innkjopMembers, produktMembers, onLogin }) => {
  const panels = [
    { id:'leadership', members:leadershipMembers, Icon:ShieldAlert,   accent:theme.navy },
    { id:'marketing',  members:marketingMembers,  Icon:Megaphone,     accent:theme.brass },
    { id:'sales',      members:salesMembers,      Icon:TrendingUp,    accent:theme.sage },
    { id:'innkjop',    members:innkjopMembers,    Icon:ClipboardList, accent:'#B0533F' },
    { id:'produkt',    members:produktMembers,    Icon:Compass,       accent:'#7B4D8C' },
  ];
  return (
    <div style={{minHeight:'100vh',background:`linear-gradient(150deg, ${theme.navyDark} 0%, ${theme.navy} 58%, #25425C 100%)`,display:'flex',alignItems:'center',justifyContent:'center',padding:'48px 20px',fontFamily:'Manrope, system-ui, sans-serif'}}>
      <div style={{width:'100%',maxWidth:1160}}>
        <div style={{textAlign:'center',marginBottom:38}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:20}}>
            <VikingbadLogo width={224} color="#fff"/>
          </div>
          <h1 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:34,fontWeight:400,color:'#fff',margin:'0 0 8px',letterSpacing:-0.5}}>Velg portal</h1>
          <p style={{fontSize:14.5,color:'rgba(255,255,255,0.62)',margin:0,lineHeight:1.5}}>Logg inn med din identitet. Du får kun tilgang til portalene rollen din omfatter.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',gap:22}}>
          {panels.map(panel => {
            const pm = portalMeta[panel.id];
            return (
              <div key={panel.id} style={{background:theme.surface,borderRadius:16,overflow:'hidden',boxShadow:'0 18px 50px rgba(0,0,0,0.30)'}}>
                <div style={{padding:'20px 22px',background:panel.accent,color:'#fff',display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:44,height:44,borderRadius:11,background:'rgba(255,255,255,0.16)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <panel.Icon size={22}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <h2 style={{fontFamily:'Fraunces, Georgia, serif',fontSize:21,fontWeight:500,margin:0}}>{pm.name}</h2>
                      {pm.restricted && <span style={{fontSize:9.5,fontWeight:700,letterSpacing:0.6,textTransform:'uppercase',background:'rgba(0,0,0,0.22)',padding:'3px 8px',borderRadius:999}}>Begrenset</span>}
                    </div>
                    <div style={{fontSize:12.5,color:'rgba(255,255,255,0.8)',marginTop:2}}>{pm.desc}</div>
                  </div>
                </div>
                <div style={{padding:'10px 12px 14px'}}>
                  {panel.members.map(m => {
                    const both = (portalAccess[m.id]||[]).length > 1;
                    return (
                      <button key={m.id} onClick={()=>onLogin(m.id, panel.id)}
                        style={{display:'flex',alignItems:'center',gap:13,padding:'11px 12px',width:'100%',borderRadius:10,background:'transparent',border:'1px solid transparent',cursor:'pointer',fontFamily:'inherit',textAlign:'left',transition:'all 120ms'}}
                        onMouseEnter={(e)=>{ e.currentTarget.style.background=theme.surfaceAlt; e.currentTarget.style.borderColor=theme.border; }}
                        onMouseLeave={(e)=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; }}>
                        <Avatar member={m} size={40}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:14,fontWeight:600,color:theme.ink,display:'flex',alignItems:'center',gap:7}}>
                            {m.name}
                            {both && <span style={{fontSize:9,fontWeight:700,letterSpacing:0.4,textTransform:'uppercase',color:theme.brassDark,background:theme.brassLight,padding:'2px 6px',borderRadius:999}}>Begge</span>}
                          </div>
                          <div style={{fontSize:12,color:theme.inkMuted}}>{m.role}</div>
                        </div>
                        <ChevronRight size={16} style={{color:theme.inkMuted}}/>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{textAlign:'center',marginTop:26,fontSize:12,color:'rgba(255,255,255,0.5)',lineHeight:1.7}}>
          Demo-innlogging. I produksjon kobles dette til Vikingbads pålogging (SSO), og tilgang styres per rolle.<br/>
          <strong style={{color:'rgba(255,255,255,0.7)'}}>Kun ledergruppen har tilgang til lederportalen.</strong>
        </div>
      </div>
    </div>
  );
};

/* ===== APP ===== */
const App = () => {
  const [leadershipData, setLeadershipData] = useState(seedData);
  const [marketingData, setMarketingData]   = useState(seedMarketing);
  const [salesData, setSalesData]           = useState(seedSales);
  const [innkjopData, setInnkjopData]       = useState(seedInnkjop);
  const [produktData, setProduktData]       = useState(seedProdukt);
  const [crossorgData, setCrossorgData]     = useState({ projects: [] });
  const [currentUserId, setCurrentUserId]   = useState(null);
  const [activePortal, setActivePortal]     = useState(null);
  const [view, setView] = useState('desk');
  const [focusMeetingId, setFocusMeetingId] = useState(null);
  const [focusChannelId, setFocusChannelId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Last inn data fra Supabase når backend er konfigurert (ellers brukes lokale seed-data)
  useEffect(() => {
    if (!SUPABASE_ENABLED) return;
    loadAllPortals({ leadership: seedData(), marketing: seedMarketing(), sales: seedSales(), innkjop: seedInnkjop(), produkt: seedProdukt(), crossorg: { projects: [] } })
      .then(all => { setLeadershipData(all.leadership); setMarketingData(all.marketing); setSalesData(all.sales); setInnkjopData(all.innkjop); setProduktData(all.produkt); if(all.crossorg) setCrossorgData(all.crossorg); })
      .catch(err => console.error('Supabase: lasting feilet', err));
    checkIsAdmin().then(setIsAdminUser);
  }, []);

  const loggedIn = !!currentUserId && !!activePortal;
  const stores = {
    leadership: [leadershipData, setLeadershipData],
    marketing:  [marketingData,  setMarketingData],
    sales:      [salesData,      setSalesData],
    innkjop:    [innkjopData,    setInnkjopData],
    produkt:    [produktData,    setProduktData],
  };
  const data = (stores[activePortal] || stores.leadership)[0];
  const rawSave = (stores[activePortal] || stores.leadership)[1];
  const save = (newData) => { rawSave(newData); if (SUPABASE_ENABLED && activePortal) savePortalContent(activePortal, newData).catch(err => console.error('Supabase: lagring feilet', err)); };
  const saveCrossorg = (newData) => { setCrossorgData(newData); if (SUPABASE_ENABLED) savePortalContent('crossorg', newData).catch(err => console.error('Supabase: crossorg lagring feilet', err)); };
  const allData = { leadership:leadershipData, marketing:marketingData, sales:salesData, innkjop:innkjopData, produkt:produktData };
  const availablePortals = currentUserId ? (portalAccess[currentUserId] || []) : [];

  const resetTransient = () => { setSearchOpen(false); setAssistantOpen(false); setUserPickerOpen(false); setFocusMeetingId(null); setFocusChannelId(null); };

  const handleLogin = (userId, portalId) => {
    // Tilgangsstyring: brukeren må eksplisitt ha tilgang til portalen
    if (!(portalAccess[userId] || []).includes(portalId)) return;
    setCurrentUserId(userId);
    setActivePortal(portalId);
    setView('desk');
    resetTransient();
  };
  const handleLogout = () => {
    setCurrentUserId(null); setActivePortal(null); setView('desk'); resetTransient();
  };
  const handleSwitchPortal = (pid) => {
    if (!(portalAccess[currentUserId] || []).includes(pid)) return;
    const targetData = (stores[pid] || stores.leadership)[0];
    if (!targetData.members.some(m => m.id === currentUserId)) return;
    setActivePortal(pid);
    setView('desk');
    resetTransient();
  };
  // Naviger fra «På tvers» rett inn i en avdelings prosjekter (kun ved tilgang)
  const handleCrossNavigate = (pid) => {
    if (!(portalAccess[currentUserId] || []).includes(pid)) return;
    const targetData = (stores[pid] || stores.leadership)[0];
    if (!targetData.members.some(m => m.id === currentUserId)) return;
    setActivePortal(pid);
    setView('initiatives');
    resetTransient();
  };

  const handleNavigate = (v, focusId) => {
    setView(v);
    if (focusId) {
      if (v === 'meetings') setFocusMeetingId(focusId);
      else if (v === 'messages') setFocusChannelId(focusId);
    }
  };

  // Tastatursnarvei: ⌘K / Ctrl-K åpner søk (kun når innlogget)
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (currentUserId && activePortal) setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [currentUserId, activePortal]);

  // Ikke innlogget → vis portalvelger med tilgangsstyring
  if (!loggedIn) {
    return <LoginScreen
      leadershipMembers={leadershipData.members}
      marketingMembers={marketingData.members}
      salesMembers={salesData.members}
      innkjopMembers={innkjopData.members}
      produktMembers={produktData.members}
      onLogin={handleLogin}/>;
  }

  const deptProjects = (data.projects || []).filter(p=>p.status!=='fullført'&&p.status!=='avlyst');
  const crossProjects = (crossorgData.projects || []).filter(p=>p.status!=='fullført'&&p.status!=='avlyst');
  const myProjectCount = [...deptProjects, ...crossProjects].filter(p => p.lead===currentUserId || (p.members||[]).some(m=>m.memberId===currentUserId)).length;

  const counts = {
    meetings: data.meetings.filter(m=>m.status==='planlagt'&&daysFromNow(m.date)>=0).length,
    decisions: data.decisions.length,
    tasks: data.tasks.filter(t=>t.status!=='fullført').length,
    documents: data.documents.length,
    team: data.members.length,
    plans: (data.plans || []).length,
    initiatives: (data.initiatives || []).filter(i=>i.status!=='fullført'&&i.status!=='avlyst').length,
    projects: deptProjects.length + myProjectCount,
    kpis: (data.kpis || []).length,
    risks: (data.risks || []).filter(r=>r.status==='aktiv').length,
    proposals: (data.agendaProposals || []).filter(p=>p.status==='foreslått').length,
    unreadMessages: totalUnread(data, currentUserId),
    crossorg: programs.length,
  };

  return (
    <div style={{display:'flex',minHeight:'100vh',background:theme.bg,fontFamily:'Manrope, system-ui, sans-serif',color:theme.ink}}>
      <Sidebar
        active={view} onChange={handleNavigate} counts={counts}
        currentUserId={currentUserId} members={data.members}
        onSwitchUser={()=>setUserPickerOpen(true)}
        onSearch={()=>setSearchOpen(true)}
        org={data.org}
        availablePortals={availablePortals}
        activePortal={activePortal}
        onSwitchPortal={handleSwitchPortal}
        onLogout={handleLogout}
        showAdmin={isAdminUser}/>
      <main style={{flex:1,padding:'40px 48px 80px',minWidth:0,maxWidth:1280,position:'relative'}}>
        {view==='desk'        && <PersonalDeskView  data={data} currentUserId={currentUserId} onNavigate={handleNavigate} save={save} onAsk={()=>setAssistantOpen(true)} allData={allData}/>}
        {view==='crossorg'    && <CrossOrgView       allData={allData} currentUserId={currentUserId} activePortal={activePortal} onCrossNavigate={handleCrossNavigate}/>}
        {view==='dashboard'   && <Dashboard         data={data} onNavigate={handleNavigate} save={save}/>}
        {view==='plans'       && <PlansView         data={data} save={save} currentUserId={currentUserId} onNavigate={handleNavigate}/>}
        {view==='initiatives' && <InitiativesView   data={data} save={save}/>}
        {view==='projects'    && <ProjectsView      data={data} save={save} crossorgData={crossorgData} saveCrossorg={saveCrossorg} allData={allData} currentUserId={currentUserId} activePortal={activePortal}/>}
        {view==='kpis'        && <KpisView          data={data} save={save}/>}
        {view==='risks'       && <RisksView         data={data} save={save}/>}
        {view==='meetings'    && <MeetingsView      data={data} save={save} focusMeetingId={focusMeetingId} onClearFocus={()=>setFocusMeetingId(null)} currentUserId={currentUserId}/>}
        {view==='proposals'   && <ProposalsView     data={data} save={save} currentUserId={currentUserId}/>}
        {view==='decisions'   && <DecisionsView     data={data} save={save}/>}
        {view==='tasks'       && <TasksView         data={data} save={save}/>}
        {view==='messages'    && <MessagesView      data={data} save={save} currentUserId={currentUserId} focusChannelId={focusChannelId} onClearFocus={()=>setFocusChannelId(null)}/>}
        {view==='documents'   && <DocumentsView     data={data} save={save}/>}
        {view==='team'        && <TeamView          data={data} save={save}/>}
        {view==='admin'       && <AdminPanel/>}
      </main>

      {/* Flytende AI-knapp – alltid synlig */}
      <button onClick={()=>setAssistantOpen(true)}
        style={{
          position:'fixed', bottom:24, right:24, zIndex:90,
          width:56, height:56, borderRadius:'50%',
          background:`linear-gradient(135deg, ${theme.brass}, ${theme.amber})`,
          color:'#fff', border:'none', cursor:'pointer',
          boxShadow:'0 8px 24px rgba(184,137,59,0.45)',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'transform 200ms',
        }}
        onMouseEnter={(e)=>e.currentTarget.style.transform='scale(1.08)'}
        onMouseLeave={(e)=>e.currentTarget.style.transform='scale(1)'}
        title="Spør AI-assistenten">
        <Sparkles size={22}/>
      </button>

      <CommandPalette open={searchOpen} onClose={()=>setSearchOpen(false)}
        data={data} onNavigate={handleNavigate} onAsk={()=>setAssistantOpen(true)}
        currentUserId={currentUserId}/>

      <AssistantPanel open={assistantOpen} onClose={()=>setAssistantOpen(false)}
        data={data} currentUserId={currentUserId} onNavigate={handleNavigate}/>

      <Modal open={userPickerOpen} onClose={()=>setUserPickerOpen(false)} title={`Velg hvem du er pålogget som · ${data.org?.orgName || ''}`}>
        <div style={{display:'grid',gap:8}}>
          {data.members.map(m => {
            const isMe = m.id === currentUserId;
            return (
              <button key={m.id} onClick={()=>{ setCurrentUserId(m.id); setUserPickerOpen(false); }}
                style={{display:'flex',alignItems:'center',gap:14,padding:14,width:'100%',
                  background:isMe?theme.brassLight:theme.surface,
                  border:`1px solid ${isMe?theme.brass:theme.border}`,
                  borderRadius:10,cursor:'pointer',fontFamily:'inherit',textAlign:'left',transition:'all 120ms'}}
                onMouseEnter={(e)=>{ if(!isMe) e.currentTarget.style.background=theme.surfaceAlt; }}
                onMouseLeave={(e)=>{ if(!isMe) e.currentTarget.style.background=theme.surface; }}>
                <Avatar member={m} size={40}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:theme.ink}}>{m.name}</div>
                  <div style={{fontSize:12,color:theme.inkMuted}}>{m.role} · {m.email}</div>
                </div>
                {isMe && <Pill bg={theme.brass} color="#fff">Pålogget</Pill>}
              </button>
            );
          })}
        </div>
        <div style={{fontSize:12,color:theme.inkMuted,marginTop:14,padding:'10px 12px',background:theme.surfaceAlt,borderRadius:8,lineHeight:1.5}}>
          Bytter identitet innenfor {data.org?.orgName || 'denne portalen'}. Bruk «Logg ut» nederst i menyen for å bytte portal. I produksjon kobles dette til ekte autentisering.
        </div>
      </Modal>
    </div>
  );
};

export default App;
