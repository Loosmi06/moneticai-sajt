# MonetIC AI — sajt

Kompletan statički sajt (HTML/CSS/JS, bez baze i bez frameworka).
Radi lokalno duplim klikom na `index.html` i može da se okači na bilo koji hosting.

---

## Struktura

```
moneticai/
├── index.html          → Početna
├── shop.html           → Shop (vodiči, kursevi, AI alati, besplatno)
├── vesti.html          → AI Vesti
├── o-nama.html         → O nama
├── kontakt.html        → Kontakt (forma)
├── README.md           → ovo uputstvo
└── assets/
    ├── css/style.css   → sav dizajn (boje, tipografija, responsive)
    ├── js/main.js      → meni, filteri, FAQ, forme, animacije
    ├── fonts/          → Poppins (lokalno — sajt radi i bez interneta)
    └── img/            → maskota (pozadina uklonjena, PNG sa providnošću)
```

---

## Kako da postaviš sajt online

**Najbrže (besplatno):** idi na [netlify.com/drop](https://app.netlify.com/drop) i prevuci
ceo folder `moneticai` u prozor. Za par sekundi dobijaš link tipa `nesto.netlify.app`,
a kasnije možeš da zakačiš svoj domen (npr. `moneticai.rs`).

**Ostale opcije:** GitHub Pages, Vercel, ili klasičan hosting — u tom slučaju sadržaj
foldera ide u `public_html/` preko FTP-a.

---

## Šta obavezno promeni pre objave

| Šta | Gde |
|---|---|
| Email adresa (`kontakt@moneticai.rs`) | `kontakt.html` — atribut `data-mailto` i tekst; footer svih stranica |
| Instagram / YouTube / TikTok linkovi | `href="#"` u `.socials` bloku (footer svih stranica) i u `kontakt.html` |
| Linkovi na proizvode (Gumroad / Payhip) | `shop.html` — dugmad „Kupi odmah" / „Upiši se" (`href="#"`) |
| Affiliate linkovi za alate | `shop.html` — dugmad „Isprobaj" (`href="#"`) |
| Cene | `shop.html` i `index.html` — blok `<span class="price__now">` |
| Tekst „Iza brenda" | `o-nama.html` — sekcija sa komentarom `<!-- ============ IZA BRENDA -->` |

---

## Kontakt forma — poruke idu u Supabase bazu

Forma na `kontakt.html` upisuje svaku poruku u tabelu `poruke` u tvojoj **Supabase**
bazi (besplatan servis, prava baza podataka koju kontroliše samo ti). Dok ne podesiš
nalog, forma automatski radi preko starog sistema (otvara mejl klijent posetioca) —
znači sajt radi i pre nego što ovo podesiš.

### 1. Napravi Supabase nalog i projekat
Idi na [supabase.com](https://supabase.com), napravi besplatan nalog i novi projekat
(izaberi region blizu tebe, npr. Frankfurt). Sačekaj par minuta da se projekat pokrene.

### 2. Napravi tabelu `poruke`
U Supabase dashboard-u otvori **SQL Editor** → **New query**, nalepi ovo i klikni **Run**:

```sql
create table poruke (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  ime text not null,
  email text not null,
  tema text,
  poruka text not null
);

alter table poruke enable row level security;

create policy "Dozvoli anonimni unos"
on poruke
for insert
to anon
with check (true);
```

Ovo pravi tabelu i dozvoljava da sajt **upisuje** poruke, ali niko sa strane ne može
da ih **čita** preko sajta — poruke vidiš samo ti, ulogovan u Supabase dashboard
(**Table Editor** → `poruke`).

### 3. Poveži sajt sa projektom
U Supabase dashboard-u idi na **Settings → API**. Kopiraj:
- **Project URL**
- **anon public** ključ (NE `service_role` ključ — taj se nikad ne stavlja na sajt)

Otvori `assets/js/supabase-config.js` i upiši ih:

```js
window.SUPABASE_URL = "https://tvoj-projekat.supabase.co";
window.SUPABASE_ANON_KEY = "tvoj-anon-public-ključ";
```

Sačuvaj fajl i osveži `kontakt.html` u browseru — forma sad upisuje direktno u bazu.

### 4. (Opciono) Mejl obaveštenje kad stigne nova poruka
Supabase sam po sebi ne šalje mejl. Najlakši dodatak: napravi besplatan **Zapier** ili
**Make.com** nalog, poveži ga sa Supabase (preko „Database Webhooks" u
**Database → Webhooks**) i podesi da ti svaka nova poruka u tabeli `poruke` stigne
i na mejl. Nije obavezno — poruke stoje sačuvane u bazi u svakom slučaju.

Isti princip (Supabase tabela) može da se iskoristi i za newsletter polja
(`data-newsletter`) ako kasnije poželiš svoju bazu email adresa umesto Mailchimp/MailerLite servisa.

---

## Kako da dodaš novu vest

U `vesti.html` nađi `<div class="grid grid--3" id="vesti-lista">` i nalepi blok:

```html
<article class="news-card reveal" data-cat="modeli">
  <div class="news-card__meta"><span class="tag">Novi modeli</span><span>01.09.2026.</span></div>
  <h3>Naslov vesti</h3>
  <p>Dve do tri rečenice: šta se desilo i zašto je bitno čitaocu.</p>
  <a class="news-card__link" href="LINK-KA-IZVORU" target="_blank" rel="noopener">Izvor: Ime medija
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
  </a>
</article>
```

Vrednosti za `data-cat`: `modeli`, `alati`, `video`, `biznis`, `regulativa`
(mora da se poklapa sa dugmetom u filteru). Ne zaboravi da promeniš datum
„Ažurirano" iznad liste.

## Kako da dodaš novi proizvod

U `shop.html` kopiraj bilo koju `<article class="product ...">` karticu i promeni
tekst, cenu i `data-cat` (`e-knjige`, `kursevi`, `alati`, `besplatno`).

---

## Slike

Maskota je isečena sa bele pozadine i snimljena kao PNG sa providnošću, pa lepo leži
na svakoj podlozi. Ako dodaješ nove slike, drži ih u `assets/img/` i ubaci sa
`loading="lazy"` da se stranica brže učitava.

| Fajl | Gde se koristi |
|---|---|
| `robot-hero.png` | hero na početnoj, „O nama" |
| `robot-stand.png` | vesti, o nama, shop kartice |
| `robot-wave.png` | kontakt, CTA trake |
| `robot-money.png` | shop |
| `robot-present.png` | koraci, glavna vest |
| `robot-head.png` | logo u navigaciji |
| `favicon.png` | ikonica u tabu pretraživača |

---

## Sitnice koje pomažu

- **SEO:** svaka stranica ima svoj `<title>` i `<meta name="description">` — promeni ih
  ako menjaš sadržaj. Za lepši prikaz na društvenim mrežama, `og:image` u `index.html`
  treba da vodi na punu adresu (npr. `https://moneticai.rs/assets/img/robot-hero.png`).
- **Boje** se menjaju na jednom mestu — na vrhu `assets/css/style.css`, u `:root` bloku
  (`--brand: #FF5733`).
- **Vesti stare brzo.** Datumi u sadržaju su iz avgusta 2026 — osveži ih kad okačiš sajt.
