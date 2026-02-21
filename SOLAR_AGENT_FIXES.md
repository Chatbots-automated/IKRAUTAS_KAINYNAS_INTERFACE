# Solar Agent Fixes - 2026-02-21

## Issues Fixed:

### 1. **Model Name Error (404)**
**Problem:** `claude-sonnet-4-5-20250124` doesn't exist
**Fix:** Changed to `claude-3-5-sonnet-20241022` (valid model)

### 2. **Raw JSON Showing in UI**
**Problem:** Response showed markdown blocks like:
```
Sveiki...

```json
{
  "message": "...",
  "variables": {}
}
```
```

**Fix:** Improved markdown stripping with multiple regex passes + JSON extraction fallback

### 3. **Agent Not Using Supabase Tools**
**Problem:** Agent wasn't querying database for products
**Fix:** Updated system prompt to:
- Explicitly instruct to USE tools proactively
- "After collecting data → USE get_category_products('solar-panels')"
- "Don't recommend without checking database first!"

### 4. **Conversation Context**
**Problem:** Claude thought it was talking to end client
**Fix:** Clarified you're the sales manager, client info comes from you

## How It Works Now:

1. **Sales Manager** (you) inputs client info: "Kliento info yra Gratas Gedraitis..."
2. **Claude** extracts variables → fills right panel
3. **Claude** uses `search_solar_products()` and `get_category_products()` to query Supabase
4. **Claude** recommends REAL products from your catalog with prices
5. **Variables** auto-fill on the right side

## Tools Available to Claude:

### `search_solar_products(query: string)`
Searches products table for solar modules, inverters, mounting systems
Example: `search_solar_products("10kW inverteris")`

### `get_category_products(categorySlug: string)`
Gets all products from category:
- `'solar-panels'` - Saulės moduliai
- `'inverters'` - Inverteriai
- `'mounting'` - Montavimo sistema

## Test It:

1. Go to `/solar-plants`
2. Say: "Kliento kontaktai: Gratas Gedraitis, Dariaus 23, 061175707"
3. Watch variables fill on right
4. Say: "Klientas turi 80m² šlaitinį stogą, suvartoja 450 kWh/mėn"
5. Claude will query Supabase and recommend actual products

## Fixed Files:
- `app/api/claude/solar-consultation/route.ts` - Model name, parsing, tool usage
- `app/solar-plants/page.tsx` - Initial greeting
