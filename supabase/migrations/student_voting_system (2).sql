-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 17, 2026 at 11:37 AM
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

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `email`, `password`, `full_name`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1000, 'pollmonitor@gmail.com', '$2a$10$EL6.5MQUL/4sJ8.5pUqAOeywMt88s.Y4iO9pX9AcgYL2pIucW9t.G', 'poll monitor', 'poll_monitor', 1, '2026-04-04 12:44:19', '2026-04-04 12:44:19');

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

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `user_type`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 0, 'admin', 'CREATE_ADMIN', 'Created admin: pollmonitor@gmail.com', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 12:44:19'),
(2, 1000, 'admin', 'LOGIN_FAILED', 'Invalid password', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 12:44:34'),
(3, 1000, 'admin', 'LOGIN_FAILED', 'Invalid password', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 12:44:52'),
(4, 1000, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 12:45:16'),
(5, 1000, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 12:45:16'),
(6, 1000, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 12:45:36'),
(7, 1000, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 12:45:37'),
(8, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 12:58:59'),
(9, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 12:58:59'),
(10, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0001', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 13:10:38'),
(11, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0002', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 13:10:38'),
(12, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-3333', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 13:10:38'),
(13, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-4444', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 13:10:38'),
(14, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-5555', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 13:10:38'),
(15, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-6666', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 13:10:38'),
(16, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0007', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 13:10:38'),
(17, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0008', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 13:10:39'),
(18, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-9999', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 13:10:39'),
(19, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-1000', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 13:10:39'),
(20, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-1111', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 13:10:39'),
(21, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-1222', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 13:10:39'),
(22, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-1333', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-04 13:10:39'),
(23, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-17 08:12:34'),
(24, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-17 08:12:34'),
(25, 0, 'admin', 'CREATE_POSITION', 'Created position: Vice President', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-17 08:22:55'),
(26, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Jomar Palarao', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-17 08:54:55'),
(27, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-17 08:55:02'),
(28, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-17 08:55:02'),
(29, 10007, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-17 08:55:45'),
(30, 10007, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-17 08:55:45'),
(31, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x9744fb0552ef61f63c9946fc7bd93a50eafe70550b0d34c08871df913a055512 (Node: node1) - Empty positions: 0', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-17 08:55:58'),
(32, 10007, 'voter', 'MARK_VOTED', 'Voter 20-0008 marked as voted with ballot vote_mo2ob60y_i7nqcobti1q_xygbrwxdq48_byex', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-17 08:55:58'),
(33, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-17 08:56:32'),
(34, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-17 08:56:32'),
(35, 10011, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.7', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', '2026-04-17 08:58:18'),
(36, 10011, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.7', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', '2026-04-17 08:58:18'),
(37, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x8f9bbad0de35d442df777f556a9c9cd88ec1adf155d998217040f9578e223e2d (Node: node1) - Empty positions: 0', '192.168.1.7', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', '2026-04-17 08:58:53'),
(38, 10011, 'voter', 'MARK_VOTED', 'Voter 20-1222 marked as voted with ballot vote_mo2oeuop_7qw8i3niyl_0eov2i13mfv_jxui', '192.168.1.7', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36', '2026-04-17 08:58:53');

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
  `image_url` varchar(500) DEFAULT NULL,
  `image_path` varchar(500) DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `vote_count` int(10) UNSIGNED DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `candidates`
--

INSERT INTO `candidates` (`id`, `name`, `party`, `position`, `position_id`, `image_url`, `image_path`, `photo_url`, `vote_count`, `is_active`, `created_at`, `updated_at`) VALUES
(100, 'Jomar Palarao', 'party', 'Vice President', NULL, 'candidate-1776416095822-981125639.jpg', '/uploads/candidates/candidate-1776416095822-981125639.jpg', NULL, 0, 1, '2026-04-17 08:54:55', '2026-04-17 08:54:55');

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
(7, 'BIT Automotive Technology', 'BIT-AT', NULL, 1, '2026-04-04 13:03:28', '2026-04-04 13:03:28'),
(9, 'BIT Electrical Technology', 'BIT-ET', NULL, 1, '2026-04-04 13:04:30', '2026-04-04 13:04:30'),
(10, 'BIT Electronics Technology', 'BIT-ET', NULL, 1, '2026-04-04 13:04:49', '2026-04-04 13:04:49'),
(11, 'BSE Social Entrepreneurship', 'BSE-SE', NULL, 1, '2026-04-04 13:06:44', '2026-04-04 13:06:44'),
(12, 'BSE Culinary Arts', 'BSE-CA', NULL, 1, '2026-04-04 13:07:08', '2026-04-04 13:07:08'),
(13, 'BSE Hospitality Management', 'BSE-HM', NULL, 1, '2026-04-04 13:07:24', '2026-04-04 13:07:24'),
(14, 'BS Information Technology', 'BSIT', NULL, 1, '2026-04-04 13:07:41', '2026-04-04 13:07:41'),
(15, 'BS Office Administration', 'BSOA', NULL, 1, '2026-04-04 13:07:51', '2026-04-04 13:07:51'),
(16, 'BS Accountancy', 'BSA', NULL, 1, '2026-04-04 13:08:00', '2026-04-04 13:08:00'),
(17, 'BS Management Accounting', 'BSMA', NULL, 1, '2026-04-04 13:08:11', '2026-04-04 13:08:11'),
(18, 'BTLED Home Economics', 'BTLED-HE', NULL, 1, '2026-04-04 13:08:39', '2026-04-04 13:08:39'),
(19, 'BTLED Industrial Arts', 'BTLED-IA', NULL, 1, '2026-04-04 13:08:54', '2026-04-04 13:08:54'),
(20, 'BSED Biological Science', 'BSED-BS', NULL, 1, '2026-04-04 13:09:21', '2026-04-04 13:09:21'),
(21, 'BSED English', 'BSED-E', NULL, 1, '2026-04-04 13:09:32', '2026-04-04 13:09:32'),
(22, 'BSED Filipino', 'BSED-F', NULL, 1, '2026-04-04 13:09:40', '2026-04-04 13:09:40'),
(23, 'BSED Mathematics', 'BSED-M', NULL, 1, '2026-04-04 13:09:53', '2026-04-04 13:09:53');

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
(1, 1, 0, NULL, NULL, NULL, 'SSC Student Election', NULL, NULL, '2026-04-04 12:29:29', '2026-04-17 08:55:02');

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

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`id`, `name`, `max_votes`, `display_order`, `is_active`, `allowed_courses`, `created_at`, `updated_at`) VALUES
(1, 'Vice President', 1, 0, 1, '[]', '2026-04-17 08:22:55', '2026-04-17 08:22:55');

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
-- Dumping data for table `voters`
--

INSERT INTO `voters` (`id`, `student_id`, `full_name`, `course`, `year_level`, `section`, `password`, `has_voted`, `voted_at`, `vote_hash`, `is_active`, `created_at`, `updated_at`) VALUES
(10000, '20-0001', 'Servando S. Tio Iii', 'BS Information Technology', 4, 'A', '$2a$10$O4xVWk7dlychVOfghHAfhe9X9wYWzEwrWUGz5.C2cTWZDXeFiJlCS', 0, NULL, NULL, 1, '2026-04-04 13:10:38', '2026-04-04 13:10:38'),
(10001, '20-0002', 'Jay Lou A. Terante', 'BS Office Administration', 4, 'A', '$2a$10$AVXB447GMQt4B9..HgSnR.CE0GK4ah8DEBgjxJ3NqflmG84E7Qhcm', 0, NULL, NULL, 1, '2026-04-04 13:10:38', '2026-04-04 13:10:38'),
(10002, '20-3333', 'Jomar Palarao', 'BSED English', 4, 'B', '$2a$10$j.G7kF75MWfaBKYG19WXE.ne7BE5k0AIjzmDF3cufv.knsvPwOBfS', 0, NULL, NULL, 1, '2026-04-04 13:10:38', '2026-04-04 13:10:38'),
(10003, '20-4444', 'Alyanna Marie Espoltero', 'BS Accountancy', 4, 'C', '$2a$10$MK85QZkWJeOldYOblyyuS.qrhW9qrDgW5ZJ8QBqr2qmJuSzbR1SAi', 0, NULL, NULL, 1, '2026-04-04 13:10:38', '2026-04-04 13:10:38'),
(10004, '20-5555', 'James Yap', 'BS Information Technology', 3, 'A', '$2a$10$r9QOLswUjCHEBGgNhyJvFOn6d8aPefm9tlQP.fQ59ACMuWc3dxLjG', 0, NULL, NULL, 1, '2026-04-04 13:10:38', '2026-04-04 13:10:38'),
(10005, '20-6666', 'Juan Dela Cruz', 'BTLED Home Economics', 4, 'A', '$2a$10$CGjcOKc6O4hYxHrWu5vJtOdLoYZ8Z6mzK6r7IxQsJzJWX.An9EI/C', 0, NULL, NULL, 1, '2026-04-04 13:10:38', '2026-04-04 13:10:38'),
(10006, '20-0007', 'Jose Rizal', 'BSED Biological Science', 2, 'A', '$2a$10$ub0oXSfN0fAllYaM2isOfeZLT8Du9gelE5zEJDAmh3hStaOM8MBMu', 0, NULL, NULL, 1, '2026-04-04 13:10:38', '2026-04-04 13:10:38'),
(10007, '20-0008', 'Rodrigo R. Duterte', 'BS Accountancy', 3, 'A', '$2a$10$S.CT4FlNvZgC2ni2pn9YuOtOIakUNrkSDX7MmCNy4HnAbtMsAM.t.', 1, '2026-04-17 08:55:58', 'vote_1776416158517_i18budqqj', 1, '2026-04-04 13:10:39', '2026-04-17 08:55:58'),
(10008, '20-9999', 'Ferdinand Marcos Jr', 'BS Information Technology', 4, 'A', '$2a$10$0cpIF2.osoLmEgigcHHfPe6cg4yaL.r4IPWGIMRIHlqQ1iJQWlFXC', 0, NULL, NULL, 1, '2026-04-04 13:10:39', '2026-04-04 13:10:39'),
(10009, '20-1000', 'Catherine Medilo', 'BIT Electrical Technology', 4, 'A', '$2a$10$982T53Kn/wEAXs8fktLvGe53wz6fiz3hojsvRxamWOkyb/dGk9znS', 0, NULL, NULL, 1, '2026-04-04 13:10:39', '2026-04-04 13:10:39'),
(10010, '20-1111', 'Joshua A. Tan', 'BIT Automotive Technology', 4, 'A', '$2a$10$XVB8X4Vb715BXgVJd22rr.lhJVg9P69CeP6naYsJ5scz7JBsx7oIy', 0, NULL, NULL, 1, '2026-04-04 13:10:39', '2026-04-04 13:10:39'),
(10011, '20-1222', 'Sweet Mary Terante', 'BTLED Home Economics', 4, 'B', '$2a$10$RqwRErGaXjue0RIoXsaCr.hyfUkUUlaTHvagFPwLV/JoeSn9H4JwK', 1, '2026-04-17 08:58:53', 'vote_1776416332960_16ly4drij', 1, '2026-04-04 13:10:39', '2026-04-17 08:58:53'),
(10012, '20-1333', 'Kimberly Banalo', 'BS Information Technology', 4, 'C', '$2a$10$x6vEqvK30fOfIS4IXQ4.iutOmSOM5HH6W9frgEdRW53mqjIJ4nERe', 0, NULL, NULL, 1, '2026-04-04 13:10:39', '2026-04-04 13:10:39');

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1001;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `election_data`
--
ALTER TABLE `election_data`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `voters`
--
ALTER TABLE `voters`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10013;

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
