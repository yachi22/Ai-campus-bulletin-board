-- =====================================================
-- AI Campus Bulletin Board Application
-- Complete Database Schema (All Phases Completed)
-- =====================================================

CREATE DATABASE IF NOT EXISTS campus_bulletin_board
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_bulletin_board;

-- ---------------------------------------------------
-- 1. Table: roles
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 2. Table: departments
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 3. Table: categories
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 4. Table: users
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  department_id INT DEFAULT NULL,
  year INT DEFAULT NULL,
  interests JSON DEFAULT NULL,
  skills JSON DEFAULT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  student_id_prn VARCHAR(100) DEFAULT NULL,
  employee_id VARCHAR(100) DEFAULT NULL,
  designation VARCHAR(150) DEFAULT NULL,
  division VARCHAR(50) DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  profile_details JSON DEFAULT NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role_id),
  INDEX idx_users_department (department_id),
  INDEX idx_users_status (status),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 5. Table: bulletins
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS bulletins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT DEFAULT NULL,
  category_id INT NOT NULL,
  author_id INT NOT NULL,
  department_id INT DEFAULT NULL,
  event_date DATETIME DEFAULT NULL,
  expiry_date DATETIME DEFAULT NULL,
  status ENUM('draft','pending','published','rejected','expired') NOT NULL DEFAULT 'draft',
  is_pinned TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bulletins_category (category_id),
  INDEX idx_bulletins_author (author_id),
  INDEX idx_bulletins_department (department_id),
  INDEX idx_bulletins_status (status),
  INDEX idx_bulletins_event_date (event_date),
  INDEX idx_bulletins_expiry_date (expiry_date),
  CONSTRAINT fk_bulletins_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bulletins_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bulletins_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 6. Table: events
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  venue VARCHAR(255) DEFAULT NULL,
  event_date DATETIME NOT NULL,
  registration_deadline DATETIME DEFAULT NULL,
  registration_link VARCHAR(500) DEFAULT NULL,
  organizer VARCHAR(255) NOT NULL,
  max_participants INT DEFAULT NULL,
  department_id INT DEFAULT NULL,
  category_id INT NOT NULL,
  created_by INT NOT NULL,
  status ENUM('draft','published','cancelled','completed') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_events_event_date (event_date),
  INDEX idx_events_registration_deadline (registration_deadline),
  INDEX idx_events_department (department_id),
  INDEX idx_events_category (category_id),
  INDEX idx_events_created_by (created_by),
  INDEX idx_events_status (status),
  CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_events_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_events_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 7. Table: comments
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bulletin_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_comments_bulletin (bulletin_id),
  INDEX idx_comments_user (user_id),
  CONSTRAINT fk_comments_bulletin FOREIGN KEY (bulletin_id) REFERENCES bulletins(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 8. Table: reactions
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS reactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bulletin_id INT NOT NULL,
  user_id INT NOT NULL,
  reaction_type ENUM('like') NOT NULL DEFAULT 'like',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_bulletin_reaction (bulletin_id, user_id),
  INDEX idx_reactions_bulletin (bulletin_id),
  INDEX idx_reactions_user (user_id),
  CONSTRAINT fk_reactions_bulletin FOREIGN KEY (bulletin_id) REFERENCES bulletins(id) ON DELETE CASCADE,
  CONSTRAINT fk_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 9. Table: notifications
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('bulletin','event','recommendation','system') NOT NULL DEFAULT 'system',
  reference_id INT DEFAULT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (is_read),
  INDEX idx_notifications_created (created_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- Seed Roles
-- ---------------------------------------------------
INSERT INTO roles (id, name) VALUES
  (1, 'student'),
  (2, 'faculty'),
  (3, 'club_coordinator'),
  (4, 'placement_cell'),
  (5, 'administrator')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ---------------------------------------------------
-- Seed Departments
-- ---------------------------------------------------
INSERT INTO departments (id, name) VALUES
  (1, 'Computer Science & Engineering'),
  (2, 'Information Technology'),
  (3, 'Electronics & Communication'),
  (4, 'Mechanical Engineering'),
  (5, 'Civil Engineering')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ---------------------------------------------------
-- Seed Categories
-- ---------------------------------------------------
INSERT INTO categories (id, name, description) VALUES
  (1, 'Academic', 'Curriculum, lectures, and academic notices'),
  (2, 'Examinations', 'Exam schedules, seating arrangements, and results'),
  (3, 'Placements', 'Campus drives, recruitment sessions, and internship opportunities'),
  (4, 'Events', 'Workshops, hackathons, seminars, and campus events'),
  (5, 'Clubs', 'Student club activities, meetups, and recruitment'),
  (6, 'Sports', 'Inter-college tournaments and athletic activities'),
  (7, 'Lost & Found', 'Lost and found belongings on campus'),
  (8, 'General', 'General university updates and circulars')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- =====================================================
-- PHASE 4: AI CAMPUS INTELLIGENCE EXPANSION TABLES
-- =====================================================

-- ---------------------------------------------------
-- 10. Table: lost_found_items
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS lost_found_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('lost', 'found') NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  color VARCHAR(100) DEFAULT NULL,
  brand VARCHAR(100) DEFAULT NULL,
  location VARCHAR(255) NOT NULL,
  item_date DATE NOT NULL,
  item_time VARCHAR(50) DEFAULT NULL,
  identifying_details TEXT DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  status ENUM('open', 'matched', 'claimed', 'closed') NOT NULL DEFAULT 'open',
  ai_summary TEXT DEFAULT NULL,
  ai_attributes JSON DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_lf_user (user_id),
  INDEX idx_lf_type (type),
  INDEX idx_lf_category (category),
  INDEX idx_lf_status (status),
  CONSTRAINT fk_lf_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 11. Table: lost_found_matches
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS lost_found_matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lost_item_id INT NOT NULL,
  found_item_id INT NOT NULL,
  match_score INT NOT NULL,
  match_reason TEXT NOT NULL,
  status ENUM('potential', 'confirmed', 'rejected') NOT NULL DEFAULT 'potential',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lfm_lost (lost_item_id),
  INDEX idx_lfm_found (found_item_id),
  CONSTRAINT fk_lfm_lost FOREIGN KEY (lost_item_id) REFERENCES lost_found_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_lfm_found FOREIGN KEY (found_item_id) REFERENCES lost_found_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 12. Table: project_requirements
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS project_requirements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  required_skills JSON NOT NULL,
  preferred_tech JSON DEFAULT NULL,
  team_size INT NOT NULL DEFAULT 4,
  current_members INT NOT NULL DEFAULT 1,
  domain VARCHAR(100) NOT NULL,
  deadline DATE DEFAULT NULL,
  role_requirements TEXT DEFAULT NULL,
  status ENUM('open', 'in_progress', 'completed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_proj_creator (creator_id),
  INDEX idx_proj_status (status),
  INDEX idx_proj_domain (domain),
  CONSTRAINT fk_proj_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 13. Table: project_collaboration_requests
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS project_collaboration_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  student_id INT NOT NULL,
  message TEXT DEFAULT NULL,
  match_score INT DEFAULT NULL,
  status ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pcr_project (project_id),
  INDEX idx_pcr_student (student_id),
  CONSTRAINT fk_pcr_project FOREIGN KEY (project_id) REFERENCES project_requirements(id) ON DELETE CASCADE,
  CONSTRAINT fk_pcr_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 14. Table: opportunities
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS opportunities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type ENUM('internship', 'hackathon', 'competition', 'scholarship', 'workshop', 'contest', 'research', 'placement_prep') NOT NULL,
  description TEXT NOT NULL,
  organization VARCHAR(255) NOT NULL,
  target_departments JSON DEFAULT NULL,
  target_years JSON DEFAULT NULL,
  required_skills JSON DEFAULT NULL,
  eligibility TEXT DEFAULT NULL,
  deadline DATETIME DEFAULT NULL,
  action_link VARCHAR(500) DEFAULT NULL,
  created_by INT NOT NULL,
  status ENUM('active', 'expired', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_opp_type (type),
  INDEX idx_opp_status (status),
  INDEX idx_opp_deadline (deadline),
  CONSTRAINT fk_opp_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 15. Table: student_schedule_items
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS student_schedule_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  type ENUM('event', 'exam', 'deadline', 'task', 'workshop') NOT NULL DEFAULT 'task',
  description TEXT DEFAULT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME DEFAULT NULL,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  reference_type VARCHAR(50) DEFAULT NULL,
  reference_id INT DEFAULT NULL,
  is_completed TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sched_user (user_id),
  INDEX idx_sched_start (start_time),
  CONSTRAINT fk_sched_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 16. Table: document_uploads
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS document_uploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  extracted_text LONGTEXT DEFAULT NULL,
  ai_summary TEXT DEFAULT NULL,
  ai_analysis JSON DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_doc_user (user_id),
  CONSTRAINT fk_doc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------
-- 17. Table: campus_issues
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS campus_issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  raw_input TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  category ENUM('Infrastructure', 'Electrical', 'Internet/Wi-Fi', 'Classroom Equipment', 'Laboratory', 'Cleanliness', 'Water', 'Safety', 'Other') NOT NULL DEFAULT 'Other',
  urgency ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  assigned_authority VARCHAR(150) NOT NULL,
  status ENUM('pending', 'in_progress', 'resolved', 'rejected') NOT NULL DEFAULT 'pending',
  admin_notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_issue_user (user_id),
  INDEX idx_issue_status (status),
  INDEX idx_issue_category (category),
  INDEX idx_issue_urgency (urgency),
  CONSTRAINT fk_issue_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;