-- Run this in Supabase SQL Editor to create templates table and add default templates

-- Templates table for editable document templates
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('contract', 'pp_act_dynamic', 'pp_act_standard', 'samata')),
    content TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_template_updated_at();

-- Insert default templates
INSERT INTO templates (name, type, content, description) VALUES
('Sutartis', 'contract', '<div><p>Default contract template with {{offerNo}}, {{clientName}}, etc.</p></div>', 'Default contract template'),
('PP Aktas su DGV', 'pp_act_dynamic', '<div><p>PP Act with dynamic power controller</p></div>', 'PP Act template with dynamic power controller'),
('PP Aktas be DGV', 'pp_act_standard', '<div><p>PP Act without dynamic power controller</p></div>', 'PP Act template without dynamic power controller')
ON CONFLICT (name) DO NOTHING;
