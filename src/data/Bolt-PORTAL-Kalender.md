# Bolt-oppgave (STYRINGSPORTAL-prosjektet): Koble inn Kalender

> **Last opp `CalendarView.jsx` sammen med denne prompten.** Legg den som `src/components/CalendarView.jsx`.
>
> **Mål:** En samlet kalender i alle portaler. Den aggregerer det som allerede har dato — møter, oppgavefrister (inkl. markedsplan og sortiment) — pluss et tynt lag egne hendelser (personlig/delt). To visninger (Måned + Agenda), filter Mine/Avdelingen, klikk åpner kilden, og .ics-eksport. Komponenten er selvstendig (eget tema og egne ikoner) og trenger ingen nye avhengigheter.

## Steg 1 — Importer komponenten
Øverst i `src/App.jsx`, sammen med de andre komponent-importene:
```js
import CalendarView from './components/CalendarView';
```

## Steg 2 — Legg til menyvalg
I `sections`-arrayet, i den **første** seksjonen (den uten label, med Hjem / Mitt skrivebord / På tvers), legg «Kalender» rett under «Mitt skrivebord» — slik at den er tilgjengelig i alle portaler:
```js
{ key:'desk',     label:'Mitt skrivebord', icon:LayoutDashboard },
{ key:'kalender', label:'Kalender',        icon:CalendarClock },
{ key:'crossorg', label:'På tvers',        icon:Command, count:counts.crossorg },
```
(`CalendarClock` finnes allerede som ikon i App.jsx — `Calendar` er opptatt av Møter.)

## Steg 3 — Legg til rute
Ved siden av de andre `view===`-grenene (f.eks. rett under `markedsplan`-ruten):
```jsx
{view==='kalender' && (
  <CalendarView
    data={data}
    allData={allData}
    currentUserId={currentUserId}
    markedsplanTasks={markedsplanAssignments}
    sortimentTasks={sortimentAssignments}
    onNavigate={handleNavigate}
    onSaveEvents={(next) => save({ ...data, calendarEvents: next })}
    activePortal={activePortal}
  />
)}
```

Det er alt. Komponenten leser møter/oppgaver fra `data`, henter egne hendelser på tvers via `allData`, og filtrerer selv på Mine/Avdelingen — ingen videre logikk i App.jsx.

## Slik virker den (kort)
- **Møter** (`data.meetings`, ikke avlyste) — i «Mine» vises de der du er deltaker; i «Avdelingen» alle. Klikk åpner møtet.
- **Oppgavefrister** (`data.tasks.dueDate`, ikke fullført) + markedsplan/sortiment-oppgaver som har dato. Klikk går til Oppgaver / Markedsplan, eller åpner Sortiment-appen.
- **Egne hendelser**: «Ny hendelse» → lagres i den aktive portalens `calendarEvents`. `scope:'personlig'` (kun deg, følger deg på tvers av portalene dine) eller `scope:'delt'` (vises for avdelingen i «Avdelingen»-filteret). Rediger/slett egne i samme modal.
- **.ics-eksport** laster ned det som vises i gjeldende filter, som heldags-oppføringer.

## Akseptansekriterier
- [ ] «Kalender» vises i menyen i alle portaler og åpner visningen.
- [ ] Et kommende møte du er deltaker på vises i «Mine» (måned + agenda); klikk åpner møtet.
- [ ] En oppgave med frist tildelt deg vises; en sortiment-oppgave med frist åpner Sortiment-appen.
- [ ] «Ny hendelse» (personlig) lagres, vises i «Mine», og overlever reload; «delt» vises i «Avdelingen».
- [ ] .ics-fil lastes ned og kan åpnes i en kalenderapp.
- [ ] Ingen nye npm-pakker; appen bygger.

## Kjente begrensninger (forventet, ikke feil)
- Markedsplan-aktiviteter er kvartalsbaserte (uten eksakt dato), så de fleste markedsplan-oppgaver plasserer seg **ikke** på datoaksen ennå — kun de som har en konkret frist.
- Sortiment-**initiativer og steg** har foreløpig ingen frist, så de vises ikke i kalenderen; sortiment-**oppgaver** med frist gjør det.
- `calendarEvents` følger samme «siste skriving vinner»-modell som resten av portalen.
