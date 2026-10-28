# Audit și curățare — 28 octombrie 2026

> Acest raport descrie etapa inițială. Îmbunătățirile aplicate ulterior, modulele noi și verificările actuale sunt documentate în README.md. Leaflet este acum local, iar materialele lipsă au stări explicite în interfață.

Site static HTML/CSS/JavaScript, fără sistem de build sau manifest de dependențe. Conținutul din `index.html`, imaginile, datele geografice și documentele existente au fost păstrate.

## Modificări aplicate

- Eliminată implementarea veche `initPageNavigationTransition` și ascultătorul separat pentru navigare mobilă. Navigarea delegată `navigateBustuchinToHash` gestionează deja aceste linkuri, inclusiv cele generate dinamic, poziționarea sub meniu și tranziția vizuală. Codul eliminat era redundant pentru linkurile interne valide, interceptate anterior în faza de captură.
- Eliminate inițializările `.media-card` și `.heritage-slide`, precum și stilurile lor exclusive și referințele din grupurile de selectori. Nici HTML-ul, nici componentele generate de JavaScript nu mai creează aceste elemente. Videoclipurile `.video-preview` și videoclipul principal rămân funcționale.
- Eliminată variabila nefolosită `isTouchDevice`.
- Corectat selectorul capitolului Sate din `#satele-comunei` în `#sate`; eliminată intrarea fără element `#patrimoniu-religios`. Capitolul existent `#religie` este păstrat.
- Actualizată versiunea cache-ului offline la `bustuchin-reading-v8`, pentru separarea resurselor actualizate de cache-ul vechi. Activarea urmează ciclul normal al service worker-ului.
- Completată documentarea importurilor CSS. Ordinea cascadei este păstrată.

## Verificări

`node --check` trece pentru `script.js`, `pwa.js` și `sw.js`.

Testele locale automate rulează în Microsoft Edge headless, la lățimi de 1440 și 390 pixeli. Structura titlurilor, numărul controalelor și proprietățile CSS calculate selectate pentru elementele paginii sunt identice înainte și după curățare. Nu s-au observat excepții JavaScript și nu există ancore interne fără destinație sau ID-uri HTML duplicate.

S-au verificat: deschiderea/închiderea videoclipului principal, navigarea internă și închiderea tranziției, meniul mobil, selectarea edițiilor revistei, filtrele facilităților, căutarea, galeria persoanelor vârstnice, dialogul de instalare, pornirea/oprirea ambianței naturale și extinderea informațiilor „Știai că?”. Selectarea unei ediții verifică actualizarea interfeței, nu disponibilitatea PDF-ului.

Testele blochează solicitările externe și service worker-ul pentru rezultate locale reproductibile. Încărcarea hărții Leaflet, serviciul meteo, redarea YouTube/radio și instalarea/offline efectivă necesită verificare separată cu acces la rețea și în mediul public. Nu se pretinde validarea acestor integrări prin testele locale.

## Probleme existente, păstrate pentru remediere

1. **51 de referințe locale indică fișiere inexistente**, dintre cele 123 de căi unice verificate în atributele HTML `src`, `href`, `data-pdf` și `data-now-src`. Lista completă este în `.codex-backups/audit-2026-10-28/static.json`. Lipsesc `cartea/Monografia.pdf`, 21 dintre cele 22 de ediții ale revistei și 29 de imagini. În `pdf/` există doar ediția 21. Componentele sunt păstrate pentru completarea ulterioară cu fișierele corecte; unele imagini au deja interfață alternativă.
2. Cheia OpenWeatherMap este inclusă în JavaScript-ul public. Curățarea nu o mută și nu schimbă serviciul meteo; protejarea acesteia necesită o configurație pe server și verificarea restricțiilor furnizorului.
3. Leaflet este încărcat dintr-un URL fără versiune fixată. Fixarea unei versiuni trebuie făcută împreună cu verificarea hărții și a CSS-ului corespunzător.
4. CSS-ul conține numeroase suprascrieri istorice și reguli responsive. Nu au fost eliminate pe baza simplei absențe din ecranul inițial: există stări dinamice, galerii, dialoguri, stiluri Leaflet și elemente generate de JavaScript. O consolidare amplă necesită verificări vizuale pe toate capitolele și stările interactive.

## Reproducere și recuperare

- Rulare: `node audit-check.cjs after`. Scriptul folosește pachetul Playwright din runtime-ul local și Microsoft Edge instalat; nu introduce dependențe în site.
- Originalele fișierelor modificate sunt în `.codex-backups/audit-2026-10-28/original/`.
- Rezultatele structurate și capturile desktop/mobil sunt în `.codex-backups/audit-2026-10-28/`.
- Pentru recuperare, copiați fișierul dorit din `original/` peste omologul din proiect. La publicarea unei versiuni recuperate, actualizați din nou identificatorul cache-ului offline.
