-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 09, 2025 at 05:39 AM
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
(6, 'monitor@voting.edu', '$2a$10$XxD7Wb42Oz2WQM./0x7yfOQ6Gk0gpzX1d/1nqdycUfTcXzyP3AgtW', 'Poll Monitor Account', 'poll_monitor', '2025-11-25 01:49:28', '2025-11-25 01:49:28', 0, 1),
(8, 'admin1@voting.edu', '$2a$10$7Eygz9BRsxmpR3w9EypzieV4JNsyHGSKxTeF4vPwaQC9nTFE1zdSi', 'Servando S. Tio III', 'admin', '2025-12-09 02:47:34', '2025-12-09 02:47:34', 0, 1),
(9, 'auditor@voting.edu', '$2a$10$crLExFpXlBZDXok94hkRV.2VnHhjnGxg1TApAWPAV3lyzILbkXfjm', 'Auditor', 'admin', '2025-12-09 03:01:01', '2025-12-09 03:01:01', 0, 1);

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
(1740, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 3 voters', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-03 15:57:48'),
(1741, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-03 15:58:00'),
(1742, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-03 15:58:02'),
(1743, 161, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 15:58:47'),
(1744, 161, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 15:58:47'),
(1745, 22, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x352c70a8bcf9f4045d9b1ced4e4ad36437ba9733408a8fca73d91d0258dddf30 (Node: emergency_storage)', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 15:58:59'),
(1746, 161, 'voter', 'MARK_VOTED', 'Voter 22-10553 marked as voted with ballot vote_miq6z8mq_w176z1kfg7_n6dvkdezhyd_nmc3', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 15:58:59'),
(1747, 159, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 16:19:30'),
(1748, 159, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 16:19:30'),
(1749, 21, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xddc1352b8c0af2a1d2afb12b126681365c3945dcb5cacef8eaa3f024ee5ea079 (Node: emergency_storage)', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 16:19:39'),
(1750, 159, 'voter', 'MARK_VOTED', 'Voter 21-10241 marked as voted with ballot vote_miq7ptsm_i4wm1e8p509_dfgy8l3c4yf_xlq4', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 16:19:39'),
(1751, 159, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 16:21:09'),
(1752, 159, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 16:21:09'),
(1753, 163, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 17:26:27'),
(1754, 163, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 17:26:28'),
(1755, 20, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x19a5e6aa902bbc48007c6aae9c189471e5af67368db1e07bc1d79b8de7a6cc19 (Node: emergency_storage)', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 17:26:37'),
(1756, 163, 'voter', 'MARK_VOTED', 'Voter 20-00000 marked as voted with ballot vote_miqa3xsf_1n0htowf26f_s8e8yogmk5_mgo5', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-03 17:26:37'),
(1757, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:15:57'),
(1758, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:16:04'),
(1759, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:16:08'),
(1760, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:16:24'),
(1761, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:16:57'),
(1762, NULL, 'admin', 'LOGIN_FAILED', 'Failed login attempt for email: superadmin@voting.edu', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:17:05'),
(1763, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: superadmin@voting.edu', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:17:16'),
(1764, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:17:40'),
(1765, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:17:40'),
(1766, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:18:07'),
(1767, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:18:07'),
(1768, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:18:30'),
(1769, 0, 'admin', 'FINISH_POLL', 'Poll finished: SSC Data (25-26) with 6 candidates and 3 votes from blockchain_votes_sql_candidates', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:18:32'),
(1770, 0, 'admin', 'STOP_POLL', 'Poll status updated', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:18:34'),
(1771, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 3 voters', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:19:13'),
(1772, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-00001', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:19:31'),
(1773, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-00002', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:19:45'),
(1774, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-00003', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:19:57'),
(1775, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-00005', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:20:31'),
(1776, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-00006', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:21:01'),
(1777, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2023-023', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:22:21'),
(1778, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2021-203', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:22:21'),
(1779, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2024-021', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:22:21'),
(1780, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2025-1234', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:22:21'),
(1781, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 47', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:22:29'),
(1782, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 46', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:22:30'),
(1783, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 45', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:22:31'),
(1784, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 44', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:22:33'),
(1785, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 43', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:22:33'),
(1786, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 42', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:22:34'),
(1787, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Alyanna Marie Espoltero', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:22:44'),
(1788, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Jay Lou A. Terante', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:22:53'),
(1789, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: John Paul Tomada', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:23:04'),
(1790, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 50', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:23:08'),
(1791, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Joshua A. Tan', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:23:31'),
(1792, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Mharlou C. Escobido', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:23:46'),
(1793, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Jerald E. Mernilo', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:23:58'),
(1794, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: John Paul Tomada', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:24:08'),
(1795, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Jerold E. Mernilo', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:24:20'),
(1796, 0, 'admin', 'UPDATE_POSITION', 'Updated position ID: 8', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:24:31'),
(1797, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: June Lian J. Tampos', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:24:49'),
(1798, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Earl Espina', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:24:59'),
(1799, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Servando S. Tio III', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:25:17'),
(1800, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-00008', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:26:04'),
(1801, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-00009', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:27:04'),
(1802, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Kristine Udtohan', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:27:21'),
(1803, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Catherine E. Medilo', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:27:29'),
(1804, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-00010', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:28:07'),
(1805, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-00011', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:28:41'),
(1806, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Maeshyla Montajes', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:28:52'),
(1807, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Cyra Jane Seco', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:29:02'),
(1808, 0, 'admin', 'START_POLL', 'Poll started by super admin', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:34:27'),
(1809, 0, 'admin', 'START_POLL', 'Poll status updated', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 00:34:29'),
(1810, NULL, 'voter', 'LOGIN_FAILED', 'Failed login attempt for student ID: superadmin@voting.edu', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:34:59'),
(1811, 165, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:35:11'),
(1812, 165, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:35:11'),
(1813, 20, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x404aa016befe33238a17f0eadddda495e777cbee0cc4bf79761294614337fca3 (Node: emergency_storage)', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:35:24'),
(1814, 165, 'voter', 'MARK_VOTED', 'Voter 20-00002 marked as voted with ballot vote_miqpf888_pi13jfj3yg_g4dhem0h01g_8met', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:35:24'),
(1815, 158, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:36:12'),
(1816, 158, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:36:12'),
(1817, 20, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x6958d79997f694e3bb8fd67e8204864077fe2871a786848d9a8e7a281511d79e (Node: emergency_storage)', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:36:25'),
(1818, 158, 'voter', 'MARK_VOTED', 'Voter 20-10076 marked as voted with ballot vote_miqpgj7b_mung5x0w4s_qns70p7x3nf_76ua', '10.108.169.118', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 00:36:25'),
(1819, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:18:40'),
(1820, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:18:41'),
(1821, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:20:07'),
(1822, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:20:07'),
(1823, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:20:49'),
(1824, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:20:50'),
(1825, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:24:17'),
(1826, 0, 'admin', 'FINISH_POLL', 'Poll finished: SSC Election (25-26) with 14 candidates and 7 votes from blockchain_votes_sql_candidates', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:24:19'),
(1827, 0, 'admin', 'STOP_POLL', 'Poll status updated', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:24:21'),
(1828, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 2 voters', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:26:47'),
(1829, 0, 'admin', 'CREATE_VOTER', 'Created voter: 23-10253', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:29:30'),
(1830, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:48:19'),
(1831, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:48:19'),
(1832, 0, 'admin', 'START_POLL', 'Poll started by super admin', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:51:15'),
(1833, 0, 'admin', 'START_POLL', 'Poll status updated', '10.108.169.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:51:17'),
(1834, 163, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '10.126.172.77', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 01:56:54'),
(1835, 163, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '10.126.172.77', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 01:56:54'),
(1836, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.126.172.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:57:22'),
(1837, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '10.126.172.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 01:57:22'),
(1838, 20, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xf94c749d4ae864d6422ee2272e8735f8739fc482b5591d064fd29ad98265a9c4 (Node: emergency_storage)', '10.126.172.77', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 01:58:23'),
(1839, 163, 'voter', 'MARK_VOTED', 'Voter 20-00000 marked as voted with ballot vote_miqsdt5c_tz1uv2uby7f_bntw0upopak_qojr', '10.126.172.77', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '2025-12-04 01:58:23'),
(1840, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 02:48:31'),
(1841, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 02:48:31'),
(1842, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 02:48:52'),
(1843, 0, 'admin', 'FINISH_POLL', 'Poll finished: SSC (25) with 14 candidates and 7 votes from blockchain_votes_sql_candidates', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 02:48:54'),
(1844, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 02:48:56'),
(1845, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 1 voters', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 02:49:26'),
(1846, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 02:56:25'),
(1847, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 02:56:27'),
(1848, 175, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-04 03:04:10'),
(1849, 175, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-04 03:04:10'),
(1850, 20, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0x687913cf706636f2de76ffb6b7a6f2d59f9c24d8e5a400bc0e734d9929057cd5 (Node: emergency_storage) - Empty positions: 2', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-04 03:04:33'),
(1851, 175, 'voter', 'MARK_VOTED', 'Voter 20-00009 marked as voted with ballot vote_miqur6p4_5fsqrky7r9_aiul26qa08_u4pa', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-04 03:04:33'),
(1852, 160, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-04 03:05:11'),
(1853, 160, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-04 03:05:11'),
(1854, 22, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xdc803b4b1f138e19331de02470038615c53b811461a2cd292c045ee278fa7af8 (Node: emergency_storage) - Empty positions: 2', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-04 03:05:26'),
(1855, 160, 'voter', 'MARK_VOTED', 'Voter 22-10640 marked as voted with ballot vote_miqus7mh_fhuumrplwup_wugnbpstq2_x5td', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-04 03:05:26'),
(1856, 0, 'admin', 'PAUSE_POLL', 'Poll paused by super admin', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 03:16:17'),
(1857, 0, 'admin', 'PAUSE_POLL', 'Poll status updated', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 03:16:18'),
(1858, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 03:16:30'),
(1859, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 03:16:32'),
(1860, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 03:22:53'),
(1861, 0, 'admin', 'FINISH_POLL', 'Poll finished: SSC (233) with 14 candidates and 5 votes from blockchain_votes_sql_candidates', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 03:22:55'),
(1862, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 03:22:57'),
(1863, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 62', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 03:35:36'),
(1864, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Cyra Jane Seco', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 03:35:46'),
(1865, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 04:41:49'),
(1866, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 04:41:51'),
(1867, 0, 'admin', 'PAUSE_POLL', 'Poll paused by super admin', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 04:42:04'),
(1868, 0, 'admin', 'PAUSE_POLL', 'Poll status updated', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 04:42:06'),
(1869, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 04:42:20'),
(1870, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 04:42:22'),
(1871, 0, 'admin', 'SUPER_ADMIN_VERIFICATION_FAILED', 'Super admin password verification failed', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 04:46:45'),
(1872, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 04:47:17'),
(1873, 0, 'admin', 'FINISH_POLL', 'Poll finished: ssss (222) with 14 candidates and 0 votes from blockchain_votes_sql_candidates', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 04:47:19'),
(1874, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 04:47:21'),
(1875, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 63', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 04:47:49'),
(1876, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 05:00:39'),
(1877, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 05:00:41'),
(1878, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 05:01:06'),
(1879, 0, 'admin', 'FINISH_POLL', 'Poll finished: SSS (22) with 13 candidates and 0 votes from blockchain_votes_sql_candidates', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 05:01:08'),
(1880, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 05:01:10'),
(1881, 0, 'admin', 'CREATE_ADMIN', 'Created admin: joshuatan@voting.edu', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 05:01:58'),
(1882, 0, 'admin', 'UPDATE_ADMIN', 'Updated admin ID: 7', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 05:02:06'),
(1883, 0, 'admin', 'CREATE_VOTER', 'Created voter: 21-01234', '192.168.254.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', '2025-12-04 05:04:41'),
(1884, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 01:36:19'),
(1885, 0, 'admin', 'LOGIN_SUCCESS', 'Super admin logged in', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 01:36:19'),
(1886, 0, 'admin', 'RESET_VOTES_ALL', 'Reset voting status for all 2 voters', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 01:38:37'),
(1887, 0, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 170', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 01:38:54'),
(1888, 0, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 171', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 01:38:54'),
(1889, 0, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 172', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 01:38:54'),
(1890, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 48', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 01:39:10'),
(1891, 0, 'admin', 'DELETE_ELECTION', 'Deleted election record ID: 42', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 01:52:53'),
(1892, 0, 'admin', 'DELETE_ELECTION', 'Deleted election record ID: 41', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 01:52:58'),
(1893, 0, 'admin', 'DELETE_ELECTION', 'Deleted election record ID: 40', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 02:42:35'),
(1894, 0, 'admin', 'DELETE_ADMIN', 'Deleted admin ID: 7', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 02:45:34'),
(1895, 0, 'admin', 'CREATE_ADMIN', 'Created admin: admin1@voting.edu', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 02:47:34'),
(1896, 0, 'admin', 'UPDATE_ADMIN', 'Updated admin ID: 2', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 02:51:42'),
(1897, 0, 'admin', 'DELETE_ADMIN', 'Deleted admin ID: 2', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 02:51:45'),
(1898, 0, 'admin', 'DELETE_ADMIN', 'Deleted admin ID: 3', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 02:59:59'),
(1899, 0, 'admin', 'CREATE_ADMIN', 'Created admin: auditor@voting.edu', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:01:01'),
(1900, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 58', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:02:39'),
(1901, 0, 'admin', 'CREATE_POSITION', 'Created position: Press Secretary', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:04:27'),
(1902, 0, 'admin', 'CREATE_CANDIDATE', 'Created candidate: Servando S. Tio III', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:05:44'),
(1903, 0, 'admin', 'UPDATE_CANDIDATE', 'Updated candidate ID: 64', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:06:35'),
(1904, 0, 'admin', 'DELETE_CANDIDATE', 'Permanently deleted candidate ID: 64', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:06:46'),
(1905, 0, 'admin', 'DELETE_POSITION', 'Permanently deleted position ID: 11', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:07:47'),
(1906, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2023-023', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:50:18'),
(1907, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2021-203', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:50:18'),
(1908, 0, 'admin', 'CREATE_VOTER', 'Created voter: 2024-021', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:50:18'),
(1909, 0, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 158', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:54:02'),
(1910, 0, 'admin', 'CREATE_VOTER', 'Created voter: 20-10076', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:54:57'),
(1911, 0, 'admin', 'BULK_ACTIVATE_VOTERS', 'activated 1 voters (IDs: 183)', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:56:49'),
(1912, 0, 'admin', 'BULK_DEACTIVATE_VOTERS', 'deactivated 1 voters (IDs: 183)', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:57:47'),
(1913, 0, 'admin', 'BULK_ACTIVATE_VOTERS', 'activated 1 voters (IDs: 183)', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:57:51'),
(1914, 0, 'admin', 'RESET_VOTES_SELECTED', 'Reset voting status for 1 selected voters (IDs: 165)', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:59:09'),
(1915, 0, 'admin', 'DELETE_VOTER', 'Deleted voter ID: 165', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 03:59:14'),
(1916, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 04:07:32'),
(1917, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 04:07:34'),
(1918, 0, 'admin', 'PAUSE_POLL', 'Poll paused by super admin', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 04:09:21'),
(1919, 0, 'admin', 'PAUSE_POLL', 'Poll status updated', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 04:09:23'),
(1920, 0, 'admin', 'START_POLL', 'Poll started by super admin', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 04:11:13'),
(1921, 0, 'admin', 'START_POLL', 'Poll status updated', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 04:11:15'),
(1922, 183, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-09 04:13:42'),
(1923, 183, 'voter', 'LOGIN_SUCCESS', 'Voter logged in', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-09 04:13:42'),
(1924, 20, 'voter', 'DECENTRALIZED_VOTE_CAST', 'Vote cast on decentralized Ethereum blockchain. TX: 0xb6dbdebd1c622c82726b9a9c735d35f8eb5b3e2a37a5a009e8a7a561de2419ec (Node: emergency_storage) - Empty positions: 1', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-09 04:17:47'),
(1925, 183, 'voter', 'MARK_VOTED', 'Voter 20-10076 marked as voted with ballot vote_miy2hjkl_10sfkq6aiz3_vxv515lb5hp_chjt', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-09 04:17:47'),
(1926, 0, 'admin', 'SUPER_ADMIN_VERIFICATION_FAILED', 'Super admin password verification failed', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 04:27:52'),
(1927, 0, 'admin', 'SUPER_ADMIN_VERIFIED', 'Super admin password verified for sensitive operation', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 04:28:31'),
(1928, 0, 'admin', 'FINISH_POLL', 'Poll finished: SSC 2025 (2025-2026) with 11 candidates and 5 votes from blockchain_votes_sql_candidates', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 04:28:33'),
(1929, 0, 'admin', 'STOP_POLL', 'Poll status updated', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2025-12-09 04:28:35');

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
(49, 'Jay Lou A. Terante', 'MAKABANSA', 'President', 0, '2025-12-04 00:22:53', '2025-12-04 00:22:53', 1, NULL),
(51, 'Joshua A. Tan', 'MAKABANSA', 'Vice President', 0, '2025-12-04 00:23:30', '2025-12-04 00:23:30', 1, NULL),
(52, 'Mharlou C. Escobido', 'MAKABAYAN', 'Vice President', 0, '2025-12-04 00:23:46', '2025-12-04 00:23:46', 1, NULL),
(53, 'Jerald E. Mernilo', 'MAKABAYAN', 'Senator', 0, '2025-12-04 00:23:58', '2025-12-04 00:23:58', 1, NULL),
(54, 'John Paul Tomada', 'MAKABAYAN', 'Senator', 0, '2025-12-04 00:24:08', '2025-12-04 00:24:08', 1, NULL),
(55, 'Jerold E. Mernilo', 'MAKABANSA', 'Senator', 0, '2025-12-04 00:24:20', '2025-12-04 00:24:20', 1, NULL),
(56, 'June Lian J. Tampos', 'MAKABAYAN', 'Senator', 0, '2025-12-04 00:24:49', '2025-12-04 00:24:49', 1, NULL),
(57, 'Earl Espina', 'MAKABANSA', 'Senator', 0, '2025-12-04 00:24:59', '2025-12-04 00:24:59', 1, NULL),
(59, 'Kristine Udtohan', 'MAKABAYAN', 'Senator', 0, '2025-12-04 00:27:21', '2025-12-04 00:27:21', 1, NULL),
(60, 'Catherine E. Medilo', 'MAKABAYAN', 'Senator', 0, '2025-12-04 00:27:29', '2025-12-04 00:27:29', 1, NULL),
(61, 'Maeshyla Montajes', 'MAKABANSA', 'Senator', 0, '2025-12-04 00:28:52', '2025-12-04 00:28:52', 1, NULL);

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
(37, 'SSC Data', '2025-12-04', '25-26', '2025-12-04 00:18:32', 6, 3, 'f75af7334698ecfe1482e043b7d3773f7083e67be068324d1431cbf03e79722a', '{\"iv\":\"091504a62bac501b595766f4b16c08ee\",\"data\":\"b5d3894bd1abf79f3171e61c187f96b9dbfa4bf7656458fc2fba2146f68cd2d182f2a02e1525d559b5f44772b48d4d89a36ab9ed2ed5c04160f9d7396e78adada511378e989ffe75f94f1de26c08f8cb1c1f8d73045b7029e6749b052df76770d01c13f1491708253e8b63bd95a898f8004d94f7dac64a26560f531ba97bc9fb41b8a0750cfd6e1666f1a0d8ed4780507d7ee968df1e04772933539d70b837f3979798926164b999a145392107311092fbd6b65e669fd2018eb5da6eeee4bb99f387139e2725e0cf675c08d59bdaed77c28926846996c7ad49941c5c00a98e65ab40686db1f7a6522cc8ed1cbf7f5dc507888c360b7c6c289dd785e4eb830cc54ac5e3e7b0d813bb7fcbba6a8d05dceb7603ce0aa6f60878bf753c183587e74ad43a1b59d0f931e94847e9f7b075784520c124f4cac492686398f6a4265bc46a182fe891a6da2587c9377c5b2e6ba19d7b06d9fc3c5c52a4c110fc1b547b498021f2f6328947571ded88a372397dcdda9152c122236aa7ce389dccc8b1296218ef22caa85b4309f06b5bacf0d84d5f2b0a315692dce4bb7e0d584c6114c791c0cf1b649dd7677b96003aa94d87fb9b01c2c7596a33cae20d26cc720b42f1d7c37d9cb22e7ede1bbab563330c31aaf749534c80bf3e709b701705e0871a67641a9970448a17368e7c0856b9c36fb6c8444878a2812810c18f7f05ec9c09f97c1d73f760aa59628227673f513593be04386236a324cb1f58110115452e8cf6337c1070dcd9b5367517d1953616bd1de4e8fcf8527fd8a5989f1e1f65c6d1c29d9d95213f6b6200e82b3ffb91166a727fcdec0d92bd9795970e3f95cf77215700097cbf2dcb768c79de9dd2e3414a7eba567fb0a4558e6763812738a87fd81d9c58b16d24f8d69bf590cc830da930285f35a9742ac36bec6cc994a38c4d8dca9d761d6650f17254e2eba460ab804892da6c18975a9996183f6b00274bc8deaff6fad673e0a932b10c4bc74623498c8d6f42444e8c4dc691ba1e41ad4272e1425652018cb675669eb206960e199675825d1f89ba10d041813662bf10240c19976d46951997c5d30a64b742673995e90a7ccedb54a0784a9f629a83f389504c697ea9175e3ad282f73044b0eea2bac607438494bfcfb46479905d901929ea1582393b41f3d46aa891f037f3f75edb76a6b56a1b3b0e7342c868e631d61511c55762ce2e072359cf7945363f5cbf076fdf7dab29b4ac2fc6fa0d645b50cb4d5c7ff39899f8448d762097a6dc141e8252bb95b5b23f53b63ad7c90e2f38fad9cf97354e6c95a5df92c22fde77cf41787839a062066845a12921e7ea43bc24a141cdffc7f9d46ccad6c73d7a61f2111ba70b8f402438de5c278c97042fdd053cd25fd08c42264632d6c8f26053115660cc1cee04bd8ce127ddcc0e2bcfdc03c7e17fe2aa259680663dff818688197dde938f94d3b12a39db12d702b0410f9b3d92cb5cf442f5968ff510b44998e001f8186e0d03c66a82a1e2c38c1a081237cb7e846222f9c668dafdd643b8c5662040c04223b34ce7e91e91438e4d6c80a2cba9b5a54db8d157df1ecd4d689a55399ec1bd64741fcce8e2829fe2370283d09bcee79ce43647d012ff34a753dab6379719cd58df2e0c033ac70bc516eb541ced2ba21191e2c5e9071e610226f17224f1d289c53826e359c7b29831a22406ced9cbf1066dd5123e9ea7ba7300d8f4d4865cbc38a496e6fc74187e22474ce0600a1218ca00ec12d9b3cb9573babe81bd35b803c7efa9a1d7dd9ba4803594d02766f1d315808dffaabba8e5a97be02a1913e8c79b7179cae08089241457908f77c6259c9db55cdb72d87631257be73d35bec2c04cac51ef9b683df8828be73852934cf6bbdb93b115d6249f8cad6873eafa2f600d32ac7dd17685d458f3a43366dad2ea929b5f011c9269703283ca7a274edc252a668b31c43384f7bea2957bc58590c72167e40fbada958d57626d8ecae12e5aab88cdf8ad84b4e514eaea0a825549184a39fcc3cba48de429acd8fd803d5e6772a4f78fb52ee0630db2b9f9d3dc192f583dad012b89c7e9298c02f3b7753f3adf5b9592f526b6c683e40db51c50be1fc1d375db001f49dd7fb9ebcf1890fe543b601b8df881642d9ef103177a7b64e39872\"}', '2025-12-04 00:18:32', '2025-12-04 00:18:32'),
(38, 'SSC Election', '2025-12-04', '25-26', '2025-12-04 01:24:19', 14, 7, '95920e898a78edf18491949941f8b494075ffc357236d77f037749861cb95972', '{\"iv\":\"70d17188aad9a1b566af1c660294ee18\",\"data\":\"325feb7de42dd861cb3149a08d8900cf62166b432d3c2cb5eb0698d52b1779a15fa95f52fa35e313063d1b807d74696af829a54033ed8fa5fe9db772cd113f0baad04e60b123c171b2b98ace409db990389f619752446f195b6d9dfc4975d4c4e0aebdd1472b72b01ae249a766926140485330f4174fc5d021a3e9d4d16c2fdfba27229da4842e71fa79ed5074290cfce12aad6804f8a16198ba9f74c3d5eddd46593e2ad1b41d7dc5d5babe3d4f30f9558946e612bfa26f1a175f5b3e04e513255de80a3e2dabafe470026e23fceffc5b1f76c74715c13d03c0b408daf79705cd877a8bf8ff5db18d67d257e03f7a912dfa688d3d609106cd571466faa301c876a4fd03431e0ac2b1fda27550d43117ea434ad1f06e2bd474bd7ad8c4cf118923ebddfc4ca1a0c9b136461e20cd7c9ca875707ba44fe9cf3a7c714e061d4ae2cc8039820aa62b9ff061d81ff533fd360b5e3290fa63edd3c1a7a5ea527b8b28539b2b92ec19ad093f187c4a4af784e287ff05c6b93c53c662824be09941aa803fee723cf47d608e310df1d455232f42b2df2ceb42989fea2d2a5d6ca351ce4a371ba1883d38ba33c698adc5986a7d4ebb3854952beec28d2035971d7cce90d1889cc8f24169549b7c8a48c7b169e9f284b2456677c1d9e07a71280e9b1657c1625da02716b6e89d4f30d86ded33b65f7688ca34fa23ce78ad03c8bc491c856592fde52608ae102585cef4b941160eff6bae0908050b42d33ac3016f38eabe08341eb2a2bfd5e8105ff3253fbb723dcfd05c36aa31935c321ca37dbe37b7c15ac12c1d4bb10a03a2be7ae931f8bedf1311b4641dd9fafe15bf248498bf07b1288fbc675a00071b79c9bf4eac5cb5448d1c7f46c6529a1fdc1158c474afea77fadee1423a8eedc3519a0486308212e4abe20f54cc1fa02240d3738de66580eb706f628ca3f8756a65645270a405a497d5c9c89c86ea2a6c9092c3da5d1a3e649862fc332ac9502fc8a28b6fc2bbd2f83d702a11a4a4b81d9e6e592c2822d6b61bd41001bc96686ae1d43a4269f1deff82d0a4d482aaf10e2086444fe38734b601f68fe38af7eeca9348f4d96b33034d7787c8d03673614e5cc6999619f4b5ccf4a898314b737c8d436402092eee07ae9f5c578ae0d188031a101abf8a657926d7e3e126695bf5ac8ed63d525d1e775b5f0e71d52c3d084a8f571d0b2e816e0b2f4bb175ce8062afe4d6ad4b02ad8d8a9d3d50692a47c2226658fd07fe2f408e7016873f6ec3a61b422cf5237bea688c676bd38350d707623a98988a90e476ecd5a398231d71fc9d1ff6d89176b2ed5e0c0ad440c24b51a2816b43f627b4efe1646b1a6793185295181b8b6e758e2f1c366fb1091df62432d500dd10e107d3ca61d0252289ea73f5a2889a01e77e07c38b009a1b49113919f30c66fbdd41f80cab5fee13daa769f64a2343063148a8054ceb86b53f15c827fe2abbf430b644057804d764e602e218fa483b28ca2275712dc19394ee2cc84a7bd6291f6ea166be18ef6e08fde7312192cb64c5e82768e5037fc425b219ea68d01971a33f7322fbf9dd9dfe3fcd6e024dac92488b48fbb5b3bb0f017c1e649dc35f0fd3e48c912dfcbecbcaf106f405ca21a23b692e438b5eca3fd04220319f66bcee708014d9e3438b8556392c6aed11bda1fdf9da060e36e9b8795eb1645c73dd301e0f66fef1d5bdc6634ce29d3d653d7db8d6a7e5278bb1daa6b9d005df22d7a6291d358e5a14034c9d9d6391075e031a694a5151deaf7b7430d59e9d569f24274e542f432137f8b4d05370024003ca11218986df9cfe357677570840732a2e88a6f97b64dd11dc46bb7b5e5240307c5a92ed3b49fc140d128b68808e0090b0555258d86ef5344559b671405dc722df93e7e555dc65738c91f51602bb0064309f08aa6e686df92aa6595467d56f325d55731c407d27265e0b76155b8d849814b6e2f4261837abcc59defa833944696739c2967371d44f05bf74c45747f2d958d2abbf49627fda1f11125c9ac2f5cf5d9b43ce2e13321e59645ddbac47d33acb873c81ee3d6dd978496e351eb45c7109b87dd2ac4f3a7747a25386775387eaf81856c34462e79e559dd8d080f73b23c20b4dcb7c9b53fe756fb479c29bd514f89757f7938c8efd26fbceeb4615fe94c363d48934cfa3b2bd3ed9086e10db3d1852d77b5a9ba81bf12384afc73bd10e6d4bfc83ebd71921630ab4882a8ee37b448a22994f65e744fa20affa2e1c235b7c6898a7d66f5f28ce03ffc3cd0df013c243c9a0d0f6a12b8af1222e2df7bd057763ac2e6c60b5f8f5935a84dd251b511fbbbf8ff9b3afb80be85dc36178476a476064d937b73b93e033199f19c2c0922321d8b3dbc3d903f8a51170dc07fb694cd52287d54a1a5cf528212ab62ea8519b07549c1c5c4f2a19c3794326b8f2a288223182cc3b4e5a54319ac11be7e2922f32fa01cfd07f7b3955d5884cc5ead8a87591a2fd1d9a22ce1c92c3e9d8c663d87033510abf7b26985404bee7257926d2aedc945f5c14c913df46ba838a3589ac43bd946c534173f636bc11ab5a9e91c96be0d754583ff110a07a6995c8f2f90c5014f40373285a8f3c82117e9c0e531290feb4d6cb301cab968ea78adb33a6dbc1a654fa98f36e5442b08af400dd6881755db2807849013e93ac8bea8eda16ab30f83e3cc3ea0388401e949535eed8201f350ac84f2a3145b33990e04bedc03ae382e813a972314d7c6f61678f3f1f1f944c6526a6698fcb7afcb3c20a4d1ffcbe74da6014bbb2145ec4990cac972bb70586e6d2a6cbfa80e17083e1ad9725db1f33f81663ea6be93e0529c3df5762a234082ba6d20b291eb15608abf7e0d7805d77233d61d0a8e5ab08df0197e5b9d235e7da72f697036675ee8de4c7fede32ab56956910c7bd7489fd8010e1313cf9dfacd11112bb081525566433d7c0a48109856ae386d24f12d9a2ffae11b156183c83b48d1e9460bac7352af89f671e89089c09faa69b928e2bc34be655cd1e63ddbf10bacda48a46b3ce754e6baa12b52a393be1ca82a920e213ccf1d4c21370df6b941cf11aceec882a64f3d3a6bbacb0bd8ed685a1bcf6bf57c8ca3f076a84b1471a33d4785008c7e67bf7b70f74a54a48ebcb85e1dffc39c1bebe3d87c60af36519b9da7ec226c2130ab259f504ee42cd468cb1c48ac52e6e973cb93af92dee07eb6bdc8973b395e8fc0b5f8a0442b7537a2f8a4bd62478391a03fa57aedfcc4ea7249c7e1466560080b0943121d456a0fe480ff2b69a4b0564a29ab068e6f3ee856dd5003c69aafe7c29db46eb40125831bce2e4905d5707a117ae995e212ee2458411330fe961488d4dcc8572415ada9db430a51a0a3733ac4f6eed090f28dceb0818e3eaf2632cea587fb16f3ccd1d2008f5386194d1d40bab21221ba0d699e0cea5606cc3a2099ba2fb2299815184e26303617b660adabee7a34760a3d70c6adfcc2bb8cd368195d04d47f54787c754bd2e2f7487a4600c25a93ccf90896c2c38af4a0b91ad7d70c64737b4e974ebaa9718a1eb66fe6bb37b94c3e545bf6ea972bfed47e736b759627973238b7cef45a82818e92cc06e6465ca0e885b208b9c4f7948bf6c2fcbad8227ff6c3e81472b00338dee457d62bba1e6d9607e22a5291b4571ae61f5118065975bfbc2b3f50ef44a4b39e77e4f9c8dd909a830d7c8da24ba40255cbbdfec79cd7b79b368e78308b6ad16c0a803a248e933a05477fff58845e5cc6f537c14111e7f8e374659845756295fc9b192e825f5d113c81e176fd89cb9e4e1c0f506d3b94712fb65074bbf8f8841cffa8b6f8b79a011bdf30370fad593212f17a03566fbc9872cfc0a85992d6df0c5893256748f121b3b42ab62014cc5c7a255250e7bb4e2c4c9244f172efa70b4846c04edebae95561aa079ff76a367456a0c85359d345d8da6d9d24c5832f3b0aacf69eb34eef69cc993f47fc496e5d1ae2b58d42829e122ca036c7e6a66b4489274e947e24adbfe6c64aad773dbeac7f08703547b87ae00a9d29b8d20f57a2d4256f625c7eb2ed17f72ed5f0fd0b4313173f7d1a663e79e8bb69d7fe69ca43f448108cff91e746184ca4b492d26989fe7e967b900633108d1d89d1ef3892963\"}', '2025-12-04 01:24:19', '2025-12-04 01:24:19'),
(39, 'SSC', '2025-12-04', '25', '2025-12-04 02:48:54', 14, 7, 'aad44b68994e49306493f5c5cc74a93e8c90bf4a31b663d14fb4ca7728ee422d', '{\"iv\":\"310dc6d248249e1c9e50a1cdcacb3d35\",\"data\":\"58ce7b4ba673a221db14f3e153776d6567aaad1df034234a0bae82b8b4a3d9fc3299bfac9c5300ee6a2b09c1f9e535b8637f2eeb58f321ef6f480e56bb0cc3eed30bb9f37061a9d87d7a00b323e51559611b0bc48597e49e39631b46e0266343a3c54568c7aa181f85f0afe59cd7204f8402a7ea9cf420c70275307b3ec704353428cbffabb9140ad69e71aa02d59a50e77bb1e737d9c4f2440361f86e9caea61b0c7be1c4ed81a7c29712512b9e5d718b79a9880e290939fcb183c821cfcd2e058eee7c95c452a473281646bf910eb9cf5a0a7be71acf9820c9e521f62a0aa1c34eb287ee92400120cc3c1541cfcf3f971692debf2050a92d2a452d8324456f62223f42d8a3b47b6f9b2372aecade1e6aba8a347db3064fc3f721f9f2aef61d3df8d08b3fb2c3a29b8adfc884269c1f09123633499200fa25e5dce286392784c89b799b9a4c26992b51712f1a3497142eeba789481ac2a2f00f1bacf23ab26fe133143df5e897d2553109e3e7f2c135e06d792161d1670776c8cdf009c5ff4fe798796632fd2ba13a6724cbfd5af2f86294a27f1f0b7054a6afbfebb994a270e26e07b48cc9d2ddb8c778b9c2bfb10bc6527d4307a667213cab11ab93df14093d9c500fe86f93662b11632eade5275d19ab72a0155a1f07ddba332f31ebc605651f209e42cf3c0f005da83e8264131170d1a2d61a3dcb3abf212d17f06e2507f8acabaa66aa26b926996ef8ac64034ee932cb888f5582c603fbc058a7d6a3b7486ad6fbd89bde4683334619f75def302ef7cebf42a75b636201911657497c00cb35e567c1070cbdfb185e3d98ed180871b81b27c3e4ac4868e05967d94405eb347b67dbd733bfcb69122e444787380c93b21810add7026c3d9c696fc9da1fea1d3bd9266393a12fd53ac88897d4c0e38c87ca6e07d4f870663b1077b2b488ff7b2c055394f57ab293498a832a2a880a0b681c32a878030f6e43378aa818506095040a8f2a4c5f72affd6f7ea86fe34458e796af68bc88614d98c8b80a15305e793bd5c75f3679c36cfa82738faf43cf47fc771899c6a05fadbb7d8156283717cdb961cf758ade6631161e37a29439c6f401aa042c0b15e485cb587d6480a656f69e1bd8a9e03cd5ad66196a3bfc123b33053549b12ca9734ec12e64110f84326e4800510b19512aee98c00601811dd76f52b71ae37e5098fb94d61326d019a6eb2089556f37ed553958b986e5228b7f00866bb3eea332d3c3b01deb104444bd35bbc7a4779024f0d5ddeb63dc5495e32b9c5852e7faccd6f05e257b14e2b7ff094fd281a7043cf6095f4e1a3712e6d898d01356f812e738832bbf09339239357879dc0fa5808ade4eaf24b93fac5002f2b92524a69ff9b7089bc44947c3a8c0d17a09bef63e1086609371b7fb4f974d292fdb331bf7e25f7574156a4e71aed354d03b63385d9990c9bbfb7116d7e72e464a79b78ac63a4f1277dce223786524ecda7968e67b53f78e7374c9ff9d2bc614c83c9cacf9fa9bd1f81d125f68f1b63de8298bd85c92b9aec1237a7ea3d70c018786bf3d072cbd1a29880781d0f63bb825bd282fd4e36dc680bfe19b3059b57e0e0fecfdf613fd1240cba51e3f79a862b01778dfa6460910e68b9a14c1a3f67bc6dd220b4056bd43b42b6c3a8957b1489037bae8af4620eeff22293d83e09659142d83efd0cc698962da7cfba5dc7d4d7ad219581a71726b4a6852316170bc1349bfc6bdc939b5fb4ea8feb1df7f59a56b7d388f8b018f9fa9c5ca89ff708aac191844d8b843057438d479bf76862d565fb2758d83c6b6692d9ce1e79d3d006d476094a29ebbcfb2f95b347969150d4dad8af9c0e0c17ea51d2b1c527141263b74379f3ed21dbf6d9a468af717a70e57b883603f303c272a201577ad0d64b6acaf314376b5ef83f682eb57913c07367ae033d89186c144369b080f991cffd16d833343a4abb353d64fefe537a52b5234b2368a1b386cc1db8aeffae6d7e8b3bc26f12325f5760348166a4fe827f7812b3240dc4b286cbe182b394e3c0d0de8dc8b616d06c078671bfe1c06082cc7e820e4bcad3b98d121ccd5df3c734a4a99f841b8e0b3c81722b8dce9da84bb1d85a1acdeaf4c183c6fca2c30c47a6b10de71d17dadc46d247d109b91809b5eaf1d8ee1ba30c1b2676d933022fe44b63e372d41bb2fef3d08167425b6f55af14576dd3c8adb1f890e10a78fe1d3c13ca0e4156c7b864fbfecec3410416c4397689ecb02d1969f2c2c78284ff9d972a3ab67c3c1afd858b17c2a44c1c0ae52f384fb818d434c4fc889b55a4988e4ea68d08a9d4b5f03292068059be1903a198406cb1e28961a2aa7f43bdd3d271b9b95729c3e5b41fa38565a374a85ba9b0d1254379355ae65036caac7bc2992b653ec119978ffff3cf70c535068cb39706d69d2df02467a6bebe33384733d3feb21be2977b9aea005ca75000737ad910601cee4bab216f9c407558cd9053a826053c5ba5442403d3ce43ff724bec1f45fd92b558296a6ccc4eefed7b50ff6584915360b6fae53e66783c204ddda53f00e9ca826e46d7eb0794d8e98a05c79cd782fc4edf445c051deaaf5b84f792b7596e1f37f99f0be2e6a0621dc27d00e0008561a898053dd8aee5893772a5fdd5c5eee87f77c484abb7ff6dcd99b7f738c6cd424bd029c2d88f4426e856d4e0350faa06cd637ca6ab8590bfe85148c91baa2403d2359c6a1b06f9ab5e353c986ccb55901f6af1ac7de757a4d837c02db9cd22d6f71863e2509ca6a546fa5fea0998148cdf11b2d702e7b77512b9a04e907fa4b897bbda72f056a6c2b353bfdb38809ce9bd52455f927fcea27c0ca93fddbcf68d417fcf5eb28197fd717cb261920b5362bec5d197586f7e9ca9398b8151f63aa6bd0fa32d6a3b7b4539e5c6847a1f131d83ea11484c2922746ac5057d156b8919b23235312dcae83c195165e38e257a4e2590efcc71186701fce6ccb67aab146d13c8085abf5bd268786fdc1d0e20df276a1be3097650553ef36e855bd562b2eee0e20cae5138ebc3af0e7eb56a3ea2552e4cf2addeae0640cbe15effe07559ca10497d422c1f1cedac6233f8928991a186980d585a8aea1ddbeee80510b99b71d9fdf4901ade977a6847c941135459a14aefed705fe15af4956c38383ef7e3df28f4ccf81cb862b7b258680d73c1d2e4386c16f8bb1dde2ef8397345724c67bd966e5c9719eaf2b07ae5395685ca580f3bb0b6789a8bbb59a4d4f3f4b40fb01a7e5069e63b4b5c892edfb76e02a7f1d6df390ae318b98b5ba2dd997a40cfef2428a93046bc1ac647c0be9f7dd4939b71d6728c04fb09b761914c1015fa59947b797ab4bf2430f95c080b64f9e874319ef5ef0450b536a4132ac7eae5abbd58d9ecad424f8c3a746b3ce965888e35c6d5733a1107cf1fe44a3c7281c879255dd63585026958923205c5e9899cbb86bc38c06f8641e7c3789d5ac04ae5d46a103c7b643dcbdace4c127c43b349ea305b6fb021a21dc43bdb64eb17121c4095d8b70d3b232495116d72696bcd1cd75e271a985f27994dbe2f604fcafdca383e23d8d1d0b60be14e71c110ba8a977d9ebc510efacbb392abc92ef513dd7ad98e02fafdc4b1b2db5bc05c206091fa312fe10568e1614280f1410698492bc8022c747ccde60703e709a74c92d47704af2b7def13cadf3781110d0fbb987614b7d40a99c7a63da19bb27734ec31eae8662d3937ef642eb98c2555110835c9a6f402c5701f037573510cb13067c3681d08b01b233154909fb4994c9e6fc4e0341ad673189aca8718dac9b6977835a0250351225f58916aa9b357f6a8a40e8e5e2fea12c9ad1c5f05ce867bedf435b08fb78faa67bb9869cf4cd014ab3402ce621315dbadb24c88b8b8cc47da6029d2dbcfedd43eee94c7085ac9800c0effb3c0af526deb19b73e0c4d6e5ae449acc5a9584284d896bc591d73d7e8e2c1d53da56e74d61e1fe820d60c9126caefe9501d41bc8e5c8ba2f4b21f5db46baadc3060401ccf838e260dcb7bc4b043f5ef282297fae4f00398f66604582a11c699e9005503971e6ec36f96cd3460df8444dd82227662387b26df3611ea511645afc9f6a044700cc69e1\"}', '2025-12-04 02:48:54', '2025-12-04 02:48:54'),
(43, 'SSC 2025', '2025-12-09', '2025-2026', '2025-12-09 04:28:33', 11, 5, 'c70e93573787daa3663041a9849acf3510976379be8bf45a6dc7846168f4d448', '{\"iv\":\"d48ebfe2b467de2bbc5a144533a85062\",\"data\":\"52d16836530486e7a2b124bf3ae42b559c7f5f363bef255e1e4c3446ee587a8532aa8d04e3f59f79700343c323e8381cf15251c287f219de51701c31c5d48e20a81eb1d2991c98c21321ba5273744b9cdecef1cd23adbcf861f50e00df3bd5970d562fd4c3b87ce82b0098525a4aa3e905bba606950e50648f889763e9188c58ea73ed60045bf17c4c985245e79f7a37c822d6d94cc326036c17a41562e83c17d6a5a73870a86df0bbc9bb4ac68b4427a4b26dc41be5c5a79c159b78f69a08257d486a5ae569065d56845f0b74a12ee5c2f1d611f01a1aeb438c90d2eb8aa2b0fc58fa083434ced2bc51ea5d8cb9ea5477d0585d98d751e11311b8580ca511f7fad846916d9b6418de908d8fa90b754ec3c9e40dac4feae8332f088557305a9ee765c6eb0a6c16636eb9bce68d58e0c1e5b5974bfb690b64e4dc2d8fa7312605a1339f8817a2780b68c2232f964ff0f264b3f2c8bf1f5400eeeb698c7247d6c74eafcbf0db9268c43d36f2d7d1a7a9028f3951ce8099ae316552559f334527803fac228a43c7ba3828277481a7fb72440f47b745cd9deb688d13c7d0f6d766b880fb489fbdc4fc8eb54a8ac453f8340170c4b06bf85e5dc1cf7e41676ebbc487b94854e14dc6f35aa530af2f8d60a8f84edf1c112f3a0b544f46591b2490d591f103571c6c378e11cc0dc824f30f4c54cd2c0227029f1ec084b0f9777b2a92178d6a3f14abe6eddc1a81ccfba7c7fdea0a6ecd39c7ab4c55c26030500ab75f37a679bbfa213a5ac6f466f1a2c0f4b7413323d519e8dbeeb7bd409ca5ed7f938ad8cde2aa393ee42772b8a0c3467acef47f1d36636df473d48b3e8a77a9fdb10d393261201c5c55764c9a120c0487c5e8cdd0afdcfd7ea0e48adb71487c718c37e8e7ce7c4cb830f0a148775f6025b8b390a1fb854fc9045c73d563f939e872c9cb6a0f06b85df542c42216dfe0839995f52eb2821839ca9615aef43dad7c0b1e66a46dfe9253913f2e6a4a6d791719641dac36c0eb5e91f9c5606eb555b739797047d1287b555cc014da14b5764936ecedc5ca7376056029a2837e5eb81b110c3cd6b703d1f4e77ce9175fc761948ef0411f2705fe0b99f37fde03a009303f914c491c4d05cdfba512e0daaccd5b382767cd6d13fbeb70c2f2c6a543d4614ed460ff859ee6274783dde85bb6596625f6bb8464d7608e4f4ca347bb96071f4132ef90e24480207b40a04138c836f61deb318c690fc22980b64a7bdb9c5c7e3ee3a771269fe5de4147b11106f2859a59ba7c6b414e2d31ab0b4a5ebdd74a15911d6413af30242820c708a56fdaca54088a059eb793347b9d62bf2b49a77b61c892476a25f2636f0c18876fb9f184517f16200eca261aee45d6d9c49b1d7ad8d25ef65ceec59a4d81018718471e10cb6cee7c3fcfc951ad98f6b2c9ee85a06805deff1065e47b49e7f8c5ca8b5e700e8f112275e767e36c72b40cb97810a8183ed084854f85d479b38428a8e0e4c8d99301fefbcf33480b70fb35048b00d91e60843d3353144ef911bd83cb959449d3e64c12803d327102300629adbac785f92f7cddcb5fe416386bd8d75887699bdadc51f3880709169cbd378826d7b49f9b4e130f07fcb316d9b10251c19ea75130e407def9574752834031534106e133c6c999319ec6f6bdf9c9825512f0426e70ab1725e230c0894522146ea6fec943ad9e0ba7b52bdd18a2fad554e1333def2d9974ccf4f8a7cd993fa1950e7c20777bd8adb4b1af87c61c27a5877ba916a33e85539cff7c7414898addb8499edbbbbc0767a438b99b6df7cea48043ed030c38775f7426442229a0d070f33de7e3b937b7de483e4aafe509fdf7ac30d094e588d685cdba209f625a32db19009b4cb2f05cedbf0822b10e78e5239e02dfb4c6e23679929caf9ed41a6a3aada867afe4167bce5f94c380b74a9efd5452429c8925b26af05b1a31e6304f82f45c18150ad647468887b42de9a0270b4d13c6b980c6822eb53eb3567947d0fac42898c886b57e28ac54da7505330fa6f410ed820082e64809f6f842fb8b6f3dd1d8aa2d119f32a65ccf01e04cbd9cc027948098f62132ae2e44933709f07a41180c9c9920a44e9ae5918eeacbdb9c85a5b38644cc9039e7360a68b01abc1b1001a10c8ff273c97da871d717bd562c2b1429a421bafdba8f2f3c9b15142ea1234ec1025a00b556eb8511af7ebff34aa7b95671826b2a1e1d41a3d4ec92811f02edda781f02a852e187a761ece8bc572c08c85f1dac339f46948c0da53e1bed3bfbb7e17b0240b9e1eac12a6ae625255572559788fabd636f132d5a4c74c249e9e363d7f50d0f05fab623b7d6d402d8e0047f46afcc30c2be9bb6c5d20f8fa612f964dca8d8f75abb8d6b49411b491ff3f00be2675af56d2745f43ff82cf0ab443b6ae50687ea533bb7970715220ac9990a4ea2279554a7cf21fb622914424c9d0e210793bcbddb89399ef0e8f5804f5855354edbe04a3f82e290065080596ba08fc6f0f979aaf8269eed378c7e6610466e0a5c2972fbae31143232782cf65c5c8c200cff5caac5d27856d6364b07139a9e07b01fcac150110ffef77affc05f349234d134e592d8f6f0ad659a2e452625d1a8683574f5013f161dcd079c1b8a422d95a7b47031ed62f4fce0757f9b3275f5e5d589935aa166bc2d124ba2fce264265da58b9c0e703796ad3825e9804e3a0fb0860ca638e1146434ad0ded9f3fa572ce36105371c003f350cfec7e6b03206636a91bb45e2a13ddec11f088bcf62dbbfa2307d823a8edc67e2f91fce5b906ee01d48e5409c551325b744a0bea018d116abd23b65a318a126e6bd9c330c3ea1236e9b3bc88432678023f61a811a31e4d9db4a84f326dfc8dc929f429c8f57da614a2c38e16cd4bbbd5f73de0509910efdae66606bd2ffb8b9b25732acbe7a8cd406b4f24373154d335af49f5fa6efbf6d18b9c9cd444dad9e499c05df2901f811f46111a777ed6bfdd7298624a2bb8d7776263b91a974e590e4e36291ad08692c52c2c46b5cecfb5caa82eea4c3111a7bf9fd5139e4598db6dcad9dc2369bf2b8abeb809cbc4d101f746166ec6786a268833ca787875fa1e51b7900794b1266b09b9fdcd45dcc5e497d2ca2ded0ad5857f59fb85bfb7378a1fa2f417b62867ede6981c6554bf0b532757fc4271e1a11c8be27378ff6f3619ab387a2ae94fc6897064dc340f605ffece5864c1bff87e6c0cfe68e7844442a2f51288535149215c7daa3b63b1e0177f8ac2f687f001bd3463c615b4007237fb4c139f70e4b338b851675ca137a350f93c1ffd24acd7d8cbe5cfde9b13b93e230cfb68aaa32a9d2e503775d27eba43\"}', '2025-12-09 04:28:33', '2025-12-09 04:28:33');

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
(159, '21-10241', 'June Lian J. Tampos', 'BS in Information Technology', 4, 'A', '$2a$10$UY2OM0rFU5SM3M4bdwsWCOZnE9pQJflxJWk4bDVWMOphRwVik5vfC', 0, 'vote_1764778779010_lo96crncw', NULL, NULL, '2025-11-25 02:53:40', '2025-12-04 00:19:13', 1),
(160, '22-10640', 'Mharlou C. Escobido', 'BS in Information Technology', 4, 'A', '$2a$10$VuTSJx0m6Ywd00C0kMr1Teteg1f1oJBHOz/yXdgvokDJbP2UCsAn2', 0, 'vote_1764817526600_j4oikm3qw', NULL, NULL, '2025-11-25 02:54:08', '2025-12-09 01:38:37', 1),
(161, '22-10553', 'Joshua A. Tan', 'BS in Information Technology', 4, 'A', '$2a$10$BIsJnNi19JVXorpZ77RhtuD4aZvhleuLPqQhtZInMgoyBD3/C0Cem', 0, 'vote_1764777539684_uoyjiqlrg', NULL, NULL, '2025-11-25 02:57:37', '2025-12-04 00:19:13', 1),
(162, '21-20002', 'Royal Hanz F. Caca', 'BS in Information Technology', 4, 'A', '$2a$10$BNO/s4STtDXnjSWk8tvFnu5/VsjxKirXKOg1VgGqpeMJ/CAKb8hEO', 0, 'vote_1764129081568_t73cvxdwh', NULL, NULL, '2025-11-25 02:58:25', '2025-11-26 07:36:58', 1),
(163, '20-00000', 'Kenneth J. Dugaria', 'BS in Information Technology', 4, 'A', '$2a$10$QOWr.L8.xfovyEBb5dHxyuF83PWrv0yxsyEdIgX4VPDfWTnqottdS', 0, 'vote_1764813498415_b35ayypcu', NULL, NULL, '2025-11-25 03:05:16', '2025-12-04 02:49:26', 1),
(164, '20-00001', 'Student1', 'Bachelor of Technology and Livelihood Education - Industrial Arts', 2, 'A', '$2a$10$9ZZGzDGXUAspEzjGCdmGDOjFGhVry4F5gsjOly.3Ex6DuAYjxbhMi', 0, NULL, NULL, NULL, '2025-12-04 00:19:31', '2025-12-04 00:19:31', 1),
(166, '20-00003', 'Student3', 'Bachelor of Secondary Education - Biological Science', 2, 'E', '$2a$10$nph50pK2TBsklxj9De3LbuXnrCeu086eoovt9y4mcnC0RcwP9DzHa', 0, NULL, NULL, NULL, '2025-12-04 00:19:57', '2025-12-04 00:19:57', 1),
(167, '20-00005', 'Alyanna Marie Espoltero', 'Bachelor of Secondary Education - English', 3, 'A', '$2a$10$Nvl4.LaoLJJb9yewCJOjhuODmjAmM1rR9Gq2v888C4gPz.bMppgTS', 0, NULL, NULL, NULL, '2025-12-04 00:20:31', '2025-12-04 00:20:31', 1),
(169, '20-00006', 'Jay Lou A. Terante', 'Bachelor of Industrial Technology - Electrical Technology', 1, 'E', '$2a$10$oB6UC7WZVV0sN5ggZaJoEeGP9xYHVeC/xxPHKkGa79c091.rBIp/e', 0, NULL, NULL, NULL, '2025-12-04 00:21:01', '2025-12-04 00:21:01', 1),
(173, '2025-1234', 'Jerold E. Mernilo', 'BS in Information Technology', 4, 'A', '$2a$10$ue5H/tGzdRK/VwvBJozK2.OCdtPU6T2DNsr/hla3/cS/qGr86lj3C', 0, NULL, NULL, NULL, '2025-12-04 00:22:21', '2025-12-04 00:22:21', 1),
(174, '20-00008', 'Catherine E. Medilo', 'BS in Information Technology', 3, 'A', '$2a$10$UfCuERK.WeVjimN1ekxfEu5TzwDEdbC1/AP7QRdqGvjyAshLlp0Aa', 0, NULL, NULL, NULL, '2025-12-04 00:26:04', '2025-12-04 00:26:04', 1),
(175, '20-00009', 'Kristine Udtohan', 'BS in Entrepreneurship - Social Entrepreneurship', 2, 'A', '$2a$10$Mzab8vOJk497IhCn3.kyxebdbFsujJvkEJ804EiIFvvCU6.463.I6', 0, 'vote_1764817473503_7yejdf3f6', NULL, NULL, '2025-12-04 00:27:04', '2025-12-09 01:38:37', 1),
(176, '20-00010', 'Cyra Jane Seco', 'Bachelor of Industrial Technology - Automotive Technology', 3, 'D', '$2a$10$d76LyC2hE9T3psHyYV6aFOcnsQOyVe0suGQ6tQFA7hXY5eOEiqdzq', 0, NULL, NULL, NULL, '2025-12-04 00:28:07', '2025-12-04 00:28:07', 1),
(177, '20-00011', 'Maeshyla Montajes', 'Bachelor of Secondary Education - Filipino', 2, 'A', '$2a$10$JQVReF/0vO7aj/aotgHWuOFty9QWK3TtENgyVesZGZ/3Dfgrn3Pey', 0, NULL, NULL, NULL, '2025-12-04 00:28:41', '2025-12-04 00:28:41', 1),
(178, '23-10253', 'Jhon Paul Gazo', 'BS in Information Technology', 3, 'A', '$2a$10$PbXNypu.LRSUxtykizEhYeDqS3Pgbhh9NnVKFkRxqSCK.Q76gAmZq', 0, NULL, NULL, NULL, '2025-12-04 01:29:30', '2025-12-04 01:29:30', 1),
(179, '21-01234', 'Angelica Mecate', 'BS in Information Technology', 3, 'A', '$2a$10$Mn8oAAjrHCX1e.al07s.Mei/KigQnuM9Fty9EThISlq8BTbnyitfq', 0, NULL, NULL, NULL, '2025-12-04 05:04:41', '2025-12-04 05:04:41', 1),
(180, '2023-023', 'Jerald E. Mernilo', 'BS in Information Technology', 4, 'A', '$2a$10$ahiIN1l6CmPV8C4Sq3SwY.zRWtFTnvZc/PEBgfOp8QzKzqMvOs24e', 0, NULL, NULL, NULL, '2025-12-09 03:50:18', '2025-12-09 03:50:18', 1),
(181, '2021-203', 'Earl Espina', 'BS in Information Technology', 4, 'A', '$2a$10$k4NLe38V1ugugpHobiOodOFb5C2lcTUClqHpW0C8ccf4yTKmUm1fG', 0, NULL, NULL, NULL, '2025-12-09 03:50:18', '2025-12-09 03:50:18', 1),
(182, '2024-021', 'John Paul Tomada', 'BS in Information Technology', 4, 'A', '$2a$10$Jdp5yrelbSXl2uEdDdTY6esLekL1psbLEzJUZpZpHG63hcf1Cqmoe', 0, NULL, NULL, NULL, '2025-12-09 03:50:18', '2025-12-09 03:50:18', 1),
(183, '20-10076', 'Servando S. Tio III', 'BS in Information Technology', 4, 'A', '$2a$10$Ljx4noQSPjX90FWJyQprgeWLQ6gUzHSBXFZNL8YEBEPxq/lKmy1Du', 1, 'vote_1765253867297_0dbk9g9xc', '2025-12-09 04:17:47', NULL, '2025-12-09 03:54:57', '2025-12-09 04:17:47', 1);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1930;

--
-- AUTO_INCREMENT for table `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `election_data`
--
ALTER TABLE `election_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `voters`
--
ALTER TABLE `voters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=184;

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
