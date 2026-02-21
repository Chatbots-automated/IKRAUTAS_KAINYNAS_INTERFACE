-- Add solar-specific fields to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS power_output TEXT, -- e.g., "10 kW", "450 W"
ADD COLUMN IF NOT EXISTS efficiency_percent NUMERIC(5, 2), -- e.g., 21.5 for 21.5%
ADD COLUMN IF NOT EXISTS dimensions TEXT, -- e.g., "1722x1134x30 mm"
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(8, 2), -- e.g., 22.5 kg
ADD COLUMN IF NOT EXISTS warranty_years INTEGER, -- e.g., 25 years
ADD COLUMN IF NOT EXISTS technology_type TEXT, -- e.g., "Monocrystalline", "String inverter"
ADD COLUMN IF NOT EXISTS brand TEXT, -- e.g., "JA Solar", "Huawei"
ADD COLUMN IF NOT EXISTS certifications TEXT, -- e.g., "CE, IEC 61215, IEC 61730"
ADD COLUMN IF NOT EXISTS max_input_voltage TEXT, -- For inverters, e.g., "1100 V"
ADD COLUMN IF NOT EXISTS mppt_channels INTEGER, -- For inverters, e.g., 2
ADD COLUMN IF NOT EXISTS installation_type TEXT, -- e.g., "Roof-mounted", "Ground-mounted"
ADD COLUMN IF NOT EXISTS datasheet_url TEXT, -- Link to product datasheet
ADD COLUMN IF NOT EXISTS description TEXT; -- Detailed product description

-- Add index for filtering by power output
CREATE INDEX IF NOT EXISTS idx_products_power_output ON products(power_output) WHERE power_output IS NOT NULL;

-- Add index for brand searches
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand) WHERE brand IS NOT NULL;

-- Add comment explaining the new fields
COMMENT ON COLUMN products.power_output IS 'Power rating (e.g., "10 kW" for inverters, "450 W" for panels)';
COMMENT ON COLUMN products.efficiency_percent IS 'Energy conversion efficiency in percent';
COMMENT ON COLUMN products.technology_type IS 'Technology: Monocrystalline, Polycrystalline, String inverter, Hybrid inverter, etc.';
COMMENT ON COLUMN products.mppt_channels IS 'Number of MPPT trackers (inverters only)';
