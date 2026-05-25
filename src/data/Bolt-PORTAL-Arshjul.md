# Bolt-oppgave (STYRINGSPORTAL-prosjektet): Ekte årshjul + rydd i navngivningen

> **Last opp `ArshjulView.jsx` sammen med denne prompten.** Legg den som `src/components/ArshjulView.jsx`.
>
> **Mål:** Innfør et ekte, sirkulært årshjul som egen visning — og rydd samtidig opp i sammenblandingen ved å døpe om den eksisterende rullerende «Årshjul»-visningen (som egentlig er en plan) til **«Plan»**. Da blir det to klart adskilte ting: *Årshjul* = den sykliske årsrytmen (hjulet), *Plan* = den rullerende 12-måneders tidslinjen.

## Steg 1 — Importer komponenten
Øverst i `src/App.jsx`, sammen med de andre komponent-importene:
```js
import ArshjulView from './components/ArshjulView';
```

## Steg 2 — Døp om den gamle «Årshjul» til «Plan» (fjerner sammenblandingen)
Den eksisterende `plans`-visningen heter «Årshjul» i ledelsesportalen. Endre det til «Plan» der, så navnet matcher det den faktisk er (en rullerende plan). I ledelsesportalens `org`-objekt:
- `navPlans: 'Årshjul'` → `navPlans: 'Plan'`
- `plansTitle: 'Årshjul'` → `plansTitle: 'Plan'`

(De andre portalene har allerede egne, dekkende navn — «Salgskalender», «Innkjøpskalender» osv. — og trenger ingen endring.)

## Steg 3 — Nytt menyvalg «Årshjul»
I `sections`-arrayet, i seksjonen «Strategi & Plan» (der `plans` ligger), legg **Årshjul** rett over «Plan» — tilgjengelig i alle portaler:
```js
{ key:'arshjul', label:'Årshjul', icon:Repeat },
{ key:'plans',   label: activePortal === 'marketing' ? 'Innholdskalender' : (org.navPlans || 'Plan'), icon:Compass, count:counts.plans },
```
(`Repeat` finnes allerede som ikon i App.jsx og passer den sykliske rytmen. `Compass` beholdes på Plan.)

## Steg 4 — Legg til rute
Ved siden av de andre `view===`-grenene (f.eks. rett over `plans`-ruten):
```jsx
{view==='arshjul' && <ArshjulView data={data} save={save} currentUserId={currentUserId} />}
```

Det er alt. Komponenten lagrer egne hendelser i den aktive portalens `data.arshjulEvents` via det vanlige `save`, så **ingen migrasjon trengs**, og hver portal får sitt eget årshjul. Tom liste håndteres internt (hjulet vises med tomme spor).

## Slik virker årshjulet (kort)
- **Sirkulært hjul:** tolv måneds-sektorer (Januar øverst, med klokka). Konsentriske **ringer = kategoriene** fra `org.planCategories` (samme taksonomi/farger som Plan).
- **Hendelser** tegnes som buer i sin ring, over én eller flere måneder. Klikk en bue for å redigere; hold over for å se tittelen i navet.
- **«Nå»-viser:** en rød peker mot dagens dato på inneværende år.
- **Årvelger:** hendelser uten årstall er fast rytme (vises hvert år); hendelser med årstall er årsspesifikke og vises kun det året.
- **Månedsliste** ved siden av hjulet gir full detalj; klikk en måned for å markere, eller en tom sektor i hjulet for å opprette en hendelse i den måneden.

## Akseptansekriterier
- [ ] «Årshjul» vises i menyen (alle portaler) og åpner det sirkulære hjulet; «Plan» er den gamle rullerende visningen (ikke lenger kalt Årshjul i ledelse).
- [ ] En hendelse fra januar til mars tegnes som en bue over tre måneder i riktig fargering, og vises i januar/februar/mars i månedslisten.
- [ ] «Nå»-viseren peker på riktig måned på inneværende år; bytte år skjuler den.
- [ ] En hendelse uten årstall vises uansett valgt år; en med årstall kun det året.
- [ ] Opprett/rediger/slett lagres og overlever reload; ingen ny npm-pakke; appen bygger.
