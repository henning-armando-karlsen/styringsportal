// MarkedsplanView -- portert fra det frittstaaende verktoeyet MarkedsplanVerktoy_9.html.
// Eneste endringer fra originalen: (1) CDN/UMD-React byttet til ES-import,
// (2) fjernet den frittstaaende ReactDOM.createRoot(...).render(...),
// (3) lagt til default-export, (4) extractStrategy() ruter naa via assistant-edge-funksjonen.
// All oevrig logikk, UI og datamodell er uendret.
import React, { useState, useEffect, useMemo, useRef } from 'react';

const C = {
  bg: "#EDE9DF",
  surface: "#FFFFFF",
  surfaceAlt: "#E4DFD4",
  ink: "#252525",
  inkSoft: "#4A4A4A",
  inkFaint: "#7A7A7A",
  gold: "#9D8068",
  goldDeep: "#7D6450",
  goldWash: "#EDE4DB",
  line: "#DDD8CB",
  lineStrong: "#CBC4AF",
  marked: "#5E6A60",
  markedWash: "#E3E7E3",
  salg: "#3E5A78",
  salgWash: "#E0E5EB",
  felles: "#7D6450",
  fellesWash: "#EDE4DB",
  ide: "#4A4A4A",
  ideWash: "#E4DFD4",
  planlagt: "#7D6450",
  planlagtWash: "#EDE4DB",
  pagaar: "#8B6914",
  pagaarWash: "#F2E8DE",
  fullfort: "#5E6A60",
  fullfortWash: "#E3E7E3",
  rust: "#F4835A",
  rustWash: "#FDE8E0",
  amber: "#B89070",
  amberWash: "#F2E8DE",
  danger: "#C2502B"
};
const serif = "'Fraunces', Georgia, serif";
const sans = "'Manrope', system-ui, sans-serif";
const PERIODS = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"];
const OWNERS = ["marked", "salg", "felles"];
const OWNER_LABEL = { marked: "Marked", salg: "Salg", felles: "Felles" };
const OWNER_COLOR = { marked: C.marked, salg: C.salg, felles: C.felles };
const OWNER_WASH = { marked: C.markedWash, salg: C.salgWash, felles: C.fellesWash };
const ACT_TYPES = ["kampanje", "lansering", "alltid-p\xE5"];
const ACT_STATUS = ["id\xE9", "planlagt", "p\xE5g\xE5r", "fullf\xF8rt"];
const TASK_STATUS = ["\xE5pen", "p\xE5g\xE5r", "fullf\xF8rt"];
const PORTAL_BY_OWNER = { marked: "marketing", salg: "sales", felles: "leadership" };
const PORTAL_LABEL = { marketing: "Marked", sales: "Salg", leadership: "Ledelse" };
const CHANNELS = ["Google Ads", "Meta", "E-post", "Utstilling", "PR", "Forhandler", "Nettside"];
const TAG_BANK = ["pris", "timing", "budskap", "kanal", "sortiment", "m\xE5lgruppe"];
const MONTHS = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
const FUNNEL = [
  { key: "bevissthet", label: "Bevissthet", fw: "See", owner: "marked", desc: "Rekkevidde og kjennskap" },
  { key: "vurdering", label: "Vurdering", fw: "Think", owner: "marked", desc: "Interesse og preferanse" },
  { key: "konvertering", label: "Konvertering", fw: "Do", owner: "salg", desc: "Leads og salg" },
  { key: "lojalitet", label: "Lojalitet", fw: "Care", owner: "felles", desc: "Gjenkj\xF8p og anbefaling" }
];
const FUNNEL_LABEL = Object.fromEntries(FUNNEL.map((f) => [f.key, f.label]));
const ANSOFF = [
  { key: "penetrasjon", label: "Markedspenetrasjon", desc: "Eksisterende produkt i eksisterende marked", risk: "Lav risiko" },
  { key: "produktutvikling", label: "Produktutvikling", desc: "Nytt produkt i eksisterende marked", risk: "Middels" },
  { key: "markedsutvikling", label: "Markedsutvikling", desc: "Eksisterende produkt i nytt marked", risk: "Middels" },
  { key: "diversifisering", label: "Diversifisering", desc: "Nytt produkt i nytt marked", risk: "H\xF8y risiko" }
];
const SWOT = [
  { key: "styrker", label: "Styrker", sub: "Internt \xB7 positivt", color: C.fullfort, wash: C.fullfortWash },
  { key: "svakheter", label: "Svakheter", sub: "Internt \xB7 negativt", color: C.danger, wash: C.rustWash },
  { key: "muligheter", label: "Muligheter", sub: "Eksternt \xB7 positivt", color: C.goldDeep, wash: C.goldWash },
  { key: "trusler", label: "Trusler", sub: "Eksternt \xB7 negativt", color: C.pagaar, wash: C.amberWash }
];
const seedGoals = [];
const seedActivities = [];
const seedHandoffs = [];
const seedLearnings = [];
const seedTasks = [];
const seedStrategy = {
  plattform: {
    baerendeIde: "Det skal v\xE6re lekende lett \xE5 f\xE5 nytt bad",
    kjerne: "Helt ferdige Vikingbad \u2014 klare til \xE5 nytes",
    oppgave: "Sammen med solide partnere skal vi lage en friksjonsfri og s\xF8ml\xF8s reise mot et nytt Vikingbad",
    opplevelse: "Inspirerende \u2014 Enkelt \u2014 Forutsigbart",
    lofte: "Helt ferdige Vikingbad til avtalt tid og pris",
    kulturord: ["Vi forenkler", "Vi inspirerer", "Vi tenker nytt", "Vi er fleksible", "Vi viser omsorg"]
  },
  merkevare: {
    arketype: "The Innocent \u2014 vennlig, ekte, trygg og optimistisk",
    merkekjerne: "Hverdagsnytelse i et stilfullt bad",
    visuell: "Klassisk moderne \xB7 Varmt \xB7 Harmonisk \xB7 Fornuftig \xB7 Jordn\xE6rt",
    kjernebudskap: "Den enkleste veien til et nytt bad man kan nyte og v\xE6re stolt av",
    sekundaer: "Helhetlige og stilsikre baderomspakker i ulike kolleksjoner \xB7 Kilden til trivsel og glede i hjemmet",
    stilTone: "Tydelig, direkte, folkelig og enkelt \u2014 vennlig, glad, ekte og inspirerende"
  },
  studio: {
    differensiering: "Differensiere seg bort fra ren priskonkurranse ved \xE5 eie helheten: det skal v\xE6re lekende lett \xE5 f\xE5 nytt bad \u2014 fiks ferdig til avtalt tid og pris. N\xE5r alle akt\xF8rer fremst\xE5r like, blir pris det eneste som teller.",
    modell: ["Egne showrom (Grimstad & Sandvika)", "Unik digital kundereise", "Baderomsdesignere", "Fysiske & digitale tegnetimer", "Egen forhandlerportal", "Ingen direktesalg \u2014 alt via forhandler", "Stilkonsepter: Nordic / Elegant / Serene / Classic / CityMind"],
    kundereise: ["Befaring", "Tegnetime", "Tegning 2D/3D", "Forel\xF8pig tilbud", "Tilbud", "Ordre"],
    rolle: "Sammen med bransjen ta tilbake baderommet \u2014 styrke r\xF8rleggerens attraktivitet, posisjon og l\xF8nnsomhet hos forbruker, og hente tilbake andeler fra de 63 % som i dag handler utenfor faghandelen.",
    marked: "Markedsf\xF8ringens jobb er \xE5 fylle toppen av Studio-reisen: skape kjennskap og vurdering som konverterer til booket befaring/tegnetime hos en Studio-forhandler."
  },
  swot: {
    styrker: [
      "Tydelig strategisk kjerne: \xABhelt ferdige Vikingbad \u2014 klare til \xE5 nytes\xBB",
      "Vikingbad Studio: egne showrom, digital kundereise, tegnetimer og forhandlerportal",
      "Sterk merkevareplattform (The Innocent) og distinkt visuell identitet",
      "Eget nettverk av sertifiserte forhandlere med godkjente helhetsutstillinger",
      "Egenutviklet, modul\xE6rt sortiment i flere stilretninger og tre prisniv\xE5er"
    ],
    svakheter: [
      "Helhetsleveranse krever tett koordinering i mange ledd \u2014 risiko for leveransesvikt",
      "Avhengig av at forhandlere bygger, oppdaterer og selger helhetskonseptene",
      "Selger kun via faghandel \u2014 leverer ikke til konkurrerende kjedekonsepter",
      "Sterk sesong- og konjunkturavhengighet (store, vurderte kj\xF8p)"
    ],
    muligheter: [
      "63 % av baderomsomsetningen skjer utenfor faghandelen \u2014 stort tilbakeerobringspotensial",
      "Sterkt forbruker\xF8nske om fiks ferdig bad (78 %) og helhetlige konsepter",
      "S\xF8ml\xF8s integrasjon av egne fysiske og digitale kanaler \u2014 kontroll p\xE5 kundereisen",
      "Vekst i proffmarkedet (utviklere, entrepren\xF8rer, borettslag) via standard/tilvalg"
    ],
    trusler: [
      "Kjeders egne, konkurrerende helhetlige baderomskonsepter og prispress",
      "Bransjeglidning: alt-mulig-butikker, byggevare, IKEA og nett tar baderomsomsetning",
      "Rente/konjunktur demper store oppussingskj\xF8p",
      "Geopolitisk- og forsyningsrisiko i inng\xE5ende verdikjede (sourcing)"
    ]
  },
  stp: {
    segment: "Sosialgeografiske segmenter. Prim\xE6rfokus: Materialistene (23 % av befolkningen) og Individualistene (minst sofistikerte del) \u2014 de med st\xF8rst verdiopplevelse av og betalingsvilje for \xABfiks ferdig\xBB.",
    malgruppe: "Materialistene (\xABDr\xF8mmerne \u2014 f\xF8rst meg selv\xBB): status- og forbruksorientert, hedonistisk og arbeidsom \u2014 pluss Individualistene. Prispunkter p\xE5 deler av sortimentet holdes innenfor Materialistenes gjennomsnittlige betalingsevne.",
    posisjonering: "Den enkleste og tryggeste veien til et nytt bad man kan nyte og v\xE6re stolt av \u2014 helt ferdige Vikingbad til avtalt tid og pris."
  },
  ansoff: "produktutvikling"
};
const nf = new Intl.NumberFormat("nb-NO");
function fmt(n, unit) {
  if (unit === "kr") return "kr " + nf.format(Math.round(n));
  if (unit === "%") return n + " %";
  return nf.format(n) + (unit ? " " + unit : "");
}
function pct(actual, target) {
  return target ? Math.min(100, Math.round(actual / target * 100)) : 0;
}
function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function kShort(n) {
  return n >= 1e3 ? Math.round(n / 1e3) + "k" : "" + n;
}
function statusColors(s) {
  const m = { "id\xE9": [C.ide, C.ideWash], "\xE5pen": [C.planlagt, C.planlagtWash], "planlagt": [C.planlagt, C.planlagtWash], "p\xE5g\xE5r": [C.pagaar, C.pagaarWash], "fullf\xF8rt": [C.fullfort, C.fullfortWash] };
  return m[s] || m["id\xE9"];
}
function quarterMonths(period) {
  const q = Number((period || "Q2 2026").replace(/[^0-9]/g, "").slice(0, 1)) || 2;
  return [(q - 1) * 3 + 1, q * 3];
}
function funnelStats(activities) {
  const total = activities.reduce((s, a) => s + a.budgetPlan, 0) || 1;
  return FUNNEL.map((f) => {
    const acts = activities.filter((a) => a.funnel === f.key);
    const budget = acts.reduce((s, a) => s + a.budgetPlan, 0);
    return { ...f, acts, budget, share: Math.round(budget / total * 100) };
  });
}
function packRows(items) {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end);
  const rows = [];
  sorted.forEach((it) => {
    let placed = false;
    for (const r of rows) {
      if (r.lastEnd < it.start) {
        r.items.push(it);
        r.lastEnd = it.end;
        placed = true;
        break;
      }
    }
    if (!placed) rows.push({ items: [it], lastEnd: it.end });
  });
  return rows.map((r) => r.items);
}
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
async function readPdf(file) {
  const lib = typeof window !== "undefined" && window.pdfjsLib;
  if (lib) {
    const buf = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: new Uint8Array(buf) }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => it.str).join(" ") + "\n";
    }
    return { text: text.trim() };
  }
  return { pdfBase64: await fileToBase64(file) };
}
async function extractStrategy({ pdfBase64, text }) {
  const schema = '{"swot":{"styrker":[],"svakheter":[],"muligheter":[],"trusler":[]},"stp":{"segment":"","malgruppe":"","posisjonering":""},"ansoff":"penetrasjon|produktutvikling|markedsutvikling|diversifisering","mal":[{"title":"","metric":"","unit":"kr|stk|%|visn.","target":0,"funnel":"bevissthet|vurdering|konvertering|lojalitet","kpiType":"leading|lagging","owner":"marked|salg|felles","parent":""}]}';
  const instruction = 'Du er markedsstrateg i Vikingbad. Les strategidokumentet og trekk ut innholdet til en markedsplan. Maks 5 korte punkter per SWOT-kategori. Foresl\xE5 2-4 SMART markedsm\xE5l i "mal". Bruk norsk. Svar KUN med gyldig JSON etter dette skjemaet, uten markdown eller forklaring:\n' + schema;
  const content = [];
  if (pdfBase64) content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } });
  content.push({ type: "text", text: text ? instruction + "\n\nDokument:\n" + text.slice(0, 24e3) : instruction });
  // Gaar via Styringsportalens server-side proxy (Edge Function `assistant`), saa Anthropic-noekkelen aldri ligger i nettleseren.
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnon) throw new Error("AI-import krever at Styringsportalen er koblet til Supabase.");
  const res = await fetch(`${supabaseUrl}/functions/v1/assistant`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseAnon}` },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2e3, messages: [{ role: "user", content }] })
  });
  if (!res.ok) throw new Error("tjenesten svarte " + res.status);
  const data = await res.json();
  const raw = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}
function Logo({ color = C.ink, width = 148 }) {
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 566.93 85.07",
      style: { width, height: "auto", display: "block", flexShrink: 0 },
      fill: color,
      "aria-label": "Vikingbad"
    },
    /* @__PURE__ */ React.createElement("path", { d: "m143.11,47.04h0l32.88-31.76h-16.3l-29.2,28.24V15.28h-11.8v68.6h11.8v-24.63c9.17-6.26,15.47.77,18.11,4.31l14.72,20.32h14.71l-19.06-26.06c-1.82-2.49-7.61-10.6-15.86-10.78Z" }),
    /* @__PURE__ */ React.createElement("polygon", { points: "267.95 65.53 235.22 15.59 235.01 15.28 221.76 15.28 221.76 83.89 233.52 83.89 233.52 33.35 266.56 83.89 279.72 83.89 279.72 15.28 267.95 15.28 267.95 65.53" }),
    /* @__PURE__ */ React.createElement("path", { d: "M413.76,45.19c3.78-2.87,6.08-7.42,6.08-12.2,0-8.7-7.29-17.7-19.49-17.7h-24.7v68.61h27.56c12.95,0,22.71-9.21,22.71-21.43,0-7.66-4.73-14.3-12.16-17.27Zm-26.84-19.7h13.14c4.92,0,8.49,3.31,8.49,7.88s-3.65,7.88-8.49,7.88h-13.14v-15.75Zm15.9,48.2h-15.9v-22.34h15.9c6.84,0,11.82,4.68,11.82,11.12s-4.97,11.22-11.82,11.22Z" }),
    /* @__PURE__ */ React.createElement("path", { d: "M459.24,15.28l-28.73,68.61h12.42l7.25-17.46h29.96l7.24,17.46h12.32l-28.63-68.61h-11.83Zm-4.56,40.28l10.48-25.12,10.47,25.12h-20.95Z" }),
    /* @__PURE__ */ React.createElement("path", { d: "M531.6,15.28h-22.63v68.61h22.63c20.8,0,35.33-14.15,35.33-34.39s-14.53-34.21-35.33-34.21Zm0,57.74h-10.87V26.14h10.87c14.1,0,23.57,9.38,23.57,23.35s-9.48,23.53-23.57,23.53Z" }),
    /* @__PURE__ */ React.createElement("rect", { x: "86.49", y: "15.28", width: "11.83", height: "68.61" }),
    /* @__PURE__ */ React.createElement("rect", { x: "188.28", y: "15.28", width: "11.83", height: "68.61" }),
    /* @__PURE__ */ React.createElement("path", { d: "M331.05,54.89h16.51v14.23c-3.98,3.12-9.91,4.98-15.94,4.98-14.33,0-25.12-10.53-25.12-24.51s10.76-24.51,25.03-24.51c6.69,0,13.21,1.82,18.42,5.14l.6.38,5.33-8.45-.46-.4c-5.62-4.94-14.27-7.66-24.37-7.66-20.91,0-36.69,15.26-36.69,35.49s15.81,35.49,36.79,35.49c11.69,0,21.4-3.67,28.07-10.63l.2-.2v-30.23h-28.37v10.89Z" }),
    /* @__PURE__ */ React.createElement("polygon", { points: "48.5 9.24 37.95 0 27.42 9.24 37.95 31.31 48.5 9.24" }),
    /* @__PURE__ */ React.createElement("polygon", { points: "37.96 67.65 12.88 15.28 0 15.28 31.91 83.89 32.02 83.89 43.89 83.89 44.01 83.89 75.92 15.28 63.04 15.28 37.96 67.65" })
  );
}
function Badge({ children, color, wash }) {
  return /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, letterSpacing: 0.2, color, background: wash, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap" } }, children);
}
function OwnerBadge({ owner }) {
  return /* @__PURE__ */ React.createElement(Badge, { color: OWNER_COLOR[owner], wash: OWNER_WASH[owner] }, OWNER_LABEL[owner]);
}
function StatusBadge({ status }) {
  const [c, w] = statusColors(status);
  return /* @__PURE__ */ React.createElement(Badge, { color: c, wash: w }, status);
}
function FunnelBadge({ funnel }) {
  return /* @__PURE__ */ React.createElement(Badge, { color: C.inkSoft, wash: C.surfaceAlt }, FUNNEL_LABEL[funnel] || funnel);
}
function Bar({ value, max, color = C.gold, track = C.line, height = 8 }) {
  const p = max ? Math.min(100, value / max * 100) : 0;
  return /* @__PURE__ */ React.createElement("div", { style: { background: track, borderRadius: 999, height, overflow: "hidden", width: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { width: p + "%", height: "100%", background: color, borderRadius: 999, transition: "width .4s ease" } }));
}
function Btn({ children, onClick, variant = "ghost", small, title }) {
  const base = { fontFamily: sans, fontWeight: 600, fontSize: small ? 12.5 : 13.5, padding: small ? "5px 11px" : "9px 16px", borderRadius: 8, cursor: "pointer", border: "1px solid transparent", transition: "all .15s ease", whiteSpace: "nowrap" };
  const styles = {
    primary: { ...base, background: C.ink, color: "#fff" },
    brass: { ...base, background: C.gold, color: "#fff" },
    ghost: { ...base, background: "transparent", color: C.inkSoft, border: `1px solid ${C.lineStrong}` }
  };
  return /* @__PURE__ */ React.createElement("button", { title, onClick, style: styles[variant] }, children);
}
function Field({ label, hint, children }) {
  return /* @__PURE__ */ React.createElement("label", { style: { display: "block", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 6 } }, label, hint && /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 400, color: C.inkFaint } }, hint)), children);
}
const inputStyle = { width: "100%", fontFamily: sans, fontSize: 14, color: C.ink, padding: "9px 11px", borderRadius: 8, border: `1px solid ${C.lineStrong}`, background: C.surfaceAlt, outline: "none" };
function Modal({ title, onClose, children, footer }) {
  return /* @__PURE__ */ React.createElement("div", { onClick: onClose, style: { position: "absolute", inset: 0, background: "rgba(37,37,37,.34)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 16px", zIndex: 50, overflowY: "auto" } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { background: C.surface, borderRadius: 14, width: "100%", maxWidth: 540, boxShadow: "0 24px 60px rgba(37,37,37,.22)", animation: "mp-modalIn .22s ease", border: `1px solid ${C.line}` } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 24px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, fontFamily: serif, fontSize: 19, fontWeight: 600, color: C.ink } }, title), /* @__PURE__ */ React.createElement("button", { onClick: onClose, style: { border: "none", background: "none", cursor: "pointer", fontSize: 22, color: C.inkFaint, lineHeight: 1 } }, "\xD7")), /* @__PURE__ */ React.createElement("div", { style: { padding: 24 } }, children), footer && /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 24px", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "flex-end", gap: 10 } }, footer)));
}
function Card({ children, style }) {
  return /* @__PURE__ */ React.createElement("div", { style: { background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, padding: 18, ...style } }, children);
}
function Empty({ children }) {
  return /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: C.inkFaint, margin: "4px 0", fontStyle: "italic" } }, children);
}
function Note({ children }) {
  return /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14, padding: "12px 16px", background: C.goldWash, borderRadius: 10, fontSize: 12.5, color: C.goldDeep, lineHeight: 1.55 } }, children);
}
function Toolbar({ title, subtitle, onAdd, addLabel }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: 16, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { style: { margin: "0 0 2px", fontFamily: serif, fontSize: 20, fontWeight: 600 } }, title), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 13, color: C.inkSoft, maxWidth: 620 } }, subtitle)), onAdd && /* @__PURE__ */ React.createElement(Btn, { variant: "brass", onClick: onAdd }, "+ ", addLabel));
}
function SmartTag({ goal }) {
  const flags = { S: !!goal.title, M: goal.target > 0 && !!goal.unit, A: null, R: !!goal.parent, T: !!goal.period };
  return /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", gap: 3 }, title: "SMART: Spesifikt, M\xE5lbart, Oppn\xE5elig, Relevant, Tidsbestemt" }, ["S", "M", "A", "R", "T"].map((k) => {
    const on = flags[k] === true;
    return /* @__PURE__ */ React.createElement("span", { key: k, style: { fontSize: 10, fontWeight: 700, width: 16, height: 16, lineHeight: "16px", textAlign: "center", borderRadius: 4, color: on ? C.fullfort : C.inkFaint, background: on ? C.fullfortWash : C.surfaceAlt } }, k);
  }));
}
function mapPortalStatus(s) {
  if (s === "fullf\xF8rt") return "done";
  if (s === "p\xE5g\xE5r") return "in_progress";
  return "todo";
}
function toPortalItem(e, kind) {
  const isTask = kind === "oppgave";
  return {
    source: "markedsplan",
    externalId: (isTask ? "o:" : "a:") + e.id,
    type: kind,
    portal: PORTAL_BY_OWNER[e.owner] || "leadership",
    ansvarlig: (e.ansvarlig || "").trim(),
    tittel: e.title,
    status: mapPortalStatus(e.status),
    frist: isTask ? e.due || null : null,
    periode: e.period || null,
    kobling: { aktivitetId: isTask ? e.activityId || null : e.id, malId: isTask ? null : e.goalId || null },
    meta: isTask ? {} : { kanal: e.channel, type: e.type, funnel: e.funnel, budsjettPlan: e.budgetPlan }
  };
}
function buildPortalPush(activities, tasks) {
  const items = [];
  activities.forEach((a) => {
    if ((a.ansvarlig || "").trim()) items.push(toPortalItem(a, "aktivitet"));
  });
  tasks.forEach((t) => {
    if ((t.ansvarlig || "").trim()) items.push(toPortalItem(t, "oppgave"));
  });
  return items;
}
async function pushToStyringsportal(items, opts = {}) {
  if (!items.length) return { ok: false, mode: "tom", count: 0 };
  const bridge = opts.push || typeof window !== "undefined" && window.VikingbadStyringsportal && window.VikingbadStyringsportal.push;
  if (typeof bridge === "function") {
    try {
      await bridge(items);
      return { ok: true, mode: "live", count: items.length };
    } catch (err) {
      return { ok: false, mode: "feil", count: items.length, error: String(err && err.message || err) };
    }
  }
  if (typeof console !== "undefined") console.log("[Styringsportal] dry-run push:", items);
  return { ok: true, mode: "dry-run", count: items.length };
}
function MarkedsplanVerktoy({ data, onChange, onPushToPortal, embedded = false, members = [] } = {}) {
  const d = data || {};
  const [goals, setGoals] = useState(d.goals || seedGoals);
  const [activities, setActivities] = useState(d.activities || seedActivities);
  const [handoffs, setHandoffs] = useState(d.handoffs || seedHandoffs);
  const [learnings, setLearnings] = useState(d.learnings || seedLearnings);
  const [tasks, setTasks] = useState(d.tasks || seedTasks);
  const [strategy, setStrategy] = useState(d.strategy || seedStrategy);
  const [pushLog, setPushLog] = useState(d.pushLog || {});
  const didMount = useRef(false);
  useEffect(() => {
    if (!onChange) return;
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    onChange({ goals, activities, tasks, handoffs, learnings, strategy, pushLog });
  }, [goals, activities, tasks, handoffs, learnings, strategy, pushLog]);
  const [view, setView] = useState("oversikt");
  const [period, setPeriod] = useState("Q2 2026");
  const [modal, setModal] = useState(null);
  useEffect(() => {
    if (!document.getElementById("mp-fonts")) {
      const l = document.createElement("link");
      l.id = "mp-fonts";
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap";
      document.head.appendChild(l);
    }
    if (!document.getElementById("mp-kf")) {
      const st = document.createElement("style");
      st.id = "mp-kf";
      st.textContent = "@keyframes mp-modalIn{from{opacity:0;transform:translateY(-10px) scale(.98)}to{opacity:1;transform:none}}";
      document.head.appendChild(st);
    }
  }, []);
  const goalsInPeriod = goals.filter((g) => g.period === period);
  const actsInPeriod = activities.filter((a) => a.period === period);
  const goalById = (id) => goals.find((g) => g.id === id);
  const actById = (id) => activities.find((a) => a.id === id);
  const budgetPlan = actsInPeriod.reduce((s, a) => s + a.budgetPlan, 0);
  const budgetActual = actsInPeriod.reduce((s, a) => s + a.budgetActual, 0);
  const openHandoffs = handoffs.filter((h) => h.status === "\xE5pen" && actsInPeriod.some((a) => a.id === h.activityId));
  const carryLearnings = learnings.filter((l) => l.carryToNext);
  const cycleActStatus = (id) => setActivities((as) => as.map((a) => a.id === id ? { ...a, status: ACT_STATUS[(ACT_STATUS.indexOf(a.status) + 1) % ACT_STATUS.length] } : a));
  const toggleGoalStatus = (id) => setGoals((gs) => gs.map((g) => g.id === id ? { ...g, status: g.status === "forslag" ? "omforent" : "forslag" } : g));
  const toggleHandoff = (id) => setHandoffs((hs) => hs.map((h) => h.id === id ? { ...h, status: h.status === "\xE5pen" ? "levert" : "\xE5pen" } : h));
  const toggleCarry = (id) => setLearnings((ls) => ls.map((l) => l.id === id ? { ...l, carryToNext: !l.carryToNext } : l));
  const delGoal = (id) => setGoals((g) => g.filter((x) => x.id !== id));
  const delAct = (id) => setActivities((a) => a.filter((x) => x.id !== id));
  const delHandoff = (id) => setHandoffs((h) => h.filter((x) => x.id !== id));
  const delLearning = (id) => setLearnings((l) => l.filter((x) => x.id !== id));
  const cycleTaskStatus = (id) => setTasks((ts) => ts.map((t) => t.id === id ? { ...t, status: TASK_STATUS[(TASK_STATUS.indexOf(t.status) + 1) % TASK_STATUS.length] } : t));
  const delTask = (id) => setTasks((ts) => ts.filter((x) => x.id !== id));
  const addSwot = (q, t) => setStrategy((s) => ({ ...s, swot: { ...s.swot, [q]: [...s.swot[q], t] } }));
  const removeSwot = (q, i) => setStrategy((s) => ({ ...s, swot: { ...s.swot, [q]: s.swot[q].filter((_, x) => x !== i) } }));
  const setStp = (k, v) => setStrategy((s) => ({ ...s, stp: { ...s.stp, [k]: v } }));
  const setAnsoff = (k) => setStrategy((s) => ({ ...s, ansoff: k }));
  const importStrategy = (p) => {
    const arr = (x) => Array.isArray(x) ? x.filter(Boolean).map(String) : null;
    setStrategy((s) => ({
      ...s,
      swot: {
        styrker: arr(p.swot && p.swot.styrker) || s.swot.styrker,
        svakheter: arr(p.swot && p.swot.svakheter) || s.swot.svakheter,
        muligheter: arr(p.swot && p.swot.muligheter) || s.swot.muligheter,
        trusler: arr(p.swot && p.swot.trusler) || s.swot.trusler
      },
      stp: {
        segment: p.stp && p.stp.segment || s.stp.segment,
        malgruppe: p.stp && p.stp.malgruppe || s.stp.malgruppe,
        posisjonering: p.stp && p.stp.posisjonering || s.stp.posisjonering
      },
      ansoff: ANSOFF.some((a) => a.key === p.ansoff) ? p.ansoff : s.ansoff
    }));
    let added = 0;
    if (Array.isArray(p.mal)) {
      const ng = p.mal.filter((m) => m && m.title).map((m) => ({
        id: uid(),
        title: String(m.title),
        owner: OWNERS.includes(m.owner) ? m.owner : "felles",
        status: "forslag",
        metric: m.metric || "M\xE5l",
        unit: ["kr", "stk", "%", "visn."].includes(m.unit) ? m.unit : "stk",
        target: Number(m.target) || 0,
        actual: 0,
        period,
        funnel: FUNNEL.some((f) => f.key === m.funnel) ? m.funnel : "vurdering",
        kpiType: m.kpiType === "leading" ? "leading" : "lagging",
        parent: m.parent || ""
      }));
      if (ng.length) {
        setGoals((gs) => [...gs, ...ng]);
        added = ng.length;
      }
    }
    const swotN = ["styrker", "svakheter", "muligheter", "trusler"].reduce((n, k) => n + (arr(p.swot && p.swot[k]) || []).length, 0);
    return { swot: swotN, goals: added };
  };
  const portalItems = buildPortalPush(activities, tasks);
  const sendToPortal = async () => {
    const res = await pushToStyringsportal(portalItems, { push: onPushToPortal });
    if (res.ok) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      setPushLog((p) => {
        const n = { ...p };
        portalItems.forEach((it) => {
          n[it.externalId] = now;
        });
        return n;
      });
    }
    return res;
  };
  const tabs = [["oversikt", "Oversikt"], ["strategi", "Strategi"], ["mal", "M\xE5l"], ["trakt", "Trakt"], ["samhandling", "Samhandling"], ["aktiviteter", "Aktiviteter"], ["tidslinje", "Aktivitetskart"], ["oppgaver", "Oppgaver"], ["laering", "L\xE6ring"]];
  return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", fontFamily: sans, color: C.ink, background: embedded ? "transparent" : C.bg, minHeight: embedded ? "auto" : 680, borderRadius: embedded ? 0 : 16, overflow: "hidden", border: embedded ? "none" : `1px solid ${C.line}` } }, !embedded && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 26px", borderBottom: `1px solid ${C.line}`, background: C.surface } }, /* @__PURE__ */ React.createElement(Logo, null), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: C.gold } }, "Styringsportal")), /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 26px 0" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, fontWeight: 600, color: C.gold, letterSpacing: 1, textTransform: "uppercase" } }, "Marked \xD7 Salg"), /* @__PURE__ */ React.createElement("h1", { style: { margin: "4px 0 2px", fontFamily: serif, fontSize: 27, fontWeight: 600, letterSpacing: -0.3 } }, "Markedsplan"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 13, color: C.inkSoft } }, "Fagspine: ", /* @__PURE__ */ React.createElement("strong", { style: { fontWeight: 600 } }, "SOSTAC"), " \u2014 situasjon \xB7 m\xE5l \xB7 strategi \xB7 taktikk \xB7 handling \xB7 kontroll.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(Btn, { small: true, variant: "ghost", onClick: () => setModal({ kind: "sync" }), title: "Send aktiviteter og oppgaver med ansvarlig til Styringsportalen" }, "Synk ansvarlige \u2192 Portal", portalItems.length ? ` (${portalItems.length})` : ""), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: C.inkSoft, fontWeight: 600 } }, "Periode"), /* @__PURE__ */ React.createElement("select", { value: period, onChange: (e) => setPeriod(e.target.value), style: { ...inputStyle, width: "auto", padding: "7px 10px", background: C.surface } }, PERIODS.map((p) => /* @__PURE__ */ React.createElement("option", { key: p }, p)))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 2, marginTop: 18, borderBottom: `1px solid ${C.line}`, flexWrap: "wrap" } }, tabs.map(([k, label]) => /* @__PURE__ */ React.createElement("button", { key: k, onClick: () => setView(k), style: { fontFamily: sans, fontSize: 13.5, fontWeight: 600, cursor: "pointer", border: "none", background: "none", padding: "10px 12px", color: view === k ? C.ink : C.inkFaint, borderBottom: view === k ? `2px solid ${C.gold}` : "2px solid transparent", marginBottom: -1 } }, label)))), /* @__PURE__ */ React.createElement("div", { style: { padding: "20px 26px 28px" } }, view === "oversikt" && /* @__PURE__ */ React.createElement(Oversikt, { goalsInPeriod, actsInPeriod, budgetPlan, budgetActual, openHandoffs, carryLearnings, actById, strategy, setView }), view === "strategi" && /* @__PURE__ */ React.createElement(StrategiView, { strategy, onAddSwot: addSwot, onRemoveSwot: removeSwot, onSetStp: setStp, onSetAnsoff: setAnsoff }), view === "mal" && /* @__PURE__ */ React.createElement(MalView, { goalsInPeriod, onAdd: () => setModal({ kind: "goal", data: { period } }), onEdit: (g) => setModal({ kind: "goal", data: g }), onToggleStatus: toggleGoalStatus, onDelete: delGoal }), view === "trakt" && /* @__PURE__ */ React.createElement(TraktView, { activities, goals, handoffs, onEdit: (a) => setModal({ kind: "activity", data: a }) }), view === "samhandling" && /* @__PURE__ */ React.createElement(SamhandlingView, { goals, activities, tasks, handoffs, actById, onAddHandoff: (aid) => setModal({ kind: "handoff", data: { activityId: aid || "" } }), onEditHandoff: (h) => setModal({ kind: "handoff", data: h }), onToggleHandoff: toggleHandoff, onDelHandoff: delHandoff }), view === "aktiviteter" && /* @__PURE__ */ React.createElement(AktiviteterView, { actsInPeriod, goalById, handoffs, pushLog, onAdd: () => setModal({ kind: "activity", data: { period } }), onEdit: (a) => setModal({ kind: "activity", data: a }), onCycleStatus: cycleActStatus, onToggleHandoff: toggleHandoff, onAddHandoff: (aid) => setModal({ kind: "handoff", data: { activityId: aid || "" } }), onDelete: delAct }), view === "tidslinje" && /* @__PURE__ */ React.createElement(AktivitetskartView, { activities, goalById, onEdit: (a) => setModal({ kind: "activity", data: a }), onAdd: () => setModal({ kind: "activity", data: { period } }) }), view === "oppgaver" && /* @__PURE__ */ React.createElement(OppgaverView, { tasks, actById, pushLog, onAdd: () => setModal({ kind: "task", data: { period } }), onEdit: (t) => setModal({ kind: "task", data: t }), onCycleStatus: cycleTaskStatus, onDelete: delTask, onSync: () => setModal({ kind: "sync" }) }), view === "laering" && /* @__PURE__ */ React.createElement(LaeringView, { learnings, goalById, actById, onAdd: () => setModal({ kind: "learning", data: { period } }), onToggleCarry: toggleCarry, onDelete: delLearning })), modal?.kind === "goal" && /* @__PURE__ */ React.createElement(GoalModal, { data: modal.data, onClose: () => setModal(null), onSave: (g) => {
    setGoals((gs) => g.id ? gs.map((x) => x.id === g.id ? g : x) : [...gs, { ...g, id: uid() }]);
    setModal(null);
  } }), modal?.kind === "activity" && /* @__PURE__ */ React.createElement(ActivityModal, { data: modal.data, goals, members, onClose: () => setModal(null), onSave: (a) => {
    setActivities((as) => a.id ? as.map((x) => x.id === a.id ? a : x) : [...as, { ...a, id: uid() }]);
    setModal(null);
  } }), modal?.kind === "learning" && /* @__PURE__ */ React.createElement(LearningModal, { data: modal.data, goals, activities, onClose: () => setModal(null), onSave: (l) => {
    setLearnings((ls) => l.id ? ls.map((x) => x.id === l.id ? l : x) : [...ls, { ...l, id: uid() }]);
    setModal(null);
  } }), modal?.kind === "task" && /* @__PURE__ */ React.createElement(TaskModal, { data: modal.data, activities, members, onClose: () => setModal(null), onSave: (t) => {
    setTasks((ts) => t.id ? ts.map((x) => x.id === t.id ? t : x) : [...ts, { ...t, id: uid() }]);
    setModal(null);
  } }), modal?.kind === "handoff" && /* @__PURE__ */ React.createElement(HandoffModal, { data: modal.data, activities, onClose: () => setModal(null), onSave: (h) => {
    setHandoffs((hs) => h.id ? hs.map((x) => x.id === h.id ? h : x) : [...hs, { ...h, id: uid() }]);
    setModal(null);
  } }), modal?.kind === "sync" && /* @__PURE__ */ React.createElement(SyncModal, { items: portalItems, pushLog, onSend: sendToPortal, onClose: () => setModal(null) }));
}
function Oversikt({ goalsInPeriod, actsInPeriod, budgetPlan, budgetActual, openHandoffs, carryLearnings, actById, strategy, setView }) {
  const omforent = goalsInPeriod.filter((g) => g.status === "omforent");
  const statusCount = ACT_STATUS.reduce((o, s) => (o[s] = actsInPeriod.filter((a) => a.status === s).length, o), {});
  const loop = [
    { key: "mal", tone: C.marked, label: "Plan & m\xE5l", big: goalsInPeriod.length, sub: `${omforent.length} omforent` },
    { key: "aktiviteter", tone: C.marked, label: "Utf\xF8ring", big: actsInPeriod.length, sub: `${statusCount["p\xE5g\xE5r"]} p\xE5g\xE5r \xB7 ${statusCount["planlagt"]} planlagt` },
    { key: "tidslinje", tone: C.gold, label: "Oppf\xF8lging", big: fmt(budgetActual, "kr"), sub: `av ${fmt(budgetPlan, "kr")} planlagt`, small: true },
    { key: "laering", tone: C.gold, label: "Analyse & l\xE6r", big: carryLearnings.length, sub: "tas med videre" }
  ];
  const stats = funnelStats(actsInPeriod);
  const swotCount = Object.values(strategy.swot).reduce((s, a) => s + a.length, 0);
  const ansoff = ANSOFF.find((a) => a.key === strategy.ansoff);
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 18 } }, loop.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i, onClick: () => setView(s.key), style: { cursor: "pointer", background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px", borderTop: `3px solid ${s.tone}` } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: s.tone, letterSpacing: 0.3, textTransform: "uppercase" } }, s.label), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: serif, fontSize: s.small ? 21 : 30, fontWeight: 600, margin: "6px 0 2px", color: C.ink } }, s.big), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: C.inkSoft } }, s.sub)))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 } }, /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("h3", { style: { margin: "0 0 14px", fontFamily: serif, fontSize: 17, fontWeight: 600 } }, "Omforente m\xE5l"), omforent.length === 0 && /* @__PURE__ */ React.createElement(Empty, null, "Ingen omforente m\xE5l i denne perioden enn\xE5."), omforent.map((g) => /* @__PURE__ */ React.createElement("div", { key: g.id, style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, fontWeight: 600 } }, g.title), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: C.inkSoft, whiteSpace: "nowrap" } }, fmt(g.actual, g.unit), " / ", fmt(g.target, g.unit))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement(Bar, { value: g.actual, max: g.target, color: pct(g.actual, g.target) >= 100 ? C.fullfort : C.gold }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: C.gold, width: 38, textAlign: "right" } }, pct(g.actual, g.target), "%"))))), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("h3", { style: { margin: "0 0 14px", fontFamily: serif, fontSize: 17, fontWeight: 600 } }, "\xC5pne overleveringer"), openHandoffs.length === 0 && /* @__PURE__ */ React.createElement(Empty, null, "Ingen \xE5pne overleveringer. Salg og marked er i takt."), openHandoffs.map((h) => {
    const a = actById(h.activityId);
    return /* @__PURE__ */ React.createElement("div", { key: h.id, style: { padding: "10px 0", borderBottom: `1px solid ${C.line}` } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 4 } }, /* @__PURE__ */ React.createElement(OwnerBadge, { owner: h.from }), /* @__PURE__ */ React.createElement("span", { style: { color: C.inkFaint } }, "\u2192"), /* @__PURE__ */ React.createElement(OwnerBadge, { owner: h.to }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: C.inkFaint, marginLeft: "auto" } }, "frist ", h.due)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: C.ink } }, h.description), a && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.inkFaint, marginTop: 2 } }, a.title));
  }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 16 } }, /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, fontFamily: serif, fontSize: 17, fontWeight: 600 } }, "Trakt-balanse"), /* @__PURE__ */ React.createElement("button", { onClick: () => setView("trakt"), style: { border: "none", background: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: C.gold } }, "Se trakt \u2192")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", height: 14, borderRadius: 999, overflow: "hidden", border: `1px solid ${C.line}` } }, stats.map((s) => /* @__PURE__ */ React.createElement("div", { key: s.key, title: `${s.label}: ${s.share}%`, style: { width: s.share + "%", background: OWNER_COLOR[s.owner], borderRight: `1px solid ${C.surface}` } }))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, display: "grid", gap: 4 } }, stats.map((s) => /* @__PURE__ */ React.createElement("div", { key: s.key, style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 9, height: 9, borderRadius: 3, background: OWNER_COLOR[s.owner] } }), /* @__PURE__ */ React.createElement("span", { style: { color: C.ink } }, s.label), /* @__PURE__ */ React.createElement("span", { style: { color: C.inkFaint } }, s.fw), /* @__PURE__ */ React.createElement("span", { style: { marginLeft: "auto", color: C.inkSoft, fontWeight: 600 } }, s.share, "%"))))), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, fontFamily: serif, fontSize: 17, fontWeight: 600 } }, "Strategisk grunnlag"), /* @__PURE__ */ React.createElement("button", { onClick: () => setView("strategi"), style: { border: "none", background: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: C.gold } }, "Rediger \u2192")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 10, fontSize: 13 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { color: C.inkSoft } }, "SWOT-punkter"), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600 } }, swotCount)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { color: C.inkSoft } }, "Posisjonering"), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600, color: strategy.stp.posisjonering ? C.fullfort : C.inkFaint } }, strategy.stp.posisjonering ? "satt" : "mangler")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { color: C.inkSoft } }, "Vekstretning"), /* @__PURE__ */ React.createElement(Badge, { color: C.goldDeep, wash: C.goldWash }, ansoff?.label)), /* @__PURE__ */ React.createElement("p", { style: { margin: "4px 0 0", fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5, fontStyle: "italic" } }, "\xAB", strategy.stp.posisjonering, "\xBB")))), /* @__PURE__ */ React.createElement(Note, null, "Sl\xF8yfen lukkes i fanen ", /* @__PURE__ */ React.createElement("strong", null, "L\xE6ring"), ": marker innsikt som \xABtas med til neste plan\xBB. Start i ", /* @__PURE__ */ React.createElement("strong", null, "Strategi"), " (last gjerne opp strategidokumentet), sett SMART-", /* @__PURE__ */ React.createElement("strong", null, "m\xE5l"), ", fordel innsatsen i ", /* @__PURE__ */ React.createElement("strong", null, "Trakt"), ", og se helheten i ", /* @__PURE__ */ React.createElement("strong", null, "Aktivitetskart"), "."));
}
function SwotBox({ q, items, onAdd, onRemove }) {
  const [val, setVal] = useState("");
  const add = () => {
    if (val.trim()) {
      onAdd(q.key, val.trim());
      setVal("");
    }
  };
  return /* @__PURE__ */ React.createElement("div", { style: { background: q.wash, border: `1px solid ${q.color}`, borderRadius: 12, padding: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: serif, fontSize: 16, fontWeight: 600, color: q.color } }, q.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 0.5 } }, q.sub)), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 6, marginBottom: 10 } }, items.length === 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: C.inkFaint, fontStyle: "italic" } }, "Ingen punkter enn\xE5."), items.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", alignItems: "flex-start", gap: 6, fontSize: 13, background: C.surface, borderRadius: 7, padding: "6px 9px" } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1, lineHeight: 1.4 } }, it), /* @__PURE__ */ React.createElement("button", { onClick: () => onRemove(q.key, i), style: { border: "none", background: "none", cursor: "pointer", color: C.inkFaint, fontSize: 15, lineHeight: 1 } }, "\xD7")))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("input", { value: val, onChange: (e) => setVal(e.target.value), onKeyDown: (e) => e.key === "Enter" && add(), placeholder: "Legg til punkt\u2026", style: { ...inputStyle, padding: "6px 9px", fontSize: 13, background: C.surface } }), /* @__PURE__ */ React.createElement(Btn, { small: true, variant: "ghost", onClick: add }, "+")));
}
function StrategiView({ strategy, onAddSwot, onRemoveSwot, onSetStp, onSetAnsoff }) {
  const p = strategy.plattform, m = strategy.merkevare, st = strategy.studio;
  const darkLabel = { fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "#A89B86", marginBottom: 6 };
  const lightLabel = { fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: C.inkFaint, marginBottom: 2 };
  const secLabel = { fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: C.inkFaint, marginBottom: 8 };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Toolbar, { title: "Strategi", subtitle: "Vikingbads strategiske plattform 2024\u20132028 \u2014 fundamentet markedsplanen bygger p\xE5." }), /* @__PURE__ */ React.createElement(Card, { style: { marginBottom: 18, background: C.ink, border: "none", padding: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: "#C9A87C", marginBottom: 14 } }, "Strategisk plattform \xB7 Vikingbad"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 } }, [["B\xE6rende id\xE9", p.baerendeIde], ["Strategisk kjerne", p.kjerne], ["Strategisk oppgave", p.oppgave], ["B\xE6rende opplevelse", p.opplevelse], ["L\xF8fte", p.lofte]].map(([label, val]) => /* @__PURE__ */ React.createElement("div", { key: label, style: { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.16)", borderRadius: 10, padding: "12px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: darkLabel }, label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: "#F4F0E6", lineHeight: 1.4, fontFamily: serif } }, val))), /* @__PURE__ */ React.createElement("div", { style: { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.16)", borderRadius: 10, padding: "12px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: darkLabel }, "Kulturord"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, p.kulturord.map((k) => /* @__PURE__ */ React.createElement("span", { key: k, style: { fontSize: 12, fontWeight: 600, color: "#F4F0E6", background: "rgba(201,168,124,.18)", border: "1px solid rgba(201,168,124,.4)", padding: "3px 9px", borderRadius: 999 } }, k)))))), /* @__PURE__ */ React.createElement(Card, { style: { marginBottom: 24, padding: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("h3", { style: { margin: 0, fontFamily: serif, fontSize: 18, fontWeight: 600 } }, "Vikingbad Studio \u2014 strategisk satsing"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, fontWeight: 600, color: C.gold } }, "Ambisjon: ~400 \u2192 1 000 MNOK innen 2030")), /* @__PURE__ */ React.createElement("p", { style: { margin: "0 0 14px", fontSize: 13, color: C.inkSoft, lineHeight: 1.5 } }, st.differensiering), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 16 } }, [["63 %", "av omsetningen skjer utenfor faghandelen"], ["78 %", "vil ha fiks ferdig bad til avtalt tid og pris"], ["72 %", "sliter med \xE5 finne h\xE5ndverkere de stoler p\xE5"], ["64 %", "synes det er vanskelig \xE5 kj\xF8pe alle produktene"]].map(([n, t]) => /* @__PURE__ */ React.createElement("div", { key: n, style: { background: C.goldWash, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: serif, fontSize: 22, fontWeight: 600, color: C.goldDeep, lineHeight: 1 } }, n), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.inkSoft, marginTop: 4, lineHeight: 1.35 } }, t)))), /* @__PURE__ */ React.createElement("div", { style: secLabel }, "Svaret: Vikingbad Studio"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 } }, st.modell.map((x) => /* @__PURE__ */ React.createElement("span", { key: x, style: { fontSize: 12, color: C.ink, background: C.surfaceAlt, border: `1px solid ${C.line}`, padding: "4px 10px", borderRadius: 999 } }, x))), /* @__PURE__ */ React.createElement("div", { style: secLabel }, "Studio-kundereisen (salgsprosessen)"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 16 } }, st.kundereise.map((step, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: step }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, fontWeight: 600, color: C.ink, background: C.surface, border: `1.5px solid ${C.lineStrong}`, borderRadius: 999, padding: "5px 12px" } }, step), i < st.kundereise.length - 1 && /* @__PURE__ */ React.createElement("span", { style: { color: C.inkFaint, fontSize: 13 } }, "\u2192")))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: C.inkSoft, lineHeight: 1.5, borderTop: `1px solid ${C.line}`, paddingTop: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { color: C.ink, fontWeight: 600 } }, "Rollen: "), st.rolle), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: C.marked, lineHeight: 1.5, marginTop: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600 } }, "Marked: "), st.marked)), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 } }, /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("h3", { style: { margin: "0 0 12px", fontFamily: serif, fontSize: 17, fontWeight: 600 } }, "Merkevare"), [["Arketype", m.arketype], ["Merkekjerne", m.merkekjerne], ["Visuell identitet", m.visuell]].map(([l, v]) => /* @__PURE__ */ React.createElement("div", { key: l, style: { marginBottom: 11 } }, /* @__PURE__ */ React.createElement("div", { style: lightLabel }, l), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: C.ink, lineHeight: 1.45 } }, v)))), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("h3", { style: { margin: "0 0 12px", fontFamily: serif, fontSize: 17, fontWeight: 600 } }, "Kommunikasjon"), [["Kjernebudskap", m.kjernebudskap], ["Sekund\xE6rbudskap", m.sekundaer], ["Stil & tone", m.stilTone]].map(([l, v]) => /* @__PURE__ */ React.createElement("div", { key: l, style: { marginBottom: 11 } }, /* @__PURE__ */ React.createElement("div", { style: lightLabel }, l), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: C.ink, lineHeight: 1.45 } }, v))))), /* @__PURE__ */ React.createElement("h3", { style: { margin: "0 0 4px", fontFamily: serif, fontSize: 16, fontWeight: 600 } }, "Situasjonsanalyse \u2014 SWOT"), /* @__PURE__ */ React.createElement("p", { style: { margin: "0 0 12px", fontSize: 12.5, color: C.inkSoft } }, "Internt (styrker/svakheter) og eksternt (muligheter/trusler). Rediger fritt \u2014 spill styrker mot muligheter, demp svakheter mot trusler."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 24 } }, SWOT.map((q) => /* @__PURE__ */ React.createElement(SwotBox, { key: q.key, q, items: strategy.swot[q.key], onAdd: onAddSwot, onRemove: onRemoveSwot }))), /* @__PURE__ */ React.createElement("h3", { style: { margin: "0 0 4px", fontFamily: serif, fontSize: 16, fontWeight: 600 } }, "Strategi \u2014 STP"), /* @__PURE__ */ React.createElement("p", { style: { margin: "0 0 12px", fontSize: 12.5, color: C.inkSoft } }, "Segmentering \u2192 targeting (m\xE5lgruppe) \u2192 posisjonering. Hentet fra strategidokumentet \u2014 rediger ved behov."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 12, marginBottom: 24 } }, [["segment", "Segmentering", "Hvilke segmenter finnes i markedet?"], ["malgruppe", "M\xE5lgruppe (targeting)", "Hvilke(t) segment satser vi p\xE5?"], ["posisjonering", "Posisjonering", "Hva skal vi eie i kundens hode?"]].map(([k, label, ph]) => /* @__PURE__ */ React.createElement(Card, { key: k, style: { padding: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 6 } }, label), /* @__PURE__ */ React.createElement("textarea", { value: strategy.stp[k], onChange: (e) => onSetStp(k, e.target.value), placeholder: ph, style: { ...inputStyle, minHeight: 56, resize: "vertical", background: C.surface } })))), /* @__PURE__ */ React.createElement("h3", { style: { margin: "0 0 4px", fontFamily: serif, fontSize: 16, fontWeight: 600 } }, "Vekstretning \u2014 Ansoff"), /* @__PURE__ */ React.createElement("p", { style: { margin: "0 0 12px", fontSize: 12.5, color: C.inkSoft } }, "Den strategiske kjernen \u2014 et mer komplett \xABhelt ferdig\xBB-konsept som henter forbrukere tilbake til faghandelen \u2014 peker mot produktutvikling."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, ANSOFF.map((a) => {
    const on = strategy.ansoff === a.key;
    return /* @__PURE__ */ React.createElement("button", { key: a.key, onClick: () => onSetAnsoff(a.key), style: { textAlign: "left", cursor: "pointer", fontFamily: sans, background: on ? C.goldWash : C.surface, border: `1.5px solid ${on ? C.gold : C.line}`, borderRadius: 12, padding: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14.5, fontWeight: 600, color: on ? C.goldDeep : C.ink } }, a.label), on && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: C.goldDeep } }, "\u2713 valgt")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: C.inkSoft, lineHeight: 1.4 } }, a.desc), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.inkFaint, marginTop: 4 } }, a.risk));
  })), /* @__PURE__ */ React.createElement(Note, null, "Dette er Vikingbads strategiske plattform og Studio-satsing (2024\u20132028). Plattform, merkevare, kommunikasjon og Studio-modellen er det faste fundamentet; SWOT, STP og vekstretning er den arbeidende analysen markedsm\xE5lene forankres i."));
}
function TraktView({ activities, goals, handoffs, onEdit }) {
  const stats = funnelStats(activities);
  const openSeam = handoffs.filter((h) => h.status === "\xE5pen" && h.from === "marked" && h.to === "salg").length;
  const widths = [100, 86, 72, 58];
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Toolbar, { title: "Trakt", subtitle: "Aktiviteter og m\xE5l fordelt p\xE5 kundereisen (See\u2013Think\u2013Do\u2013Care). Marked eier toppen, salg eier bunnen \u2014 overleveringen ligger i s\xF8mmen." }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 0 } }, stats.map((s, i) => {
    const goalsHere = goals.filter((g) => g.funnel === s.key);
    return /* @__PURE__ */ React.createElement(React.Fragment, { key: s.key }, i === 2 && /* @__PURE__ */ React.createElement("div", { style: { width: "79%", margin: "2px auto 8px", display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontSize: 12, fontWeight: 600, color: C.salg } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1, height: 1, background: C.lineStrong } }), /* @__PURE__ */ React.createElement("span", { style: { whiteSpace: "nowrap" } }, "\u2193 Overlevering \xB7 Marked \u2192 Salg", openSeam ? ` (${openSeam} \xE5pen)` : ""), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, height: 1, background: C.lineStrong } })), /* @__PURE__ */ React.createElement("div", { style: { width: widths[i] + "%", margin: "0 auto 8px", background: OWNER_WASH[s.owner], border: `1px solid ${OWNER_COLOR[s.owner]}`, borderRadius: 10, padding: "12px 16px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: s.acts.length ? 10 : 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: serif, fontSize: 17, fontWeight: 600, color: C.ink } }, s.label), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, fontWeight: 700, color: OWNER_COLOR[s.owner], letterSpacing: 0.5 } }, s.fw), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: C.inkSoft } }, "\xB7 ", s.desc)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement(OwnerBadge, { owner: s.owner }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: C.inkSoft, fontWeight: 600 } }, fmt(s.budget, "kr"), " \xB7 ", s.share, "%"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 7, flexWrap: "wrap" } }, s.acts.map((a) => /* @__PURE__ */ React.createElement("button", { key: a.id, onClick: () => onEdit(a), title: "Rediger", style: { cursor: "pointer", fontFamily: sans, fontSize: 11.5, fontWeight: 600, background: C.surface, border: `1px solid ${OWNER_COLOR[s.owner]}`, color: C.ink, padding: "4px 10px", borderRadius: 999 } }, a.title, " ", /* @__PURE__ */ React.createElement("span", { style: { color: C.inkFaint } }, "\xB7 ", fmt(a.budgetPlan, "kr")))), goalsHere.map((g) => /* @__PURE__ */ React.createElement("span", { key: g.id, style: { fontSize: 11, fontWeight: 600, background: "transparent", border: `1px dashed ${C.lineStrong}`, color: C.inkSoft, padding: "4px 10px", borderRadius: 999 } }, "\u25CE ", g.title)), s.acts.length === 0 && goalsHere.length === 0 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: C.inkFaint, fontStyle: "italic" } }, "Ingen aktiviteter her enn\xE5."))));
  })), /* @__PURE__ */ React.createElement(Note, null, /* @__PURE__ */ React.createElement("strong", null, "Slik leser du den:"), " bredden illustrerer trakten \u2014 bevissthet er bredest, lojalitet smalest. Stripene er aktiviteter (klikk for \xE5 redigere), stiplede \u25CE er m\xE5l. En sunn plan har aktiviteter i ", /* @__PURE__ */ React.createElement("em", null, "hele"), " trakten. Ligger nesten alt budsjett i bevissthet, skapes interesse uten at noen h\xF8ster den nederst."));
}
function AktivitetskartView({ activities, goalById, onEdit, onAdd }) {
  const [groupBy, setGroupBy] = useState("funnel");
  const now = /* @__PURE__ */ new Date();
  const curMonth = now.getMonth() + 1;
  const nowPct = Math.min(100, Math.max(0, (now.getMonth() + now.getDate() / 30) / 12 * 100));
  const LABELW = 210, GAP = 14, BAR_H = 28;
  let lanes;
  if (groupBy === "funnel") lanes = FUNNEL.map((f) => ({ key: f.key, label: f.label, fw: f.fw, owner: f.owner, tint: OWNER_WASH[f.owner], accent: OWNER_COLOR[f.owner], items: activities.filter((a) => a.funnel === f.key) }));
  else if (groupBy === "owner") lanes = OWNERS.map((o) => ({ key: o, label: OWNER_LABEL[o], owner: o, tint: OWNER_WASH[o], accent: OWNER_COLOR[o], items: activities.filter((a) => a.owner === o) }));
  else lanes = CHANNELS.map((c) => ({ key: c, label: c, tint: C.surfaceAlt, accent: C.lineStrong, items: activities.filter((a) => a.channel === c) })).filter((l) => l.items.length);
  const total = activities.reduce((s, a) => s + a.budgetPlan, 0);
  const paagaar = activities.filter((a) => a.status === "p\xE5g\xE5r").length;
  const monthBudget = Array(12).fill(0), monthCount = Array(12).fill(0);
  activities.forEach((a) => {
    const s = Math.max(1, a.start), e = Math.min(12, a.end);
    const span = Math.max(1, e - s + 1);
    const per = a.budgetPlan / span;
    for (let mo = s; mo <= e; mo++) {
      monthBudget[mo - 1] += per;
      monthCount[mo - 1] += 1;
    }
  });
  const maxMB = Math.max(1, ...monthBudget);
  const peakMonth = monthBudget.indexOf(Math.max(...monthBudget));
  const gridlines = `repeating-linear-gradient(to right, transparent 0, transparent calc(100%/12 - 1px), ${C.line} calc(100%/12 - 1px), ${C.line} calc(100%/12))`;
  const groupName = { funnel: "trinn i kundereisen (See\u2013Think\u2013Do\u2013Care)", owner: "hvem som eier aktiviteten", channel: "kanaler" }[groupBy];
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Toolbar, { title: "Aktivitetskart", subtitle: "Alle aktiviteter gjennom \xE5ret, fordelt p\xE5 kundereisen. Se b\xE5de n\xE5r noe skjer, hvem som eier det, og hvordan budsjettet fordeler seg.", onAdd, addLabel: "Ny aktivitet" }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 26 } }, [[activities.length, "aktiviteter"], [fmt(total, "kr"), "planlagt budsjett"], [paagaar, "p\xE5g\xE5r n\xE5"]].map(([b, l], i) => /* @__PURE__ */ React.createElement("div", { key: i }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: serif, fontSize: 24, fontWeight: 600, color: C.ink, lineHeight: 1 } }, b), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.inkSoft, marginTop: 3 } }, l)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: C.inkSoft, fontWeight: 600 } }, "Grupper:"), [["funnel", "Trakt-trinn"], ["owner", "Eier"], ["channel", "Kanal"]].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { key: k, onClick: () => setGroupBy(k), style: { fontFamily: sans, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: "5px 12px", borderRadius: 999, border: `1px solid ${groupBy === k ? C.gold : C.line}`, background: groupBy === k ? C.goldWash : C.surface, color: groupBy === k ? C.goldDeep : C.inkSoft } }, l)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 14, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: C.inkFaint } }, "Eier"), OWNERS.map((o) => /* @__PURE__ */ React.createElement("span", { key: o, style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: C.inkSoft } }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 999, background: OWNER_COLOR[o] } }), OWNER_LABEL[o]))), /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: C.inkFaint } }, "Status"), ACT_STATUS.map((s) => {
    const [c] = statusColors(s);
    return /* @__PURE__ */ React.createElement("span", { key: s, style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: C.inkSoft } }, /* @__PURE__ */ React.createElement("span", { style: { width: 11, height: 11, borderRadius: 3, background: c } }), s);
  })), /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", gap: 10, alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: C.inkSoft } }, "\u25C6 lansering"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: C.inkSoft } }, "\u221E alltid-p\xE5"))), /* @__PURE__ */ React.createElement(Card, { style: { padding: "16px 18px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: GAP, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { width: LABELW, flexShrink: 0 } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", marginBottom: 2 } }, ["Q1", "Q2", "Q3", "Q4"].map((q) => /* @__PURE__ */ React.createElement("div", { key: q, style: { textAlign: "center", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: C.inkSoft, padding: "2px 0" } }, q))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(12,1fr)" } }, MONTHS.map((m, i) => /* @__PURE__ */ React.createElement("div", { key: m, style: { textAlign: "center", fontSize: 10.5, fontWeight: i + 1 === curMonth ? 700 : 400, color: i + 1 === curMonth ? C.goldDeep : C.inkFaint, padding: "2px 0" } }, m))))), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 0, bottom: 0, left: LABELW + GAP, right: 0, zIndex: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(4,1fr)" } }, [0, 1, 2, 3].map((i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { background: i % 2 === 0 ? C.surfaceAlt : "transparent", opacity: 0.45 } }))), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, background: gridlines } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 0, bottom: 0, left: (curMonth - 1) / 12 * 100 + "%", width: 100 / 12 + "%", background: C.goldWash, opacity: 0.55 } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 0, bottom: 0, left: nowPct + "%", width: 0, borderLeft: `2px dashed ${C.gold}` } }, /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", top: -3, left: 0, transform: "translateX(-50%)", fontSize: 10, fontWeight: 700, color: "#fff", background: C.gold, padding: "1px 6px", borderRadius: 999 } }, "n\xE5"))), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", zIndex: 1, paddingTop: 6 } }, activities.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: "22px 4px" } }, /* @__PURE__ */ React.createElement(Empty, null, "Ingen aktiviteter enn\xE5 \u2014 legg til den f\xF8rste med \xAB+ Ny aktivitet\xBB.")), lanes.map((lane, li) => {
    const rows = packRows(lane.items);
    const budget = lane.items.reduce((s, a) => s + a.budgetPlan, 0);
    const seam = groupBy === "funnel" && li > 0 && lanes[li - 1].owner === "marked" && lane.owner === "salg";
    return /* @__PURE__ */ React.createElement(React.Fragment, { key: lane.key }, seam && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: GAP, alignItems: "center", margin: "2px 0 8px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: LABELW, flexShrink: 0, textAlign: "right", fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: C.gold } }, "Marked \u2192 Salg \u21C4"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, borderTop: `2px dashed ${C.gold}`, opacity: 0.7 } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: GAP, alignItems: "stretch", marginBottom: 8, opacity: lane.items.length ? 1 : 0.6 } }, /* @__PURE__ */ React.createElement("div", { style: { width: LABELW, flexShrink: 0, background: lane.tint, borderRadius: 10, padding: "10px 13px", display: "flex", flexDirection: "column", justifyContent: "center", border: `1px solid ${lane.accent}33` } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 7 } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: serif, fontSize: 15, fontWeight: 600, color: C.ink } }, lane.label), lane.fw && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: lane.accent, letterSpacing: 0.4 } }, lane.fw)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.inkSoft, marginTop: 3 } }, lane.items.length, " aktiviteter \xB7 ", fmt(budget, "kr")), groupBy === "funnel" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 7 } }, /* @__PURE__ */ React.createElement(OwnerBadge, { owner: lane.owner }))), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "grid", gap: 6, padding: "6px 0", alignContent: "center", minHeight: BAR_H + 12 } }, lane.items.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.inkFaint, fontStyle: "italic", paddingLeft: 4 } }, "ingen aktiviteter her enn\xE5"), rows.map((row, ri) => /* @__PURE__ */ React.createElement("div", { key: ri, style: { display: "grid", gridTemplateColumns: "repeat(12,1fr)", height: BAR_H } }, row.map((a) => {
      const [sc] = statusColors(a.status);
      const span = a.end - a.start + 1;
      const dashed = a.type === "alltid-p\xE5";
      return /* @__PURE__ */ React.createElement("button", { key: a.id, onClick: () => onEdit(a), title: `${a.title} \u2014 ${OWNER_LABEL[a.owner]} \xB7 ${a.status} \xB7 ${FUNNEL_LABEL[a.funnel]} \xB7 ${MONTHS[a.start - 1]}\u2013${MONTHS[a.end - 1]} \xB7 ${fmt(a.budgetPlan, "kr")}`, style: { gridColumn: `${a.start} / ${a.end + 1}`, height: BAR_H, margin: "0 3px", display: "flex", alignItems: "center", gap: 6, padding: "0 9px", background: C.surface, border: dashed ? `1px dashed ${lane.accent}` : `1px solid ${C.line}`, borderLeft: `4px solid ${sc}`, borderRadius: 8, cursor: "pointer", overflow: "hidden", boxShadow: "0 1px 2px rgba(37,37,37,.04)", textAlign: "left" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: 999, background: OWNER_COLOR[a.owner], flexShrink: 0 } }), a.type === "lansering" && /* @__PURE__ */ React.createElement("span", { style: { color: sc, fontSize: 11 } }, "\u25C6"), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, fontSize: 12.5, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, a.title), span >= 2 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: C.inkFaint, whiteSpace: "nowrap" } }, dashed ? "\u221E" : kShort(a.budgetPlan)));
    }))))));
  }))), activities.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, paddingTop: 14, borderTop: `1px solid ${C.line}` } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: GAP, alignItems: "flex-end" } }, /* @__PURE__ */ React.createElement("div", { style: { width: LABELW, flexShrink: 0, paddingBottom: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: serif, fontSize: 14, fontWeight: 600, color: C.ink } }, "Budsjett per m\xE5ned"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.inkSoft, marginTop: 2 } }, "jevnt fordelt over l\xF8petid \xB7 topp i ", MONTHS[peakMonth])), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "grid", gridTemplateColumns: "repeat(12,1fr)", alignItems: "end", height: 72 } }, monthBudget.map((b, i) => {
    const h = Math.round(b / maxMB * 100);
    const isCur = i + 1 === curMonth;
    return /* @__PURE__ */ React.createElement("div", { key: i, title: `${MONTHS[i]}: ${fmt(Math.round(b), "kr")} \xB7 ${monthCount[i]} aktive`, style: { display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", height: "100%", padding: "0 3px" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", height: Math.max(b > 0 ? 5 : 0, h) + "%", background: isCur ? C.goldDeep : C.gold, borderRadius: "4px 4px 0 0", opacity: b > 0 ? 1 : 0, transition: "height .3s ease" } }));
  }))))), /* @__PURE__ */ React.createElement(Note, null, /* @__PURE__ */ React.createElement("strong", null, "Slik leser du kartet:"), " radene er ", groupName, ", og bredden viser n\xE5r aktiviteten l\xF8per. Prikken i baren er ", /* @__PURE__ */ React.createElement("strong", null, "eier"), " (Marked/Salg/Felles), fargestripen til venstre er ", /* @__PURE__ */ React.createElement("strong", null, "status"), ", \u25C6 er lanseringer og \u221E er alltid-p\xE5. Den uthevede kolonnen og den stiplede linjen er ", /* @__PURE__ */ React.createElement("strong", null, "n\xE5"), ". Nederst ser dere hvordan ", /* @__PURE__ */ React.createElement("strong", null, "budsjettet fordeler seg over \xE5ret"), ". Gruppert p\xE5 trakt-trinn ser dere om innsatsen dekker hele kundereisen \u2014 og skj\xF8tet \xABMarked \u2192 Salg\xBB viser hvor staffettpinnen sendes."));
}
function MalView({ goalsInPeriod, onAdd, onEdit, onToggleStatus, onDelete }) {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Toolbar, { title: "M\xE5l", subtitle: "Felles, SMART-formulerte m\xE5l \u2014 m\xE5lbare, tidsbestemte og koblet til et forretningsm\xE5l. Skill ledende fra etterslepende KPI.", onAdd, addLabel: "Nytt m\xE5l" }), goalsInPeriod.length === 0 && /* @__PURE__ */ React.createElement(Empty, null, "Ingen m\xE5l i denne perioden. Legg til det f\xF8rste."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 } }, goalsInPeriod.map((g) => /* @__PURE__ */ React.createElement(Card, { key: g.id }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 8, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(OwnerBadge, { owner: g.owner }), /* @__PURE__ */ React.createElement(Badge, { color: g.status === "omforent" ? C.fullfort : C.planlagt, wash: g.status === "omforent" ? C.fullfortWash : C.planlagtWash }, g.status === "omforent" ? "\u2713 omforent" : "\u25F7 forslag"), /* @__PURE__ */ React.createElement(Badge, { color: g.kpiType === "leading" ? C.marked : C.goldDeep, wash: g.kpiType === "leading" ? C.markedWash : C.goldWash }, g.kpiType === "leading" ? "Ledende KPI" : "Etterslepende KPI"), /* @__PURE__ */ React.createElement(FunnelBadge, { funnel: g.funnel })), /* @__PURE__ */ React.createElement("h3", { style: { margin: "0 0 4px", fontFamily: serif, fontSize: 17, fontWeight: 600, lineHeight: 1.25 } }, g.title), g.parent && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.inkFaint, marginBottom: 10 } }, "\u2191 ", g.parent), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12.5, color: C.inkSoft, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", null, g.metric), /* @__PURE__ */ React.createElement("span", null, fmt(g.actual, g.unit), " / ", fmt(g.target, g.unit))), /* @__PURE__ */ React.createElement(Bar, { value: g.actual, max: g.target, color: pct(g.actual, g.target) >= 100 ? C.fullfort : C.gold }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 14, alignItems: "center" } }, /* @__PURE__ */ React.createElement(SmartTag, { goal: g }), /* @__PURE__ */ React.createElement(Btn, { small: true, variant: "ghost", onClick: () => onToggleStatus(g.id) }, g.status === "omforent" ? "Til forslag" : "Gj\xF8r omforent"), /* @__PURE__ */ React.createElement(Btn, { small: true, variant: "ghost", onClick: () => onEdit(g) }, "Rediger"), /* @__PURE__ */ React.createElement("button", { onClick: () => onDelete(g.id), style: { marginLeft: "auto", border: "none", background: "none", color: C.inkFaint, cursor: "pointer", fontSize: 13 } }, "Slett"))))));
}
function AktiviteterView({ actsInPeriod, goalById, handoffs, pushLog, onAdd, onEdit, onAddHandoff, onCycleStatus, onToggleHandoff, onDelete }) {
  const byChannel = useMemo(() => {
    const m = {};
    actsInPeriod.forEach((a) => {
      (m[a.channel] = m[a.channel] || []).push(a);
    });
    return m;
  }, [actsInPeriod]);
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Toolbar, { title: "Aktiviteter", subtitle: "Taktikken: kampanjer, lanseringer og alltid-p\xE5 \u2014 koblet til m\xE5l og traktposisjon, med budsjett plan vs. faktisk.", onAdd, addLabel: "Ny aktivitet" }), actsInPeriod.length === 0 && /* @__PURE__ */ React.createElement(Empty, null, "Ingen aktiviteter i denne perioden."), Object.keys(byChannel).map((channel) => /* @__PURE__ */ React.createElement("div", { key: channel, style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 } }, channel), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 10 } }, byChannel[channel].map((a) => {
    const g = goalById(a.goalId);
    const acthandoffs = handoffs.filter((h) => h.activityId === a.id);
    const over = a.budgetActual > a.budgetPlan;
    return /* @__PURE__ */ React.createElement(Card, { key: a.id, style: { padding: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 220px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 5, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontFamily: serif, fontSize: 16, fontWeight: 600 } }, a.title), /* @__PURE__ */ React.createElement(Badge, { color: C.inkSoft, wash: C.surfaceAlt }, a.type)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(OwnerBadge, { owner: a.owner }), /* @__PURE__ */ React.createElement(FunnelBadge, { funnel: a.funnel }), a.ansvarlig && /* @__PURE__ */ React.createElement(Badge, { color: C.salg, wash: C.salgWash }, "Ansv: ", a.ansvarlig), g && /* @__PURE__ */ React.createElement(Badge, { color: C.gold, wash: C.goldWash }, "\u21B3 ", g.title), pushLog && pushLog["a:" + a.id] && /* @__PURE__ */ React.createElement(Badge, { color: C.fullfort, wash: C.fullfortWash }, "\u2192 Portal"))), /* @__PURE__ */ React.createElement("button", { onClick: () => onCycleStatus(a.id), title: "Klikk for \xE5 endre status", style: { border: "none", background: "none", cursor: "pointer", padding: 0 } }, /* @__PURE__ */ React.createElement(StatusBadge, { status: a.status }))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: C.inkSoft, marginBottom: 5 } }, /* @__PURE__ */ React.createElement("span", null, "Budsjett"), /* @__PURE__ */ React.createElement("span", { style: { color: over ? C.danger : C.inkSoft, fontWeight: over ? 700 : 400 } }, fmt(a.budgetActual, "kr"), " / ", fmt(a.budgetPlan, "kr"), over ? " \u2014 over" : "")), /* @__PURE__ */ React.createElement(Bar, { value: a.budgetActual, max: Math.max(a.budgetPlan, a.budgetActual), color: over ? C.danger : C.salg })), acthandoffs.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.line}` } }, acthandoffs.map((h) => /* @__PURE__ */ React.createElement("div", { key: h.id, style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 } }, /* @__PURE__ */ React.createElement(OwnerBadge, { owner: h.from }), /* @__PURE__ */ React.createElement("span", { style: { color: C.inkFaint } }, "\u2192"), /* @__PURE__ */ React.createElement(OwnerBadge, { owner: h.to }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: C.ink, flex: 1 } }, h.description), /* @__PURE__ */ React.createElement("button", { onClick: () => onToggleHandoff(h.id), style: { border: "none", background: "none", cursor: "pointer", padding: 0 } }, /* @__PURE__ */ React.createElement(Badge, { color: h.status === "levert" ? C.fullfort : C.planlagt, wash: h.status === "levert" ? C.fullfortWash : C.planlagtWash }, h.status === "levert" ? "\u2713 levert" : "\xE5pen"))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } }, /* @__PURE__ */ React.createElement(Btn, { small: true, variant: "ghost", onClick: () => onEdit(a) }, "Rediger"), /* @__PURE__ */ React.createElement(Btn, { small: true, variant: "ghost", onClick: () => onAddHandoff(a.id) }, "+ Overlevering"), /* @__PURE__ */ React.createElement("button", { onClick: () => onDelete(a.id), style: { marginLeft: "auto", border: "none", background: "none", color: C.inkFaint, cursor: "pointer", fontSize: 13 } }, "Slett")));
  })))));
}
function LaeringView({ learnings, goalById, actById, onAdd, onToggleCarry, onDelete }) {
  const [onlyCarry, setOnlyCarry] = useState(false);
  const list = onlyCarry ? learnings.filter((l) => l.carryToNext) : learnings;
  const linkName = (l) => l.linkedType === "goal" ? goalById(l.linkedId)?.title : actById(l.linkedId)?.title;
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Toolbar, { title: "L\xE6ring", subtitle: "Kontroll-leddet i SOSTAC: hva virket og hvorfor. Marker innsikt som skal bli input til neste periodes plan.", onAdd, addLabel: "Ny l\xE6ring" }), /* @__PURE__ */ React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: C.inkSoft, marginBottom: 14, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: onlyCarry, onChange: (e) => setOnlyCarry(e.target.checked) }), " Vis kun det som tas med videre"), list.length === 0 && /* @__PURE__ */ React.createElement(Empty, null, "Ingen l\xE6ringspunkter enn\xE5."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 12 } }, list.map((l) => /* @__PURE__ */ React.createElement(Card, { key: l.id, style: { borderLeft: l.carryToNext ? `3px solid ${C.gold}` : `1px solid ${C.line}` } }, /* @__PURE__ */ React.createElement("p", { style: { margin: "0 0 10px", fontSize: 14.5, lineHeight: 1.5, color: C.ink } }, l.text), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" } }, l.tags.map((t) => /* @__PURE__ */ React.createElement(Badge, { key: t, color: C.inkSoft, wash: C.surfaceAlt }, "#", t)), linkName(l) && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: C.inkFaint } }, "\xB7 ", linkName(l)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: C.inkFaint } }, "\xB7 ", l.by, ", ", l.period)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12, alignItems: "center" } }, /* @__PURE__ */ React.createElement(Btn, { small: true, variant: l.carryToNext ? "brass" : "ghost", onClick: () => onToggleCarry(l.id) }, l.carryToNext ? "\u2713 Tas med til neste plan" : "Ta med til neste plan"), /* @__PURE__ */ React.createElement("button", { onClick: () => onDelete(l.id), style: { marginLeft: "auto", border: "none", background: "none", color: C.inkFaint, cursor: "pointer", fontSize: 13 } }, "Slett"))))));
}
function OppgaverView({ tasks, actById, pushLog, onAdd, onEdit, onCycleStatus, onDelete, onSync }) {
  const byPerson = useMemo(() => {
    const m = {};
    tasks.forEach((t) => {
      const key = (t.ansvarlig || "").trim() || "\u2014 uten ansvarlig \u2014";
      (m[key] = m[key] || []).push(t);
    });
    return m;
  }, [tasks]);
  const names = Object.keys(byPerson).sort();
  const withAnsvarlig = tasks.filter((t) => (t.ansvarlig || "").trim()).length;
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Toolbar, { title: "Oppgaver", subtitle: "Konkrete to-dos koblet til ansvarlig person. Oppgaver (og aktiviteter) med ansvarlig kan pushes til den enkeltes portal i Styringsportalen.", onAdd, addLabel: "Ny oppgave" }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(Btn, { small: true, variant: "brass", onClick: onSync }, "Synk ansvarlige \u2192 Styringsportal"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: C.inkSoft } }, withAnsvarlig, " av ", tasks.length, " oppgaver har ansvarlig")), tasks.length === 0 && /* @__PURE__ */ React.createElement(Empty, null, "Ingen oppgaver enn\xE5 \u2014 legg til den f\xF8rste med \xAB+ Ny oppgave\xBB."), names.map((name) => /* @__PURE__ */ React.createElement("div", { key: name, style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: C.inkSoft, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 } }, name), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 10 } }, byPerson[name].map((t) => {
    const a = t.activityId ? actById(t.activityId) : null;
    const sent = pushLog && pushLog["o:" + t.id];
    return /* @__PURE__ */ React.createElement(Card, { key: t.id, style: { padding: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 220px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14.5, fontWeight: 600, marginBottom: 5 } }, t.title), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(OwnerBadge, { owner: t.owner }), t.due && /* @__PURE__ */ React.createElement(Badge, { color: C.inkSoft, wash: C.surfaceAlt }, "frist ", t.due), a && /* @__PURE__ */ React.createElement(Badge, { color: C.gold, wash: C.goldWash }, "\u21B3 ", a.title), sent && /* @__PURE__ */ React.createElement(Badge, { color: C.fullfort, wash: C.fullfortWash }, "\u2192 Portal"))), /* @__PURE__ */ React.createElement("button", { onClick: () => onCycleStatus(t.id), title: "Klikk for \xE5 endre status", style: { border: "none", background: "none", cursor: "pointer", padding: 0 } }, /* @__PURE__ */ React.createElement(StatusBadge, { status: t.status }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } }, /* @__PURE__ */ React.createElement(Btn, { small: true, variant: "ghost", onClick: () => onEdit(t) }, "Rediger"), /* @__PURE__ */ React.createElement("button", { onClick: () => onDelete(t.id), style: { marginLeft: "auto", border: "none", background: "none", color: C.inkFaint, cursor: "pointer", fontSize: 13 } }, "Slett")));
  })))), /* @__PURE__ */ React.createElement(Note, null, "\xABSynk\xBB bygger en pakke av alle aktiviteter og oppgaver som har en ansvarlig, og sender den til Styringsportalen \u2014 gruppert per portal/person. I Bolt kobles dette til Supabase ett sted; se kommentaren over integrasjonslaget i koden."));
}
function SamhandlingView({ goals, activities, tasks, handoffs, actById, onAddHandoff, onEditHandoff, onToggleHandoff, onDelHandoff }) {
  const fellesGoals = goals.filter((g) => g.owner === "felles");
  const ownerSplit = OWNERS.map((o) => {
    const acts = activities.filter((a) => a.owner === o);
    return { owner: o, acts: acts.length, budget: acts.reduce((s, a) => s + a.budgetPlan, 0), goals: goals.filter((g) => g.owner === o).length };
  });
  const totalBudget = ownerSplit.reduce((s, x) => s + x.budget, 0) || 1;
  const stats = funnelStats(activities);
  const openH = handoffs.filter((h) => h.status === "\xE5pen").length;
  const people = {};
  const touch = (name, dept) => {
    const k = (name || "").trim();
    if (!k) return;
    people[k] = people[k] || { depts: /* @__PURE__ */ new Set(), akt: 0, opg: 0, ovl: 0 };
    if (dept) people[k].depts.add(dept);
  };
  activities.forEach((a) => {
    if ((a.ansvarlig || "").trim()) {
      touch(a.ansvarlig, a.owner);
      people[a.ansvarlig.trim()].akt++;
    }
  });
  tasks.forEach((t) => {
    if ((t.ansvarlig || "").trim()) {
      touch(t.ansvarlig, t.owner);
      people[t.ansvarlig.trim()].opg++;
    }
  });
  handoffs.forEach((h) => {
    if ((h.fromPerson || "").trim()) {
      touch(h.fromPerson, h.from);
      people[h.fromPerson.trim()].ovl++;
    }
    if ((h.toPerson || "").trim()) {
      touch(h.toPerson, h.to);
      people[h.toPerson.trim()].ovl++;
    }
  });
  const persons = Object.entries(people).map(([name, v]) => ({ name, depts: [...v.depts], akt: v.akt, opg: v.opg, ovl: v.ovl })).sort((a, b) => b.depts.length - a.depts.length || a.name.localeCompare(b.name));
  const isBro = (p) => p.depts.includes("marked") && p.depts.includes("salg");
  const band = { fontSize: 11.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.gold, margin: "0 0 12px" };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Toolbar, { title: "Samhandling", subtitle: "Marked \xD7 Salg som \xE9n lukket sl\xF8yfe \u2014 p\xE5 planniv\xE5, tiltaksniv\xE5 og personniv\xE5. Her m\xF8tes avdelingene rundt felles m\xE5l, overleveringer og delte folk." }), /* @__PURE__ */ React.createElement("div", { style: band }, "Planniv\xE5"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 } }, /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("h3", { style: { margin: "0 0 12px", fontFamily: serif, fontSize: 16, fontWeight: 600 } }, "Eierbalanse"), ownerSplit.map((x) => /* @__PURE__ */ React.createElement("div", { key: x.owner, style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 } }, /* @__PURE__ */ React.createElement(OwnerBadge, { owner: x.owner }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, color: C.inkSoft } }, x.acts, " aktiviteter \xB7 ", x.goals, " m\xE5l")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement(Bar, { value: x.budget, max: totalBudget, color: OWNER_COLOR[x.owner] }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: C.inkFaint, width: 92, textAlign: "right" } }, fmt(x.budget, "kr")))))), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("h3", { style: { margin: "0 0 12px", fontFamily: serif, fontSize: 16, fontWeight: 600 } }, "Felles m\xE5l"), fellesGoals.length === 0 && /* @__PURE__ */ React.createElement(Empty, null, "Ingen felles (Marked + Salg) m\xE5l enn\xE5. Sett eier \xABFelles\xBB p\xE5 et m\xE5l for \xE5 gj\xF8re det delt."), fellesGoals.map((g) => /* @__PURE__ */ React.createElement("div", { key: g.id, style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, padding: "7px 0", borderBottom: `1px solid ${C.line}` } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13.5, fontWeight: 600 } }, g.title), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: C.inkSoft, whiteSpace: "nowrap" } }, fmt(g.actual, g.unit), " / ", fmt(g.target, g.unit)))))), /* @__PURE__ */ React.createElement(Card, { style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement("h3", { style: { margin: "0 0 12px", fontFamily: serif, fontSize: 16, fontWeight: 600 } }, "Skj\xF8tet i kundereisen"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "stretch", gap: 8, flexWrap: "wrap" } }, FUNNEL.map((f, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: f.key }, /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 120px", background: OWNER_WASH[f.owner], border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700, color: OWNER_COLOR[f.owner] } }, f.label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: C.inkSoft, margin: "2px 0 6px" } }, f.fw, " \xB7 ", OWNER_LABEL[f.owner]), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.ink } }, stats[i].acts.length, " aktiviteter")), i === 1 && /* @__PURE__ */ React.createElement("div", { style: { alignSelf: "center", textAlign: "center", minWidth: 78 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, color: C.gold, lineHeight: 1 } }, "\u21C4"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: C.inkFaint, marginTop: 3 } }, openH, " \xE5pne overleveringer"))))), /* @__PURE__ */ React.createElement(Note, null, "Marked eier toppen (See/Think), Salg eier konvertering (Do), og lojalitet (Care) er felles. Skj\xF8tet mellom Vurdering og Konvertering er der staffettpinnen sendes \u2014 overleveringene under holder den i bevegelse.")), /* @__PURE__ */ React.createElement("div", { style: { ...band, marginTop: 22 } }, "Tiltaksniv\xE5 \u2014 overleveringer"), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement(Btn, { variant: "brass", onClick: () => onAddHandoff(null) }, "+ Ny overlevering")), handoffs.length === 0 && /* @__PURE__ */ React.createElement(Empty, null, "Ingen overleveringer enn\xE5. En overlevering er en konkret staffett mellom Marked og Salg (f.eks. \xABleads klare for oppf\xF8lging\xBB)."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 10 } }, handoffs.map((h) => {
    const a = actById(h.activityId);
    return /* @__PURE__ */ React.createElement(Card, { key: h.id, style: { padding: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 } }, /* @__PURE__ */ React.createElement(OwnerBadge, { owner: h.from }), h.fromPerson && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: C.inkSoft } }, h.fromPerson), /* @__PURE__ */ React.createElement("span", { style: { color: C.inkFaint } }, "\u2192"), /* @__PURE__ */ React.createElement(OwnerBadge, { owner: h.to }), h.toPerson && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: C.inkSoft } }, h.toPerson), h.due && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: C.inkFaint, marginLeft: "auto" } }, "frist ", h.due)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, color: C.ink, marginBottom: a ? 2 : 10 } }, h.description), a && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: C.inkFaint, marginBottom: 10 } }, "\u21B3 ", a.title), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => onToggleHandoff(h.id), style: { border: "none", background: "none", cursor: "pointer", padding: 0 } }, /* @__PURE__ */ React.createElement(Badge, { color: h.status === "levert" ? C.fullfort : C.planlagt, wash: h.status === "levert" ? C.fullfortWash : C.planlagtWash }, h.status === "levert" ? "\u2713 levert" : "\xE5pen")), /* @__PURE__ */ React.createElement(Btn, { small: true, variant: "ghost", onClick: () => onEditHandoff(h) }, "Rediger"), /* @__PURE__ */ React.createElement("button", { onClick: () => onDelHandoff(h.id), style: { marginLeft: "auto", border: "none", background: "none", color: C.inkFaint, cursor: "pointer", fontSize: 13 } }, "Slett")));
  })), /* @__PURE__ */ React.createElement("div", { style: { ...band, marginTop: 22 } }, "Personniv\xE5 \u2014 broer mellom Marked og Salg"), persons.length === 0 && /* @__PURE__ */ React.createElement(Empty, null, "Ingen personer er tildelt enn\xE5. Sett \xABansvarlig\xBB p\xE5 aktiviteter og oppgaver for \xE5 se hvem som binder Marked og Salg sammen."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 } }, persons.map((p) => /* @__PURE__ */ React.createElement(Card, { key: p.name, style: { padding: 14, borderLeft: isBro(p) ? `3px solid ${C.gold}` : `1px solid ${C.line}` } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14.5, fontWeight: 600 } }, p.name), isBro(p) && /* @__PURE__ */ React.createElement(Badge, { color: C.goldDeep, wash: C.goldWash }, "Bro")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 } }, p.depts.map((d) => /* @__PURE__ */ React.createElement(OwnerBadge, { key: d, owner: d }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: C.inkSoft } }, p.akt, " aktiviteter \xB7 ", p.opg, " oppgaver \xB7 ", p.ovl, " overleveringer")))), /* @__PURE__ */ React.createElement(Note, null, "En \xABbro\xBB er en person som er ansvarlig p\xE5 begge sider av Marked \xD7 Salg \u2014 disse personene er limet i den lukkede sl\xF8yfen. Samme prinsipp gjelder i Styringsportalen: den som er medlem i to portaler, binder dem sammen."));
}
function GoalModal({ data, onClose, onSave }) {
  const [f, setF] = useState({ id: data.id, title: data.title || "", owner: data.owner || "felles", status: data.status || "forslag", metric: data.metric || "Omsetning", unit: data.unit || "kr", target: data.target ?? 0, actual: data.actual ?? 0, period: data.period, funnel: data.funnel || "vurdering", kpiType: data.kpiType || "lagging", parent: data.parent || "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return /* @__PURE__ */ React.createElement(Modal, { title: data.id ? "Rediger m\xE5l" : "Nytt m\xE5l", onClose, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, "Avbryt"), /* @__PURE__ */ React.createElement(Btn, { variant: "primary", onClick: () => f.title && onSave(f) }, "Lagre")) }, /* @__PURE__ */ React.createElement(Field, { label: "Tittel", hint: "spesifikt" }, /* @__PURE__ */ React.createElement("input", { style: inputStyle, value: f.title, onChange: (e) => set("title", e.target.value), placeholder: "Hva skal oppn\xE5s?" })), /* @__PURE__ */ React.createElement(Field, { label: "Forretningsm\xE5l det st\xF8tter", hint: "relevant" }, /* @__PURE__ */ React.createElement("input", { style: inputStyle, value: f.parent, onChange: (e) => set("parent", e.target.value), placeholder: "Overordnet m\xE5l, f.eks. \xABVekst omsetning +12 %\xBB" })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "Eier" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.owner, onChange: (e) => set("owner", e.target.value) }, OWNERS.map((o) => /* @__PURE__ */ React.createElement("option", { key: o, value: o }, OWNER_LABEL[o])))), /* @__PURE__ */ React.createElement(Field, { label: "Status" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.status, onChange: (e) => set("status", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "forslag" }, "Forslag"), /* @__PURE__ */ React.createElement("option", { value: "omforent" }, "Omforent")))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "Traktposisjon" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.funnel, onChange: (e) => set("funnel", e.target.value) }, FUNNEL.map((x) => /* @__PURE__ */ React.createElement("option", { key: x.key, value: x.key }, x.label, " (", x.fw, ")")))), /* @__PURE__ */ React.createElement(Field, { label: "KPI-type" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.kpiType, onChange: (e) => set("kpiType", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "leading" }, "Ledende (forutser)"), /* @__PURE__ */ React.createElement("option", { value: "lagging" }, "Etterslepende (resultat)")))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "M\xE5ltall", hint: "m\xE5lbart" }, /* @__PURE__ */ React.createElement("input", { style: inputStyle, value: f.metric, onChange: (e) => set("metric", e.target.value) })), /* @__PURE__ */ React.createElement(Field, { label: "Enhet" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.unit, onChange: (e) => set("unit", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "kr" }, "kr"), /* @__PURE__ */ React.createElement("option", { value: "stk" }, "stk"), /* @__PURE__ */ React.createElement("option", { value: "%" }, "%"), /* @__PURE__ */ React.createElement("option", { value: "visn." }, "visn.")))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "M\xE5l" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: inputStyle, value: f.target, onChange: (e) => set("target", Number(e.target.value)) })), /* @__PURE__ */ React.createElement(Field, { label: "Faktisk" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: inputStyle, value: f.actual, onChange: (e) => set("actual", Number(e.target.value)) }))));
}
function ActivityModal({ data, goals, members = [], onClose, onSave }) {
  const [qs, qe] = quarterMonths(data.period);
  const [f, setF] = useState({ id: data.id, title: data.title || "", type: data.type || "kampanje", channel: data.channel || "Meta", owner: data.owner || "marked", ansvarlig: data.ansvarlig || "", goalId: data.goalId || (goals[0]?.id || ""), period: data.period, start: data.start ?? qs, end: data.end ?? qe, budgetPlan: data.budgetPlan ?? 0, budgetActual: data.budgetActual ?? 0, status: data.status || "id\xE9", funnel: data.funnel || "bevissthet" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = () => {
    if (!f.title) return;
    onSave({ ...f, start: Math.min(f.start, f.end), end: Math.max(f.start, f.end) });
  };
  return /* @__PURE__ */ React.createElement(Modal, { title: data.id ? "Rediger aktivitet" : "Ny aktivitet", onClose, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, "Avbryt"), /* @__PURE__ */ React.createElement(Btn, { variant: "primary", onClick: save }, "Lagre")) }, /* @__PURE__ */ React.createElement(Field, { label: "Tittel" }, /* @__PURE__ */ React.createElement("input", { style: inputStyle, value: f.title, onChange: (e) => set("title", e.target.value), placeholder: "Navn p\xE5 kampanje/aktivitet" })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "Type" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.type, onChange: (e) => set("type", e.target.value) }, ACT_TYPES.map((t) => /* @__PURE__ */ React.createElement("option", { key: t }, t)))), /* @__PURE__ */ React.createElement(Field, { label: "Kanal" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.channel, onChange: (e) => set("channel", e.target.value) }, CHANNELS.map((c) => /* @__PURE__ */ React.createElement("option", { key: c }, c))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "Eier" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.owner, onChange: (e) => set("owner", e.target.value) }, OWNERS.map((o) => /* @__PURE__ */ React.createElement("option", { key: o, value: o }, OWNER_LABEL[o])))), /* @__PURE__ */ React.createElement(Field, { label: "Traktposisjon", hint: "kundereise" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.funnel, onChange: (e) => set("funnel", e.target.value) }, FUNNEL.map((x) => /* @__PURE__ */ React.createElement("option", { key: x.key, value: x.key }, x.label, " (", x.fw, ")"))))), /* @__PURE__ */ React.createElement(Field, { label: "Ansvarlig (person)", hint: "pushes til Styringsportalen" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.ansvarlig, onChange: (e) => set("ansvarlig", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 velg person \u2014"), f.ansvarlig && !members.some((m) => m.name === f.ansvarlig) && /* @__PURE__ */ React.createElement("option", { value: f.ansvarlig }, f.ansvarlig + " (ikke i listen)"), members.map((m) => /* @__PURE__ */ React.createElement("option", { key: m.id, value: m.name }, m.name)))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "Status" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.status, onChange: (e) => set("status", e.target.value) }, ACT_STATUS.map((s) => /* @__PURE__ */ React.createElement("option", { key: s }, s)))), /* @__PURE__ */ React.createElement(Field, { label: "Knyttet til m\xE5l" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.goalId, onChange: (e) => set("goalId", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 ingen \u2014"), goals.map((g) => /* @__PURE__ */ React.createElement("option", { key: g.id, value: g.id }, g.title))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "Starter" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.start, onChange: (e) => set("start", Number(e.target.value)) }, MONTHS.map((m, i) => /* @__PURE__ */ React.createElement("option", { key: m, value: i + 1 }, m)))), /* @__PURE__ */ React.createElement(Field, { label: "Slutter" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.end, onChange: (e) => set("end", Number(e.target.value)) }, MONTHS.map((m, i) => /* @__PURE__ */ React.createElement("option", { key: m, value: i + 1 }, m))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "Budsjett (plan)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: inputStyle, value: f.budgetPlan, onChange: (e) => set("budgetPlan", Number(e.target.value)) })), /* @__PURE__ */ React.createElement(Field, { label: "Budsjett (faktisk)" }, /* @__PURE__ */ React.createElement("input", { type: "number", style: inputStyle, value: f.budgetActual, onChange: (e) => set("budgetActual", Number(e.target.value)) }))));
}
function TaskModal({ data, activities, members = [], onClose, onSave }) {
  const [f, setF] = useState({ id: data.id, title: data.title || "", ansvarlig: data.ansvarlig || "", owner: data.owner || "marked", status: data.status || "\xE5pen", due: data.due || "", activityId: data.activityId || "", period: data.period });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return /* @__PURE__ */ React.createElement(Modal, { title: data.id ? "Rediger oppgave" : "Ny oppgave", onClose, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, "Avbryt"), /* @__PURE__ */ React.createElement(Btn, { variant: "primary", onClick: () => f.title && onSave(f) }, "Lagre")) }, /* @__PURE__ */ React.createElement(Field, { label: "Oppgave" }, /* @__PURE__ */ React.createElement("input", { style: inputStyle, value: f.title, onChange: (e) => set("title", e.target.value), placeholder: "Hva skal gj\xF8res?" })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "Ansvarlig (person)", hint: "pushes til portal" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.ansvarlig, onChange: (e) => set("ansvarlig", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 velg person \u2014"), f.ansvarlig && !members.some((m) => m.name === f.ansvarlig) && /* @__PURE__ */ React.createElement("option", { value: f.ansvarlig }, f.ansvarlig + " (ikke i listen)"), members.map((m) => /* @__PURE__  */ React.createElement("option", { key: m.id, value: m.name }, m.name)))), /* @__PURE__ */ React.createElement(Field, { label: "Eier (avdeling)" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.owner, onChange: (e) => set("owner", e.target.value) }, OWNERS.map((o) => /* @__PURE__ */ React.createElement("option", { key: o, value: o }, OWNER_LABEL[o]))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "Status" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.status, onChange: (e) => set("status", e.target.value) }, TASK_STATUS.map((s) => /* @__PURE__ */ React.createElement("option", { key: s }, s)))), /* @__PURE__ */ React.createElement(Field, { label: "Frist" }, /* @__PURE__ */ React.createElement("input", { type: "date", style: inputStyle, value: f.due, onChange: (e) => set("due", e.target.value) }))), /* @__PURE__ */ React.createElement(Field, { label: "Knyttet aktivitet", hint: "valgfritt" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.activityId, onChange: (e) => set("activityId", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 ingen \u2014"), activities.map((a) => /* @__PURE__ */ React.createElement("option", { key: a.id, value: a.id }, a.title)))));
}
function SyncModal({ items, pushLog, onSend, onClose }) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const byPortal = useMemo(() => {
    const m = {};
    items.forEach((i) => {
      (m[i.portal] = m[i.portal] || []).push(i);
    });
    return m;
  }, [items]);
  const run = async () => {
    setSending(true);
    const r = await onSend();
    setResult(r);
    setSending(false);
  };
  return /* @__PURE__ */ React.createElement(Modal, { title: "Synk til Styringsportalen", onClose, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, "Lukk"), !result && items.length > 0 && /* @__PURE__ */ React.createElement(Btn, { variant: "primary", onClick: run }, sending ? "Sender\u2026" : `Send ${items.length} til portal`)) }, items.length === 0 && /* @__PURE__ */ React.createElement(Empty, null, "Ingen aktiviteter eller oppgaver har ansvarlig enn\xE5. Sett en ansvarlig for \xE5 kunne pushe."), items.length > 0 && !result && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { style: { margin: "0 0 14px", fontSize: 13, color: C.inkSoft, lineHeight: 1.5 } }, "Dette pushes til Styringsportalen, gruppert per portal/ansvarlig. Hver post har en stabil ", /* @__PURE__ */ React.createElement("code", null, "external_id"), ", s\xE5 ny synk oppdaterer (dubler ikke)."), Object.keys(byPortal).map((portal) => /* @__PURE__ */ React.createElement("div", { key: portal, style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: C.inkFaint, marginBottom: 6 } }, "Portal: ", PORTAL_LABEL[portal] || portal), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 6 } }, byPortal[portal].map((i) => /* @__PURE__ */ React.createElement("div", { key: i.externalId, style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "7px 10px", background: C.surfaceAlt, borderRadius: 8 } }, /* @__PURE__ */ React.createElement(Badge, { color: i.type === "oppgave" ? C.salg : C.marked, wash: i.type === "oppgave" ? C.salgWash : C.markedWash }, i.type), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, color: C.ink } }, i.tittel), /* @__PURE__ */ React.createElement("span", { style: { color: C.inkSoft, fontWeight: 600 } }, i.ansvarlig), pushLog && pushLog[i.externalId] && /* @__PURE__ */ React.createElement(Badge, { color: C.fullfort, wash: C.fullfortWash }, "oppdatert")))))), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowJson((s) => !s), style: { border: "none", background: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: C.gold, padding: 0, marginTop: 4 } }, showJson ? "Skjul" : "Vis", " pakken (JSON)"), showJson && /* @__PURE__ */ React.createElement("pre", { style: { marginTop: 8, background: C.ink, color: "#E9E2D4", padding: 12, borderRadius: 8, fontSize: 11, lineHeight: 1.45, overflowX: "auto", maxHeight: 200 } }, JSON.stringify(items, null, 2))), result && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "8px 0" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: serif, fontSize: 19, fontWeight: 600, marginBottom: 6 } }, result.ok ? "Synk fullf\xF8rt" : "Synk feilet"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 13.5, color: C.inkSoft, lineHeight: 1.5 } }, result.mode === "live" && `${result.count} poster sendt til Styringsportalen.`, result.mode === "dry-run" && `${result.count} poster klargjort (dry-run). Ingen backend er koblet p\xE5 enn\xE5 \u2014 i Bolt kobles dette til Supabase. Se integrasjonslaget i koden.`, result.mode === "feil" && `Noe gikk galt: ${result.error || "ukjent feil"}.`, result.mode === "tom" && "Ingenting \xE5 sende.")));
}
function HandoffModal({ data, activities, onClose, onSave }) {
  const [f, setF] = useState({ id: data.id, activityId: data.activityId || "", from: data.from || "marked", to: data.to || "salg", fromPerson: data.fromPerson || "", toPerson: data.toPerson || "", description: data.description || "", due: data.due || "", status: data.status || "\xE5pen" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return /* @__PURE__ */ React.createElement(Modal, { title: data.id ? "Rediger overlevering" : "Ny overlevering", onClose, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, "Avbryt"), /* @__PURE__ */ React.createElement(Btn, { variant: "primary", onClick: () => f.description && onSave(f) }, "Lagre")) }, /* @__PURE__ */ React.createElement(Field, { label: "Hva overleveres?", hint: "staffettpinnen" }, /* @__PURE__ */ React.createElement("input", { style: inputStyle, value: f.description, onChange: (e) => set("description", e.target.value), placeholder: "F.eks. \xABLeads fra kampanje klare for oppf\xF8lging\xBB" })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "Fra (avdeling)" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.from, onChange: (e) => set("from", e.target.value) }, OWNERS.map((o) => /* @__PURE__ */ React.createElement("option", { key: o, value: o }, OWNER_LABEL[o])))), /* @__PURE__ */ React.createElement(Field, { label: "Til (avdeling)" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.to, onChange: (e) => set("to", e.target.value) }, OWNERS.map((o) => /* @__PURE__ */ React.createElement("option", { key: o, value: o }, OWNER_LABEL[o]))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "Fra (person)", hint: "valgfritt" }, /* @__PURE__ */ React.createElement("input", { style: inputStyle, value: f.fromPerson, onChange: (e) => set("fromPerson", e.target.value), placeholder: "Navn" })), /* @__PURE__ */ React.createElement(Field, { label: "Til (person)", hint: "valgfritt" }, /* @__PURE__ */ React.createElement("input", { style: inputStyle, value: f.toPerson, onChange: (e) => set("toPerson", e.target.value), placeholder: "Navn" }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "Knyttet aktivitet", hint: "valgfritt" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.activityId, onChange: (e) => set("activityId", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 ingen \u2014"), activities.map((a) => /* @__PURE__ */ React.createElement("option", { key: a.id, value: a.id }, a.title)))), /* @__PURE__ */ React.createElement(Field, { label: "Frist" }, /* @__PURE__ */ React.createElement("input", { type: "date", style: inputStyle, value: f.due, onChange: (e) => set("due", e.target.value) }))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "Status" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.status, onChange: (e) => set("status", e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "\xE5pen" }, "\xC5pen"), /* @__PURE__ */ React.createElement("option", { value: "levert" }, "Levert")))));
}
function LearningModal({ data, goals, activities, onClose, onSave }) {
  const [f, setF] = useState({ id: data.id, text: data.text || "", linkedType: data.linkedType || "activity", linkedId: data.linkedId || (activities[0]?.id || ""), tags: data.tags || [], carryToNext: data.carryToNext ?? false, by: data.by || "Marked", period: data.period });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const toggleTag = (t) => setF((p) => ({ ...p, tags: p.tags.includes(t) ? p.tags.filter((x) => x !== t) : [...p.tags, t] }));
  const options = f.linkedType === "goal" ? goals : activities;
  return /* @__PURE__ */ React.createElement(Modal, { title: data.id ? "Rediger l\xE6ring" : "Ny l\xE6ring", onClose, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, "Avbryt"), /* @__PURE__ */ React.createElement(Btn, { variant: "primary", onClick: () => f.text && onSave(f) }, "Lagre")) }, /* @__PURE__ */ React.createElement(Field, { label: "Innsikt \u2014 hva virket, hva l\xE6rte vi?" }, /* @__PURE__ */ React.createElement("textarea", { style: { ...inputStyle, minHeight: 80, resize: "vertical" }, value: f.text, onChange: (e) => set("text", e.target.value) })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Field, { label: "Knyttet til" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.linkedType, onChange: (e) => {
    set("linkedType", e.target.value);
    set("linkedId", (e.target.value === "goal" ? goals[0]?.id : activities[0]?.id) || "");
  } }, /* @__PURE__ */ React.createElement("option", { value: "activity" }, "Aktivitet"), /* @__PURE__ */ React.createElement("option", { value: "goal" }, "M\xE5l"))), /* @__PURE__ */ React.createElement(Field, { label: "Av" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.by, onChange: (e) => set("by", e.target.value) }, /* @__PURE__ */ React.createElement("option", null, "Marked"), /* @__PURE__ */ React.createElement("option", null, "Salg"), /* @__PURE__ */ React.createElement("option", null, "Felles")))), /* @__PURE__ */ React.createElement(Field, { label: f.linkedType === "goal" ? "M\xE5l" : "Aktivitet" }, /* @__PURE__ */ React.createElement("select", { style: inputStyle, value: f.linkedId, onChange: (e) => set("linkedId", e.target.value) }, options.map((o) => /* @__PURE__ */ React.createElement("option", { key: o.id, value: o.id }, o.title)))), /* @__PURE__ */ React.createElement(Field, { label: "Tagger" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 7, flexWrap: "wrap" } }, TAG_BANK.map((t) => /* @__PURE__ */ React.createElement("button", { key: t, onClick: () => toggleTag(t), style: { fontFamily: sans, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: "5px 11px", borderRadius: 999, border: `1px solid ${f.tags.includes(t) ? C.gold : C.line}`, background: f.tags.includes(t) ? C.goldWash : C.surface, color: f.tags.includes(t) ? C.goldDeep : C.inkSoft } }, "#", t)))), /* @__PURE__ */ React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, color: C.ink, cursor: "pointer", marginTop: 4 } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: f.carryToNext, onChange: (e) => set("carryToNext", e.target.checked) }), " Ta med til neste plan (lukker sl\xF8yfen)"));
}

export default MarkedsplanVerktoy;
