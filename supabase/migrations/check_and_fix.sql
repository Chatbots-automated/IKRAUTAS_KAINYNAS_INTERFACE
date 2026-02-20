-- Check and fix missing tables/data
-- Run this to see what exists and fix what's missing

-- Check what tables exist
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'categories', 'products', 'offers', 'offer_items');

-- Check if categories have data
SELECT COUNT(*) as category_count FROM categories;

-- Check if products have data
SELECT COUNT(*) as product_count FROM products;

-- If categories are empty, insert them (this will fail if they exist, which is fine)
INSERT INTO categories (name, slug, sort_order) VALUES
    ('Įkrovimo stotelės', 'chargers', 1),
    ('Inverteriai', 'inverters', 2),
    ('Saulės moduliai', 'solar-panels', 3),
    ('Montavimo sistema', 'mounting', 4),
    ('Kita', 'other', 999)
ON CONFLICT (slug) DO NOTHING;

-- Check again
SELECT * FROM categories ORDER BY sort_order;
