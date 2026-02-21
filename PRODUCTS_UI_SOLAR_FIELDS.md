# Products UI - Solar Fields Integration ☀️

## What Was Updated

### ✅ Database Schema
- **Location**: `supabase/migrations/20260221000000_add_solar_product_fields.sql`
- **13 new solar-specific fields** added to products table
- Migration already applied ✓

### ✅ Products Page UI (`/products`)

#### Dynamic Form Fields
The product form now **automatically shows solar fields** when category is solar-related:
- Detects if selected category is: `solar-panels`, `inverters`, or `mounting`
- Shows "☀️ Saulės elektrinės duomenys" section with all solar fields

#### Solar Fields in Form:
1. **Galia** (Power Output) - e.g., "450 W", "10 kW"
2. **Gamintojas** (Brand) - e.g., "JA Solar", "Huawei"
3. **Efektyvumas** (Efficiency %) - e.g., 21.5
4. **Garantija** (Warranty years) - e.g., 25
5. **Technologija** (Technology Type) - e.g., "Monocrystalline"
6. **Montavimo tipas** (Installation Type) - e.g., "Roof-mounted"
7. **Matmenys** (Dimensions) - e.g., "1722x1134x30 mm"
8. **Svoris** (Weight kg) - e.g., 22.5
9. **Sertifikatai** (Certifications) - e.g., "CE, IEC 61215"
10. **Aprašymas** (Description) - Text area for details

#### Inverter-Specific Fields:
- **Max įėjimo įtampa** (Max Input Voltage) - e.g., "1100 V"
- **MPPT kanalai** (MPPT Channels) - e.g., 2

#### Enhanced Table View:
- Shows **Galia** (Power) with ⚡ badge
- Shows **Gamintojas** (Brand)
- Shows **Technologija** under product name
- Cleaner layout with key specs visible

### ✅ API Routes Updated

#### POST `/api/products`
- Now accepts all 13 solar fields
- Automatically stores them when creating products

#### PUT `/api/products/[id]`
- Now accepts all 13 solar fields
- Updates solar specs when editing products

### ✅ TypeScript Types
- Updated `Product` interface in `lib/types.ts`
- All solar fields properly typed
- Optional fields (can be null)

## How to Use

### 1. Create/Edit Solar Product:
1. Go to `/products`
2. Click "+ Naujas produktas"
3. Fill basic info (Name, Price)
4. **Select a solar category**: "Saulės moduliai", "Inverteriai", or "Montavimo sistema"
5. Solar fields section appears automatically! ☀️
6. Fill in power, brand, efficiency, warranty, etc.
7. Save

### 2. Claude Agent Sees These Fields:
When Claude queries products, it now receives:
```json
{
  "name": "JA Solar JAM72S30 450W",
  "power_output": "450 W",
  "efficiency_percent": 21.5,
  "brand": "JA Solar",
  "technology_type": "Monocrystalline",
  "warranty_years": 25,
  "dimensions": "1722x1134x30 mm",
  "unit_price": 156.50
}
```

And recommends like:
> "Rekomenduoju JA Solar JAM72S30 modulius - 450W monokristalinis, 21.5% efektyvumas, 25 metų garantija. Kaina: 156.50 EUR"

## Example Product Entry

### Solar Panel
- **Pavadinimas**: JA Solar JAM72S30 450W
- **Kategorija**: Saulės moduliai
- **Kaina**: 156.50 EUR
- **Galia**: 450 W
- **Gamintojas**: JA Solar
- **Efektyvumas**: 21.5%
- **Garantija**: 25 metai
- **Technologija**: Monocrystalline
- **Matmenys**: 1722x1134x30 mm
- **Svoris**: 22.5 kg
- **Montavimo tipas**: Roof-mounted
- **Sertifikatai**: CE, IEC 61215, IEC 61730
- **Aprašymas**: High-efficiency monocrystalline solar panel with excellent low-light performance

### Inverter
- **Pavadinimas**: Huawei SUN2000-10KTL-M1
- **Kategorija**: Inverteriai
- **Kaina**: 1450.00 EUR
- **Galia**: 10 kW
- **Gamintojas**: Huawei
- **Efektyvumas**: 98.5%
- **Garantija**: 10 metai
- **Technologija**: String inverter
- **Svoris**: 35.0 kg
- **Max įėjimo įtampa**: 1100 V
- **MPPT kanalai**: 2
- **Sertifikatai**: CE, VDE-AR-N 4105
- **Aprašymas**: Smart string inverter with built-in monitoring

## Files Modified

### Frontend
- ✅ `app/products/page.tsx` - Dynamic form with solar fields
- ✅ `lib/types.ts` - Product interface updated

### Backend
- ✅ `app/api/products/route.ts` - POST with solar fields
- ✅ `app/api/products/[id]/route.ts` - PUT with solar fields
- ✅ `app/api/claude/solar-consultation/route.ts` - Tools return solar fields

### Database
- ✅ `supabase/migrations/20260221000000_add_solar_product_fields.sql` - Schema
- ✅ `supabase/RUN_THIS_SOLAR_FIELDS.sql` - Quick setup script

## Testing

1. **Go to** `/products`
2. **Create a new product**
3. **Select category**: "Saulės moduliai"
4. **Watch**: Solar fields section appears!
5. **Fill in** technical specs
6. **Save** and see power/brand in table
7. **Go to** `/solar-plants` and ask Claude to recommend products
8. **Claude will show** full technical details!

---

**Status**: ✅ Complete and ready to use!
**Migration applied**: ✅ Yes
**UI updated**: ✅ Yes
**API updated**: ✅ Yes
**Claude integrated**: ✅ Yes
