-- =====================================================
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- This adds the new required fields for official templates
-- =====================================================

-- Add new fields to offers table
ALTER TABLE offers ADD COLUMN IF NOT EXISTS client_birth_date TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS warranty_years INTEGER DEFAULT 5;

-- Add helpful comments
COMMENT ON COLUMN offers.client_birth_date IS 'Client birth date for contract documents';
COMMENT ON COLUMN offers.payment_reference IS 'Payment reference number for advance payment tracking';
COMMENT ON COLUMN offers.warranty_years IS 'Warranty period in years for the charging station';

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'offers' 
AND column_name IN ('client_birth_date', 'payment_reference', 'warranty_years')
ORDER BY column_name;

-- =====================================================
-- DONE! Your database is now ready for the new templates
-- =====================================================
