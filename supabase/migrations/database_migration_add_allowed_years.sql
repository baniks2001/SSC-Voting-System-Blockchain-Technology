-- Migration script to add allowed_years column to positions table
-- Run this script to add year filtering functionality to positions

-- Check if column exists before adding (for MySQL 8.0+)
-- ALTER TABLE positions 
-- ADD COLUMN IF NOT EXISTS allowed_years LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL;

-- For older MySQL versions, use this approach:
-- First, try to add the column (will fail if it exists)
ALTER TABLE positions 
ADD COLUMN allowed_years LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL;

-- Add constraint for JSON validation
ALTER TABLE positions 
ADD CONSTRAINT chk_allowed_years_json CHECK (json_valid(`allowed_years`));

-- Add index for better performance on allowed_years queries
ALTER TABLE positions 
ADD INDEX idx_positions_allowed_years ((CAST(allowed_years AS CHAR(255) ARRAY)));

-- Update existing positions to have empty allowed_years array
UPDATE positions 
SET allowed_years = '[]' 
WHERE allowed_years IS NULL;
