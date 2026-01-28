-- ==========================================
-- SYSTEM BAZY DANYCH MIXTURE MARKETING
-- Kompletny plik importu i aktualizacji (v5)
-- ==========================================

-- 1. TABELA UŻYTKOWNIKÓW (Klienci i Admini)
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL UNIQUE,
  `name` varchar(100) NOT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'client', -- 'client', 'admin'
  `is_active` boolean DEFAULT 1,
  `session_token` varchar(64) DEFAULT NULL,
  `session_expires` datetime DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_session` (`session_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABELA LEADÓW (Zgłoszenia z formularzy i kalkulatora)
CREATE TABLE IF NOT EXISTS `leads` (
  `id` varchar(50) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `service_type` varchar(100) DEFAULT NULL, 
  `package_name` varchar(100) DEFAULT NULL, -- NOWA KOLUMNA: np. 'Enterprise', 'Startup'
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `company` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `budget` varchar(100) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `details` longtext DEFAULT NULL, -- Dane techniczne w JSON
  `source` varchar(50) DEFAULT 'website',
  `source_url` varchar(500) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'new',
  `current_step` int(1) DEFAULT 1,
  `email_abandoned_1_sent` tinyint(1) DEFAULT 0,
  `email_abandoned_2_sent` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABELA PROJEKTÓW
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `progress` int(3) DEFAULT 0,
  `budget` varchar(50) DEFAULT NULL,
  `drive_link` varchar(500) DEFAULT NULL,
  `next_milestone` varchar(200) DEFAULT NULL,
  `next_milestone_date` date DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABELA KAMIENI MILOWYCH (Timeline)
CREATE TABLE IF NOT EXISTS `milestones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('pending', 'accepted', 'corrections') DEFAULT 'pending',
  `feedback` text DEFAULT NULL,
  `order_index` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABELA WIADOMOŚCI (Czat)
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `sender_type` enum('client', 'admin') NOT NULL,
  `is_read` boolean DEFAULT 0,
  `notification_sent` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. TABELA DOKUMENTÓW I FAKTUR
CREATE TABLE IF NOT EXISTS `documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `type` enum('invoice', 'document') NOT NULL,
  `subtype` varchar(50) DEFAULT 'other',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. TABELA TOKENÓW MAGIC LINK
CREATE TABLE IF NOT EXISTS `auth_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` boolean DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. TABELA LOGÓW
CREATE TABLE IF NOT EXISTS `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `level` varchar(20) NOT NULL,
  `message` text NOT NULL,
  `context` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ==========================================
-- SKRYPTY NAPRAWCZE (ALTER TABLE)
-- ==========================================

-- Naprawa LEADS (Dodanie user_id)
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'leads' AND column_name = 'user_id');
SET @sql := IF(@exist = 0, 'ALTER TABLE leads ADD COLUMN user_id int(11) DEFAULT NULL AFTER id', 'SELECT "user_id exists"');
PREPARE stmt FROM @sql; EXECUTE stmt;

-- Naprawa USERS (Session fields)
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'token');
SET @sql := IF(@exist > 0, 'ALTER TABLE users CHANGE COLUMN token session_token varchar(64) DEFAULT NULL', 'SELECT "session_token OK"');
PREPARE stmt FROM @sql; EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'expires_at');
SET @sql := IF(@exist > 0, 'ALTER TABLE users CHANGE COLUMN expires_at session_expires datetime DEFAULT NULL', 'SELECT "session_expires OK"');
PREPARE stmt FROM @sql; EXECUTE stmt;

-- Naprawa LEADS (Step and Type)
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'leads' AND column_name = 'current_step');
SET @sql := IF(@exist = 0, 'ALTER TABLE leads ADD COLUMN current_step int(1) DEFAULT 1', 'SELECT "current_step OK"');
PREPARE stmt FROM @sql; EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'leads' AND column_name = 'service_interest');
SET @sql := IF(@exist > 0, 'ALTER TABLE leads CHANGE COLUMN service_interest service_type varchar(100) DEFAULT NULL', 'SELECT "service_type OK"');
PREPARE stmt FROM @sql; EXECUTE stmt;

-- Naprawa LEADS (Dodanie package_name)
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'leads' AND column_name = 'package_name');
SET @sql := IF(@exist = 0, 'ALTER TABLE leads ADD COLUMN package_name varchar(100) DEFAULT NULL AFTER service_type', 'SELECT "package_name OK"');
PREPARE stmt FROM @sql; EXECUTE stmt;

-- Naprawa PROJECTS (Budget)
SET @exist := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'projects' AND column_name = 'budget');
SET @sql := IF(@exist = 0, 'ALTER TABLE projects ADD COLUMN budget varchar(50) DEFAULT NULL', 'SELECT "budget OK"');
PREPARE stmt FROM @sql; EXECUTE stmt;
