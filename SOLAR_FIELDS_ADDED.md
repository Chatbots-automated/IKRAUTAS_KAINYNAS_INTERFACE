# Solar Product Fields - Technical Specifications

## New Fields Added to Products Table

### Power & Performance
- **power_output** (TEXT) - Power rating
  - Solar panels: "450 W", "550 W"
  - Inverters: "10 kW", "15 kW"
  
- **efficiency_percent** (NUMERIC) - Energy conversion efficiency
  - Example: 21.5 (for 21.5%)
  
### Physical Specs
- **dimensions** (TEXT) - Physical dimensions
  - Example: "1722x1134x30 mm"
  
- **weight_kg** (NUMERIC) - Product weight
  - Example: 22.5

### Product Info
- **brand** (TEXT) - Manufacturer
  - Examples: "JA Solar", "Huawei", "Longi", "Fronius"
  
- **technology_type** (TEXT) - Technology classification
  - Panels: "Monocrystalline", "Polycrystalline", "Bifacial"
  - Inverters: "String inverter", "Hybrid inverter", "Microinverter"
  
- **warranty_years** (INTEGER) - Warranty period
  - Panels: typically 25 years
  - Inverters: typically 10 years

### Compliance
- **certifications** (TEXT) - Standards and certifications
  - Example: "CE, IEC 61215, IEC 61730, VDE-AR-N 4105"

### Inverter-Specific
- **max_input_voltage** (TEXT) - Maximum DC input voltage
  - Example: "1100 V", "1500 V"
  
- **mppt_channels** (INTEGER) - Number of MPPT trackers
  - Example: 2, 4

### Installation
- **installation_type** (TEXT) - Installation method
  - Examples: "Roof-mounted", "Ground-mounted", "Flat roof", "Sloped roof"

### Additional
- **description** (TEXT) - Detailed product description
- **datasheet_url** (TEXT) - Link to technical datasheet

## How to Update Your Database

### Option 1: Run SQL File (Recommended)
```bash
# Copy the SQL content from supabase/RUN_THIS_SOLAR_FIELDS.sql
# Paste into Supabase SQL Editor at:
# http://127.0.0.1:55323/project/default/sql
```

### Option 2: Use Migration
```bash
supabase db push
```

## Example Product Data

### Solar Panel Example
```sql
UPDATE products 
SET 
  power_output = '450 W',
  efficiency_percent = 21.5,
  dimensions = '1722x1134x30 mm',
  weight_kg = 22.5,
  warranty_years = 25,
  technology_type = 'Monocrystalline',
  brand = 'JA Solar',
  certifications = 'CE, IEC 61215, IEC 61730',
  installation_type = 'Roof-mounted',
  description = 'High-efficiency monocrystalline solar panel with excellent low-light performance'
WHERE name = 'JA Solar JAM72S30 450W';
```

### Inverter Example
```sql
UPDATE products 
SET 
  power_output = '10 kW',
  efficiency_percent = 98.5,
  weight_kg = 35.0,
  warranty_years = 10,
  technology_type = 'String inverter',
  brand = 'Huawei',
  certifications = 'CE, VDE-AR-N 4105',
  max_input_voltage = '1100 V',
  mppt_channels = 2,
  description = 'Smart string inverter with built-in monitoring and optimization'
WHERE name = 'Huawei SUN2000-10KTL-M1';
```

## Claude Agent Integration

The agent now receives ALL these fields when querying products via tools:
- `search_solar_products(query)` - Returns products with full specs
- `get_category_products(categorySlug)` - Returns all products in category with specs

### Example Agent Response
```
"Rekomenduoju JA Solar JAM72S30 450W modulius:
- Galia: 450W
- Efektyvumas: 21.5%
- Garantija: 25 metai
- Technologija: Monokristalinis
- Sertifikatai: CE, IEC 61215
- Kaina: 156.50 EUR

Inverterio rekomenduoju Huawei SUN2000-10KTL-M1:
- Galia: 10 kW
- Efektyvumas: 98.5%
- 2 MPPT kanalai
- Max įėjimo įtampa: 1100V
- Garantija: 10 metų
- Kaina: 1450.00 EUR"
```

## Next Steps

1. Run `RUN_THIS_SOLAR_FIELDS.sql` in Supabase
2. Update your existing products with technical data
3. Test the agent - it will now show detailed product specs!
4. Claude will recommend products with full technical details
