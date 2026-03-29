-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 29, 2026 at 10:32 AM
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
(16, 'jaylouterante16@gmail.com', '$2a$10$jjhm5h2yGYU4NjlBrm1M6e7TOFPsiHRbNVN1.JHvStRsGhbTbDGGq', 'Jay Lou A. Terante', 'admin', '2026-03-29 05:03:07', '2026-03-29 05:26:30', 0, 1),
(17, 'jomarpalarao77@gmail.com', '$2a$10$d0JXNG7UmcMJM7dvizFAiu1yC8pyGk/X6fBLHImYprUuv3YWM5Bq6', 'Jomar Palarao', 'admin', '2026-03-29 05:08:05', '2026-03-29 05:08:05', 0, 1),
(18, 'remediosreyna04@gmail.com', '$2a$10$22zOldufbtA5yuH6OxcOJuI3pOEMXMlL.sjoxUpQgrjFimbPoTDvi', 'REYNA DEL S. REMEDIOS', 'admin', '2026-03-29 05:08:25', '2026-03-29 05:08:25', 0, 1),
(19, 'monitor@gmail.com', '$2a$10$iXlRFa0wiFtJwGUAZwZwmu6hUjmC/62QXFL7KukvEIKibmlIJ9906', 'monitor', 'poll_monitor', '2026-03-29 05:37:17', '2026-03-29 05:37:17', 0, 1);

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
  `image_url` varchar(500) DEFAULT NULL,
  `image_path` varchar(500) DEFAULT NULL,
  `vote_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `position_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(22, 'Nursing', 'NS', 1, '2026-02-01 14:05:50', '2026-02-01 14:05:50'),
(23, 'BS in Computer Engineering', 'BSCE', 1, '2026-03-29 01:31:51', '2026-03-29 01:31:51');

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
(65, 'SSC Test', '2026-02-01', '2025-2026', '2026-02-01 14:27:25', 9, 23, '57c62bbf5c43aee19b56909deacf7a5b00d6123a8d3355260cb0246009258861', '{\"iv\":\"4dd2a1c5a1a55e07801af17709811cde\",\"data\":\"c4af6ab9756d081bfefd6618f37470b00e5301272b1e1b621b3548dd3e41603f2622b44c29687df3b0382d21719bcdfe9cf76b03f664ec2408c855abdb1c022a46b2c99025773b7fabf8bae4fb1a428dc21eaa160b3d85e7b8b5cfedc9616ec0dac5dc0e447ec54e9770878f2a548336cc6ef9fbcbe81fe24b4b271a0fce189c26fc91ee92c6615091ef6719ab2bb518fdd9bb509a1e5a3c2e6b180a448c1d82d4d346bbc552b381f0c124da8890993fbdafc0daa41ec2fb0533c65545f18625426bbee43cbe351547897287c0891afd7c0341be8b00a7e3745bfd2b50593666ac449a6e399ef88991e190ff421730146267d3e63bbcc30c28bb4abb4a5244ef38864d158a311ff11848f440c3d0184d884358441bc087b3ce6aaea0742d2096851169cb01b8199608d32f4ab9d97191b83f57c07b2ab013e1749f25ccc05307ac7686e58abb5b346f1699d678572a84a5e38da7c0d52d2617b2c9ec3cc11b307c39894b67bd1ffd58e102760d1b7d6c18972e39163c5d6df2fb977ac03a6e13d6638d0e81b2374026cb83a8c342b11004f44e8514406433f1ebf70960dd44cce9c2c0c54071bb85fec6ce38d932e5dc90f39ac0d2a3dcce0f58a6ada1876d36241fc18ffa500f632bde9fa42a0cb46061941af5e6a9d494238394fdeb37d7c37e5805bf6b6e0f1fb9c3f9970cb4990fbd02150c867a2cb2032c92d75736ce70c1dfe3e79ea6a9b6892ac605c0cf7236592507ab43b865fbfab8e45379303271fac3b6af9e6d04972e0da79d432d399c9b768364d97af047e02c0c87be0b3171f62e14ed523b1e5542ba652f8ea17df100bad1b5569b345bbdda52490e71f60c43a975c7b2bb1c65f310754451f064ec9c65f3c7e4fe746f3dc899e1098f92dedca90dac5aebd7415ecb72bed6b2d16716219e02897aa078031cc60194859c7cc8183a5b6998d5d0aa0423946430df05f49c852c24c017da3cd5a51d5fd84105a6e7b0acbd137786555537e77a0e408b075983232fa952a20557075e9a13b00be2f3e401989ebf499e4cf629553fd65edb9165aafab29de6d34950df6c4bbd0dc2169ce5e13ea826e21029b83ebcf147cb3f9a01b93522f5344125b631ae03b9a06100d6270353ea69e36e7c8a9e2e5eb04b99ac6e2e2acfb5bdc6a6e2df900ad3ee838719012c6d9cda523a7018cc1b7e21256917b02063c3336a2579e9772167b847011ed9b280221ada1bc8ac71d82b2143ca4bce0dfe62e3f7b9693972e7eb2b055e48c2d978a6292dd1d4148ede01ce6dcab0b817f9f82ec43987b69f86b13ee9c696f6181a9750c30e57832606b2ec475448e2b41a21b9acc2fbe3de2cdc7f465ba28a58ea938964d97e56b207db537c72f1dedcb13819610dfe7a520ab9f542af4f07f5deb0e3eb346f6bb686053e999a4acd96f2111b3907962c5e07c3a822d23c51a968ff9a75fae9cd3965858d77c77a236702669aef2df5eed3a4613d14693298afbc85d778c314ef8af9fe3e1d2b114193a4b1da2d551ec3c53e4bfec610c4e1e13dd4cbbc29c94b57cc5b8f9d7ed478e1be3d565101859f0fda782b15c172ccd6653faad93c879aa6eafb2ad993fd9398d236374d27ee8c6e6a633419d692e952c624c7c06a8e7742d10d84e1d0cf3f674149e93ad05535e88d561d85033f32bd88c14d1f165b8cb79c7922304a8f598f5160fa4ac55a5ddf49cc317003d3b8594b309a4ca938cc5e14c3c095029b46315fba4af259fe2b42b666d6baa179988051015cd3e21c49fb393bd0458ad622390eee7418f2ecfe50f69026066724f1744d59edeabd6f2b5d0d1445437909dafd1a8b1eabac7609a52d39302187a1faa44b99715926a62937799a9927e6efdf0db60859c18f98db2555501f2c985d336059c11cd6d3da1889e0ae7ad99b125a9d12c1d9f81a6efd376ed069147d4bfe229f010ad9d8406d9775a0300382552254c4c2c6d38a7ad37ad73cd7d004187a40c45377f1afad89cdd2a9661c0fbd39e6a3a103e4f00eadce61ba52123e52787a3567c04ab402d7f47dfde6155ac3ee7a2c42b5b5ec77e0ade8b4f9e7f00baccc5251ee80904102a320b0525d6f550ec0c63eb7faa7f3042c5498230080fff564f0189c53f6f67c4506e066890b2c1682e019ba746a12fb5d6bb6ad3ec2a62da7e33340456dc0cab5b00e496ba3e4a333f04a6a97c033c35ed2bb969f7475089037e5c05409ac1d8271c664f08221c6ea20c795abfd8286a6b103571c9dfac433d897a2f22138d232f2507f70eb9bc361e3f9e6a53bdf6101ebcb4a51c2964b94f118e122c3c0511a6fc2b5a0eb454957aafe05d9588beb0ace0bc25e62576449ac9127d8d1a7f6ba38a298092cde5579d0ceeb4bcbc0e42f88df6884778efb1f010011b968a3bd1400f39474fa6099dbad1292e98666346e05cd4c46d3c2f83d681ed514d47f6d7ef6f2faf806f37965b0ace271b8a46f51984b727b3fb09cd39250acb590fc67c088798c0825f49b4c0cd5032735093eadff31e650774b308d0e2318e9a0f5c84aff1f3b87533970c351ed77f7256daedbde5805c77b0761d65dfbdba1b11368b915322f1c2110340bfc13a760d72b27c6c1b17f0d8fae46d8086829b1794cdd054dfcb10fb14b8020e30c0e9c81f51513e1dd563c2654b66431d56c19eb907b3ceaac159d71d41d976c3e08291de617c4e20595c804c62d9010df783760622c545dde4d21dcfa203f9f60efd68bc40c6356ba52379a103e4f3f6f9cfeab7cd2816e13926e5112d287844b146bdceca5746dfca58eb02d66c50cb2038efe659b06ea\"}', '2026-02-01 14:27:25', '2026-02-01 14:27:25'),
(68, 'TESTING', '2026-02-03', '2526', '2026-02-03 07:12:47', 9, 45, 'e74f8d76b653a72b46a31f2f5e76f0faa6042f1f8e566753c2a86911d17e277b', '{\"iv\":\"477c3ef208c30d5bf1e5a071dddea86b\",\"data\":\"cc73bb9ff0ad6e10cd63b0f24097ee4bac60c98c24fffd9ec2f24c550fe1dffc7e0769f3c3ee6d33835b989a3641896781ddfe3e17e28662d44060be2edc296afa2c1e80c5a5bedefd07e04be6c58970bf4b5c876e1fb15bdf388124bdd61f499c76edc4b099940cf344e8f44d4b05f71a2aeaca564dae6c8f5899df7f8edbfd08fa042f84905eede0e23d9853e18d1eb2727d2dd767a06703c1c55472144950fda1984b21b5cd981d0fa9bf51da71034bf58ad9ff6fad526ef86c59fb43d23f3fb014b945e87f68d098c3a6504f89d15e230d3442698a77d17678f8ede02ae3daf40f9dcc901e602945f252522ab95ac5bc867fe7f0e8dbc7d75e101a75d41894f45c0847b00ff03236dfb1270d9a7e78df3711adfb9cd5ab57fca3c738d144c107ec95f8f37e6e70f50940ff6a28c0ead49263878622ba6395cd4f86c379d561b485d76a75e434d820513f1f7ba2e9756be52c8c60ffff436182bc1f00fee5a88acdfae973da3974f64e7b09ac76fafa2b21886d6e3afa0de2d16f50d3a156c69e58ab9f2d4c5287c246ebb46ce0468bf6b46fcbc953bfc2b350a4c136c8186079c114a6196aedfa86e27ce7324e4cd3d3b23a66d1d74237a474786786b95f39e33bc99b550e1c950d2c6810e356b2e0cb71e0e13823cefbcf2a01ef9a3e45d9e4b060eebaa22fb6b1f5f9b4cf5afb0c60f9bf191c22dfb1628ad292e7d9b7baabab7906b359ca62dbf3f8f59242e6d16596088b4b7147b7a782b0e56f7f498e05746ddfef87f31cdeb2bd064ba092c8e826d1e1d89fcd6bd1cb37b23b199ff1cd70817d023d13d03761533faa452719964b60a45866b0c08f276b3a7d7c981e37985b4661305a0140f22a4958aba40bc8eb2e49c2d97ac83bd4585e74ed92638c1fc61bb7021efaa6622523010397d219c7fd1a4562f36798b060683579b9175032336b7a811dfcf83c3b0da7e3a928fafaf1ffbe8ee34fbfa3143123872bf44e03ac26684d577f8180f8f1f2f5856467110245e1ea187c79a9c85f2f49c047bb85ef3faf24b2127ea6116f34011f02f225111ea38c8c570689fd71fc0bcdf4adb2854e321e9499a722fe9faf6c0ef69fc3b2587c085faa3a938ad05ea171edc46a1c3e6b5c2104802b2ffe076244a95b67dfb555e446a7b6c56e404e6d79fb4622ff973133c29556e9812c76329ad8ab6a8549d3d6cde1442f29c95f694d857e5a69ec1bc8144d48ed4e545882e96f08d54fb993e7da93c95761de99870f59ac70bcc9ee671fac6094d76ac266289e3f29971b7796c3e2fd098fd36f07e1fdc3ae3beb7bb8c3d3f93d9161364e454a2456e460c24ccb2122e6bdfeac76758011c8b58c1b9357a5988c356244272fd7a964b9f582b4bc851fed7bbbc01b23c1a85b726f8bf79b258b4379b19fdfdd50240107b3d057a777e9c2c52d016daed622dc7fecba8712054fa75e856788056d40f317ab10572a97a82685a765c93e4c3fd45de7d1edf68da3d578ca4150a086c3758a2f3f019fc5365e66c9b40f386528fe80ba5bc3580d4dfb388ef4d2d25befae0e84bd63b4a5c945c5632186339a41724bdf5b3e7f5ff3164557dc505c382fc7cc89b8a7d018118c23fb2d63a841f9a2319fddc70e7eaade99fb0b26e7028d82b95d5174cdecb8dd9aafac2ece44c12f442fc397576f5b9d7600b03676692e03a1c1cd3fe7d291da7fc03b0cc522d6ed8c9e0eb9dfc75b7002c72d1e1f47e7b3880a7bc66763f3e4cbec983b322cb777022b0fb740a84016b2bc098f86ad4a4c2aa294f2fb365759f24c18ce14815a53daf3866a161462815205a2769d9aad625507f874d29bf53435a28fb4e45fda50f3e79a703c5fe2f0386bac9700019a6acc847ca2690213701e7b52187fab03c23927300c83e1d56b86568ffc1c8593f7c2db520867668ba75ef0ef3a88aad5b8c16d096b00a020cf2ecbed7256aa218e8b4212749f1c2f31b01ce6f9dfa8e24e614921ff48b5997755b465a99dc634919d4a836f898f40e3f07100b039338343d2bf9fd953356f9d1da4fd6643e110aa73cbefb74bbbe783a46010f2871de94e588a50fff3da32a3321aec6140ce4899ce958eeaf593ad8d6351635963ad4c2d4a8cec52212dfb53c994dce55ee38f6a7344f4698b021c9625c44137b3b23da59f78ad65963d43c3caf6743607aeea059de52faf240bbbb9c77ee05281d769369b4fc6f0f91849b88f556ee747f517571d38e30cdafb0c32308f316c8cfe7447992efff6c99e0fdee9126e92fac4743249126d15f383a69e1408d5d19f6a7acf1c7c0246e7a42aec6d6ec9d49511a2e739137c6962c3ccc3aaa5f09103bf646db67fc05a3778eba6e1f1a9ab438067303402ccc71f8230760721c7e842be6a4443e00677ed3e46e75437f8388b5785c11b8422cfc4ce0ae72f5ab11a087aec214a07b100128ed424624ebc64c12ecfa18a41a7e56549f0ea8499d7c4569e58e51bbf683f60d5f18343360e35bba53e1838d510d28986a19f592e09910930bd685af5795be3e890486dbdb97484fa6125a9bd16d680b3ffabb9bbef725160c590bd76a04aa684b801061a549fc20e57402c975f34b1776f6025eff8d5542325ed6e6e2970713fc3ecfdf9aa5261840a73a855c2ad5ebbbb759c7d8b4f58b4b8659edc537a481fb24ae3f71eeb2e390b3eba58ad56365a0e93ee0481ff3294f8ad7df5bfe3630fe86bfdc8e03b90c57943b5177167b90b3e70e29aa10f12248bf30a8a2843abbfe4ce4f91cc8287bb552e7c81d7ae8f5ffcabb14b14e84f\"}', '2026-02-03 07:12:47', '2026-02-03 07:12:47'),
(69, 'SSCC', '2026-02-06', '2345', '2026-02-06 03:36:53', 9, 5, '51e2e72f32a76398859c6464144d2171e28f317c124547c897d8b8386c165e46', '{\"iv\":\"a021688cf7c1777d74741bcf4a1d3eee\",\"data\":\"f209489d49432ce15eb7fcfa958b5faaf6a15cd6e8d20375c7f0f22fb72addb543439bcaee58f85965b8388de1e3b6acdb750028a96dedc501d25cd9c658a57ce04667540860eef7793da85108a12cf59a09108fd0e8e64c727bc42d5aa6bbb53c50b0a8a90b512bf17a8ede2436458dbd3d8065dfb88c84ae7ca0123dee1d9e8c9a9120d45ec1621737fb9685a55544838c4173f250f2e6df538870fed77cc38b64c7fbdc4a62f6e83878b7ccad018a4f363bfa6c2d3514f27594702aaa8ea39b0ac0b37045536f0a50a67cd0896f0480e51961fd621e97e78c913dc3b9241b8aae6f67c5cdce34cec2fd89bbc5568543123652167967f69254a7d17da8fc654266fa4d8bddc2220b0e9ebed73b0fd8a229400001e49b11ea6e2641d53a78c1ae5648934f2ef37ca174bc55df1a3edb86700da2171b10df1c58fc4da564950f4c4a3bf5d750d26236cad0cd8a153c801170ee032a55d404508ec2772a4859ccee9bcb128f95509cb3dc37de87d5e29d93e36513ee89365b102ca444e9e2a4ff34369320133b2055b36f052dd26a3bd63ae0bb8f4ecc41362fe834b3be0a629434e155c8a214aa3c3dc75e2c63d94fa05b90cdc3b7c2cd99d85ebc3e5c599b973ef340d533e3866af5c33c32aeafb2328ada8542bccc2137aececda8bc6c5a548e3a06032e2db1b9f940104e663ccdbc7a6ac03dd5d92814e422a164c0764154c7ca662b1a2def560940c0073e73f39f6838c417887e2405cdf212780d9688f2ce7b20baa2009f0a8314572f695f511406ff6bc203768c58e4a81411fe84e6e4484220e31ad66c45f48afb228a76b6ce3ce10d2404ab5d70c9577b0368af91fe23ce40447747c7f0bf42f8f8849dd41136f8fbb7e046ad78dc53592542d36181b7eeff6ce227ecedfd5e805f9296395a56b9dac9b39ab85068cae4ca7c1f78aff0cff52523665a25301f1b42249d08dd59b9ee4c89a7ed53babb04ad6da1c4256de8d8b5b82d564f6a818ae7be24f5afa019104a84c038997c46dd8e0c1e1c18a8e1355af947e866091dd66d0ac871e5812084952112bea173db7baffe289a231b427cb2431197adb6731aa12ff36fe3738a1f5ab36298e4f287f5cc559a5382e645864702000228fcde9bbef6c69f908ae3ba9f14d15bf34e7c432112a5624debabde0fbabeb0cc2f30de9321f4c0fc8911e91fb0e2f673149c9470ff1ab225520891297c2c4f32e88e4ae08641b52b37772c040a39361e0127fadd1e19767a1c5d01d4ebaa0988deb0376502380ebca857ccfc44a994ca475e369647c472801487089480a06cb519eaab6a8e8aeafeeb77fe2af1ca2574d335bc9ce236902eeacea281d080133367b954dd6d1312ef4a3504d7bdb5f0902e9bb05f43ee3febc192481487e1cbc131900f9f971d62fd7b2a78b82af00a8c243534d7fe17fee912e16d849177b2cce2d1f7daa7effa8d04ff4d2f8774561952223ab0d9b40d5c074264d7f2f6e713eb995b63180e2154792dd4528292786cc02bfd2a263602162390bacd32693e3b74d028f93e9dd21d7cd20e00c8a3a6a690f4b913c381ee48a56bc86f817f728bc4a731b6d0312c2ffa4d067efc80e72e0d102f030f943b69f83342c369b130b675fc69ac0e9fda3a6dd230fb65b12897dec07fcead1dcbada2fd511eb6d03afc6c6057e312d15ab8ed364f9386757158c3edc79f4ff2b15255e032c463c08bb8ecc90cb340b4dea80c2606ebcba36ad89c426f007e82788d8f7fbaa3b7d7224278ab2b61c04a6d11a34e18dc92c0a12e92f0bb2936855a07dbb3de4826350938861ee6da93a2c30b2598cdf5da20d91cf70c0461c32fadf94dc85a6b23ac92057fde26629de68f052b338657529041df6fd116d54754babfda7fa593123bb50377ce97ebd991d78f0a6afb4ed973f9ac949bf191fd379ea471865304d4a836ab2de727d6b977832a19a55c08bd09b3bd9e9b719b67fc9cee94130a1bec69727d7eba0e8776914a09b573366502318bc64b51d01dd9e90f7c19cc0915df3553a000b2bee735b2b4a639756f8afa637c08b63331b38821f168a49c72b786b6cd86c6b5229dc5acb351cb99c187948d1680d246c75fd5f2772942c23395e774e501d5be19131168a3b9038d8d818e6fc26e1b0de89c39918e2cb84a589bc396c68cd88038d6a637ed369d03d7e648a55f076dce13bfa2de7ab28f85984801f7e1a24f50f207992c971e96a93009d7ef8133d8aa51f497f30d41f37b63c52007e620f98c27ca817e8dba4fc87ca2ab4ea0b8b816a232161a6c8bb480be9b813897338e2c4a0f2b5ecfc4c6808183a44e3e8759b363dae0ee48c399f681e7cf7999e5fec29b21f6846ab6014b29c8e71d1dd34db1f02ba078c2cd7b0a9e456454780860b960600ddb0aec42deeb91984b5795643956765eaa54929393db40f42b7db1e50facfc44750350120c76448d0b4b35b27721c18982ff22ed5c90bf01d3a20349f213c5196b166c6f70455490eb2d40485a32223c0ac353b76c4c4222fe73d426afd4f3bf886ab679db8dbee036042510c433e8a7452b6033be4e500284487fe08c9eaa47eeb5262ef8ef20589f471f23bad390ce18aa2b9d14edf44684406d54685f3593d5863c7169dfec825aafd2dff8b3f97a833744b8d45e8e5d140bf4d9726f8ce02c4723d8d83991857d2a1cd9b146fcf828e573214c5e3fb79a6fbcd5348ce78b4019740949fd800f07ae467a5805e86fd7f791211219c54161ad24867a8d96fb5148a08d59b884d3522275bbd77ae8971c5bb4\"}', '2026-02-06 03:36:53', '2026-02-06 03:36:53'),
(75, 'Test', '2026-02-06', '02062025', '2026-02-06 06:01:15', 11, 27, 'eb79efc2c612ca3227c01ead648692c4932d297b0adb36d0b71930ef1306e94b', '{\"iv\":\"78871708408fe706133b407c915f10ac\",\"data\":\"1bb5ccb590206fdcb08e498d99ab9fc186a601eb79851f2476cb61cc6446469e4d9d223c0eb9380205b2051727ea03d295d296e0bedaff38fb8d3d1d4556aca37362561b185075139886cf453d2db56804abe904f612f565d6855c75b8b23eda9b53dd3cc2e0543989ee3869f74fb5c4e251f9f221a21461d4440b4ce410dca74966492675ed04590b0cbda96248722ae8365b68ef9f03414bf003f737d0bd4d5ac2bb154e3f8e064154e983b6f3ef98959dc58543edde9c94b9423b704616b7ecdf6326519ec8d05caadda183a57019675d8e2795a2842f2626d7d70fbcbaa1e832ebe362b9abf90ef888cc708bff8f9e929ed77e8f5356407f6ef65cb6f92fe8a0f679fc887bc9e5abeb3030009d449e20b6c120984030612b16e18b01b0031af23b098169e4e531f345501da99c9f007b040d1e8df99c4499ad609346b5089698d191f341e25f7dca463da607086864ee2e1c6048b1a47af9c3ad83895065192d0640ed4419795723e862596b5326d32e4f2dec6eea6ff4c9a74eef15e828fb0f65c93cf4d3963d9906e3d17954ef6f8dbb9297002c484c21b6eca681ef4979426e6a2840f37e350c866f37718810b86ed0f5f0417fda406a1e5dad67aae52a9d13f26bbed4ab67f7a81c05645339d6bc03fbd35cc040b24568f290d71b45c74b7cf1b48dc5d21941fc0f7fd838b9e92ea58771527e72066b4b68c34ba9e0a0e784c5921aae4079bdf48ab607a4ba5d8a9e79fe5575ef2fc7c41f068f191b2709945f16995b1b22b05507492be2679a7d86cb46d90d70fd37e2d29783f8f317868308676d37e4ba2659e3a638aca93fab8f2c41f75f05cef1db95ca0baa8d3d014a05e27648ca2f41a0d0da64debc1c50a4f3385bdf6ecea3dcf7a9bdc65833ae497b3964beaa788acbcd479a49398b5f36c8327c54d5e789ffcb31e913394289291f94e9bcb43f54f38ef5645c441a82151d5977f9fbb6b196c928c94817bb3880a410a61ce8619b0c46036b1315eace1fcea48929b9f16b9759293d0198ecb6a78bc4536c64bbf49376abc908c4c455409c45d308efba1fc8974dcc43ade51a97aa7df65a2f4b63a792f3061f9b0945e8890eaea32a8540b373ab56945f15976eff8e086976dc84d2b7f5184eaf5ac2611eef8c80a31dff1844efaef5dc35f6c3878cd76c0882eb167b5f4dc9e00f4108257c763bc061a2a74c55b2bd993d7d0b4fc4362dfa4748f5f3c7bdafd4dab073efb3e8eee843475b34b698116b17776992dedde028bf03d3141b4ceaf65ed7f44f1b658ece8c63a6962462f46767675a770e2bbe93f0884c0d61a1fc7e1ba715036c75fa01600b3492bcfa3771b396953dc99ad845a8a659196fc77d15a248ec5f32cfa498dbc8ee811b7234c3ca27eddaf67ba8ee94c7a4a7df1be33e073707b503f9f71514213127aae3c78aac6631bedd98b789cd9fef12c3693be4f442bd0b715839d0e7448ec4ec138e57b4a4a3a8b33d5998e0d5c519dda8fa94c814055526b5d897a16322618ed0c1f28755ff5e736d8cc959c3512d9430a61fb773a2fa4cd5a2cf8c75dc55c7bfb99d234c516bd2a7d5535b65880a1aeb34f1825013d5390b96dea84f9b2d913c3ccdec499d175ca5fdca9a13e45a8cfe98dfa3fd4d156e848bac3631c407ca5c70cad6faa9f8171ba2719734390260b8bf264e01ef73bc31e0dfba54895471290e7df94a86a981cfceb40d670fbb411d29558de85cbf1ec23f65a435a0003576ad4fabe8930fdea354ecf41e1bb4d77596443fc936a3b6741de5e425153fe95b81b00ce42ef0b661a39d5ac0ed48eb1fbd803a034deff1cb77d8e442ebd5bc63d658c201adb9bcf6c2952bd8af3db7fb863479c29e6ca9358b2f02de2ddb22b7b6849a9dba6b61946a4577e3279b7415133a512cce4108f0134631a7751590494a5b7693bfe459ff9152e818a72e2d3041ce04fcc0bbbc37af314f71a846520b8ec7a79e4ba4de017e1ef177cbde13cacee0375f03b02efaac62e939b94f6f77ebbdafdfb2751ef1d9daf57c9557f69b9d84d090aa9ef749f006f7d594973ba07747dabaa658b7ddcb0d6d90a6828c1ec36febca9c2c0c2927a5c90b9b99869e743e1a4e2f51599b77b87c2ff90a737c8608487663dd734f2ff76447aa961a176f7f27bf731a4b47c1c18741b4f80190c2f658b757ab15e3444a2bd70f1482c331a52ad3c21c8f7ed952fba4d11f60212a85a89a33c113cde9c5963f306051dbf5cc8011f752840499d9fcc01dbf56086f7c8ef74dc1b5cb7cc0da1a7651d5677ad50c04a5caffa91bc7d0e1490d1d66a589949788ed73fe69120b6d2f22f634bbecf4a9326111c29a6de1cb6a38f365f44b97da83666e80ed2824b34c732f6058fd7f7918866e30a76d697cf82d51bf5e4ccfcbec59110ae28d541f827d4d1ea63e6ca4ef1879b2e53d32af795c9a7c9c46d11f0681734f08420fb110333ec0742b64439751e85d84f57ca23f4d244a1e9063e17aa836aeed32d30cd253e45c4057663e2f022399c091ebb0eb724a0e5e289d2c9fb743753cd3a9dbd471535fe9314bac08ae2e6a7881d5f693660fbe029f3d892b49d6b008fa0edc6391ca9615e5ae94e3b2c4b922829b48b080092c2b19eae67466204a8de9c94380437b467dd3c82d2a0bc5b2c00a6ca80e11972e1943ac75ee7a6b67432e08ae1d1bb00f07b6461e80bcc4f20593bdca291f36280c2116f46f8aa0fdaa5526bc22d650a58b9cf1ce66c77637fbb160eec01352264242b4e2f23d5a03471b435f7702207420a40990ff4d88238c69639fd1fcf936d933c2a95f0513768af3f48c930c54c1a1d842f5d488a93701a3cd8b57cdbbeed8e4727dbfe60a740d6f1381a5727ccadf370303b2ab4641930e41328b9eecf1701719fe9da7de48f84db0183991541bfa1612c40a10003e1f8a8088a53d5080804bd44b0189e9969bbd35cafe87a7732062338deea3403556edd8d6d795f1c3db257afa882d45ba8d68ef9ca57d72b1d1ca3303f6129e6e38cfc1df2c2cb213b935f3449c1072c870a8d05440da2ef389c402f09a4c3b5edc41068f288f2e922ff9c9dd46ba28f1beaaa05fc543d549673f8abfb8e02abc2aec25ba41ee297ce0ef5ad1f9df38a6ffcb5d0d850b827c0b5c785a8ef8aeea46e1b76a5f54058426857d9ac9af79b804efd7821767b079a7121f08b0752f2c8f5ca405ac92c12faeccd65c528c83753747ee7a1d8c41a0cd56086bcf6113eb959c9793d8e8c9876f7f1c4a26107f38d151fd5c2134886063f02db918c5023a8ae8d7aefbe7a8537483\"}', '2026-02-06 06:01:15', '2026-02-06 06:01:15'),
(79, 'www', '2026-03-29', '34567', '2026-03-29 01:55:21', 11, 4, '588b407cc2f35590e5da5df7cec8f9017172667e9bf46ffbfd1cadd33c1a1efa', '{\"iv\":\"8e0e87bad724584af0caf9af06c3d3fe\",\"data\":\"043ce93650d03b526c2142a280c4e205e29ae4f9bdf1faee13f29006a608af1472d5c984378a0ba55b08593e0a403f608e762d7231f96a12d6cf2ed754098b614de0ccd6a90895502470a1deb84f4c78d90b5ebd64fb28ca6255bfc8cbcb411858e90ea57aa95b50c5b4fe0f57cf368bffb8def5e0bd6fe1263240d15a74e7a1e56e9ac36b6bb54fa57faf91c0be65f91d79e5f35ca0ed8892237c8f3da334c6c8b0ba67554733e25b4c3d2bc0738b49115a04748172fa144d226393c68f9cadf12aee11699660e4396ba62f46a7a2bc94a4dfcbabb0ec39cb6d035c3a1ea461328209db24b24398d57f944ebcabf6286b986c86f2269e0c72cece68c6508a5e0cc6631781bbd7d4ca6b470898582c1ac18418520bbcf6a5b9ef401549a615d351ead855a0546cbfdf88dc9f0dc2101ea65484dfd17863855a134302491f84f53d484b9af0d986e8d444823562a294c34d424598e2c54676e47707a3fad7efb36572ba42bf015aeaa731e8b70b9f45b20682d76a93ff49a66abe00ae60124b4f92503e1f55192507348ca09b2b36294a676bf02be596f9eb42ceff97d17aae526a807db77a51195cdbca420190fcd4e73aedc6b77b22bf5ad68eb25fab6d4856896329bc4a076aefd38b462196311a82036c81e1db072c2af3acdfb677d99d08f04ed890568b1c7ac5ab1028b8cf3e24393462f1c53fd446df8cf9573068b5db28bbccb5d8dd549ef646489e2e544de6ffeadaf78055ca84e4a768e248501e4bfcf597b2f60ba762f58e7b3e1f7151cebb4a12ba6c9527c30c6ac0ed72704bdba1a24cffa3b5eced9de9b68b455e241844d4432ff01214efa2ad9ca2c75345049f487e6d83f8f68652fe392c6b6477177104a5abbcd1b24bfc0898c45187147f428d380718cba6e47438dfd807318af38e2ba4e40b06fd9e9f4f355b5454492dc346386561be1d5e8f3c93c2b5b69e03451f5367f244f6340e335bde878471c18622db2823128e2a102761b7cd8bd671ac1cc60c5f371da55a6aa5a417e3cf4881a12c56de134331410f9dbb6adcba48d9905e89e70bc19b4247dc90d62ec68dac2dfbf4f164936d9a11c5a7a66e04f644d38bb20f43fea45b387e4fc028c70b583ddba8f6720a8514d68bb1e050d4c92a2826afe61c160a76dfa2641544038fbce4337c9e9646b42f082e364012b3bfa78adb5565dd0b3e741b7de9968f2bf5db643b4dc17b9b7d82a060645ace2f81619c309b4bddab4cc1fab7da2daa2468dad7a01055970df54e8cd09226b242a47709774fa1dd597b2a870701111e248a65b90f62d2927d6cd8c16d68b125105cacba5ecdac79c1ebacfb4aac8a0e3ce52472391688668a28a2801b6edb164e8c5e062586a8dff9edbafff8b021a374ccb70a6004ddd7c114ac5747f7e475e425ccf7d75130856f880193ace852c24b255af2f0ccab3fe76e980ca0f6f33fe9354ad7940a1f971d2815943481df61c15547aa259808e656c67ba1049b13486b81c04eece5d07f5aa12575974181cc64a69e14a226459a6ae5922274342667a22996105876b52ca979ee14a23c12c9f4d5026198c9e6b6879cf204f17c3c99b58f5dd33a4383a8512fdc2f8a89e9a70da1da044abc76b534770f865bb53e6354ccbcbc403efaf3b63f6794e2b408490962362e69d72779c07c47655536a741c1104e800cd09b6d517e3aa6d9a74b5b588301161ff00ee459ff48b7cf08cec5883db1c5479fbf80cee68367216de781af2113e4645e222d7636f28970aba8e74d20c5e0e171fc3e5a50046f5131de24d37b7f7faea80f7fd10d074d1aba1f724d37d2653590268a404a55ba28a0426b7bbf62e077e394c216ec71a24b8c835c4b03dcc0c485f2878d3bc342fc90e07bf727350a97cad0500d797d717cdc28d500ceab1605b7deee91504b145f5e847fd643bf80c03903218878fb02d4fda7b3cadd8ec5bada6dbb6716d7b483b2bec97c52d4d6f21f7bdd6e7dff1c1d712c847f773ca2266be8bf5af0a9fcab116187dcfd1983a9b3c2a39549d6ed2473256209bb74337bc02c22d76692545916a07d76c27305011b7ba2da6e3a5c4c6faa53ad4aaa7826d6e9749f89bda18eff766d4897f28a8e05d951b8ca80415c31fca6376bfd5655c2c858ae37afc6309e808d788df144057f1cf34747e007ed2f4bdd1da5e0a58306fb5d364ff5596955f6b32c141c02968ffb488739a168e2fc9b7d8662aea21927ede427224ac1de014f9773933ba04f7890ea1c6a439c9f2860b6e52c6f7e5893bc1fda0821d9d3c56e44504b5a703031fe193e500d5d3e3991373da847bc685b32328adcc3a51f474ea1fb6c846550bd9d9ab205025567e08f099972b9962242de7a50b792ee7e64d51ee1793fbda5d3fcf7d46196cdebbbf01a41a22679aa1229f0705a6f492d51f4979d891fe6f38a650b48283a6bea7a2af48ff18bf3701bf11b8b2d768aa305f47074fe130802e652b3efcb76cef0a7208854dc3f59a3a28ce637702663b57b2a0f38946630a23919ca44f0fbb8e9186178b3cf5f6d99f366b9025bc976e217dd6cd1f6f42c0fdf649ece409eac8f70621ebd3506e8b8646077e91620e459ec7ffc2b6c3a1cc5f00b8fec0283942524cdafd15b1bb2f55ab736c24ec3806bf4c9463f264244478fe10a350a41a1c75d8661689ad1aeb0f6e6a99f06c94095ecb8cffedb651a5f16d5e9db39035fccff0e45b4484a8e1e2e844dc83089691e573df49cb7293565e3a12c98da13d779f0602ce3d7eccc5c2be5ed6da0d14dbf1cbdbe52bcd145de66c5bbd7d7e4f6d3f99cf44a2204ae02f2ee00a6f7cd44a61ba59b27e0989af70bc94e64a746438c7a590bc9b509b62cb5c67358731b906e3fc81675527db6c513e11af972d5ba833f23b05fa05ed751d74bc47d4bc30de51706b1968ce42d32508f13b6449efb9b54ce48ed7c671d4ef4e41df82eb286df180f17012ea3c9a30f21229c59670f12df6367e47911c1aa2de9cef8e58e7dc979efe00681a6f31b085a30f1c709c25cfe12ec26867316d5c5f4fa1cddf744a75cee747987da8eb6aea15ec0f3e9e3a5113068e74dad3d215aaee037a1bc51e07603f99fc35671e93fe4ce5cd315eeec92bef8fd0c76295ed592772ec9f452bcae15512f3a13c142976aadb2046ed80461bb30f4527f7fdca8c00cfafd2e7ae87f5f88b6983d19322b45f49d0f2b0780a5f3a1bb1216d1bb8670ae0d1c1ec22c1af778979e95d5413587f531cec9f256da9bfe42dd817b05071f350f45ddead19f7f299ee70467b443e4eef622bae666d091e4ea1d\"}', '2026-03-29 01:55:21', '2026-03-29 01:55:21');

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
(13, 'Vice - President', 1, 1, 1, '2026-02-01 05:13:34', '2026-02-06 03:59:21', NULL),
(16, 'Senator', 3, 2, 1, '2026-02-01 14:04:19', '2026-02-06 03:59:21', NULL),
(20, 'President', 1, 0, 1, '2026-03-29 04:40:26', '2026-03-29 04:40:26', '[]');

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
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_audit_logs_user` (`user_id`,`user_type`);

--
-- Indexes for table `candidates`
--
ALTER TABLE `candidates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_position` (`position`),
  ADD KEY `idx_party` (`party`),
  ADD KEY `idx_candidates_position_id` (`position_id`),
  ADD KEY `idx_candidates_active` (`is_active`);

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
  ADD KEY `idx_voters_active` (`is_active`),
  ADD KEY `idx_voters_has_voted` (`has_voted`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53124;

--
-- AUTO_INCREMENT for table `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `election_data`
--
ALTER TABLE `election_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `voters`
--
ALTER TABLE `voters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=285;

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
