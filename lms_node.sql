-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 03, 2025 at 01:08 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lms_node`
--

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `book_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `status` enum('available','borrowed') DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`book_id`, `title`, `author`, `category`, `status`) VALUES
(1, 'Data Base Advanced', 'Hazem El Bakry', 'Technology', 'available'),
(2, 'Psychological complexes are your eternal prison', 'Mark Johnathon', 'Psychology', 'borrowed'),
(3, 'احاديث', 'مصطفي محمود', 'ديني', 'available'),
(4, 'Mastering CSS3', 'Code Book', 'Programming', 'available'),
(5, 'Mastering HTML ', 'Code Book', 'Programming', 'borrowed');

-- --------------------------------------------------------

--
-- Table structure for table `borrow`
--

CREATE TABLE `borrow` (
  `borrow_id` int NOT NULL,
  `member_id` int NOT NULL,
  `book_id` int NOT NULL,
  `borrow_date` date DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('borrowed','returned','overdue') DEFAULT 'borrowed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `borrow`
--

INSERT INTO `borrow` (`borrow_id`, `member_id`, `book_id`, `borrow_date`, `return_date`, `status`) VALUES
(1, 1, 1, '2025-10-20', '2025-10-24', 'returned'),
(2, 2, 2, '2025-10-21', '2025-10-25', 'returned'),
(3, 2, 1, '2025-12-23', '2025-12-10', 'returned'),
(4, 3, 2, '2025-12-03', '2025-12-10', 'returned'),
(5, 4, 3, '2025-11-25', '2025-11-26', 'returned'),
(6, 1, 3, '2020-12-01', '2025-12-02', 'returned'),
(7, 1, 2, '2025-12-04', '2025-12-05', 'returned'),
(8, 3, 2, '2025-12-03', '2025-12-05', 'borrowed'),
(9, 5, 5, '2025-12-03', '2025-12-04', 'borrowed');

-- --------------------------------------------------------

--
-- Stand-in structure for view `borrow_view`
-- (See below for the actual view)
--
CREATE TABLE `borrow_view` (
`book_title` varchar(255)
,`borrowed` date
,`id` int
,`member_name` varchar(255)
,`return_date` date
,`status` enum('borrowed','returned','overdue')
);

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `member_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`member_id`, `name`, `email`, `phone`) VALUES
(1, 'Ziad El Bakry', 'zezomamdouh12@gmail.com', '01152602002'),
(2, 'Eslam Maher', 'eslammaher152@gmail.com', '01152602006'),
(3, 'jana Ahmed', 'misonahmed12@gmail.com', '01129650122'),
(4, 'Omar Maher', 'omarmaher@gmail.com', '01123456789'),
(5, 'Mamdouh El Bakry', 'zezomamdouh612@gmail.com', '01120475790'),
(6, 'Youseff magdy', 'youseffmag12@gmail.com', '01145678913');

-- --------------------------------------------------------

--
-- Structure for view `borrow_view`
--
DROP TABLE IF EXISTS `borrow_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `borrow_view`  AS SELECT `b`.`borrow_id` AS `id`, `m`.`name` AS `member_name`, `bk`.`title` AS `book_title`, `b`.`borrow_date` AS `borrowed`, `b`.`return_date` AS `return_date`, `b`.`status` AS `status` FROM ((`borrow` `b` join `members` `m` on((`b`.`member_id` = `m`.`member_id`))) join `books` `bk` on((`b`.`book_id` = `bk`.`book_id`))) ORDER BY `b`.`borrow_id` DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`book_id`);

--
-- Indexes for table `borrow`
--
ALTER TABLE `borrow`
  ADD PRIMARY KEY (`borrow_id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `book_id` (`book_id`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`member_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `book_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `borrow`
--
ALTER TABLE `borrow`
  MODIFY `borrow_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `member_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `borrow`
--
ALTER TABLE `borrow`
  ADD CONSTRAINT `borrow_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `borrow_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
