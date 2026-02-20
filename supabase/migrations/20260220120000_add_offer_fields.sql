-- Add new fields to offers table
ALTER TABLE offers ADD COLUMN IF NOT EXISTS client_birth_date TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS warranty_years INTEGER DEFAULT 5;

-- Add comment
COMMENT ON COLUMN offers.client_birth_date IS 'Client birth date for contract documents';
COMMENT ON COLUMN offers.payment_reference IS 'Payment reference number for advance payment tracking';
COMMENT ON COLUMN offers.warranty_years IS 'Warranty period in years for the charging station';
