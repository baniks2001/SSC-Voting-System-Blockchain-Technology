-- Update script for allowed_years functionality
-- Run this if the allowed_years column already exists

-- Update existing positions to have empty allowed_years array if NULL
UPDATE positions 
SET allowed_years = '[]' 
WHERE allowed_years IS NULL;

-- Add constraint for JSON validation (if not already exists)
-- ALTER TABLE positions 
-- ADD CONSTRAINT chk_allowed_years_json CHECK (json_valid(`allowed_years`));

-- Add index for better performance (if not already exists)
-- ALTER TABLE positions 
-- ADD INDEX idx_positions_allowed_years ((CAST(allowed_years AS CHAR(255) ARRAY)));

-- Verify the update
SELECT id, name, allowed_years FROM positions;
