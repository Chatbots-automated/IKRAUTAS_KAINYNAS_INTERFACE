-- Quick setup script for solar product fields
-- Run this in your Supabase SQL editor

-- Add solar-specific fields to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS power_output TEXT,
ADD COLUMN IF NOT EXISTS efficiency_percent NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS dimensions TEXT,
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(8, 2),
ADD COLUMN IF NOT EXISTS warranty_years INTEGER,
ADD COLUMN IF NOT EXISTS technology_type TEXT,
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT,
ADD COLUMN IF NOT EXISTS max_input_voltage TEXT,
ADD COLUMN IF NOT EXISTS mppt_channels INTEGER,
ADD COLUMN IF NOT EXISTS installation_type TEXT,
ADD COLUMN IF NOT EXISTS datasheet_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_products_power_output ON products(power_output) WHERE power_output IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand) WHERE brand IS NOT NULL;

-- Example: Update some products with solar data
-- Uncomment and modify these examples based on your actual products

-- UPDATE products 
-- SET 
--   power_output = '450 W',
--   efficiency_percent = 21.5,
--   dimensions = '1722x1134x30 mm',
--   weight_kg = 22.5,
--   warranty_years = 25,
--   technology_type = 'Monocrystalline',
--   brand = 'JA Solar',
--   certifications = 'CE, IEC 61215, IEC 61730',
--   installation_type = 'Roof-mounted',
--   description = 'High-efficiency monocrystalline solar panel with excellent low-light performance'
-- WHERE name ILIKE '%solar%panel%' AND power_output IS NULL;

-- UPDATE products 
-- SET 
--   power_output = '10 kW',
--   efficiency_percent = 98.5,
--   weight_kg = 35.0,
--   warranty_years = 10,
--   technology_type = 'String inverter',
--   brand = 'Huawei',
--   certifications = 'CE, VDE-AR-N 4105',
--   max_input_voltage = '1100 V',
--   mppt_channels = 2,
--   description = 'Smart string inverter with built-in monitoring and optimization'
-- WHERE name ILIKE '%inverter%' AND power_output IS NULL;

SELECT 'Solar fields added successfully!' as status;
