-- ============================================================
-- SSC VOTING SYSTEM - COMPLETE DATABASE SCHEMA
-- With Performance-Optimized Indexes
-- Created: April 2026
-- Compatible with: MySQL 5.7+ / MariaDB 10.2+
-- ============================================================

-- Drop and create database
DROP DATABASE IF EXISTS student_voting_system;
CREATE DATABASE student_voting_system 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE student_voting_system;

-- ============================================================
-- TABLE: admins
-- Administrator accounts for managing the system
-- ============================================================
CREATE TABLE admins (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'super_admin', 'auditor', 'poll_monitor') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_admins_email (email),
    KEY idx_admins_role (role),
    KEY idx_admins_is_active (is_active),
    KEY idx_admins_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: courses
-- Available courses for voters
-- ============================================================
CREATE TABLE courses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_courses_name (name),
    KEY idx_courses_is_active (is_active),
    KEY idx_courses_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: positions
-- Election positions (e.g., President, Vice President)
-- ============================================================
CREATE TABLE positions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    max_votes INT UNSIGNED DEFAULT 1,
    display_order INT UNSIGNED DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    allowed_courses JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_positions_name (name),
    KEY idx_positions_is_active (is_active),
    KEY idx_positions_display_order (display_order),
    KEY idx_positions_is_active_order (is_active, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: voters
-- Registered voters/students
-- ============================================================
CREATE TABLE voters (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    course VARCHAR(255),
    year_level INT UNSIGNED,
    section VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    has_voted BOOLEAN DEFAULT FALSE,
    voted_at TIMESTAMP NULL,
    vote_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Primary unique constraint
    UNIQUE KEY uk_voters_student_id (student_id),
    
    -- Performance indexes for common queries
    KEY idx_voters_has_voted (has_voted),
    KEY idx_voters_is_active (is_active),
    KEY idx_voters_course (course),
    KEY idx_voters_year_level (year_level),
    KEY idx_voters_section (section),
    
    -- Composite indexes for filter combinations
    KEY idx_voters_active_voted (is_active, has_voted),
    KEY idx_voters_course_year (course, year_level),
    KEY idx_voters_search (full_name, student_id),
    KEY idx_voters_voted_at (voted_at),
    
    -- Full-text search index
    FULLTEXT KEY ft_voters_search (full_name, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: candidates
-- Election candidates
-- ============================================================
CREATE TABLE candidates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    party VARCHAR(255),
    position VARCHAR(255) NOT NULL,
    position_id INT UNSIGNED,
    photo_url VARCHAR(500),
    vote_count INT UNSIGNED DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    KEY idx_candidates_position (position),
    KEY idx_candidates_position_id (position_id),
    KEY idx_candidates_is_active (is_active),
    KEY idx_candidates_vote_count (vote_count),
    KEY idx_candidates_active_position (is_active, position),
    KEY idx_candidates_party (party),
    
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: votes
-- Individual vote records
-- ============================================================
CREATE TABLE votes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    voter_id INT UNSIGNED NOT NULL,
    candidate_id INT UNSIGNED NOT NULL,
    position VARCHAR(255) NOT NULL,
    transaction_hash VARCHAR(255),
    block_number BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    KEY idx_votes_voter_id (voter_id),
    KEY idx_votes_candidate_id (candidate_id),
    KEY idx_votes_position (position),
    KEY idx_votes_transaction_hash (transaction_hash),
    KEY idx_votes_created_at (created_at),
    KEY idx_votes_voter_position (voter_id, position),
    
    FOREIGN KEY (voter_id) REFERENCES voters(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: vote_verification
-- Vote verification records for audit
-- ============================================================
CREATE TABLE vote_verification (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    voter_id VARCHAR(50) NOT NULL,
    candidate_id INT UNSIGNED NOT NULL,
    position VARCHAR(255) NOT NULL,
    transaction_hash VARCHAR(255),
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    KEY idx_vv_voter_id (voter_id),
    KEY idx_vv_candidate_id (candidate_id),
    KEY idx_vv_position (position),
    KEY idx_vv_verified_at (verified_at),
    KEY idx_vv_voter_candidate (voter_id, candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: poll_settings
-- Election/poll configuration (single row configuration)
-- ============================================================
CREATE TABLE poll_settings (
    id INT UNSIGNED PRIMARY KEY DEFAULT 1,
    is_active BOOLEAN DEFAULT FALSE,
    is_paused BOOLEAN DEFAULT FALSE,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    paused_at TIMESTAMP NULL,
    election_name VARCHAR(255),
    election_date DATE,
    academic_year VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    KEY idx_poll_is_active (is_active),
    KEY idx_poll_is_paused (is_paused),
    KEY idx_poll_status (is_active, is_paused),
    
    CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: election_data
-- Historical election results archive
-- ============================================================
CREATE TABLE election_data (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    election_name VARCHAR(255) NOT NULL,
    election_date DATE NOT NULL,
    academic_year VARCHAR(50) NOT NULL,
    finished_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_candidates INT UNSIGNED DEFAULT 0,
    total_votes INT UNSIGNED DEFAULT 0,
    election_hash VARCHAR(255),
    encrypted_data LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    KEY idx_election_date (election_date),
    KEY idx_academic_year (academic_year),
    KEY idx_finished_at (finished_at),
    KEY idx_election_hash (election_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: audit_logs
-- System audit trail for all actions
-- ============================================================
CREATE TABLE audit_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    user_type ENUM('admin', 'voter', 'system') NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    KEY idx_audit_user_id (user_id),
    KEY idx_audit_user_type (user_type),
    KEY idx_audit_action (action),
    KEY idx_audit_created_at (created_at),
    KEY idx_audit_user_created (user_id, created_at),
    KEY idx_audit_action_created (action, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INSERT DEFAULT DATA
-- ============================================================

-- Default poll settings
INSERT INTO poll_settings (id, is_active, is_paused, election_name) 
VALUES (1, FALSE, FALSE, 'SSC Student Election');

-- Sample courses (optional - can be added via admin panel)
INSERT INTO courses (name, code, is_active) VALUES
('BS Computer Science', 'BSCS', TRUE),
('BS Information Technology', 'BSIT', TRUE),
('BS Business Administration', 'BSBA', TRUE),
('BS Accountancy', 'BSA', TRUE),
('BS Engineering', 'BSENG', TRUE),
('BS Nursing', 'BSN', TRUE);

-- Default super admin (password: superadmin123 - change in production!)
-- Note: This is a bcrypt hash of 'superadmin123'
INSERT INTO admins (email, password, full_name, role, is_active) VALUES
('superadmin@ssc.edu.ph', '$2a$10$YourHashHere', 'Super Administrator', 'super_admin', TRUE);

-- ============================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================

-- View: Active voters summary
CREATE VIEW view_voter_stats AS
SELECT 
    COUNT(*) as total_voters,
    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_voters,
    COUNT(CASE WHEN has_voted = 1 AND is_active = 1 THEN 1 END) as has_voted_count,
    COUNT(CASE WHEN has_voted = 0 AND is_active = 1 THEN 1 END) as not_voted_count,
    course,
    year_level
FROM voters
GROUP BY course, year_level;

-- View: Election results summary
CREATE VIEW view_election_results AS
SELECT 
    c.position,
    c.name as candidate_name,
    c.party,
    c.vote_count,
    p.max_votes,
    p.display_order
FROM candidates c
LEFT JOIN positions p ON c.position_id = p.id
WHERE c.is_active = TRUE
ORDER BY p.display_order, c.vote_count DESC;

-- View: Audit summary
CREATE VIEW view_audit_summary AS
SELECT 
    user_type,
    action,
    COUNT(*) as action_count,
    DATE(created_at) as action_date
FROM audit_logs
GROUP BY user_type, action, DATE(created_at)
ORDER BY action_date DESC, action_count DESC;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DELIMITER //

-- Procedure: Reset election data
CREATE PROCEDURE sp_reset_election()
BEGIN
    START TRANSACTION;
    
    -- Reset voter status
    UPDATE voters SET has_voted = FALSE, voted_at = NULL, vote_hash = NULL;
    
    -- Reset candidate vote counts
    UPDATE candidates SET vote_count = 0;
    
    -- Clear votes table
    DELETE FROM votes;
    
    -- Clear vote verification
    DELETE FROM vote_verification;
    
    -- Reset poll settings
    UPDATE poll_settings SET 
        is_active = FALSE, 
        is_paused = FALSE, 
        start_time = NULL, 
        end_time = NULL,
        paused_at = NULL
    WHERE id = 1;
    
    COMMIT;
END //

-- Procedure: Get voter turnout statistics
CREATE PROCEDURE sp_get_voter_turnout()
BEGIN
    SELECT 
        COUNT(*) as total_voters,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_voters,
        COUNT(CASE WHEN has_voted = 1 THEN 1 END) as voted_count,
        ROUND(COUNT(CASE WHEN has_voted = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN is_active = 1 THEN 1 END), 0), 2) as turnout_percentage
    FROM voters;
END //

-- Procedure: Archive election results
CREATE PROCEDURE sp_archive_election(
    IN p_election_name VARCHAR(255),
    IN p_election_date DATE,
    IN p_academic_year VARCHAR(50)
)
BEGIN
    DECLARE v_total_candidates INT;
    DECLARE v_total_votes INT;
    DECLARE v_election_hash VARCHAR(255);
    
    -- Calculate totals
    SELECT COUNT(*) INTO v_total_candidates FROM candidates WHERE is_active = 1;
    SELECT COUNT(*) INTO v_total_votes FROM votes;
    
    -- Generate hash
    SET v_election_hash = MD5(CONCAT(p_election_name, p_election_date, NOW()));
    
    -- Insert election data
    INSERT INTO election_data (
        election_name, 
        election_date, 
        academic_year, 
        total_candidates, 
        total_votes, 
        election_hash
    ) VALUES (
        p_election_name,
        p_election_date,
        p_academic_year,
        v_total_candidates,
        v_total_votes,
        v_election_hash
    );
    
    SELECT LAST_INSERT_ID() as election_id;
END //

DELIMITER ;

-- ============================================================
-- TRIGGERS
-- ============================================================

DELIMITER //

-- Trigger: Update voter voted_at timestamp
CREATE TRIGGER trg_voter_voted_at
BEFORE UPDATE ON voters
FOR EACH ROW
BEGIN
    IF NEW.has_voted = TRUE AND OLD.has_voted = FALSE THEN
        SET NEW.voted_at = NOW();
    END IF;
END //

-- Trigger: Log candidate vote count changes (optional audit)
CREATE TRIGGER trg_candidate_vote_change
AFTER UPDATE ON candidates
FOR EACH ROW
BEGIN
    IF OLD.vote_count != NEW.vote_count THEN
        INSERT INTO audit_logs (user_type, action, details, created_at)
        VALUES ('system', 'VOTE_COUNT_UPDATE', 
                CONCAT('Candidate ', NEW.name, ' vote count changed from ', 
                       OLD.vote_count, ' to ', NEW.vote_count), 
                NOW());
    END IF;
END //

DELIMITER ;

-- ============================================================
-- INDEXES SUMMARY
-- ============================================================

-- Additional composite indexes for complex queries
CREATE INDEX idx_voters_course_year_section ON voters(course, year_level, section);
CREATE INDEX idx_candidates_position_party ON candidates(position, party);
CREATE INDEX idx_votes_position_candidate ON votes(position, candidate_id);

-- Foreign key indexes (if not already created)
CREATE INDEX idx_candidates_fk_position ON candidates(position_id);
CREATE INDEX idx_votes_fk_voter ON votes(voter_id);
CREATE INDEX idx_votes_fk_candidate ON votes(candidate_id);

-- ============================================================
-- OPTIMIZATION SETTINGS
-- ============================================================

-- Set table auto-increment values
ALTER TABLE admins AUTO_INCREMENT = 1000;
ALTER TABLE voters AUTO_INCREMENT = 10000;
ALTER TABLE candidates AUTO_INCREMENT = 100;

-- Analyze tables for query optimizer
ANALYZE TABLE admins;
ANALYZE TABLE voters;
ANALYZE TABLE candidates;
ANALYZE TABLE votes;
ANALYZE TABLE audit_logs;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
