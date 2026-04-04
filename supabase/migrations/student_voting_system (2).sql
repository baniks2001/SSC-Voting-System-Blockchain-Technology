-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 04, 2026 at 02:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `student_voting_system`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_archive_election` (IN `p_election_name` VARCHAR(255), IN `p_election_date` DATE, IN `p_academic_year` VARCHAR(50))   BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_voter_turnout` ()   BEGIN
    SELECT 
        COUNT(*) as total_voters,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_voters,
        COUNT(CASE WHEN has_voted = 1 THEN 1 END) as voted_count,
        ROUND(COUNT(CASE WHEN has_voted = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN is_active = 1 THEN 1 END), 0), 2) as turnout_percentage
    FROM voters;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reset_election` ()   BEGIN
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
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(10) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('admin','super_admin','auditor','poll_monitor') DEFAULT 'admin',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `user_type` enum('admin','voter','system') NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `candidates`
--

CREATE TABLE `candidates` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `party` varchar(255) DEFAULT NULL,
  `position` varchar(255) NOT NULL,
  `position_id` int(10) UNSIGNED DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `vote_count` int(10) UNSIGNED DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `candidates`
--
DELIMITER $$
CREATE TRIGGER `trg_candidate_vote_change` AFTER UPDATE ON `candidates` FOR EACH ROW BEGIN
    IF OLD.vote_count != NEW.vote_count THEN
        INSERT INTO audit_logs (user_type, action, details, created_at)
        VALUES ('system', 'VOTE_COUNT_UPDATE', 
                CONCAT('Candidate ', NEW.name, ' vote count changed from ', 
                       OLD.vote_count, ' to ', NEW.vote_count), 
                NOW());
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `name`, `code`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'BS Computer Science', 'BSCS', NULL, 1, '2026-04-04 12:29:29', '2026-04-04 12:29:29'),
(2, 'BS Information Technology', 'BSIT', NULL, 1, '2026-04-04 12:29:29', '2026-04-04 12:29:29'),
(3, 'BS Business Administration', 'BSBA', NULL, 1, '2026-04-04 12:29:29', '2026-04-04 12:29:29'),
(4, 'BS Accountancy', 'BSA', NULL, 1, '2026-04-04 12:29:29', '2026-04-04 12:29:29'),
(5, 'BS Engineering', 'BSENG', NULL, 1, '2026-04-04 12:29:29', '2026-04-04 12:29:29'),
(6, 'BS Nursing', 'BSN', NULL, 1, '2026-04-04 12:29:29', '2026-04-04 12:29:29');

-- --------------------------------------------------------

--
-- Table structure for table `election_data`
--

CREATE TABLE `election_data` (
  `id` int(10) UNSIGNED NOT NULL,
  `election_name` varchar(255) NOT NULL,
  `election_date` date NOT NULL,
  `academic_year` varchar(50) NOT NULL,
  `finished_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_candidates` int(10) UNSIGNED DEFAULT 0,
  `total_votes` int(10) UNSIGNED DEFAULT 0,
  `election_hash` varchar(255) DEFAULT NULL,
  `encrypted_data` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `poll_settings`
--

CREATE TABLE `poll_settings` (
  `id` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 0,
  `is_paused` tinyint(1) DEFAULT 0,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `paused_at` timestamp NULL DEFAULT NULL,
  `election_name` varchar(255) DEFAULT NULL,
  `election_date` date DEFAULT NULL,
  `academic_year` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `poll_settings`
--

INSERT INTO `poll_settings` (`id`, `is_active`, `is_paused`, `start_time`, `end_time`, `paused_at`, `election_name`, `election_date`, `academic_year`, `created_at`, `updated_at`) VALUES
(1, 0, 0, NULL, NULL, NULL, 'SSC Student Election', NULL, NULL, '2026-04-04 12:29:29', '2026-04-04 12:29:29');

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `max_votes` int(10) UNSIGNED DEFAULT 1,
  `display_order` int(10) UNSIGNED DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `allowed_courses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allowed_courses`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_audit_summary`
-- (See below for the actual view)
--
CREATE TABLE `view_audit_summary` (
`user_type` enum('admin','voter','system')
,`action` varchar(100)
,`action_count` bigint(21)
,`action_date` date
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_election_results`
-- (See below for the actual view)
--
CREATE TABLE `view_election_results` (
`position` varchar(255)
,`candidate_name` varchar(255)
,`party` varchar(255)
,`vote_count` int(10) unsigned
,`max_votes` int(10) unsigned
,`display_order` int(10) unsigned
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_voter_stats`
-- (See below for the actual view)
--
CREATE TABLE `view_voter_stats` (
`total_voters` bigint(21)
,`active_voters` bigint(21)
,`has_voted_count` bigint(21)
,`not_voted_count` bigint(21)
,`course` varchar(255)
,`year_level` int(10) unsigned
);

-- --------------------------------------------------------

--
-- Table structure for table `voters`
--

CREATE TABLE `voters` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `course` varchar(255) DEFAULT NULL,
  `year_level` int(10) UNSIGNED DEFAULT NULL,
  `section` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `has_voted` tinyint(1) DEFAULT 0,
  `voted_at` timestamp NULL DEFAULT NULL,
  `vote_hash` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `voters`
--
DELIMITER $$
CREATE TRIGGER `trg_voter_voted_at` BEFORE UPDATE ON `voters` FOR EACH ROW BEGIN
    IF NEW.has_voted = TRUE AND OLD.has_voted = FALSE THEN
        SET NEW.voted_at = NOW();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `votes`
--

CREATE TABLE `votes` (
  `id` int(10) UNSIGNED NOT NULL,
  `voter_id` int(10) UNSIGNED NOT NULL,
  `candidate_id` int(10) UNSIGNED NOT NULL,
  `position` varchar(255) NOT NULL,
  `transaction_hash` varchar(255) DEFAULT NULL,
  `block_number` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vote_verification`
--

CREATE TABLE `vote_verification` (
  `id` int(10) UNSIGNED NOT NULL,
  `voter_id` varchar(50) NOT NULL,
  `candidate_id` int(10) UNSIGNED NOT NULL,
  `position` varchar(255) NOT NULL,
  `transaction_hash` varchar(255) DEFAULT NULL,
  `verified_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure for view `view_audit_summary`
--
DROP TABLE IF EXISTS `view_audit_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_audit_summary`  AS SELECT `audit_logs`.`user_type` AS `user_type`, `audit_logs`.`action` AS `action`, count(0) AS `action_count`, cast(`audit_logs`.`created_at` as date) AS `action_date` FROM `audit_logs` GROUP BY `audit_logs`.`user_type`, `audit_logs`.`action`, cast(`audit_logs`.`created_at` as date) ORDER BY cast(`audit_logs`.`created_at` as date) DESC, count(0) DESC ;

-- --------------------------------------------------------

--
-- Structure for view `view_election_results`
--
DROP TABLE IF EXISTS `view_election_results`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_election_results`  AS SELECT `c`.`position` AS `position`, `c`.`name` AS `candidate_name`, `c`.`party` AS `party`, `c`.`vote_count` AS `vote_count`, `p`.`max_votes` AS `max_votes`, `p`.`display_order` AS `display_order` FROM (`candidates` `c` left join `positions` `p` on(`c`.`position_id` = `p`.`id`)) WHERE `c`.`is_active` = 1 ORDER BY `p`.`display_order` ASC, `c`.`vote_count` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `view_voter_stats`
--
DROP TABLE IF EXISTS `view_voter_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_voter_stats`  AS SELECT count(0) AS `total_voters`, count(case when `voters`.`is_active` = 1 then 1 end) AS `active_voters`, count(case when `voters`.`has_voted` = 1 and `voters`.`is_active` = 1 then 1 end) AS `has_voted_count`, count(case when `voters`.`has_voted` = 0 and `voters`.`is_active` = 1 then 1 end) AS `not_voted_count`, `voters`.`course` AS `course`, `voters`.`year_level` AS `year_level` FROM `voters` GROUP BY `voters`.`course`, `voters`.`year_level` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_admins_email` (`email`),
  ADD KEY `idx_admins_role` (`role`),
  ADD KEY `idx_admins_is_active` (`is_active`),
  ADD KEY `idx_admins_created_at` (`created_at`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_user_id` (`user_id`),
  ADD KEY `idx_audit_user_type` (`user_type`),
  ADD KEY `idx_audit_action` (`action`),
  ADD KEY `idx_audit_created_at` (`created_at`),
  ADD KEY `idx_audit_user_created` (`user_id`,`created_at`),
  ADD KEY `idx_audit_action_created` (`action`,`created_at`);

--
-- Indexes for table `candidates`
--
ALTER TABLE `candidates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_candidates_position` (`position`),
  ADD KEY `idx_candidates_position_id` (`position_id`),
  ADD KEY `idx_candidates_is_active` (`is_active`),
  ADD KEY `idx_candidates_vote_count` (`vote_count`),
  ADD KEY `idx_candidates_active_position` (`is_active`,`position`),
  ADD KEY `idx_candidates_party` (`party`),
  ADD KEY `idx_candidates_position_party` (`position`,`party`),
  ADD KEY `idx_candidates_fk_position` (`position_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_courses_name` (`name`),
  ADD KEY `idx_courses_is_active` (`is_active`),
  ADD KEY `idx_courses_created_at` (`created_at`);

--
-- Indexes for table `election_data`
--
ALTER TABLE `election_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_election_date` (`election_date`),
  ADD KEY `idx_academic_year` (`academic_year`),
  ADD KEY `idx_finished_at` (`finished_at`),
  ADD KEY `idx_election_hash` (`election_hash`);

--
-- Indexes for table `poll_settings`
--
ALTER TABLE `poll_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_poll_is_active` (`is_active`),
  ADD KEY `idx_poll_is_paused` (`is_paused`),
  ADD KEY `idx_poll_status` (`is_active`,`is_paused`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_positions_name` (`name`),
  ADD KEY `idx_positions_is_active` (`is_active`),
  ADD KEY `idx_positions_display_order` (`display_order`),
  ADD KEY `idx_positions_is_active_order` (`is_active`,`display_order`);

--
-- Indexes for table `voters`
--
ALTER TABLE `voters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_voters_student_id` (`student_id`),
  ADD KEY `idx_voters_has_voted` (`has_voted`),
  ADD KEY `idx_voters_is_active` (`is_active`),
  ADD KEY `idx_voters_course` (`course`),
  ADD KEY `idx_voters_year_level` (`year_level`),
  ADD KEY `idx_voters_section` (`section`),
  ADD KEY `idx_voters_active_voted` (`is_active`,`has_voted`),
  ADD KEY `idx_voters_course_year` (`course`,`year_level`),
  ADD KEY `idx_voters_search` (`full_name`,`student_id`),
  ADD KEY `idx_voters_voted_at` (`voted_at`),
  ADD KEY `idx_voters_course_year_section` (`course`,`year_level`,`section`);
ALTER TABLE `voters` ADD FULLTEXT KEY `ft_voters_search` (`full_name`,`student_id`);

--
-- Indexes for table `votes`
--
ALTER TABLE `votes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_votes_voter_id` (`voter_id`),
  ADD KEY `idx_votes_candidate_id` (`candidate_id`),
  ADD KEY `idx_votes_position` (`position`),
  ADD KEY `idx_votes_transaction_hash` (`transaction_hash`),
  ADD KEY `idx_votes_created_at` (`created_at`),
  ADD KEY `idx_votes_voter_position` (`voter_id`,`position`),
  ADD KEY `idx_votes_position_candidate` (`position`,`candidate_id`),
  ADD KEY `idx_votes_fk_voter` (`voter_id`),
  ADD KEY `idx_votes_fk_candidate` (`candidate_id`);

--
-- Indexes for table `vote_verification`
--
ALTER TABLE `vote_verification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vv_voter_id` (`voter_id`),
  ADD KEY `idx_vv_candidate_id` (`candidate_id`),
  ADD KEY `idx_vv_position` (`position`),
  ADD KEY `idx_vv_verified_at` (`verified_at`),
  ADD KEY `idx_vv_voter_candidate` (`voter_id`,`candidate_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1000;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `election_data`
--
ALTER TABLE `election_data`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `voters`
--
ALTER TABLE `voters`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10000;

--
-- AUTO_INCREMENT for table `votes`
--
ALTER TABLE `votes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vote_verification`
--
ALTER TABLE `vote_verification`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `candidates`
--
ALTER TABLE `candidates`
  ADD CONSTRAINT `candidates_ibfk_1` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `votes`
--
ALTER TABLE `votes`
  ADD CONSTRAINT `votes_ibfk_1` FOREIGN KEY (`voter_id`) REFERENCES `voters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `votes_ibfk_2` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
