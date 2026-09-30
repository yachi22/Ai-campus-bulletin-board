# CampusBoard — MIT-WPU Kothrud Demo Credentials & Dataset Guide

> **Important Notice:**
> **Fictional academic demonstration accounts — not real university accounts.**
> All credentials listed in this document are strictly for evaluation, testing, and faculty demonstration purposes.
> Passwords are encrypted with standard bcrypt hashing (salt rounds: 10) in the MySQL database.
> These demonstration credentials are not displayed on the public login UI.

---

## 🔑 Demonstration Accounts

### 1. Existing Core Accounts

| Role | Email | Password | Department | Profile Summary |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@test.com` | `Admin@123` | Campus Admin / CSE | Full system administrative oversight, issue triage, and management |
| **Faculty Member** | `faculty@test.com` | `Faculty@123` | Computer Science & Engineering | Academic reviews, moderation panels, and lecture scheduling |
| **Enrolled Student** | `student@test.com` | `Student@123` | Computer Science & Engineering | 3rd Year B.Tech, Project owner, active campus schedule with overlap |

---

### 2. Additional Students (Exact 5 Test Personas)

All student accounts use password: **`Student@123`** (Role: `student`, Active).

| Account | Name | Department | Academic Year | Interests | Skills |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `student01@test.com` | Aarav Sharma | **CSE** (Computer Science & Engineering) | **3rd Year** | AI/ML, Python | Python, Machine Learning, SQL |
| `student02@test.com` | Priya Patel | **ECE** (Electronics & Communication) | **2nd Year** | IoT, Robotics | C++, Embedded Systems, IoT |
| `student03@test.com` | Rohan Deshmukh | **CSE** (Computer Science & Engineering) | **3rd Year** | Cybersecurity, Networking | C++, Python, Networking, Security |
| `student04@test.com` | Ananya Iyer | **CSF** (Cyber Security & Forensics) | **2nd Year** | Web Development, Full Stack | JavaScript, React, Node.js, MySQL |
| `student05@test.com` | Vikram Malhotra | **Management** (School of Management) | **2nd Year** | Entrepreneurship, Startups | Business Strategy, Marketing, Presentation |

---

### 3. Additional Faculty (Exact 5 Faculty Personas)

All faculty accounts use password: **`Faculty@123`** (Role: `faculty`, Active).

| Account | Name | Department | Designation | Expertise | Campus Office |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `faculty01@test.com` | Dr. Sunil Kadam | **CSE** (Computer Science & Engineering) | Faculty | AI/ML | Vyas Building Cabin 301 |
| `faculty02@test.com` | Prof. Anjali Ranade | **ECE** (Electronics & Communication) | Faculty | IoT and Embedded Systems | Dhruv Building Cabin 204 |
| `faculty03@test.com` | Dr. Amit Vashishta | **CSE** (Computer Science & Engineering) | Faculty | Cybersecurity and Networking | Vyas Building Cabin 308 |
| `faculty04@test.com` | Prof. Smita Joshi | **CSF** (Cyber Security & Forensics) | Faculty | Web and Software Development | Chanakya Building Cabin 102 |
| `faculty05@test.com` | Dr. Narendra Kulkarni | **Management** (School of Management) | Faculty | Entrepreneurship and Innovation | Sant Dnyaneshwar Hall Wing B |

*Note on Faculty Role Separation: Faculty accounts receive the dedicated faculty dashboard. They are strictly prohibited from viewing or accessing the student Project Team Matcher and student "For You" recommendations.*

---

## 🏛️ MIT-WPU Kothrud Campus Nomenclature

All dataset records, locations, and issues strictly use authentic **MIT-WPU Kothrud Campus** nomenclature:

- **Vyas Building** *(Spelled strictly with 'S' — housing Computer Science, AI Labs, Classrooms, Dean Offices, and AP-VYAS-01 through 08)*
- **Dhruv Building** *(Housing Robotics Workshops, Hardware Labs, Civil & Material Labs)*
- **Chanakya Building** *(Housing Advanced Computing, Seminar Halls, and Conference Facilities)*
- **Swami Vivekanand Auditorium** *(Main campus auditorium for symposiums and keynotes)*
- **Sant Dnyaneshwar Hall** *(Air-conditioned hall for academic colloquiums and meetings)*
- **Atri Lawns** *(Central outdoor green space and open stage for cultural fests and exhibitions)*
- **Sports Ground** *(Multi-sport outdoor facilities with basketball courts and floodlit fields)*
- **Eco Park** *(Campus environmental zone for drone demonstrations and tree initiatives)*
- **Central Library** *(Quiet study zones, IEEE digital wings, and reading rooms)*

---

## 🎯 Verification Scenarios

### 1. Recommendation Personalization (Deterministic Algorithm)
Each student profile naturally receives distinct top-ranked recommendations without changing backend logic:
- `student01@test.com` (CSE, AI/ML, Python) → Top: *Research Internship Call: Winter Cycle 2026 at Vyas AI Lab* (90 pts)
- `student02@test.com` (ECE, IoT, Robotics) → Top: *IoT Smart Campus Project Exhibition — Vyas 2nd Floor Corridor* (90 pts)
- `student03@test.com` (CSE, Cybersecurity, Networking) → Top: *Cybersecurity Club: Hands-on Ethical Hacking CTF at Dhruv 302* (90 pts)
- `student04@test.com` (CSF, Web Development, Full Stack) → Top: *Full Stack Web Development Bootcamp Announcement (MERN Stack)* (90 pts)
- `student05@test.com` (Management, Entrepreneurship, Startups) → Top: *MIT-WPU E-Cell: Startup Pitch Challenge — Seed Grants Announcement* (90 pts)

### 2. Schedule & Conflict Intelligence
The schedule analysis distinguishes between different conflict types:
- **Conflict-Free Schedules**: `student01@test.com`, `student02@test.com`, `student05@test.com` have clean, non-overlapping lectures and labs (0 conflicts).
- **Type A (Schedule Overlap)**: `student03@test.com` has two concurrent sessions (*Cybersecurity Workshop* 14:00–16:00 and *Network Security Lab Viva* 15:00–17:00).
- **Type C (Deadline + Event Conflict)**: `student04@test.com` has an assignment deadline at 14:30 occurring during an active sprint event (14:00–16:00).
- **Faculty Academic Overlap**: `faculty@test.com` has *Academic Review Committee Meeting* overlapping with *Examination Moderation Panel*.

### 3. Vyas Building Wi-Fi Cluster in Campus Issues
- 5 related Wi-Fi reports in Vyas Building under canonical category `Internet / Wi-Fi`:
  - Intermittent Wi-Fi Disconnection on 3rd Floor East Wing (Vyas Building)
  - Eduroam Wi-Fi Authentication Timeout in Vyas Reading Hall
  - Vyas Building 4th Floor Corridor Wi-Fi Signal Loss
  - Wi-Fi DHCP IP Exhaustion during Seminars in Vyas Room 201
  - Vyas Building Ground Floor Lobby Wi-Fi AP Red Blinking LED
- Canonical categories enforced across all issues: `Infrastructure`, `Electrical`, `Internet / Wi-Fi`, `Classroom Equipment`, `Laboratory`, `Cleanliness`, `Water`, `Safety`, `Other`.

### 4. Professional Image Architecture
- 100% of cards in Project Team Matcher (34/34), Lost & Found (26/26), Bulletins, Events, and Opportunities use dedicated, subject-specific visual assets stored locally in `frontend/public/images/`.
- No broken image icons, no missing image areas, no 404 network errors, and zero generic "Campus Announcement" or graduation cap fallbacks on project/lost & found cards.
