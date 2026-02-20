# Kainynas - Pasiūlymų Sistema

Pasiūlymų kūrimo ir valdymo sistema su produktų katalogu, kainų skaičiavimu ir dokumentų eksportavimu.

## Technologijos

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **Database:** Supabase (Self-hosted)
- **Node:** 20+

## Funkcionalumas

### ✅ Įgyvendinta

- **Supabase integracija** - Pilnai veikianti duomenų bazė
  - Kategorijos ir produktai saugomi DB
  - Pasiūlymai persistuojami su visomis eilutėmis
  - CRUD operacijos per API routes
- **Pasiūlymų sąrašas** (`/`) - Visų pasiūlymų peržiūra iš DB
- **Naujo pasiūlymo kūrimas** (`/new-offer`) - Triejų stulpelių layout
  - Kairėje: kategorijų pasirinkimas ir filtrai
  - Centre: produktų katalogas su paieška
  - Dešinėje: pasiūlymo krepšelis su kainų skaičiavimu
  - **Išsaugojimas į Supabase**
- **Pasiūlymo redagavimas** (`/offers/[id]`) - Esančio pasiūlymo peržiūra/redagavimas
  - **Duomenys kraunami iš Supabase**
  - **Pakeitimai išsaugomi į DB**
- **Produktų katalogas** - 24 produktai, 5 kategorijose (iš DB)
- **Kainų skaičiavimas**:
  - Automatinis PVM (21%) skaičiavimas
  - Nuolaida procentais su toggle (prieš/po PVM)
  - Ignitis fiksuota nuolaida eurais
- **Eksportavimas** (placeholder API):
  - PDF pasiūlymas
  - DOCX sutartis
  - DOCX PP aktas

### Kategorijos

1. Įkrovimo stotelės
2. Inverteriai
3. Saulės moduliai
4. Montavimo sistema
5. Kita

## Duomenų bazės schema

Supabase migracijos failas: `supabase/migrations/20260220000000_initial_schema.sql`

### Lentelės

- **users** - Vartotojai (custom, ne Supabase Auth)
- **categories** - Produktų kategorijos
- **products** - Produktų katalogas
- **offers** - Pasiūlymai
- **offer_items** - Pasiūlymų eilutės

## Paleidimas

### 1. Įdiekite priklausomybes

```bash
npm install
```

### 2. Supabase Setup

**IMPORTANT:** You must set up Supabase before the app will work!

Follow the detailed guide in [SUPABASE_SETUP.md](SUPABASE_SETUP.md) or:

#### Quick Setup:

1. Apply the migration:
```bash
supabase db push
```

2. Visit the setup page:
```
http://localhost:3000/setup
```

3. Click "Seed Database" button

### 3. Patikrinkite .env.local

Patikrinkite, kad `.env.local` failas turi teisingus Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Paleiskite dev serverį

```bash
npm run dev
```

Atsidarykite [http://localhost:3000](http://localhost:3000) naršyklėje.

## Projektų struktūra

```
├── app/
│   ├── api/
│   │   └── offers/export/          # Export API routes (placeholders)
│   ├── offers/[id]/                # Offer edit page
│   ├── new-offer/                  # New offer creation page
│   ├── layout.tsx                  # Root layout with ToastProvider
│   ├── page.tsx                    # Offers list page
│   └── globals.css                 # Global styles & animations
├── components/
│   ├── ui/                         # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   ├── CategorySidebar.tsx         # Left sidebar with categories
│   ├── ProductCatalog.tsx          # Middle panel with product list
│   ├── ProductAddModal.tsx         # Product add modal
│   ├── OfferCart.tsx               # Right panel - offer cart
│   ├── OfferInfoForm.tsx           # Client info form
│   ├── OfferItemsGroup.tsx         # Grouped items by category
│   ├── TotalsCard.tsx              # Totals calculation card
│   ├── ExportButtons.tsx           # Export action buttons
│   └── CustomItemModal.tsx         # Custom line item modal
├── lib/
│   ├── types.ts                    # TypeScript interfaces
│   ├── mock-data.ts                # Mock product catalog
│   ├── store/
│   │   └── offer-store.ts          # Zustand state management
│   ├── utils/
│   │   ├── calculations.ts         # Price calculations
│   │   └── search.ts               # Search & filtering
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       └── server.ts               # Server Supabase client
└── supabase/
    └── migrations/
        └── 20260220000000_initial_schema.sql  # Database schema
```

## UX Funkcijos

- **Greita paieška:** Paspauskite `/` bet kuriame puslapyje
- **Keyboard navigation:** Arrow keys produktų sąraše
- **Drag & edit:** Tiesioginis kiekio/kainos redagavimas krepšelyje
- **Toast notifications:** Grįžtamasis ryšys po kiekvieno veiksmo
- **Responsive design:** Optimizuota laptopams (min 1280px)
- **Empty states:** Informatyvūs pranešimai, kai nėra duomenų

## Verslo logika

### Kainų skaičiavimas

1. **Line total** = unit_price × quantity
2. **Subtotal** = sum(line totals)
3. **VAT** = subtotal × 0.21 (arba pagal produkto VAT rate)
4. **Total** = subtotal + VAT
5. **Discount** (toggle):
   - **Po PVM:** total - (total × discount_percent / 100)
   - **Prieš PVM:** (subtotal × (1 - discount_percent / 100)) × 1.21
6. **Ignitis discount:** Atimama nuo galutinės sumos
7. **Final total:** Math.max(0, total - discounts)

### Grupavimas

Produktai visada grupuojami pagal kategoriją ir rūšiuojami:
1. Pagal `category.sort_order` (1, 2, 3, 4, 999)
2. Viduje kategorijos - pagal `item.sort_order`, tada pagal pavadinimą

## API Endpoints

### Data Operations

- `GET /api/categories` - Fetch all categories
- `GET /api/products` - Fetch all products
  - Query params: `?category_id=uuid` (optional filter)
- `GET /api/offers` - Fetch all offers
- `POST /api/offers` - Create new offer
- `GET /api/offers/[id]` - Fetch specific offer with items
- `PUT /api/offers/[id]` - Update existing offer
- `DELETE /api/offers/[id]` - Delete offer

### Database Seeding

- `POST /api/seed` - Seed database with initial categories and products

### Export (Placeholders)

- `POST /api/offers/export/pdf` - PDF pasiūlymo generavimas
- `POST /api/offers/export/contract` - DOCX sutarties generavimas
- `POST /api/offers/export/pp-act` - DOCX PP akto generavimas

Export endpoints return:
```json
{
  "ok": true,
  "url": "/mock/file.ext",
  "message": "Success message"
}
```

## Tolimesni žingsniai

- [x] ~~Supabase duomenų sinchronizacija~~ ✅ COMPLETE
- [ ] Tikras PDF/DOCX generavimas
- [ ] Autentifikacija ir vartotojų valdymas
- [ ] Produktų CRUD interface (add/edit/delete products)
- [ ] Produktų importas/eksportas (CSV/Excel)
- [ ] Email siuntimas klientams
- [ ] Medžiagų žiniaraščio generavimas
- [ ] Pasiūlymų klonavimas
- [ ] Pasiūlymų statusų valdymas (draft → sent → accepted/rejected)
- [ ] Istorijos sekimas (audit log)
- [ ] Ataskaitos ir statistika

## Licencija

Private project.
