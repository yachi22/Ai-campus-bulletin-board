require('dotenv').config();
const { pool } = require('../config/db');

async function migratePhase4() {
  console.log('Starting Phase 4 database migration...');

  // 1. Add skills column to users if not present
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM users LIKE 'skills'");
    if (cols.length === 0) {
      await pool.query('ALTER TABLE users ADD COLUMN skills JSON DEFAULT NULL AFTER interests');
      console.log('✅ Added skills column to users table');
    } else {
      console.log('ℹ️ skills column already exists in users table');
    }
  } catch (err) {
    console.error('Error checking/adding skills column:', err.message);
  }

  // 2. lost_found_items
  await pool.query(`
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
  `);
  console.log('✅ Table verified: lost_found_items');

  // 3. lost_found_matches
  await pool.query(`
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
  `);
  console.log('✅ Table verified: lost_found_matches');

  // 4. project_requirements
  await pool.query(`
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
  `);
  console.log('✅ Table verified: project_requirements');

  // 5. project_collaboration_requests
  await pool.query(`
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
  `);
  console.log('✅ Table verified: project_collaboration_requests');

  // 6. opportunities
  await pool.query(`
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
  `);
  console.log('✅ Table verified: opportunities');

  // 7. student_schedule_items
  await pool.query(`
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
  `);
  console.log('✅ Table verified: student_schedule_items');

  // 8. document_uploads
  await pool.query(`
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
  `);
  console.log('✅ Table verified: document_uploads');

  // 9. campus_issues
  await pool.query(`
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
  `);
  console.log('✅ Table verified: campus_issues');

  // Seed sample initial opportunities if none exist
  const [oppCount] = await pool.query('SELECT COUNT(*) as c FROM opportunities');
  if (oppCount[0].c === 0) {
    await pool.query(`
      INSERT INTO opportunities (title, type, description, organization, target_departments, target_years, required_skills, eligibility, deadline, action_link, created_by, status)
      VALUES
      ('Summer AI Research Internship 2027', 'internship', 'Paid summer research internship working on NLP and vision systems for autonomous healthcare.', 'AI Research Lab & TechCorp', '[1, 2]', '[3, 4]', '["Python", "PyTorch", "NLP", "Machine Learning"]', 'Minimum 7.5 CGPA, CSE or IT 3rd/4th year students.', '2026-10-25 23:59:59', 'https://example.com/ai-internship', 2, 'active'),
      ('Smart Campus Hackathon 2026', 'hackathon', '48-hour nationwide hackathon to build intelligent solutions for modern smart university campuses. Prize pool of Rs 2,50,000.', 'Innovation Cell & ACM Student Chapter', '[1, 2, 3]', '[1, 2, 3, 4]', '["React", "Node.js", "Python", "IoT", "Mobile Development"]', 'Open to all undergraduate engineering students in teams of 2 to 4.', '2026-10-15 18:00:00', 'https://example.com/hackathon-register', 2, 'active'),
      ('National Cybersecurity Coding Contest', 'contest', 'Competitive coding challenge testing network security, cryptography, and secure programming.', 'Cyber Security Club & DEFCON Group', '[1, 2]', '[2, 3, 4]', '["C++", "Python", "Algorithms", "Cryptography", "Linux"]', 'All engineering students interested in security and competitive programming.', '2026-10-18 20:00:00', 'https://example.com/cyber-contest', 2, 'active'),
      ('Women in Technology Fellowship', 'scholarship', 'Merit fellowship offering mentorship, full semester fee sponsorship, and fast-track placement interviews.', 'Global Tech Foundation', '[1, 2, 3, 4, 5]', '[2, 3]', '["Academic Excellence", "Leadership", "Coding"]', 'Female students in 2nd or 3rd year with minimum 8.0 CGPA.', '2026-11-01 23:59:59', 'https://example.com/women-tech-fellowship', 2, 'active')
    `);
    console.log('✅ Seeded sample opportunities for demonstration');
  }

  // Update student skills if null
  await pool.query(`
    UPDATE users SET skills = '["React", "Node.js", "Python", "DSA", "SQL"]' WHERE email = 'student@test.com' AND (skills IS NULL OR JSON_LENGTH(skills) = 0)
  `);
  console.log('✅ Seeded demo skills for test student');

  console.log('Phase 4 database migration finished successfully!');
  process.exit(0);
}

migratePhase4().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
