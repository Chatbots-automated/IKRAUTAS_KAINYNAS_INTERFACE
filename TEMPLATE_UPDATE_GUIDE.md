# Official Template Integration Guide

## New Features Added

### 1. New Data Fields

The following fields have been added to the Offer model:

- **`client_birth_date`** (string): Client's birth date for contract documents
- **`payment_reference`** (string): Payment reference number for advance payment tracking
- **`warranty_years`** (number): Warranty period in years for the charging station (default: 5)

### 2. Official Templates

Three official HTML templates have been saved in `lib/templates/`:

- **`contract-template.html`**: Official SUTARTIS template
- **`pp-act-dynamic-template.html`**: PP Act with dynamic power controller
- **`pp-act-standard-template.html`**: PP Act without dynamic power controller

### 3. Document Preview Feature

You can now **preview documents before downloading**! Each export button now has two actions:

- **👁️ Preview**: Opens a modal showing exactly how the document will look
- **⬇️ Download**: Directly downloads the document

### 4. Smart PP Act Selection

The system automatically detects if your offer includes a "dinaminis galios valdiklis" (dynamic power controller) and uses the appropriate template:

- **With DGV**: Includes the paragraph about dynamic power management and 11kW limitation
- **Without DGV**: Uses the standard template

## Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add new fields to offers table
ALTER TABLE offers ADD COLUMN IF NOT EXISTS client_birth_date TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS warranty_years INTEGER DEFAULT 5;

-- Add comments
COMMENT ON COLUMN offers.client_birth_date IS 'Client birth date for contract documents';
COMMENT ON COLUMN offers.payment_reference IS 'Payment reference number for advance payment tracking';
COMMENT ON COLUMN offers.warranty_years IS 'Warranty period in years for the charging station';
```

Or simply run the migration file:
```bash
# In Supabase SQL Editor, copy-paste the content from:
supabase/migrations/20260220120000_add_offer_fields.sql
```

## Variable Mapping

The templates use these variables (shown in blue in originals):

### Contract (SUTARTIS):
- `{{offerNo}}` → Offer number
- `{{date}}` → Current date
- `{{clientName}}` → Client's full name
- `{{clientBirthDate}}` → Client's birth date
- `{{clientEmail}}` → Client email
- `{{clientPhone}}` → Client phone
- `{{clientAddress}}` → Client address
- `{{projectManagerName}}` → Project manager name
- `{{paymentReference}}` → Payment reference number (highlighted in contract)
- `{{warrantyYears}}` → Warranty years (for charging station)
- `{{finalTotal}}` → Final total with VAT and discounts
- `{{advancePayment}}` → 50% advance payment
- `{{finalPayment}}` → 50% final payment
- `{{productsTable}}` → Dynamic products table

### PP Act:
- All above variables plus:
- **Automatic detection**: Checks if offer contains "dinaminio galios valdiklio" or similar
- **Template selection**: Chooses between dynamic and standard versions automatically

### SAMATA (PDF):
- All offer details in Excel-style format
- Product table with categories
- Full pricing breakdown with discounts
- Company header with all official details

## UI Updates

The Offer Info Form now includes:

1. **Gimimo data** (Birth Date) - date input
2. **Mokėjimo nr.** (Payment Reference) - required field, shown prominently in contract
3. **Garantija (metai)** (Warranty Years) - number input, default 5 years

All three fields are marked as **required** during save validation.

## Testing the Templates

1. **Fill out an offer** with the new required fields
2. **Click the eye icon (👁️)** next to any export button to preview
3. **Verify** that:
   - All blue variables from original templates are filled
   - Payment reference appears in the contract
   - Warranty years appears correctly
   - Client birth date is included
   - Products are grouped by category
   - Totals match your calculations

4. **Download** the document to verify final formatting

## Export Button Layout

- **Top header**: "📥 Eksportuoti viską" (exports PDF + Contract at once)
- **Individual exports** (in sidebar):
  - 👁️ PDF / ⬇️ PDF
  - 👁️ Sutartis / ⬇️ Sutartis  
  - 👁️ PP aktas / ⬇️ PP

## Technical Notes

- Preview renders the exact structure that will be in the final document
- DOCX uses `docx` library with proper formatting
- PDF uses `jspdf` with `autoTable` for professional tables
- All blue text in previews represents dynamic data from your offer
- Templates support Lithuanian characters (ą, č, ę, ė, į, š, ų, ū, ž)
