-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 08, 2026 at 11:26 AM
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
(6, 'monitor@voting.edu', '$2a$10$kKs0lebeo8i1lZl0s3Yz6eofh6vESxgZ1edCRe5I0Ct3AIXFjWMGy', 'Poll Monitor Account', 'poll_monitor', '2025-11-25 01:49:28', '2026-01-07 07:47:35', 0, 1),
(8, 'admin1@voting.edu', '$2a$10$7Eygz9BRsxmpR3w9EypzieV4JNsyHGSKxTeF4vPwaQC9nTFE1zdSi', 'Servando S. Tio III', 'admin', '2025-12-09 02:47:34', '2025-12-09 02:47:34', 0, 1),
(9, 'auditor@voting.edu', '$2a$10$yj5buhVvrknlTiy18ncJC.qoFDe3aX2ZsVJgHwjLGSRoRM4cR3lKC', 'Auditor', 'auditor', '2025-12-09 03:01:01', '2025-12-09 05:04:15', 0, 1),
(10, 'admin23@voting.edu', '$2a$10$BMibHOto/JeUfbtAtgihBOvYSs./lGXFlEMWHaUk2bjcW.wTo5BIm', 'admin23', 'admin', '2026-01-07 07:34:10', '2026-01-07 07:34:10', 0, 1);

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

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `user_type`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(1960, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 03:54:51'),
(1961, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 03:54:51'),
(1962, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 03:56:08'),
(1963, 0, 'admin', 'FINISH_POLL', 'Poll finished: 20233 (25) with 0 candidates and 0 votes from blockchain_votes_sql_candidates', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 03:56:10'),
(1964, 0, 'admin', 'STOP_POLL', 'Poll status updated', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 03:56:12'),
(1965, 0, 'admin', 'RESET_BLOCKCHAIN', 'Blockchain reset completed. Emergency votes cleared: 0, Nodes reset: 0', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 03:56:16'),
(1966, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-10076', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 03:57:15'),
(1967, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-2301', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 03:57:41'),
(1968, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-2819', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 03:58:01'),
(1969, 0, 'admin', 'CREATE_VOTER', 'Created voter: 22-2920', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 03:58:21'),
(1970, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-2228', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 03:58:59'),
(1971, 0, 'admin', 'CREATE_VOTER', 'Created voter: 10-0001', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 03:59:31'),
(1972, 0, 'admin', 'CREATE_VOTER', 'Created voter: 10-7281', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 03:59:52'),
(1973, 0, 'admin', 'CREATE_VOTER', 'Created voter: 11-9281', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:00:28'),
(1974, 0, 'admin', 'CREATE_VOTER', 'Created voter: 13-8371', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:00:45'),
(1975, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Alyanna Marie Espoltero', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:01:07'),
(1976, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Jay Lou Terante', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:01:18'),
(1977, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Jomar Palarao', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:01:29'),
(1978, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: John Paul Gazo', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:01:40'),
(1979, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Servando S. Tio III', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:01:51'),
(1980, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Mharlou Escobido', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:02:03'),
(1981, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Joshua Tan', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:02:04'),
(1982, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: June Lian Jazle Tampos', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:02:11'),
(1983, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Royal Hanz Efren Caca', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:02:19'),
(1984, 0, 'admin', 'CREATE_VOTER', 'Created voter: 17-2712', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:02:42'),
(1985, 0, 'admin', 'CREATE_VOTER', 'Created voter: 15-2718', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:03:09'),
(1986, 0, 'admin', 'CREATE_VOTER', 'Created voter: 18-3728', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:03:25'),
(1987, 0, 'admin', 'CREATE_VOTER', 'Created voter: 27-7382', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:04:00'),
(1988, 0, 'admin', 'CREATE_VOTER', 'Created voter: 28-7382', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:04:27'),
(1989, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Jerameel Gamo', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:04:43'),
(1990, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Jerold Mernilo', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:04:51'),
(1991, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Catherine Medilo', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:04:59'),
(1992, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Angelica Mecate', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:05:07'),
(1993, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Zyira Dawat', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:05:28'),
(1994, 0, 'admin', 'DELETE_ELECTION', 'Deleted election record ID: 44', '10.123.36.76', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 04:06:58'),
(1995, 0, 'admin', 'START_POLL', 'Poll started by super admin', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:13:56'),
(1996, 0, 'admin', 'START_POLL', 'Poll status updated', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:13:58'),
(1997, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:14:13'),
(1998, 0, 'admin', 'FINISH_POLL', 'Poll finished: 2025 (25) with 14 candidates and 0 votes from blockchain_votes_sql_candidates', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:14:15'),
(1999, 0, 'admin', 'STOP_POLL', 'Poll status updated', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:14:16'),
(2000, 0, 'admin', 'RESET_BLOCKCHAIN', 'Blockchain reset completed. Emergency votes cleared: 0, Nodes reset: 0', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:14:34'),
(2001, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '10.123.36.76', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 04:14:37'),
(2002, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.123.36.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 04:16:04'),
(2003, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.123.36.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 04:16:04'),
(2004, 0, 'admin', 'DELETE_ELECTION', 'Deleted election record ID: 45', '10.123.36.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 04:17:03'),
(2005, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 06:46:22'),
(2006, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 06:47:02'),
(2007, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 06:47:02'),
(2008, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:31:23'),
(2009, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:31:23'),
(2010, 0, 'admin', 'CREATE_ADMIN', 'Created admin: admin23@voting.edu', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:34:10'),
(2011, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2023-023', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:37:56'),
(2012, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2021-203', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:37:56'),
(2013, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2024-021', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:37:56'),
(2014, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2025-1234', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:37:57'),
(2015, 0, 'admin', 'DEACTIVATE_VOTER', 'deactivated voter ID: 202', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:39:42'),
(2016, 0, 'admin', 'START_POLL', 'Poll started by super admin', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:41:41'),
(2017, 0, 'admin', 'START_POLL', 'Poll status updated', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:41:43'),
(2018, 194, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 07:42:15'),
(2019, 194, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 07:42:15'),
(2020, 17, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x461cc9ddf8ceabacd36c57867a252d3175fbd972010840527fe8b4e0a78cb1ab (Node: emergency_storage) - Empty positions: 1', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 07:44:42'),
(2021, 194, 'voter', 'MARK_VOTED', 'Voter 17-2712 marked as voted with ballot vote_mk3pp96x_0y7k3rcdfbfi_libx0lf79ta_in2v', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 07:44:42'),
(2022, 194, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 07:45:47'),
(2023, 194, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 07:45:48'),
(2024, 200, 'voter', 'LOGIN_FAILED', 'Invalid password', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 07:46:35'),
(2025, 200, 'voter', 'LOGIN_FAILED', 'Invalid password', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 07:46:53'),
(2026, 0, 'admin', 'UPDATE_ADMIN', 'Updated admin ID: 6', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:47:35'),
(2027, 6, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:47:47'),
(2028, 6, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:47:48'),
(2029, 189, 'voter', 'LOGIN_FAILED', 'Invalid password', '10.217.68.74', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 07:50:29'),
(2030, 185, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '10.217.68.42', 'Mozilla/5.0 (Linux; Android 11; V2026 Build/RP1A.200720.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.146 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/537.0.0.52.109;]', '2026-01-07 07:50:54'),
(2031, 185, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '10.217.68.42', 'Mozilla/5.0 (Linux; Android 11; V2026 Build/RP1A.200720.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/143.0.7499.146 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/537.0.0.52.109;]', '2026-01-07 07:50:55'),
(2032, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: 20-228', '10.217.68.74', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-07 07:51:23'),
(2033, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:52:21'),
(2034, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-07 07:52:21'),
(2035, 199, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 07:56:10'),
(2036, 199, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '10.217.68.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-07 07:56:10'),
(2037, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 02:37:07'),
(2038, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 02:37:07'),
(2039, 0, 'admin', 'SUPER_ADMIN_VERIFICATION_FAILED', 'Super admin password verification failed', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 02:37:41'),
(2040, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 02:37:51'),
(2041, 0, 'admin', 'FINISH_POLL', 'Poll finished: SSC 25 (25-26) with 14 candidates and 0 votes from blockchain_votes_sql_candidates', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 02:37:53'),
(2042, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 02:37:55'),
(2043, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 65', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 03:00:49'),
(2044, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 78', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 03:02:41'),
(2045, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 77', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 03:02:42'),
(2046, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 76', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 03:02:44'),
(2047, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 75', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 03:02:45'),
(2048, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 74', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 03:02:46'),
(2049, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 73', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 03:02:47'),
(2050, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 72', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 03:02:48'),
(2051, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 71', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 03:02:50'),
(2052, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 70', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 03:02:52'),
(2053, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 69', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 03:02:54'),
(2054, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 68', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 03:02:56'),
(2055, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 67', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 03:02:57'),
(2056, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 66', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 03:02:59'),
(2057, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Alyanna Marie Espoltero', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 10:20:48'),
(2058, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 10:20:59'),
(2059, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 10:21:01'),
(2060, 201, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-08 10:21:44'),
(2061, 201, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-08 10:21:44'),
(2062, 2024, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x8594dbff2321134d235a8d855db543d43a150fad16840ca151217a1e72096159 (Node: emergency_storage) - Empty positions: 2', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-08 10:23:52'),
(2063, 201, 'voter', 'MARK_VOTED', 'Voter 2024-021 marked as voted with ballot vote_mk5aufjr_e7fes3o79zl_6amgwkwnyq9_0nil', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-08 10:23:52'),
(2064, 0, 'admin', 'SUPER_ADMIN_VERIFICATION_FAILED', 'Super admin password verification failed', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 10:24:21'),
(2065, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 10:24:30'),
(2066, 0, 'admin', 'FINISH_POLL', 'Poll finished: SSC (25-26) with 1 candidates and 1 votes from blockchain_votes_sql_candidates', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 10:24:32'),
(2067, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 10:24:34'),
(2068, 0, 'admin', 'UPDATE_CANDIDATE', 'Updated candidate ID: 79', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-08 10:25:35');

-- --------------------------------------------------------

--
-- Table structure for table `candidates`
--

CREATE TABLE `candidates` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `party` varchar(255) NOT NULL,
  `position` varchar(255) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `image_path` varchar(500) DEFAULT NULL,
  `vote_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `position_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `candidates`
--

INSERT INTO `candidates` (`id`, `name`, `party`, `position`, `image_url`, `image_path`, `vote_count`, `created_at`, `updated_at`, `is_active`, `position_id`) VALUES
(79, 'Alyanna Marie Espoltero', 'Makabayan', 'President', 'candidate-1767867935109-197619026.jpg', '/uploads/candidates/candidate-1767867935109-197619026.jpg', 0, '2026-01-08 10:20:48', '2026-01-08 10:25:35', 1, NULL);

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
(17, 'BS Criminology', 'BS-Crim', 1, '2025-11-23 04:32:44', '2025-11-23 04:32:44'),
(21, ' Bachelor of Science in Criminology', 'BS Criminology', 1, '2025-12-09 03:12:14', '2025-12-09 03:12:14');

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

--
-- Dumping data for table `election_data`
--

INSERT INTO `election_data` (`id`, `election_name`, `election_date`, `academic_year`, `finished_at`, `total_candidates`, `total_votes`, `election_hash`, `encrypted_data`, `created_at`, `updated_at`) VALUES
(47, 'SSC 25', '2026-01-08', '25-26', '2026-01-08 02:37:53', 14, 0, '0f3e93474e6cccd84e972710a146bcc5694c21e7e5ae5128aca83affefbbb37d', '{\"iv\":\"df991b3eaa4be01f9a6dfa9e30d4e666\",\"data\":\"9c03798148f9e04224ed0c234767ab4d5286de10893ff980731c26a7a20f5af45195bb621f6f1fb2576ed4b2d1c3f872385e6042e9b76aba6178f46bc6d658a2a49abc9a14ad24a5b975f9e5e745a63b31553a1af8ba7b7db4bb849631a4f77ab66a41f4f8680959141b796746a8670d157b46ac74f1086d2827f2641253ec9bf10aa6f177403efef30c0ac5f69d97f0f602e89757a1ce37dd47fb7bceaf5c1654188063772a94f8304d7ee686a5f2097221f1fea78652c4d4493c80c988ba18b5bc217a5ff3edd2bc77653c07c90c6a54cffb07a45a73f1e3eb4f307458919103e0d66f06491a7d3b0a3bed7bf497296096c7c2ebe9e8d4cee58b2426c8ff0f57bbbb8c476d9982c4a44124b08ad994f9b4a9e31b20d33d954404311daa0c9a4aeeac26c37708855c85448e42260e5b99e75c9e00f12be53a7f18bded37d7ea83f05af5dec67e44653eca6f1f7e5aa30321d3292ce5f0a2e6a19fe49ece39795bb376998088aabb33f7a64dcb18dac7721fa30d465a2ca3e927edd62f06c1cadd4dcb0a0952920b3125b57a73506cb2e22c9772c3cec26e4e10147b92d35b165336c14b4cec07057f523e67afa113a91be51a8b52f5ae54f14b46c0f4ea678c8d2d87637ce7e8f14ffed71a9c2d81130d5cdae440def97974623d67e3aea12c2c549f3509f1f5b8f24f89e31d849e3a8ccecdc2bf80fc0b5c380390e2e8584860df8022b216adfec3f9f2c43292757e8e49aa34e1118ab9691c4233e3a02ca57f117c3ca77592aeb8ca7b38ae9ecdd0fe720ad0c1a5180ab89d27e99f33a6f0e6968aef80856cbd699436e0aa709a2b51a8f1ab726a1feff63d060a0528b17f7acd919ca5d6d195c88fa75a5b26f1c3038b2886f8cc93461df3c9f6dc3ed1fe5f41c17976dbaa94b70f78259e759fbce37a77a34af311b5f7b037dbd43c881e36019c07918ef656b4a24f8dea2daa141fc394216ea43e768df6c5f6508e2e4f20ab04c03f124def06870b69afb5e15f8fb72a872df7e156b5a824939b4987d8421a552266fbfaba14d5fedac4b1e8deeab541ecaeaa27f3849c00cbabcd8529d33dabf5b38ab209994416f6e866fdc415f7e8bcf4dc6048389f466fa2e4d2757d6441e82a8d8e083b67e8fcdfa8879eb5e4d5b31ebcc6d266f4c59743ec0f2af9e39d95611c668b2bacf08d2d144c21b0e9061f23f3a1a580b40704bebe22e87d69e6946835582196ab10036df13d57ca04851afc04405468a352efd2653bbbb6cae9dc3e9c9a1615301f4c0abc6c4eace9b80f6a36f812579e6a555c64062249ea87d81c7b1283eed363ca6c98814b08bd7413b0d5d343856a47dc8c4c2f84b2a829a406bc20c1406286e3b3f2dadfa176827b475fd7286049b659d093b261c7e3b744b2cfcecdc0c33ea0be2d4ff420c1e0cefb4a2e915e48b187b457b5f32bfe3cc33815bea1671fe1651f1aaba45181a6af6e109c2628661f90f84597c3ee02b17e8d164aeb7077de9a173a823c3e5eeb50046123490214a12d2cacb180858ee5f2f23f42cfe6bd4ac15e5e67bc3f14eb23ec14c8fa8f3c854f88163e21652965e8ec2ff64f66f0580a620e6d7c6b8593b6a0c4dfc31863f58a3b1414f44342c65d61392257936058e1ec57f5716abc40e8019b1c73f4612d826f2701e1fdc035b4847cfe5c04f85f14ca41c1f93fcaf03099182b2ad087d47dbbdb43d4dea546ad34158bed8937eb03bcf9ebbe0786cdd868b963ba6e4ae1d985caf19e97db1c65f4a96611480f2b3a2d133598d8f23f0b62bde709ceb77db45ebdd730587c57dfcc1845de33d2cbf15a5d367191a649c9e3e925ff7b81b53e942fe99a87ff677f378b2ae840ce311bbce81e7427e51e1266a8095fb627bc9581d0d8a79efa1bdc2db7a6b391aed00daf4295d43530dac1858fcb3f428529a239fc2ecc17b9e6785de115beb920772e609de0b9c67e54582505245640aa44a703d240c671340c7caa55fc7aa8cfd862a18d184bb96ac032ba131db122970cc10b5e163b0f5bc5a387dd8d67a7050bc661ccea6e36a22caa55ae78bc6e1e34a8ebbf37db4f5c910b5f780ce43122c05bc6573f63bc0832d07ae05a2a9fd597b148839230eae1754d205a17870ba3bfc922907cfa638cb892524950781cf769ca6beabc25f18ab15305db28816e4c5ac572b925433cca4d3222e853aa00bd7701b3ea25e39f5d097b441fbf672c2ec27cad60de0ee565f59a4ee038f2ce15aba54b68fa5efe8ddc65ecd5f107f438d7de13d60ed9b11f2cc74cb79cb20d6bde02a1b7eb34a7554b24fefc486e0f155348d7802d92fc6d20af736852e0e5e473a7835aa2ce86bf3564f44d76853e851d8981ad0ab26acefea4ec75651cdbfa857d0c06de05a0d61edffd4ccf4e6d173e7c1ffb05694d0e1c64c0c6348e7fc1c7fce0426ee8b6c9d64de3d540da5eac5f6c5f94138c51c9fe0427fe880cc6a43343d6ca2b6e1903912c3fe78d7f258c495c6f163d87b4fc5b860a7567e92f6ef2c4eb79fcd68717f84e1d89c0916fb228c71b64b1fcf05215a3dbdf4b78b9fe6c20e6607b43bc7561c77d5c2d2cb4064405578eed617dd52624b2a641b57456930868433a67593a0ed249ba99abd94c9ebb6bc2aa8ce492491eb15c5e7b10fe9e4947c334e1510c92839defb4c3ef762976de3908c49719ac5d004c33fe1a28ff7be2ee888a06651a663c99758003424f287937cb969d37a112b8cfb068d96d5b75e6b732a78cb4824030c0e69f45cdd6443696787810fe3104add1735a69719636e60b610a9043e1b54bad58d899df24e08990299defac7241b327371fddd9b07f27fd83153ecd9171763423e3943392f6dfd50223af955e8f14bcc416a42829ffdfee2891e5dfb18fce8c23564f164d432dfe1384a2bbe6819c3f4decab3734cb118856ea172ef85b977bad5e3a372cf8ab49df99d987c8b2d6b958cc0e6f2228be86e56143e00ce9a75f36201f62d8a034299a4a566dce29cc57088d4d5ead01e6a0bc5d42da00552af3f991f594bb49f27f2430012eedbb3cb8bdaa959de45a8b23ffe3c49de855f733af4ce690a0f2aa08296a6d8f9047e0eb4befc2a30e4910b55e8244fa82561f6d5aa5a37d3a1e8258017ec85f02ddfabc2ed578512f9acf05c268ffefc07f86f216952f72644c9b280bb8eb8c3c218f111134200fcaf6a3e128b024166fe2cc215e54fb4ce13d2bdda91f2c1e928460ab89f6f0be55d17ad1a865fa158ea2f54f795e5aa8d4d5b18594bb9603a010b76f16a79be7171420cf1c4610b09d5b6e16032d499f14051e7277801dc9ec73486a379126424ed7b6caa2c0616058a0c4992ee5d116e7ea66e25e9cb5e371343d4f0fd38b61383ce09cd9a46edaa10b2e2d0888c82fdf44b9d132840d19fa4fb9dea2655f8a592f291b0eee6e3fb9f7acd204435457be04e7f2e62bd1228de7c5958fe7a4a0bba4e8d1262108f0711af034d24878898634579c5031bdbb6117b523356172ac91f5b4bb012bf36ac5ce905fb713aee0b6dbea31920bbf4ddbab6118bfd41d704705aadd930b38c725098d1c828bb279b570b8d8eae14eee33d3988a851d0a7f75202e1a95261330474bc15ff0be2c6f5ee0f8b1f26ffa7038907c47b02e7afbb683818dfc73a9b406ed0497e7996a5469c736a0f698d90d9a2bdb4cd312de277fc817e68011cb94c722c8d5bd22874b50db53206dc8625172e1611018de25bdbf1a00d5f39460dfd919817a32acf5dbd58a523c3a636d8450bf415317cfc9ba503468709518b7b37e7b2c4c32a4e6e5ace3fb174ef6d1b5e0bd3e68c8af8d52d01cf736983c9a122826fc742ca0303806e733f9d84da51baca7204cc6450f1877041d18958692c0c1c5fffa4d5339df2de2cdd5de744491b9971af6ef66b902e66c350fe0a5ce9cabfbee6b1930531642ce00471f1df3c9e790832880d45c35384cabdadc0652f06bd74376c12175acad5f4c40a4385f5e5eec0f95d657e4a47a78d190e3328fafd2406b9de4d225f41433cf52f54b824d177b19369f2039d998824214a496760c06ba895a4370bf8ecb223dc3d586d922c71c5ddea85b2e997017137caac6\"}', '2026-01-08 02:37:53', '2026-01-08 02:37:53'),
(48, 'SSC', '2026-01-08', '25-26', '2026-01-08 10:24:32', 1, 1, '22fa2f953f2784826d914c22c51033d2c573558792c0d37f6b11dccc98b07c91', '{\"iv\":\"78981a278854fd8412a0f29af98490fa\",\"data\":\"d71c9e6a062b26f1c43142407252633380775ba4909a125d5099c253a613a6238c8ff346e4cb10b7d9ab41624a16e7680e06f36dba55d1c528be37dd9a07548ad8f19b78b186180e796b3d828dded6c87009fade9ef125c48c7d568b5673d8bcb485821c8dbe23c88dabb620f8de2c083918fbb13da819f784c4d73e9176a52a06c26ce5ff40aba2765c6c973682338eefad3c42699f7b6a934dc87531d7594e52df167a9ef2b3c41c59f69809d981255ca006add39b8619ca3478f3989bcf68485069215cc1a1c0d841521130f1e639bf83bc36da75488a5081c46d0ed50c13ee900e5e4c18c21b05113a2de3f2bf874bf636fe26c4033cfdc185aca7becb394a4c0cfbd2ff64cfec82937c0bcbc6272a8a8809eb01f8551a58b66a372b7feca9dfa11993ec9b5f7a9bd9defeadbe7f7e294bbbc8dc1631eec5c3d8d2d61900a1252cc2f17518771e89715c7b0a210afdaf64d599f3c067cabd7fc68847c4efef6028be14439e5a879fd87c13155ebe8ea78f554810038bc85f6fd922179dae6ced09746a3848b771fe8f034c578896c28e31fdf0fa44d387bf0a35375e6ae9b7cc627c240acf495e6f420b95378d39106fd37afb1ed903167510adcf7fadf344b05d3d64a10bbf8f9ce16a4537999a695a1b230557bf91b6224aa66d38ce3a7abbcc4b6972c7fa9e067490f742a0221357fb7bddb0f3c442a83f6bf03d0c3c8be46903163dfe90ea2ef056772e92a1718284228bae3847f2a80cf812f9075f\"}', '2026-01-08 10:24:32', '2026-01-08 10:24:32');

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
(8, 'President', 1, 1, 1, '2025-11-25 03:03:13', '2025-12-04 00:24:31'),
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
(184, '20-10076', 'Servando S. Tio III', 'BS in Information Technology', 4, 'A', '$2a$10$hUEtQuzJ4/wCfwu0imqof.CVX2xdo004/eOpm/AIebOsLijB4ML6G', 0, NULL, NULL, NULL, '2026-01-07 03:57:15', '2026-01-07 03:57:15', 1),
(185, '20-2301', 'Mharlou Escobido', 'BS in Information Technology', 4, 'A', '$2a$10$d6NRgExgNQ6ifZ.oDFtFQOBjxuZICtcOzyB5FQZ6G1I0eHiJx5tDC', 0, NULL, NULL, NULL, '2026-01-07 03:57:41', '2026-01-07 03:57:41', 1),
(186, '20-2819', 'Joshua Tan', 'BS in Information Technology', 4, 'A', '$2a$10$lhLNcczd3LiEksGkPZGOGOs/4yYdEuWWI6AoOJLT8I.qaaut4OC52', 0, NULL, NULL, NULL, '2026-01-07 03:58:01', '2026-01-07 03:58:01', 1),
(187, '22-2920', 'June Lian Jazle Tampos', 'BS in Information Technology', 4, 'A', '$2a$10$Hk4O9vZ.WTi5p31yO6Fhk.iSZ8knCKdGpJO1VKuZlAd8jbnOaIKVa', 0, NULL, NULL, NULL, '2026-01-07 03:58:21', '2026-01-07 03:58:21', 1),
(189, '20-2228', 'Royal Hanz Efren Caca', 'BS in Information Technology', 4, 'A', '$2a$10$L2BnTUupxcBlpqmpNjBtpO.T3L5nLCdBThJmkwi9XjrN9ltIT.DRS', 0, NULL, NULL, NULL, '2026-01-07 03:58:59', '2026-01-07 03:58:59', 1),
(190, '10-0001', 'Jay Lou Terante', 'BS in Entrepreneurship - Hospitality Management', 3, 'B', '$2a$10$X9g9f/EZwdyICF28G.ZltOQdmGE.quTI8lY3aGiRp1R9miaCdTabi', 0, NULL, NULL, NULL, '2026-01-07 03:59:31', '2026-01-07 03:59:31', 1),
(191, '10-7281', 'Alyanna Marie Espoltero', 'Bachelor of Industrial Technology - Electrical Technology', 4, 'E', '$2a$10$wNvX9bcy8UV6yOLIaArULOmJpYcASLdDMANretn6yWQVJRgmW1oAO', 0, NULL, NULL, NULL, '2026-01-07 03:59:52', '2026-01-07 03:59:52', 1),
(192, '11-9281', 'John Paul Gazo', 'BS in Information Technology', 3, 'B', '$2a$10$U7hDNT2JBdGiCfnTDm9H.eJB1XbpvOGtYFrL1omQfhwHRsLTv5lf2', 0, NULL, NULL, NULL, '2026-01-07 04:00:28', '2026-01-07 04:00:28', 1),
(193, '13-8371', 'Jomar Palarao', 'BS in Entrepreneurship - Hospitality Management', 4, 'A', '$2a$10$dgpKMxKg1P1m0EJgtrmYFOy2faYiV207PqOYrVQEpnKnp5uyO7c76', 0, NULL, NULL, NULL, '2026-01-07 04:00:45', '2026-01-07 04:00:45', 1),
(194, '17-2712', 'Catherine Medilo', 'BS in Information Technology', 4, 'A', '$2a$10$0uHGiWjd3xgEu5he5omTIuqdEXVFWMdPLkLRMhuIVULBffCye1pii', 1, 'vote_1767771882608_eqj8i1ai6', '2026-01-07 07:44:42', NULL, '2026-01-07 04:02:42', '2026-01-07 07:44:42', 1),
(195, '15-2718', 'Jerameel Gamo', 'BS in Information Technology', 2, 'A', '$2a$10$w0RHfAMZavfQXqpw1.KHBOnjQxtVQJMzoK1oOa.wns/zKnNhaIV5G', 0, NULL, NULL, NULL, '2026-01-07 04:03:09', '2026-01-07 04:03:09', 1),
(196, '18-3728', 'Angelica Mecate', 'BS in Information Technology', 3, 'C', '$2a$10$.hZub98Q1quZjn3FjrsVTua2SpTVIasOSnpcg/EPC.uqwSLPfT3se', 0, NULL, NULL, NULL, '2026-01-07 04:03:25', '2026-01-07 04:03:25', 1),
(197, '27-7382', 'Zyira Dawat', 'Bachelor of Secondary Education - Biological Science', 3, 'E', '$2a$10$z0Tel7prCjgu2cmEFc08GuCk5aEaHuhjKjb35I7H.q2qQEKiFBZPa', 0, NULL, NULL, NULL, '2026-01-07 04:04:00', '2026-01-07 04:04:00', 1),
(198, '28-7382', 'Jerold Mernilo', 'Bachelor of Secondary Education - Filipino', 4, 'E', '$2a$10$D5GKbJ052g3ImeFEX4tftux7yQgs4mJ9CAmdfTYgxG2oDcMg62sA2', 0, NULL, NULL, NULL, '2026-01-07 04:04:27', '2026-01-07 04:04:27', 1),
(199, '2023-023', 'Jerald E. Mernilo', 'BS in Information Technology', 4, 'A', '$2a$10$FIPBxPF7m/w5n5B.w86r/OcZ3fMOAqAlKYJdFhI7OIToaJMXrcXye', 0, NULL, NULL, NULL, '2026-01-07 07:37:56', '2026-01-07 07:37:56', 1),
(200, '2021-203', 'Earl Espina', 'BS in Information Technology', 4, 'A', '$2a$10$nsB1xq4SvYmhmaP3pHe1suECXVnIGYL7t6IkIcTRCajXtgjrzp6lu', 0, NULL, NULL, NULL, '2026-01-07 07:37:56', '2026-01-07 07:37:56', 1),
(201, '2024-021', 'John Paul Tomada', 'BS in Information Technology', 4, 'A', '$2a$10$5JtoDFHW8pBQtkRaSpryPOmZ5u3dFEj/t5oinFlM9QHTdZyYA61G2', 1, 'vote_1767867832081_7eyxq0dr2', '2026-01-08 10:23:52', NULL, '2026-01-07 07:37:56', '2026-01-08 10:23:52', 1),
(202, '2025-1234', 'Jerold E. Mernilo', 'BS in Information Technology', 4, 'A', '$2a$10$oTVDxTefIB5rx940JzytDuVdgoxZkZuoEbBovOTpTdLQCJWoldDw6', 0, NULL, NULL, NULL, '2026-01-07 07:37:57', '2026-01-07 07:39:42', 0);

-- --------------------------------------------------------

--
-- Table structure for table `vote_verification`
--

CREATE TABLE `vote_verification` (
  `id` int(11) NOT NULL,
  `voter_id` varchar(50) NOT NULL,
  `candidate_id` int(11) NOT NULL,
  `position` varchar(100) NOT NULL,
  `ballot_id` varchar(255) NOT NULL,
  `transaction_hash` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Indexes for table `vote_verification`
--
ALTER TABLE `vote_verification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `voter_id` (`voter_id`),
  ADD KEY `candidate_id` (`candidate_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2069;

--
-- AUTO_INCREMENT for table `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `election_data`
--
ALTER TABLE `election_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `voters`
--
ALTER TABLE `voters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=203;

--
-- AUTO_INCREMENT for table `vote_verification`
--
ALTER TABLE `vote_verification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `candidates`
--
ALTER TABLE `candidates`
  ADD CONSTRAINT `candidates_ibfk_1` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`);

--
-- Constraints for table `vote_verification`
--
ALTER TABLE `vote_verification`
  ADD CONSTRAINT `vote_verification_ibfk_1` FOREIGN KEY (`voter_id`) REFERENCES `voters` (`student_id`),
  ADD CONSTRAINT `vote_verification_ibfk_2` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
