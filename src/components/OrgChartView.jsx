import React from 'react';

const orgChartHtml = `<!doctype html>
<html lang="no">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
<style>
  :root{
    --sand:#CBC4AF; --sand-tint:#F3F0E8; --sand-deep:#B8AF95;
    --black:#252525; --white:#FFFFFF;
    --brun:#9D8068; --oliven:#5E6A60; --oransj:#F4835A;
    --warm-white:#F2EFE8;
    --ink:#252525;
    --line:rgba(37,37,37,.18);
    --line-soft:rgba(37,37,37,.12);
    --g-lg:#5E6A60;
    --g-lgf:#93A28C;
    --g-ulg:#9D8068;
    --g-dmg:#5C7A93;
    --g-sug:#F4835A;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
  body{
    font-family:'Hanken Grotesk',system-ui,sans-serif;
    background:var(--sand-tint);
    color:var(--ink);
    padding:0 0 64px;
  }
  body::after{
    content:"";position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.4;
    background-image:radial-gradient(rgba(120,108,84,.06) 1px, transparent 1px);
    background-size:5px 5px;
  }
  .wrap{position:relative;z-index:1;max-width:1740px;margin:0 auto;padding:0 40px}
  .masthead{
    position:relative;overflow:hidden;
    background:radial-gradient(130% 160% at 18% 0%, #3a3a38 0%, #2b2b29 48%, #1c1c1b 100%);
    color:var(--warm-white);
    padding:40px 0 38px;margin-bottom:34px;
  }
  .masthead::after{content:"";position:absolute;inset:0;opacity:.16;pointer-events:none;
    background-image:radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px);background-size:5px 5px}
  .masthead .wrap{display:flex;flex-direction:column;gap:18px}
  .mh-top{display:flex;justify-content:space-between;align-items:center}
  .logo{display:block;width:150px;height:auto;color:var(--warm-white)}
  .mh-meta{font-size:12px;letter-spacing:.26em;text-transform:uppercase;font-weight:600;opacity:.55}
  .mh-rule{height:1px;background:currentColor;opacity:.16}
  .eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:12.5px;letter-spacing:.24em;text-transform:uppercase;font-weight:600;color:var(--sand)}
  .eyebrow::before{content:"";width:9px;height:9px;background:var(--oransj);display:inline-block}
  .mh-h{font-weight:300;letter-spacing:-.02em;line-height:1.05;font-size:46px;max-width:900px}
  .mh-h b{font-weight:600}
  .mh-sub{font-size:16px;line-height:1.55;opacity:.74;max-width:760px;font-weight:400}
  .legend{
    display:flex;flex-wrap:wrap;align-items:center;gap:10px 26px;
    background:var(--white);border:1px solid var(--line-soft);border-radius:5px;
    padding:16px 22px;margin-bottom:30px;
    box-shadow:0 1px 0 rgba(37,37,37,.03);
  }
  .legend .lh{font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:700;color:var(--oliven);margin-right:4px}
  .lg-item{display:inline-flex;align-items:center;gap:9px;font-size:13.5px;font-weight:500}
  .lg-item .gd{flex:0 0 auto}
  .lg-count{font-size:11.5px;font-weight:700;color:rgba(37,37,37,.42);
    background:rgba(37,37,37,.05);border-radius:20px;padding:2px 8px;font-variant-numeric:tabular-nums}
  .gd{width:12px;height:12px;border-radius:50%;display:inline-block;box-shadow:inset 0 0 0 2px rgba(255,255,255,.55)}
  .lg-badge{display:inline-flex;align-items:center;gap:6px;font-size:9.5px;letter-spacing:.13em;
    text-transform:uppercase;font-weight:700;color:#fff;background:var(--g-lg);
    padding:3px 9px 3px 8px;border-radius:20px;line-height:1;white-space:nowrap}
  .lg-badge::before{content:"";width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.85);flex:0 0 auto}
  .tree{display:flex;flex-direction:column;align-items:center}
  .ceo-zone{display:flex;flex-direction:column;align-items:center}
  .ceo{
    background:var(--black);color:var(--warm-white);
    border-radius:6px;padding:18px 30px;min-width:280px;text-align:center;position:relative;
    box-shadow:0 18px 40px -22px rgba(0,0,0,.55);
  }
  .ceo .role-tag{font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;font-weight:700;color:var(--oransj);margin-bottom:7px}
  .ceo .nm{font-size:24px;font-weight:300;letter-spacing:-.01em;line-height:1.1}
  .ceo .ti{font-size:13.5px;opacity:.72;margin-top:2px}
  .ceo .groups{justify-content:center;margin-top:12px}
  .v-line{width:1.5px;background:var(--line);}
  .stab-branch{display:flex;flex-direction:column;align-items:center}
  .stab{
    width:100%;background:rgba(203,196,175,.30);
    border:1px solid var(--line-soft);border-radius:8px;padding:16px 18px 18px;
    margin:4px 0 6px;
  }
  .stab-head{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:0 4px}
  .stab-head .k{font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:700;color:var(--oliven)}
  .stab-head .d{font-size:12px;color:rgba(37,37,37,.5);font-weight:500}
  .stab-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;align-items:start}
  .stab-sub{position:relative;margin-top:12px;padding-left:22px}
  .stab-sub::before{content:"";position:absolute;left:10px;top:-12px;bottom:20px;width:1.5px;background:var(--line)}
  .stab-sub .report::before{left:-12px;width:12px}
  .card{
    background:var(--white);border:1px solid var(--line-soft);border-radius:5px;
    padding:13px 15px;position:relative;
  }
  .card .tag{display:inline-block;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;
    color:var(--brun);margin-bottom:5px}
  .card .nm{font-size:15px;font-weight:600;letter-spacing:-.01em;line-height:1.18}
  .card.ext{border-style:dashed;border-color:rgba(157,128,104,.6)}
  .card.ext .tag{color:var(--brun)}
  .card .ti{font-size:12.5px;color:rgba(37,37,37,.62);line-height:1.32;margin-top:2px}
  .email{font-size:10.5px;color:rgba(37,37,37,.4);margin-top:4px;letter-spacing:.01em;word-break:break-word}
  .rtag{font-size:9px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:rgba(37,37,37,.38);margin-bottom:4px}
  .card.vacant{background:rgba(203,196,175,.16)}
  .card.vacant .nm{color:rgba(37,37,37,.55)}
  .card.unit{border-style:dashed}
  .roster-list{list-style:none;margin:10px 0 0;padding:0}
  .roster-list li{font-size:12px;line-height:1.55;color:rgba(37,37,37,.68);padding-left:13px;position:relative}
  .roster-list li::before{content:"";position:absolute;left:1px;top:7px;width:4px;height:4px;border-radius:50%;background:var(--oliven);opacity:.55}
  .rcount{font-size:10.5px;font-weight:700;color:rgba(37,37,37,.42);background:rgba(37,37,37,.06);border-radius:20px;padding:1px 7px;margin-left:5px;font-variant-numeric:tabular-nums;vertical-align:middle}
  .ceo .email{font-size:11px;color:rgba(242,239,232,.5);margin-top:5px}
  .groups{display:flex;gap:6px;margin-top:11px;flex-wrap:wrap}
  .groups .gd{width:11px;height:11px}
  .bus-wrap{width:100%;display:flex;flex-direction:column;align-items:center;margin-top:2px}
  .bus{position:relative;width:100%;height:22px}
  .bus-line{position:absolute;top:0;left:12.5%;right:12.5%;height:1.5px;background:var(--line)}
  .bus-drops{position:absolute;inset:0;display:grid;grid-template-columns:repeat(4,1fr)}
  .bus-drops span{justify-self:center;width:1.5px;height:100%;background:var(--line)}
  .columns{
    width:100%;display:grid;grid-template-columns:repeat(4,1fr);gap:26px;
    align-items:start;
  }
  .col{position:relative;display:flex;flex-direction:column;align-items:stretch}
  .col-head{
    text-align:center;font-size:11px;letter-spacing:.18em;text-transform:uppercase;
    font-weight:700;color:var(--oliven);margin-bottom:10px;
  }
  .leader{
    background:var(--white);border:1px solid var(--line-soft);border-radius:6px;
    padding:15px 16px;border-top:3px solid var(--oransj);text-align:center;
    box-shadow:0 10px 26px -20px rgba(37,37,37,.5);
  }
  .leader .nm{font-size:16.5px;font-weight:600;letter-spacing:-.01em;line-height:1.18}
  .leader .ro{font-size:12px;color:rgba(37,37,37,.6);line-height:1.3;margin-top:3px}
  .leader .email{font-size:10.5px;color:rgba(37,37,37,.4);margin-top:4px}
  .leader .groups{justify-content:center}
  .rail{position:relative;margin-top:14px;padding-left:26px}
  .rail::before{content:"";position:absolute;left:11px;top:-14px;bottom:18px;width:1.5px;background:var(--line)}
  .report{position:relative;margin-bottom:14px}
  .report::before{content:"";position:absolute;left:-15px;top:22px;width:15px;height:1.5px;background:var(--line)}
  .report:last-child{margin-bottom:0}
  .subrail{position:relative;margin-top:12px;padding-left:24px}
  .subrail::before{content:"";position:absolute;left:10px;top:-12px;bottom:18px;width:1.5px;background:var(--line)}
  .subrail .report::before{left:-14px;width:14px}
  .enhet{
    display:inline-flex;align-items:center;gap:8px;margin-top:9px;
    background:rgba(94,106,96,.12);border:1px solid rgba(94,106,96,.28);
    color:#3f4942;border-radius:4px;padding:7px 11px;font-size:12.5px;font-weight:600;
  }
  .enhet::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--oliven);flex:0 0 auto}
  .enhet .lab{font-size:9px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:rgba(94,106,96,.7);margin-right:1px}
  .notes{margin-top:46px;border-top:1px solid var(--line-soft);padding-top:22px;display:flex;gap:40px;flex-wrap:wrap}
  .notes .blk{flex:1;min-width:280px}
  .notes h4{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--oliven);font-weight:700;margin-bottom:10px}
  .notes p,.notes li{font-size:13px;line-height:1.55;color:rgba(37,37,37,.66)}
  .notes ul{padding-left:18px}
  .notes li{margin-bottom:5px}
  .foot{margin-top:30px;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(37,37,37,.45);letter-spacing:.02em}
  .foot b{color:var(--oransj)}
  @media (max-width:1180px){
    .scroller{overflow-x:auto;-webkit-overflow-scrolling:touch}
    .tree{min-width:1080px}
  }
</style>
</head>
<body>
<header class="masthead">
  <div class="wrap">
    <div class="mh-top"><span id="logoslot"></span><span class="mh-meta">Styringsportalen &middot; Organisasjon</span></div>
    <div class="mh-rule"></div>
    <div class="eyebrow">Organisasjonskart</div>
    <h1 class="mh-h">En organisasjon &mdash;<br><b>bundet sammen pa tvers</b></h1>
    <p class="mh-sub">Linjeorganisasjonen viser hvem som rapporterer hvor. Fargemarkørene viser de fem tverrgående gruppene — der avdelingene faktisk møtes og koordineres.</p>
  </div>
</header>
<div class="wrap">
  <div class="legend" id="legend"><span class="lh">Tverrgående grupper</span></div>
  <div class="scroller"><div class="tree" id="tree"></div></div>
  <div class="notes">
    <div class="blk">
      <h4>Slik leses kartet</h4>
      <p>Boksene og linjene er den formelle rapporteringsveien. Medlemmer av <b>Ledergruppe</b> er merket med egen etikett, saa lederteamet er lett aa se. De smaa fargeprikkene viser de øvrige tverrgaende gruppene — jo flere markører, jo mer binder rollen organisasjonen sammen. De grønne enhets-merkene nederst er de operative teamene.</p>
    </div>
    <div class="blk">
      <h4>Tolkninger</h4>
      <ul>
        <li>Skillet <b>Ledergruppe</b> vs. <b>deltaker fag</b> er lest fra fargenyansen i originalen.</li>
        <li>Roller uten navn i listen er merket «ubesatt» (intern logistikk, Lager m.fl.).</li>
      </ul>
    </div>
  </div>
  <div class="foot">
    <span>Vikingbad &middot; Styringsportalen</span>
    <span>Organisasjonskart &middot; <b>oppdatert</b></span>
  </div>
</div>
<script>
document.getElementById('logoslot').innerHTML = '<svg class="logo" viewBox="0 0 566.93 85.07" fill="currentColor" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vikingbad"><g><path d="m143.11,47.04h0l32.88-31.76h-16.3l-29.2,28.24V15.28h-11.8v68.6h11.8v-24.63c9.17-6.26,15.47.77,18.11,4.31l14.72,20.32h14.71l-19.06-26.06c-1.82-2.49-7.61-10.6-15.86-10.78Z"/><polygon points="267.95 65.53 235.22 15.59 235.01 15.28 221.76 15.28 221.76 83.89 233.52 83.89 233.52 33.35 266.56 83.89 279.72 83.89 279.72 15.28 267.95 15.28 267.95 65.53"/><path d="m413.76,45.19c3.78-2.87,6.08-7.42,6.08-12.2,0-8.7-7.29-17.7-19.49-17.7h-24.7v68.61h27.56c12.95,0,22.71-9.21,22.71-21.43,0-7.66-4.73-14.3-12.16-17.27Zm-26.84-19.7h13.14c4.92,0,8.49,3.31,8.49,7.88s-3.65,7.88-8.49,7.88h-13.14v-15.75Zm15.9,48.2h-15.9v-22.34h15.9c6.84,0,11.82,4.68,11.82,11.12s-4.97,11.22-11.82,11.22Z"/><path d="m459.24,15.28l-28.73,68.61h12.42l7.25-17.46h29.96l7.24,17.46h12.32l-28.63-68.61h-11.83Zm-4.56,40.28l10.48-25.12,10.47,25.12h-20.95Z"/><path d="m531.6,15.28h-22.63v68.61h22.63c20.8,0,35.33-14.15,35.33-34.39s-14.53-34.21-35.33-34.21Zm0,57.74h-10.87V26.14h10.87c14.1,0,23.57,9.38,23.57,23.35s-9.48,23.53-23.57,23.53Z"/><rect x="86.49" y="15.28" width="11.83" height="68.61"/><rect x="188.28" y="15.28" width="11.83" height="68.61"/><path d="m331.05,54.89h16.51v14.23c-3.98,3.12-9.91,4.98-15.94,4.98-14.33,0-25.12-10.53-25.12-24.51s10.76-24.51,25.03-24.51c6.69,0,13.21,1.82,18.42,5.14l.6.38,5.33-8.45-.46-.4c-5.62-4.94-14.27-7.66-24.37-7.66-20.91,0-36.69,15.26-36.69,35.49s15.81,35.49,36.79,35.49c11.69,0,21.4-3.67,28.07-10.63l.2-.2v-30.23h-28.37v10.89Z"/><polygon points="48.5 9.24 37.95 0 27.42 9.24 37.95 31.31 48.5 9.24"/><polygon points="37.96 67.65 12.88 15.28 0 15.28 31.91 83.89 32.02 83.89 43.89 83.89 44.01 83.89 75.92 15.28 63.04 15.28 37.96 67.65"/></g></svg>';

var G={LG:{name:'Ledergruppe',color:'var(--g-lg)'},LGF:{name:'Ledergruppe \\u2013 deltaker fag',color:'var(--g-lgf)'},ULG:{name:'Utvidet ledergruppe',color:'var(--g-ulg)'},DMG:{name:'Driftsm\\u00f8tegruppe',color:'var(--g-dmg)'},SUG:{name:'Sortimentsutviklingsgruppe',color:'var(--g-sug)'}};
var ORDER=['LG','LGF','ULG','DMG','SUG'];

var ceo={tagName:'Toppledelse',nm:'Stein Viggo Karlsen',ti:'Administrerende direkt\\u00f8r \\u00b7 CEO',email:'svk@vikingbad.no',groups:['LG','SUG','DMG','ULG']};

var stab=[
  {nm:'Tonny Morewood',ti:'Direkt\\u00f8r for Teknologi og IKT \\u00b7 CIO',email:'tonny@vikingbad.no',groups:['LG','ULG'],reports:[{nm:'Eirik Halvorsen',ti:'Systemutvikler IKT',email:'eh@vikingbad.no',groups:[]}]},
  {nm:'\\u00d8rjan Moy Jacobsen',ti:'Spesialist Analyse',email:'orjan@vikingbad.no',groups:['LG','SUG','DMG','ULG']},
  {tag:'Ekstern r\\u00e5dgiver',nm:'Henning Karlsen',ti:'Strategi',ext:true,groups:['LG','ULG']},
  {nm:'Espen L\\u00f8vberg Hansen',ti:'Direkt\\u00f8r \\u00d8konomi og Finans \\u00b7 CFO',email:'espen.lovberg.hansen@vikingbad.no',groups:['LG','ULG'],reports:[{nm:'Hanne Birkenes Aamlid',ti:'HR-leder',email:'hanne@vikingbad.no',groups:['ULG']}]}
];

var columns=[
  {head:'Marked',leader:{nm:'Arild Kaale',role:'Direkt\\u00f8r for Marked',email:'arild.kaale@vikingbad.no',groups:['LG','SUG','ULG']},reports:[
    {nm:'Stine Veronica Bernander',ti:'Leder Marked',email:'stine@vikingbad.no',groups:['ULG'],children:[{nm:'Sona Appaiah',ti:'Merkevare- og webdesigner',email:'sona.appaiah@vikingbad.no',groups:[]},{nm:'Kaja Frigstad Skuggevik',ti:'Spesialist visuelt design',email:'kaja.skuggevik@vikingbad.no',groups:[]}]},
    {nm:'Christer Bergene',ti:'Studioleder \\u00b7 Sandvika',email:'christer.bergene@vikingbad.no',groups:['ULG'],children:[{nm:'Emilie Gullvik',ti:'Baderomsdesigner',email:'emilie.gullvik@vikingbad.no',groups:[]},{nm:'Andrea Jensen',ti:'Baderomsdesigner',email:'andrea.jensen@vikingbad.no',groups:[]}]},
    {nm:'Eivind Rasmussen',ti:'Studioleder \\u00b7 Grimstad',email:'eivind@vikingbad.no',groups:['ULG']}
  ]},
  {head:'Salg',leader:{nm:'Geir H\\u00e5kon Lindheim',role:'Leder Salg',email:'ghl@vikingbad.no',groups:['LG','SUG','ULG']},reports:[
    {nm:'Marius Olsen',ti:'Teamleder Kundesenter',email:'marius@vikingbad.no',groups:['ULG'],children:[{nm:'Kundesenter',unitOnly:true}]},
    {nm:'Teamleder RA',vacant:true,groups:['ULG'],children:[{nm:'RA',roster:['Carl Eric Wessel Holst','Irina Ellingsen','Tom Nyhagen','Tore M\\u00f8lbach Lunde-Olsen','Vegard Somdal','Per \\u00d8ivind Pedersen','Aleksander Torjussen']}]},
    {nm:'S\\u00f8lve Marlon Str\\u00f8msland',ti:'Salg \\u00b7 Proff',email:'sms@vikingbad.no',groups:['ULG'],enhet:'Kunder\\u00e5dg. PROFF',children:[{nm:'Anette Hansen',ti:'Salg \\u00b7 Proff',groups:[]}]}
  ]},
  {head:'Sortimentsutvikling & Sourcing',leader:{nm:'Snorre Larstad',role:'Direkt\\u00f8r for Sortimentsutvikling og Sourcing',groups:['LG','SUG','DMG','ULG']},reports:[
    {nm:'Tom Patrich Josefsen',ti:'Leder for Produktutvikling',email:'tpj@vikingbad.no',groups:['LGF','SUG','DMG','ULG'],enhet:'Produkt'},
    {nm:'Peder \\u00d8stmoe',ti:'Teamleder Teknisk kundeservice',email:'peder@vikingbad.no',groups:['DMG','ULG'],enhet:'Teknisk kundeservice'}
  ]},
  {head:'Supply chain',leader:{nm:'Elisabeth Engler',role:'Leder for supply chain',groups:['LG','DMG','ULG']},reports:[
    {nm:'Innkj\\u00f8p',unitOnly:true},
    {nm:'Ansv. intern logistikk',vacant:true,groups:['DMG']},
    {nm:'Avd. leder Lager',vacant:true,groups:['DMG','ULG'],children:[{nm:'TL Lager',vacant:true,groups:[],enhet:'Lager'}]}
  ]}
];

function dots(groups){
  if(!groups||!groups.length) return '';
  var badge=groups.includes('LG')?'<span class="lg-badge" title="Ledergruppe">Ledergruppe</span>':'';
  var ds=ORDER.filter(function(k){return k!=='LG'&&groups.includes(k)}).map(function(k){return '<span class="gd" title="'+G[k].name+'" style="background:'+G[k].color+'"></span>';}).join('');
  return '<div class="groups">'+badge+ds+'</div>';
}
function enhetChip(name){return '<div class="enhet"><span class="lab">Enhet</span>'+name+'</div>';}
function emailLine(x){return x.email?'<div class="email">'+x.email+'</div>':'';}
function reportEl(r){
  if(r.unitOnly) return '<div class="report"><div class="card unit"><div class="tag">Enhet</div><div class="nm">'+r.nm+'</div></div></div>';
  if(r.roster) return '<div class="report"><div class="card"><div class="tag">Team</div><div class="nm">'+r.nm+'<span class="rcount">'+r.roster.length+'</span></div><ul class="roster-list">'+r.roster.map(function(n){return '<li>'+n+'</li>';}).join('')+'</ul></div></div>';
  var inner='<div class="card'+(r.vacant?' vacant':'')+'">';
  if(r.vacant) inner+='<div class="rtag">Rolle \\u00b7 ubesatt</div>';
  if(r.nm) inner+='<div class="nm">'+r.nm+'</div>';
  if(r.ti) inner+='<div class="ti">'+r.ti+'</div>';
  inner+=emailLine(r)+dots(r.groups);
  if(r.enhet) inner+=enhetChip(r.enhet);
  inner+='</div>';
  if(r.children&&r.children.length) inner+='<div class="subrail">'+r.children.map(reportEl).join('')+'</div>';
  return '<div class="report">'+inner+'</div>';
}

function renderLegend(){
  var el=document.getElementById('legend');
  el.innerHTML='<span class="lh">Tverrgaende grupper</span>';
  var all=[ceo];
  function collect(n){all.push(n);(n.reports||[]).forEach(collect);(n.children||[]).forEach(collect);}
  stab.forEach(collect);
  columns.forEach(function(c){all.push(c.leader);c.reports.forEach(collect);});
  var counts={};ORDER.forEach(function(k){counts[k]=0;});
  all.forEach(function(n){(n.groups||[]).forEach(function(k){if(counts[k]!=null)counts[k]++;});});
  ORDER.forEach(function(k){
    var item=document.createElement('span');item.className='lg-item';
    item.innerHTML=(k==='LG')?'<span class="lg-badge">Ledergruppe</span><span class="lg-count">'+counts[k]+'</span>':'<span class="gd" style="background:'+G[k].color+'"></span>'+G[k].name+'<span class="lg-count">'+counts[k]+'</span>';
    el.appendChild(item);
  });
}
function renderTree(){
  var t=document.getElementById('tree');
  var ceoHtml='<div class="ceo-zone"><div class="ceo"><div class="role-tag">'+ceo.tagName+'</div><div class="nm">'+ceo.nm+'</div><div class="ti">'+ceo.ti+'</div>'+emailLine(ceo)+dots(ceo.groups)+'</div><div class="v-line" style="height:20px"></div></div>';
  var stabHtml='<div class="stab-branch" style="width:100%"><div class="stab"><div class="stab-head"><span class="k">Stab & st\\u00f8ttefunksjoner</span><span class="d">\\u2014 rapporterer til adm. dir.</span></div><div class="stab-grid">'+stab.map(function(s){return '<div class="card'+(s.ext?' ext':'')+'">'+( s.tag?'<div class="tag">'+s.tag+'</div>':'')+'<div class="nm">'+s.nm+'</div>'+(s.ti?'<div class="ti">'+s.ti+'</div>':'')+emailLine(s)+dots(s.groups)+((s.reports&&s.reports.length)?'<div class="stab-sub">'+s.reports.map(reportEl).join('')+'</div>':'')+'</div>';}).join('')+'</div></div><div class="v-line" style="height:22px"></div></div>';
  var colsHtml='<div class="columns">'+columns.map(function(c){return '<div class="col"><div class="col-head">'+c.head+'</div><div class="leader"><div class="nm">'+c.leader.nm+'</div>'+(c.leader.role?'<div class="ro">'+c.leader.role+'</div>':'')+emailLine(c.leader)+dots(c.leader.groups)+'</div><div class="rail">'+c.reports.map(reportEl).join('')+'</div></div>';}).join('')+'</div>';
  t.innerHTML=ceoHtml+stabHtml+'<div class="bus-wrap"><div class="bus"><div class="bus-line"></div><div class="bus-drops"><span></span><span></span><span></span><span></span></div></div>'+colsHtml+'</div>';
}
renderLegend();renderTree();
</script>
</body>
</html>`;

const OrgChartView = () => {
  return (
    <div style={{margin:'-40px -48px -80px',height:'calc(100vh)',overflow:'hidden'}}>
      <iframe
        srcDoc={orgChartHtml}
        style={{width:'100%',height:'100%',border:'none'}}
        title="Organisasjonskart"
      />
    </div>
  );
};

export default OrgChartView;
