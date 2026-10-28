# Monografia comunei Bustuchin

Site static. Nu necesită un pas de build sau instalarea unui framework.

## Previzualizare

Din folderul proiectului:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Deschideți `http://127.0.0.1:8000/`. Folosiți un server local, deoarece încărcarea datelor geografice și service worker-ul nu funcționează corect prin deschiderea directă a fișierului HTML.

## Organizarea codului

- `index.html`: conținutul și metadatele ediției.
- `script.js`: meniuri, navigare, progres și instrumentele de explorare.
- `js/galleries.js`: galerii, videoclipuri, comparații fotografice, cititorul revistei și pregătirea textelor editoriale.
- `js/map.js`: harta, cele 40 de obiective, filtrele, traseele și lista accesibilă.
- `js/weather.js`: vremea și prognoza; coordonatele sunt aliniate cu punctul Bustuchin din hartă.
- `js/search.js`: căutare în text, filtrare pe capitole, evidențiere și navigare prin tastatură.
- `js/audio.js`: sunete naturale și radio.
- `js/reading.js`: mărimea textului, poziția lecturii și semnele de carte.
- `js/materials.js` și `js/content-status.js`: disponibilitatea documentelor și prezentarea materialelor lipsă.
- `style.css` și `css/`: stilurile, importate într-o ordine intenționată.
- `vendor/leaflet/`: Leaflet 1.9.4 cu licența și resursele sale. Biblioteca este locală; imaginile de fundal ale hărții sunt online. Versiunea și hash-urile au fost verificate după [documentația oficială Leaflet](https://leafletjs.com/download.html).

Ordinea scripturilor `defer` din HTML este importantă. Galeriile se pregătesc înainte de construirea indexului de căutare.

## Adăugarea materialelor lipsă

1. Copiați fotografia sau PDF-ul original la calea indicată în `data/content-report.json`. Respectați numele și literele mari/mici pentru găzduirea pe Linux.
2. Rulați `python tools/check-content.py`. Comanda regenerează raportul și manifestul folosit de interfață. Documentele adăugate vor redeveni disponibile la următoarea încărcare.
3. Pentru fotografii noi, completați descrierea `alt`, dimensiunile reale și `loading="lazy"`, cu excepția imaginii principale.
4. Pentru fotografii WebP mari puteți rula `python tools/prepare-images.py` într-un mediu cu Pillow. Comanda creează variante de 640/1024 px și actualizează `srcset`, păstrând sursele originale. Verificați încadrarea și lizibilitatea.
5. Actualizați identificatorul `CACHE` din `sw.js` înainte de publicare. Adăugați în `SHELL` orice nou script sau fișier CSS necesar lecturii offline.

Validatorul verifică referințele statice HTML, variantele `srcset`, ID-urile și ancorele. Referințele generate dinamic și serviciile externe se verifică suplimentar în browser. `python tools/check-content.py --strict` întoarce cod de eroare și când lipsesc materiale.

## Surse și actualizări editoriale

Bibliografia și autorii existenți sunt prezentați în secțiunea „Despre monografie”. Legătura este accesibilă și din instrumentele de lectură. Păstrați anul de referință al statisticilor istorice. Pentru informații noi, notați sursa concretă, autorul fotografiei unde este cunoscut și data verificării în secțiunea relevantă.

Data de 28 octombrie 2026 afișată în nota editorială este data reviziei tehnice. Nu reprezintă validarea istorică a fiecărei afirmații. Cele 51 de materiale lipsă nu au fost înlocuite cu documente sau fotografii inventate.

## Teste și limite

```powershell
node --check script.js
node tools/check-site.cjs
node tools/check-integrations.cjs
python tools/check-content.py
```

Testele browser folosesc Playwright din runtime-ul local al acestui calculator și Microsoft Edge instalat. Rezultatele sunt în `.codex-backups/improvements-2026-10-28/checks/`.

Verificările acoperă desktop/mobil, controalele existente, căutarea în text, filtrarea, focalizarea în dialog, mărirea efectivă a textului, persistența și ștergerea semnelor de carte, reluarea lecturii, stocarea blocată, documentele indisponibile și harta. Dacă există răspunsurile meteo locale de test, se verifică și afișarea temperaturii și a celor trei zile de prognoză.

`check-integrations.cjs` verifică biblioteca locală, marcajele, controalele hărții, înregistrarea service worker-ului și reîncărcarea offline cu căutare funcțională. Mediul browser de test blochează unele domenii externe: acest lucru este consemnat în raport, separat de erorile aplicației. Serviciul meteo a fost verificat separat prin cereri reale pentru vreme și prognoză, ambele cu răspuns HTTP 200. Redarea YouTube/radio și harta de fundal OpenStreetMap necesită o verificare în browserul public cu acces la aceste servicii.

Cheia OpenWeatherMap rămâne în codul public al site-ului static. Ascunderea ei necesită o componentă pe server; mutarea ei într-un alt fișier JavaScript nu ar proteja-o.

Poziția lecturii, preferințele și semnele de carte sunt locale browserului. Nu sunt trimise către un cont sau un server al aplicației. Controalele funcționează și când stocarea este blocată, dar preferințele nu pot fi păstrate între vizite.

## Recuperare

Versiunea dinaintea acestor îmbunătățiri este salvată în `.codex-backups/improvements-2026-10-28/`. Auditul și originalele anterioare sunt păstrate separat în `.codex-backups/audit-2026-10-28/`. Aceste foldere și instrumentele de test nu trebuie publicate pe site.

## Bara fixă de lectură

Controalele sunt într-o bară compactă pe toată lățimea, imediat sub meniul cu logo. „Am rămas aici” salvează manual pasajul curent; derularea și închiderea paginii nu suprascriu această poziție. „Continuă” revine la pasaj, ținând cont de înălțimea celor două bare fixe. Mărimea textului și „Mod lectură” se păstrează local. Modul de lectură folosește hârtie crem, text închis și fonturi serif pentru proză; fotografiile și funcțiile interactive rămân disponibile. Semnele de carte, sursele și ștergerea poziției sunt în „Mai multe”.

### Verificarea contrastului în modul de lectură

`node tools/check-reader-contrast.cjs` verifică textele randate în capitole, pe desktop (1440 px) și mobil (414 px), inclusiv cu secțiunile `details` deschise. Verificarea compară culorile calculate cu fundalurile compuse și pragurile 4,5:1 pentru text obișnuit / 3:1 pentru text mare. Capturile sunt inspectate separat, deoarece fundalurile fotografice și pseudo-elementele nu pot fi evaluate complet prin această metodă. Nu este o certificare completă de accesibilitate. Rapoartele și capturile sunt în `.codex-backups/improvements-2026-10-28/checks/contrast-*`.
