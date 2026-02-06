-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 06, 2026 at 07:02 AM
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
(11, 'admin1@voting.edu', '$2a$10$iBNedhQXb2fDOecEPdOaB.2ylpAMSm3JqeVIMzegLcvo4fY209MhC', 'admin1', 'admin', '2026-02-01 09:06:07', '2026-02-03 03:11:26', 0, 1),
(12, 'admin2@voting.edu', '$2a$10$KS2f1ONltWgdWyKrt482tOqtAfiRPguDZocHhlFSpd33zUB6S12pK', 'admin2', 'admin', '2026-02-01 10:52:55', '2026-02-01 10:52:55', 0, 1),
(13, 'admin3@voting.edu', '$2a$10$YqpNDhs4iC8sgMNphBax/eNhNwHAU.hZKjmfB8WF3cxGuDuZ.V8iq', 'admin3', 'admin', '2026-02-01 13:49:46', '2026-02-01 13:49:46', 0, 1),
(14, 'admin4@voting.edu', '$2a$10$DOIbuqiDzlGfApRmJpO9YOaO8MaOdlWoxX/IRB7NKYoHhJuiJgXHC', 'admin4', 'admin', '2026-02-01 14:03:52', '2026-02-01 14:03:52', 0, 1);

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
(2428, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:10:24'),
(2429, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:10:24'),
(2430, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:12:05'),
(2431, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:12:05'),
(2432, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:12:40'),
(2433, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:12:40'),
(2434, 0, 'admin', 'CREATE_POSITION', 'Created position: President', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:12:53'),
(2435, 0, 'admin', 'CREATE_POSITION', 'Created position: Vice - President', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:13:34'),
(2436, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-10076', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:14:16'),
(2437, 0, 'admin', 'CREATE_POSITION', 'Created position: Senator', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:25:56'),
(2438, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 05:29:27'),
(2439, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 05:29:28'),
(2440, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 05:29:34'),
(2441, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 05:29:34'),
(2442, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0001', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:30:50'),
(2443, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0002', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:32:22'),
(2444, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Alyanna Marie Espoltero', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:38:20'),
(2445, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0004', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:42:01'),
(2446, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: John Paul Gazo', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:43:41'),
(2447, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:44:01'),
(2448, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 05:44:02'),
(2449, 203, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 05:45:07'),
(2450, 203, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 05:45:07'),
(2451, 203, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 05:46:44'),
(2452, 203, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 05:46:45'),
(2453, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0xa8bbc22b72be0da850157fcedc36d61755d144ea8eafb1eece7917f72967e432 (Node: node1) - Empty positions: 1', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 05:51:19'),
(2454, 203, 'voter', 'MARK_VOTED', 'Voter 20-10076 marked as voted with ballot vote_ml3bj6kz_1bs8ugg3egk_ij8jecm2o8_okkb', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 05:51:19'),
(2455, 204, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 08:32:29'),
(2456, 204, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 08:32:29'),
(2457, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0xafcf1a7411ead9749e1ac37e10f2b34ecd2a454d382b9969ba2e0da2d18f6799 (Node: node1) - Empty positions: 1', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 08:34:45'),
(2458, 204, 'voter', 'MARK_VOTED', 'Voter 20-0001 marked as voted with ballot vote_ml3hj32g_3kufi8ofscs_7ba269bu42t_asrl', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 08:34:45'),
(2459, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 08:46:50'),
(2460, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 08:46:50'),
(2461, 0, 'admin', 'PAUSE_POLL', 'Poll paused by super admin', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 08:46:51'),
(2462, 0, 'admin', 'PAUSE_POLL', 'Poll status updated', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 08:46:52'),
(2463, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 08:51:00'),
(2464, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 08:51:00'),
(2465, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 08:51:01'),
(2466, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 08:51:02'),
(2467, 208, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 08:51:09'),
(2468, 208, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 08:51:09'),
(2469, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 09:00:29'),
(2470, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 09:00:29'),
(2471, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 09:02:45'),
(2472, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 09:02:45'),
(2473, 0, 'admin', 'CREATE_ADMIN', 'Created admin: admin@voting.edu', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 09:06:07'),
(2474, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 09:18:37'),
(2475, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 09:18:37'),
(2476, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 09:53:08'),
(2477, 0, 'admin', 'FINISH_POLL', 'Poll finished: SSCC (222222) with 2 candidates and 2 votes from blockchain_votes_sql_candidates', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 09:53:08'),
(2478, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 09:53:09'),
(2479, 0, 'admin', 'RESET_BLOCKCHAIN_FAILED', 'Reset failed: memoryCleared is not defined', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 09:53:12'),
(2480, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 09:56:11'),
(2481, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 09:56:11'),
(2482, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:15:52'),
(2483, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:15:52'),
(2484, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 2 voters', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:16:03'),
(2485, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 10:16:24'),
(2486, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 10:16:24'),
(2487, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Jomar Palarao', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 10:16:43'),
(2488, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0005', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 10:17:47'),
(2489, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Jaylou Terante', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 10:18:32'),
(2490, 0, 'admin', 'DELETE_POSITION', 'Permanently deleted position ID: 14', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 10:19:51'),
(2491, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 10:20:05'),
(2492, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 10:20:06'),
(2493, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 10:20:20'),
(2494, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 10:20:20'),
(2495, 204, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 10:21:02'),
(2496, 204, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-01 10:21:02'),
(2497, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:51:21'),
(2498, 0, 'admin', 'FINISH_POLL', 'Poll finished: SES (23441) with 4 candidates and 0 votes from blockchain_votes_sql_candidates', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:51:21'),
(2499, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:51:22'),
(2500, 0, 'admin', 'RESET_BLOCKCHAIN_FAILED', 'Reset failed: memoryCleared is not defined', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:51:25'),
(2501, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 0 voters', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:51:49'),
(2502, 0, 'admin', 'CREATE_ADMIN', 'Created admin: admin2@voting.edu', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:52:55'),
(2503, 0, 'admin', 'CREATE_POSITION', 'Created position: Senator', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:53:08'),
(2504, 0, 'admin', 'UPDATE_POSITION', 'Updated position ID: 13', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:53:16'),
(2505, 0, 'admin', 'UPDATE_POSITION', 'Updated position ID: 13', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:53:26'),
(2506, 0, 'admin', 'UPDATE_POSITION', 'Updated position ID: 15', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:53:32'),
(2507, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:56:31'),
(2508, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:56:31'),
(2509, 204, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:57:52'),
(2510, 204, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:57:52'),
(2511, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x8fe1ad31e534f8534c29bf8f3fbbac09f67ff225ebbb18f220a7e878b8a89c62 (Node: node1) - Empty positions: 1', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:59:46'),
(2512, 204, 'voter', 'MARK_VOTED', 'Voter 20-0001 marked as voted with ballot vote_ml3moiw5_01rj29vh7ljf_lyr154zqp4_uyx2', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:59:46'),
(2513, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:59:53'),
(2514, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:59:53'),
(2515, 0, 'admin', 'PAUSE_POLL', 'Poll paused by super admin', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:59:55'),
(2516, 0, 'admin', 'PAUSE_POLL', 'Poll status updated', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 10:59:55'),
(2517, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 11:01:30'),
(2518, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 11:01:30'),
(2519, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 11:01:39'),
(2520, 0, 'admin', 'FINISH_POLL', 'Poll finished: SSSS (2341) with 4 candidates and 2 votes from blockchain_votes_sql_candidates', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 11:01:39'),
(2521, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 11:01:39'),
(2522, 0, 'admin', 'RESET_BLOCKCHAIN_FAILED', 'Reset failed: memoryCleared is not defined', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 11:01:42'),
(2523, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 11:04:12'),
(2524, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 11:04:12'),
(2525, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 81', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 11:04:20'),
(2526, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Alyanna Marie Espoltero', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 11:05:14'),
(2527, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 13:49:02'),
(2528, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 13:49:02'),
(2529, 0, 'admin', 'CREATE_ADMIN', 'Created admin: admin3@voting.edu', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 13:49:47'),
(2530, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0006', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 13:50:24'),
(2531, 0, 'admin', 'UPDATE_VOTER', 'Updated voter ID: 210 (Active: 1)', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 13:50:51'),
(2532, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0007', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 13:51:58'),
(2533, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0009', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 13:54:36'),
(2534, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0010', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 13:56:01'),
(2535, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0011', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 13:57:09'),
(2536, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0012', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 13:59:05'),
(2537, 0, 'admin', 'DEACTIVATE_VOTER', 'deactivated voter ID: 218', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 13:59:18'),
(2538, 0, 'admin', 'ACTIVATE_VOTER', 'activated voter ID: 218', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 13:59:20'),
(2539, 0, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 218', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 13:59:26'),
(2540, 0, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 214', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:02:20'),
(2541, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0011', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:02:33'),
(2542, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:03:21'),
(2543, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:03:21'),
(2544, 0, 'admin', 'CREATE_ADMIN', 'Created admin: admin4@voting.edu', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:03:52'),
(2545, 0, 'admin', 'DELETE_POSITION', 'Permanently deleted position ID: 15', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:04:04'),
(2546, 0, 'admin', 'CREATE_POSITION', 'Created position: Senator', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:04:19'),
(2547, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Jose Rizal', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:05:29'),
(2548, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 1 voters', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:06:08'),
(2549, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2023-023', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:06:41'),
(2550, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2021-203', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:06:42'),
(2551, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2024-021', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:06:42'),
(2552, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2025-1234', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:06:42'),
(2553, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0012', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:07:19'),
(2554, 0, 'admin', 'DEACTIVATE_VOTER', 'deactivated voter ID: 224', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:07:34'),
(2555, 0, 'admin', 'ACTIVATE_VOTER', 'activated voter ID: 224', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:07:41'),
(2556, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Ferdinand Marcos', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:09:01'),
(2557, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Juan Dela Cruz', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:09:21'),
(2558, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Joshua Tan', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:09:51'),
(2559, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Earl Espina', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:10:16'),
(2560, 0, 'admin', 'UPDATE_POSITION', 'Updated position ID: 16', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:10:25'),
(2561, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:11:21'),
(2562, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:11:21'),
(2563, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:11:34'),
(2564, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:11:34'),
(2565, 210, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:12:07'),
(2566, 210, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:12:07'),
(2567, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x47f943748860587b9c8f7eec51728403cae7e6cbc9f43d36c29667200571c2da (Node: node1) - Empty positions: 0', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:12:53'),
(2568, 210, 'voter', 'MARK_VOTED', 'Voter 20-0006 marked as voted with ballot vote_ml3tlqke_qrdvh5hqexs_icglmzluwel_n5dq', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:12:53'),
(2569, 208, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:13:52'),
(2570, 208, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:13:52'),
(2571, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x5826c9bbb42a98bc07dead93cfb08c38531fb90590bb13f9559348ecebd484e4 (Node: node1) - Empty positions: 1', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:14:01'),
(2572, 208, 'voter', 'MARK_VOTED', 'Voter 20-0004 marked as voted with ballot vote_ml3tndh3_ko562d22vj_82yxg88zvcq_b5sa', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:14:01'),
(2573, 206, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:18:17'),
(2574, 206, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:18:18'),
(2575, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0xd947edef36c70e19fe6e9f761e289cc237d6572cef5494362f18bf837f918df0 (Node: node1) - Empty positions: 0', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:18:33'),
(2576, 206, 'voter', 'MARK_VOTED', 'Voter 20-0002 marked as voted with ballot vote_ml3tt8fo_r3rfmdlt9ps_hnatb3k41lp_alyj', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:18:33'),
(2577, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: Superadmin@voting.edu', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:20:02'),
(2578, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:20:11'),
(2579, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:20:11'),
(2580, 203, 'voter', 'LOGIN_FAILED', 'Invalid password', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 14:20:47'),
(2581, 203, 'voter', 'LOGIN_FAILED', 'Invalid password', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 14:20:57'),
(2582, 203, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 14:21:11'),
(2583, 203, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 14:21:12'),
(2584, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x2480c8482251195c0035374e18728be2617cfb97d797f07cf65ed672b5a2b864 (Node: node1) - Empty positions: 0', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 14:22:32'),
(2585, 203, 'voter', 'MARK_VOTED', 'Voter 20-10076 marked as voted with ballot vote_ml3ty9wv_q4iex46d1s_tm4y99w2hs_wc9u', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 14:22:32'),
(2586, 204, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 14:23:55'),
(2587, 204, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 14:23:55'),
(2588, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x694cc55af7e04fdf32788e42a33c7b215c426443dd57adbae3fc78b380e98e70 (Node: node1) - Empty positions: 0', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 14:24:03'),
(2589, 204, 'voter', 'MARK_VOTED', 'Voter 20-0001 marked as voted with ballot vote_ml3u0azt_nszulkgz3x_6kp0uvvmsnb_d6po', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-01 14:24:03'),
(2590, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:27:25'),
(2591, 0, 'admin', 'FINISH_POLL', 'Poll finished: SSC Test (2025-2026) with 9 candidates and 23 votes from blockchain_votes_sql_candidates', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:27:25'),
(2592, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:27:25'),
(2593, 0, 'admin', 'RESET_BLOCKCHAIN_FAILED', 'Reset failed: memoryCleared is not defined', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:27:27'),
(2594, 0, 'admin', 'DELETE_ELECTION', 'Deleted election record ID: 63', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:27:52'),
(2595, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 5 voters', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:28:00'),
(2596, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:30:27'),
(2597, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:30:27'),
(2598, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:31:03'),
(2599, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:31:03'),
(2600, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x432a41f195b90c893da949cb46b2d09648d3b0fb0307601b23d3b83c4f94e168 (Node: node1) - Empty positions: 1', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:32:03'),
(2601, 211, 'voter', 'MARK_VOTED', 'Voter 20-0007 marked as voted with ballot vote_ml3uabmy_aroeh38i2nc_ecckg1oevj_u8s7', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-01 14:32:03'),
(2602, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 00:23:28'),
(2603, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 00:23:28'),
(2604, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 01:00:17'),
(2605, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 01:00:17'),
(2606, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 01:40:35'),
(2607, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 01:40:35'),
(2608, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 01:40:53'),
(2609, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 01:40:53'),
(2610, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 01:42:11'),
(2611, 0, 'admin', 'FINISH_POLL', 'Poll finished: Fssc (2526) with 9 candidates and 0 votes from blockchain_votes_sql_candidates', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 01:42:12'),
(2612, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 01:42:12'),
(2613, 0, 'admin', 'RESET_BLOCKCHAIN_FAILED', 'Reset failed: memoryCleared is not defined', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 01:42:14'),
(2614, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 1 voters', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 01:45:46'),
(2615, 0, 'admin', 'UPDATE_ADMIN', 'Updated admin ID: 14', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 01:49:44'),
(2616, 0, 'admin', 'UPDATE_CANDIDATE', 'Updated candidate ID: 86', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 01:50:05'),
(2617, 0, 'admin', 'UPDATE_ADMIN', 'Updated admin ID: 14', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 02:00:37'),
(2618, 0, 'admin', 'UPDATE_ADMIN', 'Updated admin ID: 14', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 02:00:44'),
(2619, 0, 'admin', 'UPDATE_VOTER', 'Updated voter ID: 220 (Active: 1)', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 02:20:42'),
(2620, 0, 'admin', 'DELETE_ELECTION', 'Deleted election record ID: 66', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 02:26:46'),
(2621, 0, 'admin', 'DEACTIVATE_VOTER', 'deactivated voter ID: 224', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 02:28:01'),
(2622, 0, 'admin', 'ACTIVATE_VOTER', 'activated voter ID: 224', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 02:28:04'),
(2623, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0015', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 02:37:08'),
(2624, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-0016', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 02:39:49'),
(2625, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-1002', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 02:44:24'),
(2626, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-1212', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 02:48:34'),
(2627, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 0 voters', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 02:48:47'),
(2628, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:02:30'),
(2629, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:02:30'),
(2630, 226, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:02:42'),
(2631, 226, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:02:42'),
(2632, 213, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:02:52'),
(2633, 213, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:02:52'),
(2634, 206, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:03:00'),
(2635, 206, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:03:00'),
(2636, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:03:07'),
(2637, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:03:07');
INSERT INTO `audit_logs` (`id`, `user_id`, `user_type`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
(2638, 213, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:05:59'),
(2639, 213, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:05:59'),
(2640, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:06:14'),
(2641, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:06:14'),
(2642, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 03:09:03'),
(2643, 0, 'admin', 'FINISH_POLL', 'Poll finished: Fg (78) with 9 candidates and 0 votes from blockchain_votes_sql_candidates', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 03:09:04'),
(2644, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 03:09:04'),
(2645, 0, 'admin', 'RESET_BLOCKCHAIN_FAILED', 'Reset failed: memoryCleared is not defined', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 03:09:07'),
(2646, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: admin1@voting.edu', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:10:18'),
(2647, 11, 'admin', 'LOGIN_FAILED', 'Invalid password', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:10:26'),
(2648, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:11:02'),
(2649, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:11:02'),
(2650, 0, 'admin', 'UPDATE_ADMIN', 'Updated admin ID: 11', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:11:26'),
(2651, 11, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:11:38'),
(2652, 11, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:11:38'),
(2653, 11, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:11:52'),
(2654, 11, 'admin', 'LOGIN_SUCCESS', 'Admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 03:11:52'),
(2655, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 03:13:18'),
(2656, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 03:13:18'),
(2657, 0, 'admin', 'DELETE_ELECTION', 'Deleted election record ID: 67', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 03:13:24'),
(2658, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 06:04:15'),
(2659, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 06:04:22'),
(2660, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 06:04:26'),
(2661, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 06:04:26'),
(2662, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 06:04:28'),
(2663, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 06:04:28'),
(2664, 213, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:05:48'),
(2665, 213, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:05:48'),
(2666, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0xb2a805066bb060ea310e875d5cec3899b173ffc1865cd264776ecfa3465d5e99 (Node: node1) - Empty positions: 0', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:06:03'),
(2667, 213, 'voter', 'MARK_VOTED', 'Voter 20-0010 marked as voted with ballot vote_ml6738wg_df0jx36gc09_e80c8d2sv6_vz31', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:06:03'),
(2668, 226, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:13:08'),
(2669, 226, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:13:08'),
(2670, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x9c82101422dd482a167a643d9586c426f627328f47319c02b6e88392bdbc775e (Node: node1) - Empty positions: 0', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:13:29'),
(2671, 226, 'voter', 'MARK_VOTED', 'Voter 20-0015 marked as voted with ballot vote_ml67cnkd_n8ap3wjdmlq_ev1q27pe8x_4wxa', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:13:29'),
(2672, 206, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:14:59'),
(2673, 206, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:14:59'),
(2674, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x743c4670bcc87d33b734f83e9525247099e8a2aaa0443dae6395d215e50775c7 (Node: node1) - Empty positions: 0', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:15:09'),
(2675, 206, 'voter', 'MARK_VOTED', 'Voter 20-0002 marked as voted with ballot vote_ml67ezy6_55hedpr8dev_5sezee24dze_3jbc', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:15:09'),
(2676, 229, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:17:45'),
(2677, 229, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:17:45'),
(2678, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0xd23bcb511fe398b4e349518cae0eb6945f16ee1453ad241600c1ca521ecb05dd (Node: node1) - Empty positions: 0', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:17:55'),
(2679, 229, 'voter', 'MARK_VOTED', 'Voter 20-1002 marked as voted with ballot vote_ml67ijzn_atcvk9qxp4n_0qsoaie4fyg_m14q', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:17:55'),
(2680, 203, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:22:54'),
(2681, 203, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:22:54'),
(2682, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x51181340c9d8b7fc28d42ad1f43d16f5c82f0f4812e64d483ead5b3c61431b24 (Node: node1) - Empty positions: 0', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:23:04'),
(2683, 203, 'voter', 'MARK_VOTED', 'Voter 20-10076 marked as voted with ballot vote_ml67p6s2_phmve73xol_p76twrr9gq_9ecd', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:23:05'),
(2684, 219, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:25:52'),
(2685, 219, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:25:53'),
(2686, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x01c6bef1433bd9f178ea37db12c3fca0a204a3a6d10f27c35566be296a8f9437 (Node: node1) - Empty positions: 0', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:26:04'),
(2687, 219, 'voter', 'MARK_VOTED', 'Voter 20-0011 marked as voted with ballot vote_ml67t1pi_v59wyojrgi_805rs9yvf3a_3bsm', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:26:04'),
(2688, 230, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:34:10'),
(2689, 230, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:34:10'),
(2690, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x16c8aa8d538f6ea7bb0f0a1362bbc17692dd054113b9623dcefc889dfd86314e (Node: node1) - Empty positions: 0', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:34:23'),
(2691, 230, 'voter', 'MARK_VOTED', 'Voter 20-1212 marked as voted with ballot vote_ml683pz4_bu7y8o0f15p_2gtvkphfils_8dsg', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:34:23'),
(2692, 220, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:37:03'),
(2693, 220, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:37:03'),
(2694, 2023, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0xcad99bbbce6a0beace61871b38add21a8c54fc9b8123c1195c9324e0975314dd (Node: node1) - Empty positions: 0', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:37:15'),
(2695, 220, 'voter', 'MARK_VOTED', 'Voter 2023-023 marked as voted with ballot vote_ml687f1e_im55yz1xxu_3vvuu6d67lt_xo57', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:37:15'),
(2696, 223, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:39:52'),
(2697, 223, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:39:53'),
(2698, 2025, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0xfa61944972aa660809956adf7427319d1e617db7661f3da69ce8e691c3802f34 (Node: node1) - Empty positions: 0', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:40:03'),
(2699, 223, 'voter', 'MARK_VOTED', 'Voter 2025-1234 marked as voted with ballot vote_ml68b0vq_7poryuuo7e_j8jotdcd6er_yflb', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:40:03'),
(2700, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: 73738', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:41:21'),
(2701, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: 638376', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:41:26'),
(2702, 221, 'voter', 'LOGIN_FAILED', 'Invalid password', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:41:48'),
(2703, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: Yuu', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 06:42:44'),
(2704, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: wqeqw@voting.edu', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 06:43:45'),
(2705, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 06:43:58'),
(2706, 11, 'admin', 'LOGIN_FAILED', 'Invalid password', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-03 06:44:16'),
(2707, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 07:10:32'),
(2708, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 07:10:32'),
(2709, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 07:12:31'),
(2710, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 07:12:31'),
(2711, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 07:12:47'),
(2712, 0, 'admin', 'FINISH_POLL', 'Poll finished: TESTING (2526) with 9 candidates and 45 votes from blockchain_votes_sql_candidates', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 07:12:47'),
(2713, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 07:12:47'),
(2714, 0, 'admin', 'RESET_BLOCKCHAIN_FAILED', 'Reset failed: memoryCleared is not defined', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 07:12:50'),
(2715, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 9 voters', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 07:13:24'),
(2716, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 0 voters', '192.168.1.10', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-03 07:13:35'),
(2717, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-04 01:04:36'),
(2718, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-04 01:04:36'),
(2719, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 0 voters', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-04 01:04:40'),
(2720, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-04 01:16:35'),
(2721, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.4', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-04 01:16:35'),
(2722, 213, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-04 01:17:15'),
(2723, 213, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-04 01:17:16'),
(2724, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x597423cd1fc2515ca03b43e409301ebb3aa4c5337e90af8d4a0a149dd040262c (Node: node1) - Empty positions: 0', '192.168.1.5', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-04 01:17:27'),
(2725, 213, 'voter', 'MARK_VOTED', 'Voter 20-0010 marked as voted with ballot vote_ml7c864d_knp13wyi5t_xpxvybc7c8l_7jy2', '192.168.1.5', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', '2026-02-04 01:17:27'),
(2726, 213, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:33:02'),
(2727, 213, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:33:03'),
(2728, 226, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:33:20'),
(2729, 226, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:33:20'),
(2730, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x6361318af294591f4279776333675b28830361379001d23b77f1e62c04acfcda (Node: node1) - Empty positions: 0', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:33:28'),
(2731, 226, 'voter', 'MARK_VOTED', 'Voter 20-0015 marked as voted with ballot vote_mlabywkh_1jawtkxd52t_o8ytrnpnhb_kmw7', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:33:28'),
(2732, 229, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:36:13'),
(2733, 229, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:36:13'),
(2734, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0xe89dbc0b21369b3a185e7372d2f7c95ca23a268d4fd4e2ad4bf525022971fda6 (Node: node1) - Empty positions: 0', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:36:22'),
(2735, 229, 'voter', 'MARK_VOTED', 'Voter 20-1002 marked as voted with ballot vote_mlac2n1z_7sfllx1se1a_8wd9hzdvst4_zdef', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:36:22'),
(2736, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:36:34'),
(2737, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:36:34'),
(2738, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:36:53'),
(2739, 0, 'admin', 'FINISH_POLL', 'Poll finished: SSCC (2345) with 9 candidates and 5 votes from blockchain_votes_sql_candidates', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:36:53'),
(2740, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:36:53'),
(2741, 0, 'admin', 'RESET_BLOCKCHAIN_FAILED', 'Reset failed: memoryCleared is not defined', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:36:56'),
(2742, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 3 voters', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:37:02'),
(2743, 0, 'admin', 'CREATE_POSITION', 'Created position: IT Representative', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:50:54'),
(2744, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Francis Smith', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:51:19'),
(2745, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Charles Smith', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:51:40'),
(2746, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:51:47'),
(2747, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 03:51:47'),
(2748, 210, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 03:52:28'),
(2749, 210, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 03:52:28'),
(2750, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:00:22'),
(2751, 0, 'admin', 'FINISH_POLL', 'Poll finished: SSSS (2333) with 11 candidates and 0 votes from blockchain_votes_sql_candidates', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:00:22'),
(2752, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:00:22'),
(2753, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:00:23'),
(2754, 0, 'admin', 'RESET_BLOCKCHAIN_FAILED', 'Reset failed: memoryCleared is not defined', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:00:25'),
(2755, 0, 'admin', 'UPDATE_POSITION', 'Updated position ID: 17', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:00:42'),
(2756, 0, 'admin', 'UPDATE_POSITION', 'Updated position ID: 17', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:05:17'),
(2757, 0, 'admin', 'UPDATE_POSITION', 'Updated position ID: 17', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:05:58'),
(2758, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 92', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:06:21'),
(2759, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 91', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:06:23'),
(2760, 0, 'admin', 'DELETE_POSITION', 'Permanently deleted position ID: 17', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:06:24'),
(2761, 0, 'admin', 'CREATE_POSITION', 'Created position: IT Reps', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:06:42'),
(2762, 0, 'admin', 'UPDATE_POSITION', 'Updated position ID: 18', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:09:16'),
(2763, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Francis Smith', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:09:34'),
(2764, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Charles Smith', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:09:42'),
(2765, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:09:49'),
(2766, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 04:09:49'),
(2767, 210, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 04:10:13'),
(2768, 210, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 04:10:13'),
(2769, 210, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 04:18:48'),
(2770, 210, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 04:18:48'),
(2771, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:09:17'),
(2772, 0, 'admin', 'FINISH_POLL', 'Poll finished: ssssss (2333) with 11 candidates and 0 votes from blockchain_votes_sql_candidates', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:09:17'),
(2773, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:09:17'),
(2774, 0, 'admin', 'RESET_BLOCKCHAIN_FAILED', 'Reset failed: memoryCleared is not defined', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:09:20'),
(2775, 0, 'admin', 'UPDATE_POSITION', 'Updated position ID: 18', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:09:34'),
(2776, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:09:43'),
(2777, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:09:43'),
(2778, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:10:01'),
(2779, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:10:01'),
(2780, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:17:53'),
(2781, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:17:53'),
(2782, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:19:39'),
(2783, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:19:39'),
(2784, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:20:06'),
(2785, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:20:06'),
(2786, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:40:21'),
(2787, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:40:21'),
(2788, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:43:25'),
(2789, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:43:25'),
(2790, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:46:53'),
(2791, 0, 'admin', 'FINISH_POLL', 'Poll finished: eeee (231) with 11 candidates and 0 votes from blockchain_votes_sql_candidates', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:46:54'),
(2792, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:46:54'),
(2793, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:46:54'),
(2794, 0, 'admin', 'RESET_BLOCKCHAIN_FAILED', 'Reset failed: memoryCleared is not defined', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:46:56'),
(2795, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 94', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:57:30'),
(2796, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 93', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:57:32'),
(2797, 0, 'admin', 'DELETE_POSITION', 'Permanently deleted position ID: 18', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:57:33'),
(2798, 0, 'admin', 'CREATE_POSITION', 'Created position: IT Representative', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:57:50'),
(2799, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Francis Smith', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:57:59'),
(2800, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Charles Smith', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:58:08'),
(2801, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:58:15'),
(2802, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 05:58:15'),
(2803, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:58:30'),
(2804, 211, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:58:30'),
(2805, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x327b936d9a286c90c20fd6865319534323894429b1a65e41b1c247d14429d2cf (Node: node1) - Empty positions: 0', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:58:46'),
(2806, 211, 'voter', 'MARK_VOTED', 'Voter 20-0007 marked as voted with ballot vote_mlah5rb8_x0kv82v5jod_p8cfofgttka_r5oq', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:58:46'),
(2807, 226, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:59:01'),
(2808, 226, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:59:01'),
(2809, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0xeaa4eacd87690bfef6eac8e5fee1f4c5b0701b1cb5712b92832f0c8e60921a7e (Node: node1) - Empty positions: 0', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:59:16'),
(2810, 226, 'voter', 'MARK_VOTED', 'Voter 20-0015 marked as voted with ballot vote_mlah6dw7_teg6zeaaljf_k1hhx4b2idk_i2of', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:59:16'),
(2811, 224, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:59:25'),
(2812, 224, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:59:25'),
(2813, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x9e7dad0e96a4c207f6e77b101a2f36d58fbc0a495c20d31e5228fed1a1a12f02 (Node: node1) - Empty positions: 0', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:59:32'),
(2814, 224, 'voter', 'MARK_VOTED', 'Voter 20-0012 marked as voted with ballot vote_mlah6rkl_8pvoizszzv4_oigol405wqq_sj7w', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:59:32'),
(2815, 208, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:59:50'),
(2816, 208, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:59:50'),
(2817, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0xd54d6af01181022e7a060053f2ed3e0d364282e885d2c8cc36836ddeecfdeba6 (Node: node1) - Empty positions: 0', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:59:58'),
(2818, 208, 'voter', 'MARK_VOTED', 'Voter 20-0004 marked as voted with ballot vote_mlah7b8y_h3eq501w6e_mzk7vw4p5ai_z94b', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 05:59:58'),
(2819, 213, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 06:00:37'),
(2820, 213, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 06:00:37'),
(2821, 20, 'voter', 'BLOCKCHAIN_VOTE_CAST', 'Vote cast in blockchain storage. TX: 0x0887fab63dea321623386a0655b0af338eea21f62516a498a742653582d0334b (Node: node1) - Empty positions: 0', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 06:00:49'),
(2822, 213, 'voter', 'MARK_VOTED', 'Voter 20-0010 marked as voted with ballot vote_mlah8dh5_j1ockaolvm_5588oz83bht_4yei', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 06:00:49'),
(2823, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 06:01:14'),
(2824, 0, 'admin', 'FINISH_POLL', 'Poll finished: Test (02062025) with 11 candidates and 27 votes from blockchain_votes_sql_candidates', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 06:01:15'),
(2825, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 06:01:15'),
(2826, 0, 'admin', 'RESET_BLOCKCHAIN_FAILED', 'Reset failed: memoryCleared is not defined', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 06:01:17'),
(2827, 0, 'admin', 'DELETE_ELECTION', 'Deleted election record ID: 73', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 06:01:24'),
(2828, 0, 'admin', 'DELETE_ELECTION', 'Deleted election record ID: 72', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 06:01:27'),
(2829, 0, 'admin', 'DELETE_ELECTION', 'Deleted election record ID: 70', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 06:01:29'),
(2830, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 5 voters', '192.168.1.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-06 06:01:43');

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
(82, 'John Paul Gazo', 'Makabansa', 'Vice - President', 'candidate-1769924621805-729189902.jpg', '/uploads/candidates/candidate-1769924621805-729189902.jpg', 0, '2026-02-01 05:43:41', '2026-02-01 05:43:41', 1, NULL),
(83, 'Jomar Palarao', 'Makabayan', 'Vice - President', 'candidate-1769941002713-162809065.jpg', '/uploads/candidates/candidate-1769941002713-162809065.jpg', 0, '2026-02-01 10:16:43', '2026-02-01 10:16:43', 1, NULL),
(84, 'Jaylou Terante', 'Makabayan', 'President', 'candidate-1769941112741-983771333.jpg', '/uploads/candidates/candidate-1769941112741-983771333.jpg', 0, '2026-02-01 10:18:32', '2026-02-01 10:18:32', 1, NULL),
(85, 'Alyanna Marie Espoltero', 'Makabayan', 'President', 'candidate-1769943914573-195063051.jpg', '/uploads/candidates/candidate-1769943914573-195063051.jpg', 0, '2026-02-01 11:05:14', '2026-02-01 11:05:14', 1, NULL),
(86, 'Jose Rizal', 'Makabansa', 'Senator', 'candidate-1769954729315-28270629.jpg', '/uploads/candidates/candidate-1769954729315-28270629.jpg', 0, '2026-02-01 14:05:29', '2026-02-01 14:05:29', 1, NULL),
(87, 'Ferdinand Marcos', 'Makabayan', 'Senator', 'candidate-1769954941799-599182056.webp', '/uploads/candidates/candidate-1769954941799-599182056.webp', 0, '2026-02-01 14:09:01', '2026-02-01 14:09:01', 1, NULL),
(88, 'Juan Dela Cruz', 'Makabayan', 'Senator', 'candidate-1769954961728-667406226.jpg', '/uploads/candidates/candidate-1769954961728-667406226.jpg', 0, '2026-02-01 14:09:21', '2026-02-01 14:09:21', 1, NULL),
(89, 'Joshua Tan', 'Makabansa', 'Senator', 'candidate-1769954991494-253033692.webp', '/uploads/candidates/candidate-1769954991494-253033692.webp', 0, '2026-02-01 14:09:51', '2026-02-01 14:09:51', 1, NULL),
(90, 'Earl Espina', 'Makabayan', 'Senator', 'candidate-1769955016326-223861793.jpg', '/uploads/candidates/candidate-1769955016326-223861793.jpg', 0, '2026-02-01 14:10:16', '2026-02-01 14:10:16', 1, NULL),
(95, 'Francis Smith', 'as', 'IT Representative', NULL, NULL, 0, '2026-02-06 05:57:59', '2026-02-06 05:57:59', 1, NULL),
(96, 'Charles Smith', 'eee', 'IT Representative', NULL, NULL, 0, '2026-02-06 05:58:08', '2026-02-06 05:58:08', 1, NULL);

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
(21, ' Bachelor of Science in Criminology', 'BS Criminology', 1, '2025-12-09 03:12:14', '2025-12-09 03:12:14'),
(22, 'Nursing', 'NS', 1, '2026-02-01 14:05:50', '2026-02-01 14:05:50');

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
(62, 'SSCC', '2026-02-01', '222222', '2026-02-01 09:53:08', 2, 2, 'eb5be37c64ebda0e778a519c617a182e6988a627336c758019f513423da696ad', '{\"iv\":\"6b5f5fa9a0f7231acd5660bd9d285545\",\"data\":\"8b83db6814e8af07194bcd428d0786247653a15ed68108e9891d5222bca32073391023d942f7e87f76835def8b03cabdaa17280951419cd24146f13044f327f0b4d78caec1a225cb52565b03d6dc5e6819d5b7bdf3ee0dd51c20c3b737577e3a4dbf5ae661a573f09eb827b1d0ca9b0ab715f824688183517c59cbaeff77815cd40d437e5d600a03548754d4f94581820c57a41b3d7c697ce6ab31ca8e505f27ba855f9923781f9d486c80bfea7a8199452a9f2a7d7ed704d7e1a5092a448944f4e1c5276aa49f9ccfe39b6d5911638d9b4292623b8feec49fcb15992b7e24e95550a278f3367790afe95a1e30bd9138e12e20f76de12665d4d028d91abe358e6a32932efcc09b390572feb88cf4825e0ed6f6ca68354a13bbcca1c329158e47acea685a3d2a570b7dc16fbc251f17d0e0296e10c184b4733c28bcb637004e62b04db6cd10fd13f556e94a3a38245d10001954e14b10cf5f042595b4d60bb39128997b132e64663b81115bde2e07f226f6b224074b8762e08a21a1f90e745c105f3a0eef8c313fb1e35590464c1fa036928fee392494ad4de6387f91dba9b561e4cfd9240f3b1c7e94b9ce84ed387886b8cd75b66119ae00dc38cc4593af7c89d31a732d0c1b084a6422199adb115a648dd2139f9417c649b5bb5cec394d04d500d7ba6f0eb032e44b13f878a366ff9277372a190b42468e222a21fbe81ad29cfb8babf6b16309ca7e2b30d2c069a533762d75bc92df8a7c31e2fde979656f59993effe6d8e1874226577531bedf19ee589d6a035d5a740fd72d133da9601276be6baa9bccc717ad3bf3742b2a9592f066cb6a9b857af89451fba18cd6a1c8c36c1e0d71d5271661412d21319d74f5b6ecbae3b8530b37ebdc04d6c7f318cdbedae9138fa12dc5025c246eae4d9c14127590293413d7a3d9106da5129d7347820d34e4ce6ab509bf21dd6fb76510790242afa477ebbb3942cb5e764966625ec81fb2e3ab8cbdf5d9caf8bfd4870fbd9b010a66b98a190cae285361ae420ad28df96cf66ac972ac67d38ffe93631c06f3\"}', '2026-02-01 09:53:08', '2026-02-01 09:53:08'),
(64, 'SSSS', '2026-03-03', '2341', '2026-02-01 11:01:39', 4, 2, '1f5717dd620131ea4c0f59baf5ce12cb684d816c351a2f9b6166e21582abe33c', '{\"iv\":\"8282e7b9db96a48d47ab4999b85ebd8b\",\"data\":\"943ae6c5a3ca5631c31884c7fed0bff01f76ba02b4c60d90831712f5d77b3192a31d18c0cdca84bd6a75efd09b43dd6295c7317336f4419c505f6704b661c5ae211c6d444361335811bdb3e23800ed44ae4e386839ec64a062ec3ed213a7e7f3c6d69d5dc0b713d1c9575f0f973fbe839b674561e4522f1bccd7be12216fa596b076837a1eb2f9cbcd2923c6f57318e5cd4a772039a44b79a14e1274b5ff48d0303c551db4c739724eb8e6d397b2d1941033eee5b571c60c573cef925600d5d3edaf337ed58ce0faf58d165320d9db02065c38b0a839bde7b98a391cdab2127a7760ab5a3bc3c301a2a3038ebd641de9b09fb74a6011473915953cd3bc9b7dd9d1b4d20fba5dbc6582d594d740c3fdcb5018031293178394aa9049f845307bc53f197a6035645fb7f3ca4862bfb33b9896b958a04f523d7395bd03f24eaf0844e7e6998e48e802f2ceeeb86d0b99d8f5e26ac05603f10a8e1aaa93c69dc2adf7ec05f386f2dfac368a34ee4580e8d3028af33dbed5279cfb0d4a772d63bea387aeefe1ca4bb3a2ce196001a76b0e30ef7d9ad11f8914af367e1fbb06329734f9108668cc4779506a8d9f45a8cafe7a60c049c17e972529d61dcc1ff4754bc3f076486bddf12755715f5ff1e4ea6a29523e1640da2b1352177219cb662c61ccdeecb43a30b13044a5c4fd62ffe8055bad3517ad9151abc0056e68a5eb542feaf7d3fabeffd6e761290cd6812ae7e3d44081d137f8fa83ad92596f86f0c314bffadb9bbdcfae781338353001e1e7487d0ab22036daf630ea50064edf6d74bcb01e7f38b0a653afa039b7c840b266178f44b2d19ec955931ca379af7cd2efbdfb03dc3f165981bd4274ff64aee92442b803f1bdc27023388eb67d72d1737e5e359c737a532c3bdb21fe823cbdf71b81adc023d4600f591c9d00a93c8bf936182da3aa8ac431693a9fc49908951c1d202fd25e09b188ce7fa1e7c2ca529aea15cf99fdb24ce4ac5c15d6197c8524ac8b01ef2d9a29e98881d11db554754e4d522ca4aa51e6901078032095f39d792940789c0c7cedc7e7d85df1bbcdecc280733659578b487f118ceb32887c5a591567ac6beda322a7fcf31b1a0a61fc63c82f4e9608ddf00442955a1e24ce51cbdba0e7f27f3a3086e5ae1f9eb1bf8754909fa67a98dd04bd695be30af64bd5d138ce96e9d275b297b7f1829a89820c23e9ca08850b54c5512b7422f5059ab73e7d1745d3a52ee0d167caa40fc68ef74c3ac4fd595b9ebcfaff6a66fc223c441e0bc580f2a50ca47d4ba3c844a9cdcc20e9885d7981d20de915b05eb84f3c8d283ed5a30dc2a247483cf64f1b3f9928065bbcd9b46c7da0378cf08d3154339fd83946a8418be0357989e0592757ac593d8b63b8b517cdf6be1dd50f07aa40044e0a9a5e33c8ce52a1c1a9670e8acbb0e3838badefbca6054dbfd2eddc5ad7721d77f9a3ed6b983726a76568951f6e6e329059de985ac2ad4e93f28747dddea8f5f75da0c7de4856b88452caf8c09ece79eccf3dbb56c026af7ddf5ef08cd6629d9b670b4cbee9d5cc2bd52d3366af9b62cd10ddca\"}', '2026-02-01 11:01:39', '2026-02-01 11:01:39'),
(65, 'SSC Test', '2026-02-01', '2025-2026', '2026-02-01 14:27:25', 9, 23, '57c62bbf5c43aee19b56909deacf7a5b00d6123a8d3355260cb0246009258861', '{\"iv\":\"4dd2a1c5a1a55e07801af17709811cde\",\"data\":\"c4af6ab9756d081bfefd6618f37470b00e5301272b1e1b621b3548dd3e41603f2622b44c29687df3b0382d21719bcdfe9cf76b03f664ec2408c855abdb1c022a46b2c99025773b7fabf8bae4fb1a428dc21eaa160b3d85e7b8b5cfedc9616ec0dac5dc0e447ec54e9770878f2a548336cc6ef9fbcbe81fe24b4b271a0fce189c26fc91ee92c6615091ef6719ab2bb518fdd9bb509a1e5a3c2e6b180a448c1d82d4d346bbc552b381f0c124da8890993fbdafc0daa41ec2fb0533c65545f18625426bbee43cbe351547897287c0891afd7c0341be8b00a7e3745bfd2b50593666ac449a6e399ef88991e190ff421730146267d3e63bbcc30c28bb4abb4a5244ef38864d158a311ff11848f440c3d0184d884358441bc087b3ce6aaea0742d2096851169cb01b8199608d32f4ab9d97191b83f57c07b2ab013e1749f25ccc05307ac7686e58abb5b346f1699d678572a84a5e38da7c0d52d2617b2c9ec3cc11b307c39894b67bd1ffd58e102760d1b7d6c18972e39163c5d6df2fb977ac03a6e13d6638d0e81b2374026cb83a8c342b11004f44e8514406433f1ebf70960dd44cce9c2c0c54071bb85fec6ce38d932e5dc90f39ac0d2a3dcce0f58a6ada1876d36241fc18ffa500f632bde9fa42a0cb46061941af5e6a9d494238394fdeb37d7c37e5805bf6b6e0f1fb9c3f9970cb4990fbd02150c867a2cb2032c92d75736ce70c1dfe3e79ea6a9b6892ac605c0cf7236592507ab43b865fbfab8e45379303271fac3b6af9e6d04972e0da79d432d399c9b768364d97af047e02c0c87be0b3171f62e14ed523b1e5542ba652f8ea17df100bad1b5569b345bbdda52490e71f60c43a975c7b2bb1c65f310754451f064ec9c65f3c7e4fe746f3dc899e1098f92dedca90dac5aebd7415ecb72bed6b2d16716219e02897aa078031cc60194859c7cc8183a5b6998d5d0aa0423946430df05f49c852c24c017da3cd5a51d5fd84105a6e7b0acbd137786555537e77a0e408b075983232fa952a20557075e9a13b00be2f3e401989ebf499e4cf629553fd65edb9165aafab29de6d34950df6c4bbd0dc2169ce5e13ea826e21029b83ebcf147cb3f9a01b93522f5344125b631ae03b9a06100d6270353ea69e36e7c8a9e2e5eb04b99ac6e2e2acfb5bdc6a6e2df900ad3ee838719012c6d9cda523a7018cc1b7e21256917b02063c3336a2579e9772167b847011ed9b280221ada1bc8ac71d82b2143ca4bce0dfe62e3f7b9693972e7eb2b055e48c2d978a6292dd1d4148ede01ce6dcab0b817f9f82ec43987b69f86b13ee9c696f6181a9750c30e57832606b2ec475448e2b41a21b9acc2fbe3de2cdc7f465ba28a58ea938964d97e56b207db537c72f1dedcb13819610dfe7a520ab9f542af4f07f5deb0e3eb346f6bb686053e999a4acd96f2111b3907962c5e07c3a822d23c51a968ff9a75fae9cd3965858d77c77a236702669aef2df5eed3a4613d14693298afbc85d778c314ef8af9fe3e1d2b114193a4b1da2d551ec3c53e4bfec610c4e1e13dd4cbbc29c94b57cc5b8f9d7ed478e1be3d565101859f0fda782b15c172ccd6653faad93c879aa6eafb2ad993fd9398d236374d27ee8c6e6a633419d692e952c624c7c06a8e7742d10d84e1d0cf3f674149e93ad05535e88d561d85033f32bd88c14d1f165b8cb79c7922304a8f598f5160fa4ac55a5ddf49cc317003d3b8594b309a4ca938cc5e14c3c095029b46315fba4af259fe2b42b666d6baa179988051015cd3e21c49fb393bd0458ad622390eee7418f2ecfe50f69026066724f1744d59edeabd6f2b5d0d1445437909dafd1a8b1eabac7609a52d39302187a1faa44b99715926a62937799a9927e6efdf0db60859c18f98db2555501f2c985d336059c11cd6d3da1889e0ae7ad99b125a9d12c1d9f81a6efd376ed069147d4bfe229f010ad9d8406d9775a0300382552254c4c2c6d38a7ad37ad73cd7d004187a40c45377f1afad89cdd2a9661c0fbd39e6a3a103e4f00eadce61ba52123e52787a3567c04ab402d7f47dfde6155ac3ee7a2c42b5b5ec77e0ade8b4f9e7f00baccc5251ee80904102a320b0525d6f550ec0c63eb7faa7f3042c5498230080fff564f0189c53f6f67c4506e066890b2c1682e019ba746a12fb5d6bb6ad3ec2a62da7e33340456dc0cab5b00e496ba3e4a333f04a6a97c033c35ed2bb969f7475089037e5c05409ac1d8271c664f08221c6ea20c795abfd8286a6b103571c9dfac433d897a2f22138d232f2507f70eb9bc361e3f9e6a53bdf6101ebcb4a51c2964b94f118e122c3c0511a6fc2b5a0eb454957aafe05d9588beb0ace0bc25e62576449ac9127d8d1a7f6ba38a298092cde5579d0ceeb4bcbc0e42f88df6884778efb1f010011b968a3bd1400f39474fa6099dbad1292e98666346e05cd4c46d3c2f83d681ed514d47f6d7ef6f2faf806f37965b0ace271b8a46f51984b727b3fb09cd39250acb590fc67c088798c0825f49b4c0cd5032735093eadff31e650774b308d0e2318e9a0f5c84aff1f3b87533970c351ed77f7256daedbde5805c77b0761d65dfbdba1b11368b915322f1c2110340bfc13a760d72b27c6c1b17f0d8fae46d8086829b1794cdd054dfcb10fb14b8020e30c0e9c81f51513e1dd563c2654b66431d56c19eb907b3ceaac159d71d41d976c3e08291de617c4e20595c804c62d9010df783760622c545dde4d21dcfa203f9f60efd68bc40c6356ba52379a103e4f3f6f9cfeab7cd2816e13926e5112d287844b146bdceca5746dfca58eb02d66c50cb2038efe659b06ea\"}', '2026-02-01 14:27:25', '2026-02-01 14:27:25'),
(68, 'TESTING', '2026-02-03', '2526', '2026-02-03 07:12:47', 9, 45, 'e74f8d76b653a72b46a31f2f5e76f0faa6042f1f8e566753c2a86911d17e277b', '{\"iv\":\"477c3ef208c30d5bf1e5a071dddea86b\",\"data\":\"cc73bb9ff0ad6e10cd63b0f24097ee4bac60c98c24fffd9ec2f24c550fe1dffc7e0769f3c3ee6d33835b989a3641896781ddfe3e17e28662d44060be2edc296afa2c1e80c5a5bedefd07e04be6c58970bf4b5c876e1fb15bdf388124bdd61f499c76edc4b099940cf344e8f44d4b05f71a2aeaca564dae6c8f5899df7f8edbfd08fa042f84905eede0e23d9853e18d1eb2727d2dd767a06703c1c55472144950fda1984b21b5cd981d0fa9bf51da71034bf58ad9ff6fad526ef86c59fb43d23f3fb014b945e87f68d098c3a6504f89d15e230d3442698a77d17678f8ede02ae3daf40f9dcc901e602945f252522ab95ac5bc867fe7f0e8dbc7d75e101a75d41894f45c0847b00ff03236dfb1270d9a7e78df3711adfb9cd5ab57fca3c738d144c107ec95f8f37e6e70f50940ff6a28c0ead49263878622ba6395cd4f86c379d561b485d76a75e434d820513f1f7ba2e9756be52c8c60ffff436182bc1f00fee5a88acdfae973da3974f64e7b09ac76fafa2b21886d6e3afa0de2d16f50d3a156c69e58ab9f2d4c5287c246ebb46ce0468bf6b46fcbc953bfc2b350a4c136c8186079c114a6196aedfa86e27ce7324e4cd3d3b23a66d1d74237a474786786b95f39e33bc99b550e1c950d2c6810e356b2e0cb71e0e13823cefbcf2a01ef9a3e45d9e4b060eebaa22fb6b1f5f9b4cf5afb0c60f9bf191c22dfb1628ad292e7d9b7baabab7906b359ca62dbf3f8f59242e6d16596088b4b7147b7a782b0e56f7f498e05746ddfef87f31cdeb2bd064ba092c8e826d1e1d89fcd6bd1cb37b23b199ff1cd70817d023d13d03761533faa452719964b60a45866b0c08f276b3a7d7c981e37985b4661305a0140f22a4958aba40bc8eb2e49c2d97ac83bd4585e74ed92638c1fc61bb7021efaa6622523010397d219c7fd1a4562f36798b060683579b9175032336b7a811dfcf83c3b0da7e3a928fafaf1ffbe8ee34fbfa3143123872bf44e03ac26684d577f8180f8f1f2f5856467110245e1ea187c79a9c85f2f49c047bb85ef3faf24b2127ea6116f34011f02f225111ea38c8c570689fd71fc0bcdf4adb2854e321e9499a722fe9faf6c0ef69fc3b2587c085faa3a938ad05ea171edc46a1c3e6b5c2104802b2ffe076244a95b67dfb555e446a7b6c56e404e6d79fb4622ff973133c29556e9812c76329ad8ab6a8549d3d6cde1442f29c95f694d857e5a69ec1bc8144d48ed4e545882e96f08d54fb993e7da93c95761de99870f59ac70bcc9ee671fac6094d76ac266289e3f29971b7796c3e2fd098fd36f07e1fdc3ae3beb7bb8c3d3f93d9161364e454a2456e460c24ccb2122e6bdfeac76758011c8b58c1b9357a5988c356244272fd7a964b9f582b4bc851fed7bbbc01b23c1a85b726f8bf79b258b4379b19fdfdd50240107b3d057a777e9c2c52d016daed622dc7fecba8712054fa75e856788056d40f317ab10572a97a82685a765c93e4c3fd45de7d1edf68da3d578ca4150a086c3758a2f3f019fc5365e66c9b40f386528fe80ba5bc3580d4dfb388ef4d2d25befae0e84bd63b4a5c945c5632186339a41724bdf5b3e7f5ff3164557dc505c382fc7cc89b8a7d018118c23fb2d63a841f9a2319fddc70e7eaade99fb0b26e7028d82b95d5174cdecb8dd9aafac2ece44c12f442fc397576f5b9d7600b03676692e03a1c1cd3fe7d291da7fc03b0cc522d6ed8c9e0eb9dfc75b7002c72d1e1f47e7b3880a7bc66763f3e4cbec983b322cb777022b0fb740a84016b2bc098f86ad4a4c2aa294f2fb365759f24c18ce14815a53daf3866a161462815205a2769d9aad625507f874d29bf53435a28fb4e45fda50f3e79a703c5fe2f0386bac9700019a6acc847ca2690213701e7b52187fab03c23927300c83e1d56b86568ffc1c8593f7c2db520867668ba75ef0ef3a88aad5b8c16d096b00a020cf2ecbed7256aa218e8b4212749f1c2f31b01ce6f9dfa8e24e614921ff48b5997755b465a99dc634919d4a836f898f40e3f07100b039338343d2bf9fd953356f9d1da4fd6643e110aa73cbefb74bbbe783a46010f2871de94e588a50fff3da32a3321aec6140ce4899ce958eeaf593ad8d6351635963ad4c2d4a8cec52212dfb53c994dce55ee38f6a7344f4698b021c9625c44137b3b23da59f78ad65963d43c3caf6743607aeea059de52faf240bbbb9c77ee05281d769369b4fc6f0f91849b88f556ee747f517571d38e30cdafb0c32308f316c8cfe7447992efff6c99e0fdee9126e92fac4743249126d15f383a69e1408d5d19f6a7acf1c7c0246e7a42aec6d6ec9d49511a2e739137c6962c3ccc3aaa5f09103bf646db67fc05a3778eba6e1f1a9ab438067303402ccc71f8230760721c7e842be6a4443e00677ed3e46e75437f8388b5785c11b8422cfc4ce0ae72f5ab11a087aec214a07b100128ed424624ebc64c12ecfa18a41a7e56549f0ea8499d7c4569e58e51bbf683f60d5f18343360e35bba53e1838d510d28986a19f592e09910930bd685af5795be3e890486dbdb97484fa6125a9bd16d680b3ffabb9bbef725160c590bd76a04aa684b801061a549fc20e57402c975f34b1776f6025eff8d5542325ed6e6e2970713fc3ecfdf9aa5261840a73a855c2ad5ebbbb759c7d8b4f58b4b8659edc537a481fb24ae3f71eeb2e390b3eba58ad56365a0e93ee0481ff3294f8ad7df5bfe3630fe86bfdc8e03b90c57943b5177167b90b3e70e29aa10f12248bf30a8a2843abbfe4ce4f91cc8287bb552e7c81d7ae8f5ffcabb14b14e84f\"}', '2026-02-03 07:12:47', '2026-02-03 07:12:47'),
(69, 'SSCC', '2026-02-06', '2345', '2026-02-06 03:36:53', 9, 5, '51e2e72f32a76398859c6464144d2171e28f317c124547c897d8b8386c165e46', '{\"iv\":\"a021688cf7c1777d74741bcf4a1d3eee\",\"data\":\"f209489d49432ce15eb7fcfa958b5faaf6a15cd6e8d20375c7f0f22fb72addb543439bcaee58f85965b8388de1e3b6acdb750028a96dedc501d25cd9c658a57ce04667540860eef7793da85108a12cf59a09108fd0e8e64c727bc42d5aa6bbb53c50b0a8a90b512bf17a8ede2436458dbd3d8065dfb88c84ae7ca0123dee1d9e8c9a9120d45ec1621737fb9685a55544838c4173f250f2e6df538870fed77cc38b64c7fbdc4a62f6e83878b7ccad018a4f363bfa6c2d3514f27594702aaa8ea39b0ac0b37045536f0a50a67cd0896f0480e51961fd621e97e78c913dc3b9241b8aae6f67c5cdce34cec2fd89bbc5568543123652167967f69254a7d17da8fc654266fa4d8bddc2220b0e9ebed73b0fd8a229400001e49b11ea6e2641d53a78c1ae5648934f2ef37ca174bc55df1a3edb86700da2171b10df1c58fc4da564950f4c4a3bf5d750d26236cad0cd8a153c801170ee032a55d404508ec2772a4859ccee9bcb128f95509cb3dc37de87d5e29d93e36513ee89365b102ca444e9e2a4ff34369320133b2055b36f052dd26a3bd63ae0bb8f4ecc41362fe834b3be0a629434e155c8a214aa3c3dc75e2c63d94fa05b90cdc3b7c2cd99d85ebc3e5c599b973ef340d533e3866af5c33c32aeafb2328ada8542bccc2137aececda8bc6c5a548e3a06032e2db1b9f940104e663ccdbc7a6ac03dd5d92814e422a164c0764154c7ca662b1a2def560940c0073e73f39f6838c417887e2405cdf212780d9688f2ce7b20baa2009f0a8314572f695f511406ff6bc203768c58e4a81411fe84e6e4484220e31ad66c45f48afb228a76b6ce3ce10d2404ab5d70c9577b0368af91fe23ce40447747c7f0bf42f8f8849dd41136f8fbb7e046ad78dc53592542d36181b7eeff6ce227ecedfd5e805f9296395a56b9dac9b39ab85068cae4ca7c1f78aff0cff52523665a25301f1b42249d08dd59b9ee4c89a7ed53babb04ad6da1c4256de8d8b5b82d564f6a818ae7be24f5afa019104a84c038997c46dd8e0c1e1c18a8e1355af947e866091dd66d0ac871e5812084952112bea173db7baffe289a231b427cb2431197adb6731aa12ff36fe3738a1f5ab36298e4f287f5cc559a5382e645864702000228fcde9bbef6c69f908ae3ba9f14d15bf34e7c432112a5624debabde0fbabeb0cc2f30de9321f4c0fc8911e91fb0e2f673149c9470ff1ab225520891297c2c4f32e88e4ae08641b52b37772c040a39361e0127fadd1e19767a1c5d01d4ebaa0988deb0376502380ebca857ccfc44a994ca475e369647c472801487089480a06cb519eaab6a8e8aeafeeb77fe2af1ca2574d335bc9ce236902eeacea281d080133367b954dd6d1312ef4a3504d7bdb5f0902e9bb05f43ee3febc192481487e1cbc131900f9f971d62fd7b2a78b82af00a8c243534d7fe17fee912e16d849177b2cce2d1f7daa7effa8d04ff4d2f8774561952223ab0d9b40d5c074264d7f2f6e713eb995b63180e2154792dd4528292786cc02bfd2a263602162390bacd32693e3b74d028f93e9dd21d7cd20e00c8a3a6a690f4b913c381ee48a56bc86f817f728bc4a731b6d0312c2ffa4d067efc80e72e0d102f030f943b69f83342c369b130b675fc69ac0e9fda3a6dd230fb65b12897dec07fcead1dcbada2fd511eb6d03afc6c6057e312d15ab8ed364f9386757158c3edc79f4ff2b15255e032c463c08bb8ecc90cb340b4dea80c2606ebcba36ad89c426f007e82788d8f7fbaa3b7d7224278ab2b61c04a6d11a34e18dc92c0a12e92f0bb2936855a07dbb3de4826350938861ee6da93a2c30b2598cdf5da20d91cf70c0461c32fadf94dc85a6b23ac92057fde26629de68f052b338657529041df6fd116d54754babfda7fa593123bb50377ce97ebd991d78f0a6afb4ed973f9ac949bf191fd379ea471865304d4a836ab2de727d6b977832a19a55c08bd09b3bd9e9b719b67fc9cee94130a1bec69727d7eba0e8776914a09b573366502318bc64b51d01dd9e90f7c19cc0915df3553a000b2bee735b2b4a639756f8afa637c08b63331b38821f168a49c72b786b6cd86c6b5229dc5acb351cb99c187948d1680d246c75fd5f2772942c23395e774e501d5be19131168a3b9038d8d818e6fc26e1b0de89c39918e2cb84a589bc396c68cd88038d6a637ed369d03d7e648a55f076dce13bfa2de7ab28f85984801f7e1a24f50f207992c971e96a93009d7ef8133d8aa51f497f30d41f37b63c52007e620f98c27ca817e8dba4fc87ca2ab4ea0b8b816a232161a6c8bb480be9b813897338e2c4a0f2b5ecfc4c6808183a44e3e8759b363dae0ee48c399f681e7cf7999e5fec29b21f6846ab6014b29c8e71d1dd34db1f02ba078c2cd7b0a9e456454780860b960600ddb0aec42deeb91984b5795643956765eaa54929393db40f42b7db1e50facfc44750350120c76448d0b4b35b27721c18982ff22ed5c90bf01d3a20349f213c5196b166c6f70455490eb2d40485a32223c0ac353b76c4c4222fe73d426afd4f3bf886ab679db8dbee036042510c433e8a7452b6033be4e500284487fe08c9eaa47eeb5262ef8ef20589f471f23bad390ce18aa2b9d14edf44684406d54685f3593d5863c7169dfec825aafd2dff8b3f97a833744b8d45e8e5d140bf4d9726f8ce02c4723d8d83991857d2a1cd9b146fcf828e573214c5e3fb79a6fbcd5348ce78b4019740949fd800f07ae467a5805e86fd7f791211219c54161ad24867a8d96fb5148a08d59b884d3522275bbd77ae8971c5bb4\"}', '2026-02-06 03:36:53', '2026-02-06 03:36:53'),
(75, 'Test', '2026-02-06', '02062025', '2026-02-06 06:01:15', 11, 27, 'eb79efc2c612ca3227c01ead648692c4932d297b0adb36d0b71930ef1306e94b', '{\"iv\":\"78871708408fe706133b407c915f10ac\",\"data\":\"1bb5ccb590206fdcb08e498d99ab9fc186a601eb79851f2476cb61cc6446469e4d9d223c0eb9380205b2051727ea03d295d296e0bedaff38fb8d3d1d4556aca37362561b185075139886cf453d2db56804abe904f612f565d6855c75b8b23eda9b53dd3cc2e0543989ee3869f74fb5c4e251f9f221a21461d4440b4ce410dca74966492675ed04590b0cbda96248722ae8365b68ef9f03414bf003f737d0bd4d5ac2bb154e3f8e064154e983b6f3ef98959dc58543edde9c94b9423b704616b7ecdf6326519ec8d05caadda183a57019675d8e2795a2842f2626d7d70fbcbaa1e832ebe362b9abf90ef888cc708bff8f9e929ed77e8f5356407f6ef65cb6f92fe8a0f679fc887bc9e5abeb3030009d449e20b6c120984030612b16e18b01b0031af23b098169e4e531f345501da99c9f007b040d1e8df99c4499ad609346b5089698d191f341e25f7dca463da607086864ee2e1c6048b1a47af9c3ad83895065192d0640ed4419795723e862596b5326d32e4f2dec6eea6ff4c9a74eef15e828fb0f65c93cf4d3963d9906e3d17954ef6f8dbb9297002c484c21b6eca681ef4979426e6a2840f37e350c866f37718810b86ed0f5f0417fda406a1e5dad67aae52a9d13f26bbed4ab67f7a81c05645339d6bc03fbd35cc040b24568f290d71b45c74b7cf1b48dc5d21941fc0f7fd838b9e92ea58771527e72066b4b68c34ba9e0a0e784c5921aae4079bdf48ab607a4ba5d8a9e79fe5575ef2fc7c41f068f191b2709945f16995b1b22b05507492be2679a7d86cb46d90d70fd37e2d29783f8f317868308676d37e4ba2659e3a638aca93fab8f2c41f75f05cef1db95ca0baa8d3d014a05e27648ca2f41a0d0da64debc1c50a4f3385bdf6ecea3dcf7a9bdc65833ae497b3964beaa788acbcd479a49398b5f36c8327c54d5e789ffcb31e913394289291f94e9bcb43f54f38ef5645c441a82151d5977f9fbb6b196c928c94817bb3880a410a61ce8619b0c46036b1315eace1fcea48929b9f16b9759293d0198ecb6a78bc4536c64bbf49376abc908c4c455409c45d308efba1fc8974dcc43ade51a97aa7df65a2f4b63a792f3061f9b0945e8890eaea32a8540b373ab56945f15976eff8e086976dc84d2b7f5184eaf5ac2611eef8c80a31dff1844efaef5dc35f6c3878cd76c0882eb167b5f4dc9e00f4108257c763bc061a2a74c55b2bd993d7d0b4fc4362dfa4748f5f3c7bdafd4dab073efb3e8eee843475b34b698116b17776992dedde028bf03d3141b4ceaf65ed7f44f1b658ece8c63a6962462f46767675a770e2bbe93f0884c0d61a1fc7e1ba715036c75fa01600b3492bcfa3771b396953dc99ad845a8a659196fc77d15a248ec5f32cfa498dbc8ee811b7234c3ca27eddaf67ba8ee94c7a4a7df1be33e073707b503f9f71514213127aae3c78aac6631bedd98b789cd9fef12c3693be4f442bd0b715839d0e7448ec4ec138e57b4a4a3a8b33d5998e0d5c519dda8fa94c814055526b5d897a16322618ed0c1f28755ff5e736d8cc959c3512d9430a61fb773a2fa4cd5a2cf8c75dc55c7bfb99d234c516bd2a7d5535b65880a1aeb34f1825013d5390b96dea84f9b2d913c3ccdec499d175ca5fdca9a13e45a8cfe98dfa3fd4d156e848bac3631c407ca5c70cad6faa9f8171ba2719734390260b8bf264e01ef73bc31e0dfba54895471290e7df94a86a981cfceb40d670fbb411d29558de85cbf1ec23f65a435a0003576ad4fabe8930fdea354ecf41e1bb4d77596443fc936a3b6741de5e425153fe95b81b00ce42ef0b661a39d5ac0ed48eb1fbd803a034deff1cb77d8e442ebd5bc63d658c201adb9bcf6c2952bd8af3db7fb863479c29e6ca9358b2f02de2ddb22b7b6849a9dba6b61946a4577e3279b7415133a512cce4108f0134631a7751590494a5b7693bfe459ff9152e818a72e2d3041ce04fcc0bbbc37af314f71a846520b8ec7a79e4ba4de017e1ef177cbde13cacee0375f03b02efaac62e939b94f6f77ebbdafdfb2751ef1d9daf57c9557f69b9d84d090aa9ef749f006f7d594973ba07747dabaa658b7ddcb0d6d90a6828c1ec36febca9c2c0c2927a5c90b9b99869e743e1a4e2f51599b77b87c2ff90a737c8608487663dd734f2ff76447aa961a176f7f27bf731a4b47c1c18741b4f80190c2f658b757ab15e3444a2bd70f1482c331a52ad3c21c8f7ed952fba4d11f60212a85a89a33c113cde9c5963f306051dbf5cc8011f752840499d9fcc01dbf56086f7c8ef74dc1b5cb7cc0da1a7651d5677ad50c04a5caffa91bc7d0e1490d1d66a589949788ed73fe69120b6d2f22f634bbecf4a9326111c29a6de1cb6a38f365f44b97da83666e80ed2824b34c732f6058fd7f7918866e30a76d697cf82d51bf5e4ccfcbec59110ae28d541f827d4d1ea63e6ca4ef1879b2e53d32af795c9a7c9c46d11f0681734f08420fb110333ec0742b64439751e85d84f57ca23f4d244a1e9063e17aa836aeed32d30cd253e45c4057663e2f022399c091ebb0eb724a0e5e289d2c9fb743753cd3a9dbd471535fe9314bac08ae2e6a7881d5f693660fbe029f3d892b49d6b008fa0edc6391ca9615e5ae94e3b2c4b922829b48b080092c2b19eae67466204a8de9c94380437b467dd3c82d2a0bc5b2c00a6ca80e11972e1943ac75ee7a6b67432e08ae1d1bb00f07b6461e80bcc4f20593bdca291f36280c2116f46f8aa0fdaa5526bc22d650a58b9cf1ce66c77637fbb160eec01352264242b4e2f23d5a03471b435f7702207420a40990ff4d88238c69639fd1fcf936d933c2a95f0513768af3f48c930c54c1a1d842f5d488a93701a3cd8b57cdbbeed8e4727dbfe60a740d6f1381a5727ccadf370303b2ab4641930e41328b9eecf1701719fe9da7de48f84db0183991541bfa1612c40a10003e1f8a8088a53d5080804bd44b0189e9969bbd35cafe87a7732062338deea3403556edd8d6d795f1c3db257afa882d45ba8d68ef9ca57d72b1d1ca3303f6129e6e38cfc1df2c2cb213b935f3449c1072c870a8d05440da2ef389c402f09a4c3b5edc41068f288f2e922ff9c9dd46ba28f1beaaa05fc543d549673f8abfb8e02abc2aec25ba41ee297ce0ef5ad1f9df38a6ffcb5d0d850b827c0b5c785a8ef8aeea46e1b76a5f54058426857d9ac9af79b804efd7821767b079a7121f08b0752f2c8f5ca405ac92c12faeccd65c528c83753747ee7a1d8c41a0cd56086bcf6113eb959c9793d8e8c9876f7f1c4a26107f38d151fd5c2134886063f02db918c5023a8ae8d7aefbe7a8537483\"}', '2026-02-06 06:01:15', '2026-02-06 06:01:15');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `allowed_courses` text DEFAULT NULL COMMENT 'JSON array of course names that can vote for this position'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`id`, `name`, `max_votes`, `display_order`, `is_active`, `created_at`, `updated_at`, `allowed_courses`) VALUES
(12, 'President', 1, 0, 1, '2026-02-01 05:12:53', '2026-02-06 03:59:21', NULL),
(13, 'Vice - President', 1, 1, 1, '2026-02-01 05:13:34', '2026-02-06 03:59:21', NULL),
(16, 'Senator', 3, 2, 1, '2026-02-01 14:04:19', '2026-02-06 03:59:21', NULL),
(19, 'IT Representative', 1, 3, 1, '2026-02-06 05:57:50', '2026-02-06 05:57:50', '[\"BS in Information Technology\"]');

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
(203, '20-10076', 'Servando S. Tio III', 'BS in Information Technology', 4, 'A', '$2a$10$VbB74Q0szcjFeEmQJb3GnObRTn1vyx1qD4sJEau3ECLww7vs512DS', 0, 'vote_1770099773291_8q625nuze', NULL, NULL, '2026-02-01 05:14:16', '2026-02-03 07:13:24', 1),
(204, '20-0001', 'Alyanna Marie Espoltero', 'BS in Office Administration', 3, 'A', '$2a$10$irbWF1S1J9.NQji2VYXHTeVVUQMTTN6GibOwmxJkJ7GFoic5z1cq6', 0, 'vote_1769955843287_8grzyg6aw', NULL, NULL, '2026-02-01 05:30:50', '2026-02-01 14:28:00', 1),
(206, '20-0002', 'John Paul Gazo', 'BS in Information Technology', 3, 'A', '$2a$10$8Zy6jkpA2mIBUYIbEiCUH.2Y8/T1YMxS9oSLaKbIWYFF.9Ige7A.q', 0, 'vote_1770099297516_c88npsi5b', NULL, NULL, '2026-02-01 05:32:22', '2026-02-03 07:13:24', 1),
(208, '20-0004', 'Jomar Palarao', 'Bachelor of Secondary Education - English', 4, 'A', '$2a$10$5q1MI46Lr7c/X3ymvRSHDeMvNwf8Xg7wpjbWmyIcMF3JmwfYicg62', 0, 'vote_1770357598249_29iut2lcn', NULL, NULL, '2026-02-01 05:42:01', '2026-02-06 06:01:43', 1),
(209, '20-0005', 'Jaylou Terante', 'BS in Office Administration', 3, 'A', '$2a$10$JQkvp2DxT2wBxDwUIVTrBOwj/tGJQd1B6gDOwapq6LghgxZ2umK7i', 0, NULL, NULL, NULL, '2026-02-01 10:17:47', '2026-02-01 10:17:47', 1),
(210, '20-0006', 'Juan Dela Cruz', ' Bachelor of Science in Criminology', 1, 'A', '$2a$10$NB0ULmhtg6YMoba/xnTEcOvDqqXKJguSJQkIt6PXEdbXRwvqVmhBW', 0, 'vote_1769955173023_1gv39lhfc', NULL, NULL, '2026-02-01 13:50:24', '2026-02-01 14:28:00', 1),
(211, '20-0007', 'Jose Rizal', 'Bachelor of Industrial Technology - Automotive Technology', 3, 'A', '$2a$10$.hyuvZfYBqdUe0r6QU5bH.zopJ8ZuZ/7FmP9xUzfJjU0/bHAE2oPq', 0, 'vote_1770357526293_jlb1kc2jm', NULL, NULL, '2026-02-01 13:51:58', '2026-02-06 06:01:43', 1),
(212, '20-0009', 'Andres Bonifacio', 'Bachelor of Industrial Technology - Electrical Technology', 3, 'B', '$2a$10$O8kNZAK26Bexc.fOLodhoOkq3TBjN7G8aZ7uVGSt1yWwYsqwRj7MK', 0, NULL, NULL, NULL, '2026-02-01 13:54:36', '2026-02-01 13:54:36', 1),
(213, '20-0010', 'Kenneth Dugaria', 'BS in Information Technology', 2, 'A', '$2a$10$0ivTJe4IhLDiVeEs2yMVlOmIY0F2Yn/wAcfk.mLi1UMH4J.6AL5ay', 0, 'vote_1770357649125_ie9y8jy5a', NULL, NULL, '2026-02-01 13:56:01', '2026-02-06 06:01:43', 1),
(219, '20-0011', 'Joshua Tan', 'BS in Information Technology', 4, 'A', '$2a$10$zmW5abh.t48dA1jg3c/CXOazg0EtZrvc2kI98QdSzZohfdEbMQjXm', 0, 'vote_1770099952785_uicw5d1mp', NULL, NULL, '2026-02-01 14:02:33', '2026-02-03 07:13:24', 1),
(220, '2023-023', 'Jerald E. Mernilo', 'BS in Information Technology', 4, 'A', '$2a$10$z.BRSOzZpgXDR1jrv25bxuDsOFEbDxMoLxnQ8emxFssXeYitqiFlS', 0, 'vote_1770100623289_jdlzq0yt2', NULL, NULL, '2026-02-01 14:06:41', '2026-02-03 07:13:24', 1),
(221, '2021-203', 'Earl Espina', 'BS in Information Technology', 4, 'A', '$2a$10$M19iViJIrUjx2Z37DteaqeZskyh5Cmh1F2tKnJFqhtL5WEwUl2FRS', 0, NULL, NULL, NULL, '2026-02-01 14:06:41', '2026-02-01 14:06:41', 1),
(222, '2024-021', 'John Paul Tomada', 'BS in Information Technology', 4, 'A', '$2a$10$xWef4BqcQTsIBLaN/xSrQuEQya.iq8MZSOEZit/aGQtI2JSJR8MjG', 0, NULL, NULL, NULL, '2026-02-01 14:06:42', '2026-02-01 14:06:42', 1),
(223, '2025-1234', 'Jerold E. Mernilo', 'BS in Information Technology', 4, 'A', '$2a$10$wlWVf3.w03.jkkRKwU4HcOppvHhoEo9gP5CZOdiipL.vkBmoXxyQa', 0, 'vote_1770100791388_dsqi0xmem', NULL, NULL, '2026-02-01 14:06:42', '2026-02-03 07:13:24', 1),
(224, '20-0012', 'Ferdinand Marcos', 'Bachelor of Secondary Education - Filipino', 4, 'A', '$2a$10$aLIdlvLh0ZrDEWYEhcxwK./8ZNZ4hnrhgYDq8NSJqK6xUtxeM5JOm', 0, 'vote_1770357572798_ks5sd5ht3', NULL, NULL, '2026-02-01 14:07:19', '2026-02-06 06:01:43', 1),
(226, '20-0015', 'James Yap', 'BS in Information Technology', 1, 'C', '$2a$10$SYtBxdZ6knsmBrhFd0I1BuiJ9irVQJx4gkV4wUc6zq6mqbALDVNtG', 0, 'vote_1770357556399_3n162uimu', NULL, NULL, '2026-02-03 02:37:08', '2026-02-06 06:01:43', 1),
(228, '20-0016', 'James Clark', 'BS in Information Technology', 4, 'D', '$2a$10$hED6nGT3M8A16HKfhrks6.y84ZzucwOAZ9JWEfbpubKwFJMLC/rvy', 0, NULL, NULL, NULL, '2026-02-03 02:39:49', '2026-02-03 02:39:49', 1),
(229, '20-1002', 'Charles Smith', 'BS in Information Technology', 3, 'E', '$2a$10$5zxkVV9xmMZYelnbWEaD5uyhgadcmNyUua5vds72.0f8bpT82Frsa', 0, 'vote_1770348982467_kk4h6lab9', NULL, NULL, '2026-02-03 02:44:24', '2026-02-06 03:37:02', 1),
(230, '20-1212', 'Francis Smith', 'BS in Information Technology', 3, 'E', '$2a$10$1F3/AWevwH63RFQKqFQErOsagZXmxf4A//2H7rAWmZkkoJSeq2NnC', 0, 'vote_1770100452093_3oe1f1rpn', NULL, NULL, '2026-02-03 02:48:34', '2026-02-03 07:13:24', 1);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2831;

--
-- AUTO_INCREMENT for table `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `election_data`
--
ALTER TABLE `election_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `voters`
--
ALTER TABLE `voters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=231;

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
