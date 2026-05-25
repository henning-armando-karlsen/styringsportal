# Bolt-oppgave (STYRINGSPORTAL-prosjektet): Oppdater Kalender med dagvisning

> **Last opp den nye `CalendarView.jsx` sammen med denne prompten.**
>
> **Mål:** Erstatt den eksisterende kalender-komponenten med en ny versjon som legger til en **dagvisning i Outlook-stil**. Ingen andre endringer trengs — App.jsx, menyvalget og ruten er allerede på plass fra forrige oppgave, og propsene er uendret.

## Det eneste steget
Erstatt innholdet i `src/components/CalendarView.jsx` med den vedlagte filen (overskriv hele filen). **Ikke** rør App.jsx — komponenten tar de samme propsene som før (`data`, `allData`, `currentUserId`, `markedsplanTasks`, `sortimentTasks`, `onNavigate`, `onSaveEvents`, `activePortal`), og den nye dagvisningen er helt intern.

## Hva som er nytt i komponenten
- **«Dag»** er lagt til i visningsvelgeren (Måned / Dag / Agenda).
- **Timegrid 00–24** som scroller automatisk til kl. 07. Møter plasseres på riktig klokkeslett med høyde etter varighet; overlappende møter legges side om side i kolonner.
- **Rød «nå»-strek** på dagens dato, oppdateres hvert minutt.
- **«Hele dagen»-stripe** øverst for frister og heldagshendelser (de har ikke klokkeslett).
- **Tre veier inn i en dag:** velg «Dag», klikk et datotall i månedsvisningen, eller klikk «+N til» i en travel dag-rute.
- **Klikk på et tomt tidsrom** i rutenettet → «Ny hendelse» åpnes ferdig utfylt med dato og klokkeslett.

## Akseptansekriterier
- [ ] «Dag» vises i visningsvelgeren og åpner timegridet.
- [ ] Et møte med klokkeslett og varighet plasseres riktig og får høyde etter varighet; to overlappende møter vises side om side.
- [ ] «Nå»-streken vises på dagens dato.
- [ ] En frist uten klokkeslett havner i «Hele dagen»-stripen.
- [ ] Klikk på et datotall i måned hopper til den dagen; klikk på tomt tidsrom oppretter en hendelse på det klokkeslettet.
- [ ] Ingen endringer i App.jsx kreves; appen bygger; ingen nye npm-pakker.

## Kjente begrensninger (forventet, ikke feil)
- Egne hendelser med klokkeslett får standard varighet 60 min (datamodellen har ikke sluttid innen en dag; kun møter har ekte varighet).
- Frister / markedsplan / sortiment har ikke klokkeslett og vises derfor alltid i heldagsstripen, ikke i selve timegridet.
