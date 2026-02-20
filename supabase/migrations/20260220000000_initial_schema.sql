-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (custom, not supabase auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT,
    name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    vat_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.21,
    is_service BOOLEAN NOT NULL DEFAULT FALSE,
    is_internal_only BOOLEAN NOT NULL DEFAULT FALSE,
    collapse_into_materials BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create offers table
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_no TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    client_address TEXT,
    client_email TEXT,
    client_phone TEXT,
    project_manager_name TEXT NOT NULL,
    notes TEXT,
    discount_percent NUMERIC(5, 2),
    ignitis_discount_eur NUMERIC(10, 2),
    apply_discount_after_vat BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create offer_items table
CREATE TABLE offer_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    vat_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.21,
    hide_qty BOOLEAN NOT NULL DEFAULT FALSE,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('simple', name));
CREATE INDEX idx_offer_items_offer_id ON offer_items(offer_id);
CREATE INDEX idx_offer_items_category_id ON offer_items(category_id);
CREATE INDEX idx_offers_created_by ON offers(created_by);
CREATE INDEX idx_offers_status ON offers(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_items ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all for now, since auth not implemented)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on offers" ON offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on offer_items" ON offer_items FOR ALL USING (true) WITH CHECK (true);

-- Insert default categories with proper sort order
INSERT INTO categories (name, slug, sort_order) VALUES
    ('Įkrovimo stotelės', 'chargers', 1),
    ('Inverteriai', 'inverters', 2),
    ('Saulės moduliai', 'solar-panels', 3),
    ('Montavimo sistema', 'mounting', 4),
    ('Kita', 'other', 999);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
