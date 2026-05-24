# Vikingbad Portaler

Internt samhandlingsverktøy for Vikingbad – fem avdelingsportaler (Ledelse, Marked, Salg, Innkjøp, Produkt & Sourcing) med tverrgående koordinering, AI-assistent og felles programmer.

Dette er prototypen gjort om til et **Vite + React**-prosjekt klart for **Bolt**, med **Supabase** som database/backend.

---

## Slik kjører du den

Uten backend (lokalt, in-memory) – fungerer rett ut av boksen:

```bash
npm install
npm run dev
```

Da brukes lokale seed-data, og innlogging skjer ved å velge person/portal. Ingenting lagres mellom økter. Dette er nyttig for å jobbe med UI-et.

---

## Ta i bruk i Bolt + Supabase (database, innlogging, lagring)

Bolt har innebygd Supabase. Slik kobler du på backend:

1. **Åpne prosjektet i Bolt** (last opp mappen / dra inn zip-en).
2. **Koble til Supabase** i Bolt («Connect to Supabase»). Bolt oppretter/kobler et Supabase-prosjekt og setter automatisk miljøvariablene `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY`. (Lokalt: kopier `.env.example` til `.env` og fyll inn verdiene fra Supabase → Project Settings → API.)
3. **Kjør databasemigrasjonen.** Innholdet i `supabase/migrations/0001_init.sql` oppretter tabeller, radnivå-sikkerhet (RLS) og seeder portalene. Kjør den i Supabase → **SQL Editor**, eller la Bolt kjøre migrasjonen.
4. **Opprett din konto.** Når miljøvariablene er satt, viser appen en innloggingsskjerm (e-post/passord, Supabase Auth). Registrer deg – en profil opprettes automatisk.
5. **Gi deg selv tilgang.** Kjør bootstrap-spørringen nederst i migrasjonsfilen (bytt ut e-posten) for å legge brukeren din inn i `portal_members`. Da ser og redigerer du portalene.
6. **AI-assistenten (valgfritt):** sett nøkkel og deploy backend-funksjonen som holder nøkkelen server-side:
   ```bash
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   supabase functions deploy assistant
   ```

Etter dette persisteres alt du gjør (møter, oppgaver, initiativer, meldinger …) i Supabase, beskyttet av RLS per portal.

---

## Hvordan det henger sammen

| Lag | Fil | Ansvar |
|-----|-----|--------|
| UI / all funksjonalitet | `src/App.jsx` | Hele appen (portaler, visninger, AI, «På tvers») |
| Innlogging | `src/lib/AuthGate.jsx` | Supabase Auth når backend er på; usynlig ellers |
| Klient | `src/lib/supabase.js` | Oppretter Supabase-klient (kun når env er satt) |
| Datakilde | `src/lib/dataSource.js` | Laster/lagrer portaldata; seed-fallback uten backend |
| Database | `supabase/migrations/0001_init.sql` | Tabeller, RLS, trigger og seed |
| AI-backend | `supabase/functions/assistant/index.ts` | Proxy til Anthropic (nøkkel server-side) |

**Datamodell (v1):** hver portal lagres som ett JSONB-dokument i `portal_state` (matcher appens interne struktur 1:1, så all UI virker uendret). Tilgang styres av `portal_members` + RLS. `profiles`/`portals` håndterer identitet og konfig. Når dere senere vil ha tverrgående rapportering/spørringer per entitet, kan dokumentet normaliseres til egne tabeller (møter, oppgaver, …) – be Bolt om hjelp til det stegvis.

**Tilgang/«broer»:** en person som er medlem i to portaler er en bro mellom dem. «Kun ledergruppen»-prinsippet håndheves ved at kun ledelsesmedlemmer ligger i `portal_members` for `leadership`.

---

## Publisering

`npm run build` lager en statisk produksjonsbygg i `dist/`. Bolt kan publisere direkte. Supabase (database + auth + edge functions) kjører som backend. Husk at AI-funksjonene krever at `assistant`-funksjonen er deployet med `ANTHROPIC_API_KEY`.
