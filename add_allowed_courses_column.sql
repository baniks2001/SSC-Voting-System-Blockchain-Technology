-- Add allowed_courses column to positions table
ALTER TABLE `positions` ADD COLUMN `allowed_courses` TEXT DEFAULT NULL COMMENT 'JSON array of course names that can vote for this position';

-- Update existing positions to have empty allowed_courses (meaning all courses can vote)
UPDATE `positions` SET `allowed_courses` = NULL WHERE `allowed_courses` IS NULL;
