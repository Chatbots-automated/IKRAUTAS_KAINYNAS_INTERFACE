# Testing Guide - How to Verify Everything Works

## ✅ Your Setup Status

- **Supabase**: Self-hosted at `http://127.0.0.1:55323`
- **Next.js**: Running at `http://localhost:3000`
- **Database**: Tables exist, 24 products seeded ✓

## 🧪 Test 1: Products Management

**What to test**: Create, edit, and delete products

1. Go to: `http://localhost:3000/products`
2. You should see 24 products
3. Click "**+ Naujas produktas**"
4. Fill in the form:
   - Name: "Test Product"
   - Price: "99.99"
   - Category: Select any
5. Click "**Sukurti**"
6. ✅ You should see the new product in the list
7. **Verify in Supabase**: 
   - Open: `http://127.0.0.1:55323/project/default/editor`
   - Open `products` table
   - You should see your "Test Product"

## 🧪 Test 2: Create an Offer

**What to test**: Full offer creation flow

1. Go to: `http://localhost:3000/new-offer`
2. **Fill client info** (right panel):
   - Client name: "Test Klientas"
   - Project manager: "Tavo Vardas"
3. **Add products** (middle panel):
   - Search for "Longi" or select from list
   - Click the **+** button on any product
   - Add 2-3 different products
4. **Check the cart** (right panel):
   - You should see products grouped by category
   - Edit quantities if you want
5. Click "**Išsaugoti**" (top right)
6. You should see: "Pasiūlymas sėkmingai išsaugotas" ✓
7. **Verify in Supabase**:
   - Go to `offers` table → should have 1 row
   - Go to `offer_items` table → should have 2-3 rows

## 🧪 Test 3: View Offers List

1. Go to: `http://localhost:3000`
2. You should see your test offer in the list
3. Click "**Peržiūrėti**" on your offer
4. It should load with all your data ✓

## 🔍 Debugging: Watch the Terminal

Open your terminal where `npm run dev` is running. When you save an offer, you should see:

```
Creating offer: { offerNo: '2026-XXX', clientName: 'Test Klientas', itemCount: 3 }
Offer created: <uuid>
Offer items created: 3
Offer saved successfully: <uuid>
POST /api/offers 200 in XXXms
```

If you DON'T see these logs, the offer isn't being saved.

## 🐛 Common Issues

### Issue: "Užpildykite kliento vardą"
**Solution**: Fill in both "Client name" and "Project manager name" fields

### Issue: "Pridėkite bent vieną produktą"
**Solution**: Add at least one product to the cart before saving

### Issue: No logs in terminal when clicking "Save"
**Possible causes**:
1. Check browser console (F12) for errors
2. Verify `.env.local` has correct Supabase URL
3. Make sure Supabase is running

### Issue: Offer saves but doesn't appear in list
**Solution**: Refresh the page at `http://localhost:3000`

## 📊 Check Your Data

After testing, verify everything in Supabase:

**Categories**: `http://127.0.0.1:55323/project/default/editor/1`
- Should have 5 rows

**Products**: `http://127.0.0.1:55323/project/default/editor/2`
- Should have 24+ rows (+ your test products)

**Offers**: `http://127.0.0.1:55323/project/default/editor/3`
- Should have your test offer(s)

**Offer Items**: `http://127.0.0.1:55323/project/default/editor/4`
- Should have items from your offers

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ You can create products at `/products`
2. ✅ New products appear in Supabase `products` table
3. ✅ You can create offers at `/new-offer`
4. ✅ Offers appear in Supabase `offers` table
5. ✅ Offer items appear in Supabase `offer_items` table
6. ✅ Offers list shows your created offers
7. ✅ You can edit offers at `/offers/[id]`
8. ✅ Terminal shows logs when saving

## 🚀 Next Steps After Testing

Once everything works:

1. **Clean up test data** (delete test products/offers)
2. **Add real products** via `/products` page
3. **Create real offers** for your clients
4. **Customize** as needed (add more fields, etc.)

---

**Need help?** Check the terminal logs and browser console (F12) for error messages!
