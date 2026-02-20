# Quick Start Guide

## 1. Database Setup (5 minutes)

### Run this SQL in Supabase SQL Editor:

Open: **http://127.0.0.1:55323/project/default/sql**

Copy and paste the contents of: `supabase/RUN_THIS_TEMPLATES.sql`

Click "Run" ✅

## 2. Test the System

### Test Offer Creation:
1. Go to: http://localhost:3000/new-offer
2. Fill in client details
3. Add some products
4. Fill in **all required fields** (especially Payment Reference)

### Test Excel Export (SAMATA):
1. Click "⬇️ SAMATA" button
2. Verify logo appears
3. Check purple columns (Purchase Price, Margin)
4. Verify all data is correct

### Test DOCX Export (Contract):
1. Click "⬇️ Sutartis" button
2. Open the downloaded DOCX
3. Verify logo appears at top
4. Verify all data filled correctly

### Test PP Act Export:
1. Click "⬇️ PP" button
2. Verify correct template used (with/without DGV)
3. Verify logo appears

### Test Template Editor:
1. Go to: http://localhost:3000/templates
2. Select "Sutartis" from left sidebar
3. Click "✏️ Redaguoti"
4. Make a small change
5. Click "💾 Išsaugoti"
6. Go back to offer and export again to verify change

## 3. Required Fields

Make sure these are filled when creating an offer:
- Client Name **REQUIRED**
- Client Birth Date **REQUIRED**
- Client Address
- Client Email
- Client Phone
- Project Manager Name **REQUIRED**
- **Payment Reference** **REQUIRED**
- Warranty Years (default: 5)

## 4. Done!

You're ready to create offers and export professional documents! 🎉

---

## Quick Links

- **New Offer**: http://localhost:3000/new-offer
- **Templates Editor**: http://localhost:3000/templates
- **Products Manager**: http://localhost:3000/products

---

## Need Help?

Check `EXPORT_TEMPLATES_COMPLETE.md` for detailed documentation.
