# Export Testing Guide 🎉

## ✅ What's Implemented

Real PDF and DOCX generation with automatic download to your PC!

### Export Types

1. **PDF Pasiūlymas** - Professional offer PDF
2. **Sutartis (DOCX)** - Contract document in Word format
3. **PP Aktas (DOCX)** - Acceptance-Handover Act in Word format

## 🧪 How to Test

### 1. Create a Test Offer

1. Go to: `http://localhost:3000/new-offer`
2. **Add products**:
   - Search for products
   - Click **+** to add them
   - Add at least 3-4 products
3. **Fill client info** (right panel):
   - Client name: "Test UAB"
   - Project manager: "Your Name"
   - Address, email, phone (optional but recommended)
   - Notes: "Test offer for export"
4. **Add discounts** (optional):
   - Try 10% discount
   - Try Ignitis discount €100

### 2. Export PDF

1. Scroll down in the right panel
2. Click **"Eksportuoti PDF"**
3. ✅ File should download automatically!
4. **Check the PDF**:
   - Opens without errors
   - Shows offer number
   - Shows client info
   - Products grouped by category
   - Totals calculated correctly
   - Discounts shown (if added)

### 3. Export DOCX (Contract)

1. Click **"Sutartis (DOCX)"**
2. ✅ DOCX file downloads automatically!
3. **Open in Word/LibreOffice**:
   - Title: "SUTARTIS"
   - All offer details present
   - Table with products
   - Totals section
   - Professional formatting

### 4. Export PP Act

1. Click **"PP aktas (DOCX)"**
2. ✅ Another DOCX downloads!
3. **Check the document**:
   - Title: "PRIĖMIMO-PERDAVIMO AKTAS"
   - Same data, different format
   - Ready for signing

## 📋 What Gets Exported

### Included in All Documents:

✅ Offer number (e.g., "2026-001")  
✅ Date (current date)  
✅ Client information (name, address, email, phone)  
✅ Project manager name  
✅ Products grouped by category:
  - Įkrovimo stotelės
  - Inverteriai
  - Saulės moduliai
  - Montavimo sistema
  - Kita
✅ Each product shows:
  - Name
  - Quantity (or hidden if checkbox checked)
  - Unit price
  - Total price
✅ Financial summary:
  - Subtotal (before VAT)
  - VAT (21%)
  - Total (with VAT)
  - Discount percentage (if applied)
  - Ignitis discount (if applied)
  - **Final total**
✅ Notes (if added)

## 🎨 Document Styling

### PDF Features:
- Professional header with centered title
- Clean table layout
- Striped rows for readability
- Bold category headers
- Right-aligned numbers
- Page numbers in footer

### DOCX Features:
- Proper heading styles
- Word-compatible table formatting
- Category headers with gray background
- Professional layout for printing

## 🐛 Troubleshooting

### "Užpildykite pasiūlymą prieš eksportavimą"
**Solution**: Add at least:
- Client name
- Project manager
- One product

### File doesn't download
**Possible causes**:
1. Check browser console (F12) for errors
2. Check browser's download settings
3. Try a different browser
4. Check terminal for API errors

### PDF looks weird
- This is the first version - it's functional!
- Can be customized later (fonts, colors, layout)

### DOCX won't open
- Make sure you have Word or LibreOffice installed
- File format is .docx (Office 2007+)

## 💡 Tips

1. **Test with real data**: Use actual product names and prices to see how it looks
2. **Try different scenarios**:
   - With/without discounts
   - With/without notes
   - Different product quantities
   - Mix of products and services
3. **Check calculations**: Verify totals match what's shown in the UI
4. **Print test**: Try printing the PDFs to see how they look on paper

## 🚀 Next Steps

If exports work well, you can:

1. **Customize templates**:
   - Add company logo
   - Change colors
   - Adjust fonts
   - Add terms & conditions

2. **Add more fields**:
   - Payment terms
   - Validity period
   - Signature fields
   - Company details

3. **Email integration**:
   - Send PDFs directly to clients
   - Auto-attach to emails

4. **Cloud storage**:
   - Save to Google Drive
   - Archive in Dropbox
   - Store in Supabase storage

---

**Ready to test?** Create an offer and click those export buttons! 🎯
