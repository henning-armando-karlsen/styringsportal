# Bolt-oppgave (STYRINGSPORTAL-prosjektet): Oppgrader Årshjul (Plandisc-stil)

> **Last opp den nye `ArshjulView.jsx` sammen med denne prompten.**
>
> **Mål:** Erstatt årshjul-komponenten med en mer Plandisc-aktig versjon. Samme props, samme datamodell (`data.arshjulEvents`), månedsoppløsning beholdt — så **ingen App.jsx-endringer** og ingen migrasjon trengs.

## Det eneste steget
Overskriv hele `src/components/ArshjulView.jsx` med den vedlagte filen.

(Har du ennå ikke lagt inn årshjulet i menyen/ruten, følg den forrige prompten `Bolt-PORTAL-Arshjul.md` for det — denne filen er bare en nyere versjon av komponenten. Husk også å fjerne/omdøpe den gamle duplikat-«Årshjul»-fanen i ledelsesportalen, slik vi avtalte.)

## Hva som er nytt
- **Ring-navn på hjulet:** hvert spor får navnet sitt som buetekst langs ringens innerkant (øverst), i ringens farge.
- **Buetekst på aktiviteter:** aktivitetens tittel følger buen («kakestykke»-looken). Korte buer som ikke har plass til tekst, viser tittelen ved hover (i navet) og i månedslisten i stedet.
- **Filtrering:** klikkbare spor-brytere øverst (vis/skjul ringer) + et søkefelt som filtrerer aktiviteter på tittel. Påvirker både hjulet og månedslisten.

## Akseptansekriterier
- [ ] Ringene viser navn på selve hjulet; tegnforklaringen er nå klikkbare filter-brikker.
- [ ] En aktivitet over flere måneder viser tittelen som buetekst langs buen (riktig vei også nederst på hjulet).
- [ ] Å skru av et spor skjuler aktivitetene i det sporet (og toner ned ringen); søk filtrerer på tittel.
- [ ] Opprett/rediger/slett, årvelger og «nå»-viser virker som før; appen bygger; ingen nye npm-pakker.

## Kjent begrensning (uendret)
- Månedsoppløsning (ikke dato/uke). To aktiviteter i samme spor og samme måneder kan overlappe visuelt — uvanlig på månedsnivå, men verdt å vite.
