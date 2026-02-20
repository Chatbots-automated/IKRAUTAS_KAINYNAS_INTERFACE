# How to Update the Įkrautas Logo

## Quick Steps (2 minutes)

### 1. Download the Logo
Go to: **https://i.imgur.com/Aeb1z5V.png**

Right-click → "Save image as..."

### 2. Save to Project
Save the file as: **`ikrautas-logo.png`**

Location: **`c:\Projects\ikrautas_kainynas_interface\public\`**

Final path: **`c:\Projects\ikrautas_kainynas_interface\public\ikrautas-logo.png`**

### 3. Restart Dev Server
In your terminal:
1. Press `Ctrl+C` to stop
2. Run: `npm run dev`
3. Wait for "Ready" message

### 4. Test
1. Create/open an offer
2. Export any DOCX document (Contract or PP Act)
3. Open the downloaded file
4. **Verify logo appears at the top!** ✅

---

## Where the Logo Appears

Once saved, the logo will automatically show in:
- ✅ DOCX Contract documents (top of first page)
- ✅ DOCX PP Act documents (top of first page)
- ✅ Excel SAMATA files (top left corner)

## Technical Details

The logo is loaded from `public/ikrautas-logo.png` by:
- `lib/exports/docx-generator.ts` (line ~40)
- `lib/exports/excel-generator.ts` (line ~17)

Expected dimensions: **186px × 63px** (automatically scaled)
Format: **PNG** (supports transparency)

---

## Troubleshooting

### Logo Not Showing?
1. Verify file exists: `c:\Projects\ikrautas_kainynas_interface\public\ikrautas-logo.png`
2. Check file name is **exactly**: `ikrautas-logo.png` (lowercase, no spaces)
3. Restart dev server (important!)
4. Clear browser cache
5. Try exporting a new document

### Still Not Working?
Check terminal for errors like:
- `ENOENT: no such file or directory`
- `Error reading logo file`

If you see these, the file path is wrong.

---

That's it! Download → Save → Restart → Test! 🎯
