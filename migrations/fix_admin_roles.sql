-- Migration: Update admins table to support all role types
-- Run this SQL in your MySQL database to fix the role column

-- Check if the column exists and modify it to include all roles
ALTER TABLE admins 
MODIFY COLUMN role ENUM('admin', 'super_admin', 'auditor', 'poll_monitor') 
DEFAULT 'admin' 
NOT NULL;

-- Verify the change
DESCRIBE admins;

-- Show current admin roles
SELECT id, email, full_name, role FROM admins;
