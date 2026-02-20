# Official Templates Implementation

## 🎉 What's New

Your offer creation interface now uses **your exact official templates** for all document exports!

## ✅ Completed Changes

### 1. **New Required Fields**

Added to the Offer Info Form (right sidebar):

- ✅ **Gimimo data** (Birth Date) - Date picker
- ✅ **Mokėjimo nr.** (Payment Reference) - Required field, e.g., "2026-001"
- ✅ **Garantija (metai)** (Warranty Years) - Number input, defaults to 5 years

### 2. **Official Template Files**

Saved in `lib/templates/`:

- ✅ `contract-template.html` - SUTARTIS (Contract)
- ✅ `pp-act-dynamic-template.html` - PP Act with dynamic power controller
- ✅ `pp-act-standard-template.html` - PP Act without dynamic power controller

### 3. **Smart PP Act Selection**

The system **automatically** chooses the correct PP Act template:

- If offer contains "dinaminio galios valdiklio" or "DGV" → Uses **dynamic template**
- Otherwise → Uses **standard template**

### 4. **Document Preview Feature** 👁️

**NEW!** You can now preview documents before downloading!

Each export button now has TWO actions:

- **👁️ (Eye icon)**: Preview the document in a modal
- **⬇️ (Download icon)**: Direct download

### 5. **Updated Export UI**

The export section now shows:

```
📥 Visi dokumentai (Quick export all)

👁️ PDF    | ⬇️ PDF
👁️ Sutartis | ⬇️ Sutartis  
👁️ PP aktas  | ⬇️ PP
```

All buttons fit perfectly without scrolling issues!

## 🗄️ Database Update Required

**IMPORTANT**: Run this SQL in your Supabase SQL Editor:

```sql
-- Add new fields to offers table
ALTER TABLE offers ADD COLUMN IF NOT EXISTS client_birth_date TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS warranty_years INTEGER DEFAULT 5;
```

Or run the file: `supabase/RUN_THIS_UPDATE.sql`

## 📋 Variable Mapping

### All Documents Use:

| Variable | Source | Example |
|----------|--------|---------|
| `{{offerNo}}` | Offer number | `IKR-2026-001` |
| `{{date}}` | Current date | `2026-02-20` |
| `{{clientName}}` | Client name | `Jonas Jonaitis` |
| `{{clientBirthDate}}` | Birth date | `1990-01-15` |
| `{{clientEmail}}` | Email | `jonas@example.com` |
| `{{clientPhone}}` | Phone | `+370 600 00000` |
| `{{clientAddress}}` | Address | `Vilnius g. 1` |
| `{{projectManagerName}}` | PM name | `Gratas Gedraitis` |
| `{{paymentReference}}` | Payment ref | `2026-001` |
| `{{warrantyYears}}` | Warranty | `5` |
| `{{finalTotal}}` | Final total | `5 234,56 €` |
| `{{advancePayment}}` | 50% advance | `2 617,28 €` |
| `{{finalPayment}}` | 50% final | `2 617,28 €` |

### SUTARTIS (Contract) Specific:

- Full company details (UAB Įkrautas, codes, bank account)
- 4 numbered sections with subsections
- Products table with categories
- Payment terms (50% advance, 50% after completion)
- Warranty details (station, work, materials)
- Link to general terms
- Signature section for both parties

### PP AKTAS (Delivery Act) Specific:

- Party table (Užsakovas vs Vykdytojas)
- Products table
- Service address
- Numbered clauses (1-6)
- **Dynamic version only**: 
  - Mentions dynamic power controller
  - 11kW power limitation clause
- Signature table with name underlines

### SĄMATA (PDF Quote) Specific:

- Full company header (address, bank, codes)
- Offer info (PIRKĖJAS, PROJEKTAS, dates)
- Right column: PM info, client details, payment ref, birth date
- Excel-style products table with:
  - Eil. Nr. (Item number)
  - Kodas (SKU)
  - Aprašymas (Description)
  - Kaina, EUR (Price)
  - Kiekis, vnt. (Quantity)
  - Suma, EUR (be PVM) (Subtotal)
  - Suma, EUR (su PVM) (Total with VAT)
- Totals breakdown
- Footer note: "(+pasirinktos stotelės ar įrangos kaina)"

## 🧪 How to Test

1. **Apply the database migration** (see above)
2. **Restart your dev server** if needed
3. **Create a new offer** or edit an existing one
4. **Fill in the new fields**:
   - Birth date: Pick any date
   - Payment reference: e.g., `2026-001`
   - Warranty years: Leave at 5 or change
5. **Click the eye icon (👁️)** to preview any document
6. **Verify** all data appears correctly in blue
7. **Download** the document to verify formatting

## 📁 File Changes

### New Files:
- `lib/templates/contract-template.html`
- `lib/templates/pp-act-dynamic-template.html`
- `lib/templates/pp-act-standard-template.html`
- `components/DocumentPreviewModal.tsx`
- `supabase/migrations/20260220120000_add_offer_fields.sql`
- `supabase/RUN_THIS_UPDATE.sql`

### Modified Files:
- `lib/types.ts` - Added new fields to `Offer` and `OfferFormData`
- `lib/store/offer-store.ts` - Updated initial state
- `components/OfferInfoForm.tsx` - Added 3 new input fields
- `components/ExportButtons.tsx` - Added preview functionality
- `lib/exports/pdf-generator.ts` - Updated to match SAMATA template
- `lib/exports/docx-generator.ts` - Completely rewritten for official templates
- `app/api/offers/route.ts` - Save new fields
- `app/api/offers/[id]/route.ts` - Update new fields
- `app/new-offer/page.tsx` - Validation for new required fields
- `app/offers/[id]/page.tsx` - Load and save new fields

## 🚀 Next Steps

After applying the database migration:

1. The export buttons will be fully functional
2. Preview feature will work immediately
3. All documents will match your official templates exactly
4. Variables in blue will be filled with real data

## 💡 Tips

- **Payment Reference** is highlighted in the contract for easy visibility
- **Warranty Years** appears in the contract's warranty section
- **Birth Date** is included in the client info line
- Preview modal is **responsive** and **scrollable** for long offers
- The system **remembers** all fields when editing existing offers
