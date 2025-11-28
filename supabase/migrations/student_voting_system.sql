-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 26, 2025 at 09:26 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

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

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('admin','auditor','poll_monitor') DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `email`, `password`, `full_name`, `role`, `created_at`, `updated_at`, `created_by`, `is_active`) VALUES
(2, 'admin@voting.edu', '$2a$10$hDpaxHSY6ZPRETC3/Bh4UeSazfeC81y2iH5c26D8F1BJ6M4Fx0lM6', 'admin', 'admin', '2025-11-14 16:33:34', '2025-11-14 16:33:34', 0, 1),
(3, 'auditor@voting.edu', '$2a$10$WtQvZSQn5491ep.vwmMc3e/JTADHomugR0W1zBL5lpTaymmmIctVu', 'auditor', 'auditor', '2025-11-19 07:29:40', '2025-11-19 07:29:40', 0, 1),
(6, 'monitor@voting.edu', '$2a$10$XxD7Wb42Oz2WQM./0x7yfOQ6Gk0gpzX1d/1nqdycUfTcXzyP3AgtW', 'Poll Monitor Account', 'poll_monitor', '2025-11-25 01:49:28', '2025-11-25 01:49:28', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_type` enum('admin','voter','system') NOT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `candidates`
--

CREATE TABLE `candidates` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `party` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `vote_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `position_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `candidates`
--

INSERT INTO `candidates` (`id`, `name`, `party`, `position`, `vote_count`, `created_at`, `updated_at`, `is_active`, `position_id`) VALUES
(42, 'Joshua A. Tan', 'TECHNOCRATS', 'President', 0, '2025-11-25 03:03:40', '2025-11-25 03:03:40', 1, NULL),
(43, 'Mharlou C. Escobido', 'D\'TECHNOCRATS', 'President', 0, '2025-11-25 03:03:53', '2025-11-25 03:03:53', 1, NULL),
(44, 'June Lian J. Tampos', 'TECHNOCRATS', 'Vice President', 0, '2025-11-25 03:04:08', '2025-11-25 03:04:08', 1, NULL),
(45, 'Royal Hanz F. Caca', 'D\'TECHNOCRATS', 'Vice President', 0, '2025-11-25 03:04:20', '2025-11-25 03:04:20', 1, NULL),
(46, 'Servando S. Tio III', 'TECHNOCRATS', 'Senator', 0, '2025-11-25 03:04:35', '2025-11-25 03:04:35', 1, NULL),
(47, 'Kenneth J. Dugaria', 'Technocrats', 'Senator', 0, '2025-11-25 03:42:22', '2025-11-25 03:42:22', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `name`, `code`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'BS in Information Technology', 'BSIT', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(2, 'BS in Office Administration', 'BSOA', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(3, 'BS in Accountancy', 'BSA', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(4, 'BS in Office Management Accounting', 'BSMA', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(5, 'Bachelor of Technology and Livelihood Education - Home Economics', 'BTLED-HE', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(6, 'Bachelor of Technology and Livelihood Education - Industrial Arts', 'BTLED-IA', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(7, 'BS in Entrepreneurship - Social Entrepreneurship', 'BSE-SE', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(8, 'BS in Entrepreneurship - Culinary Arts', 'BSE-CA', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(9, 'BS in Entrepreneurship - Hospitality Management', 'BSE-HM', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(10, 'Bachelor of Secondary Education - Biological Science', 'BSED-BS', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(11, 'Bachelor of Secondary Education - English', 'BSED-ENG', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(12, 'Bachelor of Secondary Education - Filipino', 'BSED-FIL', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(13, 'Bachelor of Secondary Education - Mathematics', 'BSED-MATH', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(14, 'Bachelor of Industrial Technology - Automotive Technology', 'BSINDU-AT', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(15, 'Bachelor of Industrial Technology - Electrical Technology', 'BSINDU-ELECTRICALTECH', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(16, 'Bachelor of Industrial Technology - Electronics Technology', 'BSINDU-ET', 1, '2025-09-24 10:12:09', '2025-09-24 10:12:09'),
(17, 'BS Criminology', 'BS-Crim', 1, '2025-11-23 04:32:44', '2025-11-23 04:32:44');

-- --------------------------------------------------------

--
-- Table structure for table `election_data`
--

CREATE TABLE `election_data` (
  `id` int(11) NOT NULL,
  `election_name` varchar(255) NOT NULL,
  `election_date` date NOT NULL,
  `academic_year` varchar(50) NOT NULL,
  `finished_at` datetime NOT NULL,
  `total_candidates` int(11) NOT NULL DEFAULT 0,
  `total_votes` int(11) NOT NULL DEFAULT 0,
  `election_hash` varchar(64) DEFAULT NULL,
  `encrypted_data` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `poll_settings`
--

CREATE TABLE `poll_settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 0,
  `is_paused` tinyint(1) DEFAULT 0,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `paused_at` datetime DEFAULT NULL,
  `current_state` varchar(50) DEFAULT 'stopped',
  `last_election_name` varchar(255) DEFAULT NULL,
  `last_election_date` date DEFAULT NULL,
  `last_academic_year` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `poll_settings`
--

INSERT INTO `poll_settings` (`id`, `is_active`, `is_paused`, `start_time`, `end_time`, `paused_at`, `current_state`, `last_election_name`, `last_election_date`, `last_academic_year`) VALUES
(1, 0, 0, NULL, NULL, NULL, 'stopped', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `max_votes` int(11) NOT NULL DEFAULT 1,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`id`, `name`, `max_votes`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(8, 'President', 1, 0, 1, '2025-11-25 03:03:13', '2025-11-25 03:03:13'),
(9, 'Vice President', 1, 2, 1, '2025-11-25 03:03:18', '2025-11-25 03:10:33'),
(10, 'Senator', 5, 3, 1, '2025-11-25 03:03:25', '2025-11-25 03:10:39');

-- --------------------------------------------------------

--
-- Table structure for table `voters`
--

CREATE TABLE `voters` (
  `id` int(11) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `course` varchar(100) NOT NULL,
  `year_level` int(11) NOT NULL,
  `section` varchar(10) NOT NULL,
  `password` varchar(255) NOT NULL,
  `has_voted` tinyint(1) DEFAULT 0,
  `vote_hash` varchar(255) DEFAULT NULL,
  `voted_at` timestamp NULL DEFAULT NULL,
  `ballot_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `voters`
--

INSERT INTO `voters` (`id`, `student_id`, `full_name`, `course`, `year_level`, `section`, `password`, `has_voted`, `vote_hash`, `voted_at`, `ballot_id`, `created_at`, `updated_at`, `is_active`) VALUES
(158, '20-10076', 'Servando S. Tio III', 'BS in Information Technology', 4, 'A', '$2a$10$GVRk8qAqd2E4AZMdArDxpO4RSIcPuJ62hO9eAQ0I9ZtA52ngIHgE.', 0, 'vote_1764129096116_7th3btqir', NULL, NULL, '2025-11-25 01:50:39', '2025-11-26 07:36:58', 1),
(159, '21-10241', 'June Lian J. Tampos', 'BS in Information Technology', 4, 'A', '$2a$10$UY2OM0rFU5SM3M4bdwsWCOZnE9pQJflxJWk4bDVWMOphRwVik5vfC', 1, 'vote_1764145055871_tp7x51cq9', '2025-11-26 08:17:36', NULL, '2025-11-25 02:53:40', '2025-11-26 08:17:36', 1),
(160, '22-10640', 'Mharlou C. Escobido', 'BS in Information Technology', 4, 'A', '$2a$10$VuTSJx0m6Ywd00C0kMr1Teteg1f1oJBHOz/yXdgvokDJbP2UCsAn2', 0, 'vote_1764142771542_vm7vo34qf', NULL, NULL, '2025-11-25 02:54:08', '2025-11-26 08:16:28', 1),
(161, '22-10553', 'Joshua A. Tan', 'BS in Information Technology', 4, 'A', '$2a$10$BIsJnNi19JVXorpZ77RhtuD4aZvhleuLPqQhtZInMgoyBD3/C0Cem', 1, 'vote_1764145031666_j31u3rrlf', '2025-11-26 08:17:11', NULL, '2025-11-25 02:57:37', '2025-11-26 08:17:11', 1),
(162, '21-20002', 'Royal Hanz F. Caca', 'BS in Information Technology', 4, 'A', '$2a$10$BNO/s4STtDXnjSWk8tvFnu5/VsjxKirXKOg1VgGqpeMJ/CAKb8hEO', 0, 'vote_1764129081568_t73cvxdwh', NULL, NULL, '2025-11-25 02:58:25', '2025-11-26 07:36:58', 1),
(163, '20-00000', 'Kenneth J. Dugaria', 'BS in Information Technology', 4, 'A', '$2a$10$QOWr.L8.xfovyEBb5dHxyuF83PWrv0yxsyEdIgX4VPDfWTnqottdS', 1, 'vote_1764145357676_5wr1hzacb', '2025-11-26 08:22:37', NULL, '2025-11-25 03:05:16', '2025-11-26 08:22:37', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_type` (`user_type`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `candidates`
--
ALTER TABLE `candidates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_position` (`position`),
  ADD KEY `idx_party` (`party`),
  ADD KEY `idx_candidates_position_id` (`position_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `election_data`
--
ALTER TABLE `election_data`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_election` (`election_name`,`academic_year`);

--
-- Indexes for table `poll_settings`
--
ALTER TABLE `poll_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_positions_display_order` (`display_order`),
  ADD KEY `idx_positions_active` (`is_active`);

--
-- Indexes for table `voters`
--
ALTER TABLE `voters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD UNIQUE KEY `idx_ballot_id` (`ballot_id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_course_year_section` (`course`,`year_level`,`section`),
  ADD KEY `idx_has_voted` (`has_voted`),
  ADD KEY `idx_voters_active` (`is_active`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1740;

--
-- AUTO_INCREMENT for table `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `election_data`
--
ALTER TABLE `election_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `voters`
--
ALTER TABLE `voters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=164;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `candidates`
--
ALTER TABLE `candidates`
  ADD CONSTRAINT `candidates_ibfk_1` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
