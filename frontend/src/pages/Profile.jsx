import { useEffect, useState } from "react";
import {
    UserRound,
    Save,
    ShieldCheck,
    School,
    GraduationCap,
    CheckCircle,
    BookOpen,
    Clock,
    Award,
    Building2,
    Briefcase
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const role = (user?.role_name || user?.role || "student").toLowerCase();

    const [form, setForm] = useState({
        name: "",
        email: "",
        department_id: "",
        phone: "",
        // Student specific
        year: "",
        student_id_prn: "",
        division: "",
        interests: "",
        skills: "",
        // Faculty specific
        employee_id: "",
        designation: "",
        qualifications: "",
        specialization: "",
        areas_of_expertise: "",
        years_of_experience: "",
        office_room: "",
        office_hours: ""
    });

    const [departments, setDepartments] = useState([]);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            let details = user.profile_details || {};
            if (typeof details === "string") {
                try { details = JSON.parse(details); } catch { /* ignore */ }
            }
            let interests = user.interests;
            if (typeof interests === "string") {
                try { interests = JSON.parse(interests); } catch { /* ignore */ }
            }
            let skills = user.skills;
            if (typeof skills === "string") {
                try { skills = JSON.parse(skills); } catch { /* ignore */ }
            }

            setForm({
                name: user.name || "",
                email: user.email || "",
                department_id: user.department_id || "",
                phone: user.phone || "",
                // Student
                year: user.year || "",
                student_id_prn: user.student_id_prn || "",
                division: user.division || "",
                interests: Array.isArray(interests) ? interests.join(", ") : (typeof interests === "string" ? interests : ""),
                skills: Array.isArray(skills) ? skills.join(", ") : (typeof skills === "string" ? skills : ""),
                // Faculty / Admin
                employee_id: user.employee_id || "",
                designation: user.designation || "",
                qualifications: details.qualifications || "",
                specialization: details.specialization || "",
                areas_of_expertise: details.areas_of_expertise || (Array.isArray(skills) ? skills.join(", ") : (typeof skills === "string" ? skills : "")),
                years_of_experience: details.years_of_experience || "",
                office_room: details.office_room || user.division || "",
                office_hours: details.office_hours || ""
            });
        }
        api.get("/users/departments")
            .then((r) => setDepartments(r.data?.data?.departments || r.data?.data || []))
            .catch(() => {});
    }, [user]);

    const save = async (e) => {
        e.preventDefault();
        setMessage("");
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                phone: form.phone ? form.phone.trim() : null,
                department_id: form.department_id ? Number(form.department_id) : null
            };

            if (role === "student") {
                payload.year = form.year ? Number(form.year) : null;
                payload.student_id_prn = form.student_id_prn ? form.student_id_prn.trim() : null;
                payload.division = form.division ? form.division.trim() : null;
                payload.skills = form.skills ? form.skills.split(",").map((x) => x.trim()).filter(Boolean) : [];
                payload.interests = form.interests ? form.interests.split(",").map((x) => x.trim()).filter(Boolean) : [];
            } else if (role === "faculty") {
                payload.employee_id = form.employee_id ? form.employee_id.trim() : null;
                payload.designation = form.designation ? form.designation.trim() : null;
                payload.division = form.office_room ? form.office_room.trim() : null;
                payload.profile_details = {
                    qualifications: form.qualifications ? form.qualifications.trim() : null,
                    specialization: form.specialization ? form.specialization.trim() : null,
                    areas_of_expertise: form.areas_of_expertise ? form.areas_of_expertise.trim() : null,
                    years_of_experience: form.years_of_experience ? form.years_of_experience.trim() : null,
                    office_room: form.office_room ? form.office_room.trim() : null,
                    office_hours: form.office_hours ? form.office_hours.trim() : null
                };
            } else if (role === "administrator" || role === "admin") {
                payload.employee_id = form.employee_id ? form.employee_id.trim() : null;
                payload.designation = form.designation ? form.designation.trim() : null;
                payload.division = form.office_room ? form.office_room.trim() : null;
            }

            await api.put("/users/me", payload);
            setMessage("Profile updated successfully.");
            if (refreshUser) refreshUser();
        } catch (error) {
            setMessage(error.response?.data?.message || "Could not update profile.");
        } finally {
            setSaving(false);
        }
    };

    const isStudent = role === "student";
    const isFaculty = role === "faculty";
    const isAdmin = role === "administrator" || role === "admin";

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <p className="dashboard-eyebrow">
                        {isAdmin ? "ADMINISTRATIVE ACCOUNT" : (isFaculty ? "FACULTY PROFILE" : "STUDENT PROFILE")}
                    </p>
                    <h1>{isStudent ? "Student Profile" : (isFaculty ? "Faculty Member Profile" : "Administrator Profile")}</h1>
                    <p>
                        {isStudent
                            ? "Keep your academic info, skills, and interests updated for team matching and opportunities."
                            : (isFaculty
                                ? "Manage your faculty designation, department, cabin/office details, and academic specializations."
                                : "Manage your administrator account details, office location, and security contact info.")}
                    </p>
                </div>
            </div>

            <form className="profile-form-card" onSubmit={save}>
                {/* Avatar & Header Block */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <div className="profile-large-avatar" style={{ marginBottom: 0 }}>
                        {isAdmin ? <ShieldCheck size={28} /> : (isFaculty ? <School size={28} /> : <GraduationCap size={28} />)}
                    </div>
                    <div>
                        <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--cb-text-navy)" }}>{user?.name || "Campus Member"}</div>
                        <div style={{ fontSize: "12px", color: "var(--cb-primary)", textTransform: "capitalize", marginTop: "2px", fontWeight: 600 }}>
                            {isAdmin ? "System Administrator" : (isFaculty ? "Faculty Member" : "Registered Student")}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--cb-text-muted)", marginTop: "2px" }}>{user?.email}</div>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* 1. BASIC INFORMATION (Common across roles)                 */}
                {/* ========================================================= */}
                <div className="profile-section-heading">
                    <UserRound size={14} /> Basic Information
                </div>

                <div className="form-grid-two">
                    <label>
                        Full Name *
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            placeholder="Your full official name"
                        />
                    </label>
                    <label>
                        College Email
                        <input
                            value={user?.email || ""}
                            disabled
                            style={{ opacity: 0.7, cursor: "not-allowed" }}
                            title="Institutional email address is managed centrally"
                        />
                    </label>
                </div>

                <div className="form-grid-two">
                    {isFaculty && (
                        <label>
                            Faculty / Employee ID
                            <input
                                value={form.employee_id}
                                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                                placeholder="e.g. FAC-CS-108"
                            />
                        </label>
                    )}

                    {isStudent && (
                        <label>
                            Student PRN / Roll Number
                            <input
                                value={form.student_id_prn}
                                onChange={(e) => setForm({ ...form, student_id_prn: e.target.value })}
                                placeholder="e.g. PRN-2023-CS-042"
                            />
                        </label>
                    )}

                    {isAdmin && (
                        <label>
                            Administrator Employee ID
                            <input
                                value={form.employee_id}
                                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                                placeholder="e.g. ADM-001"
                            />
                        </label>
                    )}

                    <label>
                        Contact Phone Number
                        <input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                        />
                    </label>
                </div>

                {/* ========================================================= */}
                {/* 2. FACULTY SPECIFIC: PROFESSIONAL & ACADEMIC INFO         */}
                {/* ========================================================= */}
                {isFaculty && (
                    <>
                        <div className="profile-section-divider" />
                        <div className="profile-section-heading">
                            <BookOpen size={14} /> Professional Information
                        </div>

                        <div className="form-grid-two">
                            <label>
                                Department
                                <select
                                    value={form.department_id}
                                    onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                                >
                                    <option value="">Select department</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Academic Designation
                                <input
                                    value={form.designation}
                                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                                    placeholder="e.g. Assistant Professor, Associate Professor, HOD"
                                />
                            </label>
                        </div>

                        <div className="form-grid-two">
                            <label>
                                Specialization
                                <input
                                    value={form.specialization}
                                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                                    placeholder="e.g. Artificial Intelligence, Distributed Systems"
                                />
                            </label>

                            <label>
                                Qualifications
                                <input
                                    value={form.qualifications}
                                    onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                                    placeholder="e.g. Ph.D. in Computer Science, M.Tech"
                                />
                            </label>
                        </div>

                        <div className="form-grid-two">
                            <label>
                                Areas of Expertise <span className="field-help">(comma separated)</span>
                                <input
                                    value={form.areas_of_expertise}
                                    onChange={(e) => setForm({ ...form, areas_of_expertise: e.target.value })}
                                    placeholder="e.g. Cloud Computing, Big Data, NLP, IoT"
                                />
                            </label>

                            <label>
                                Years of Experience
                                <input
                                    value={form.years_of_experience}
                                    onChange={(e) => setForm({ ...form, years_of_experience: e.target.value })}
                                    placeholder="e.g. 10 Years"
                                />
                            </label>
                        </div>

                        {/* Optional Faculty Section: Office & Consultation */}
                        <div className="profile-section-divider" />
                        <div className="profile-section-heading">
                            <Clock size={14} /> Office & Student Consultation (Optional)
                        </div>

                        <div className="form-grid-two">
                            <label>
                                Office / Room / Cabin Number
                                <input
                                    value={form.office_room}
                                    onChange={(e) => setForm({ ...form, office_room: e.target.value })}
                                    placeholder="e.g. Faculty Block B, Cabin 304"
                                />
                            </label>

                            <label>
                                Office Hours
                                <input
                                    value={form.office_hours}
                                    onChange={(e) => setForm({ ...form, office_hours: e.target.value })}
                                    placeholder="e.g. Mon & Wed: 2:00 PM – 4:00 PM"
                                />
                            </label>
                        </div>
                    </>
                )}

                {/* ========================================================= */}
                {/* 3. STUDENT SPECIFIC: ACADEMIC & SKILLS INFO               */}
                {/* ========================================================= */}
                {isStudent && (
                    <>
                        <div className="profile-section-divider" />
                        <div className="profile-section-heading">
                            <School size={14} /> Academic Information
                        </div>

                        <div className="form-grid-two">
                            <label>
                                Department
                                <select
                                    value={form.department_id}
                                    onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                                >
                                    <option value="">Select department</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Academic Year
                                <select
                                    value={form.year}
                                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                                >
                                    <option value="">Select year</option>
                                    <option value="1">1st Year (Freshman)</option>
                                    <option value="2">2nd Year (Sophomore)</option>
                                    <option value="3">3rd Year (Junior)</option>
                                    <option value="4">4th Year (Senior)</option>
                                </select>
                            </label>
                        </div>

                        <label>
                            Division / Class Section
                            <input
                                value={form.division}
                                onChange={(e) => setForm({ ...form, division: e.target.value })}
                                placeholder="e.g. Division A, Lab Batch 2"
                            />
                        </label>

                        <div className="profile-section-divider" />
                        <div className="profile-section-heading">
                            <Award size={14} /> Technical Skills & Goals
                        </div>

                        <label>
                            Technical Skills <span className="field-help">comma separated (used for Project & Opportunity Matcher)</span>
                            <input
                                value={form.skills}
                                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                                placeholder="Python, React, Node.js, Machine Learning, UI/UX"
                            />
                        </label>

                        <label>
                            Interests & Career Goals <span className="field-help">comma separated (used for For You recommendations)</span>
                            <input
                                value={form.interests}
                                onChange={(e) => setForm({ ...form, interests: e.target.value })}
                                placeholder="AI, Robotics, Hackathons, Placements, Cloud"
                            />
                        </label>
                    </>
                )}

                {/* ========================================================= */}
                {/* 4. ADMIN SPECIFIC: ADMINISTRATIVE DETAILS                */}
                {/* ========================================================= */}
                {isAdmin && (
                    <>
                        <div className="profile-section-divider" />
                        <div className="profile-section-heading">
                            <Briefcase size={14} /> Administrative Details
                        </div>

                        <div className="form-grid-two">
                            <label>
                                Administrative Designation
                                <input
                                    value={form.designation}
                                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                                    placeholder="e.g. Lead System Administrator, Dean Student Affairs"
                                />
                            </label>

                            <label>
                                Department / Unit
                                <select
                                    value={form.department_id}
                                    onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                                >
                                    <option value="">Select department / unit</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label>
                            Office / Division Location
                            <input
                                value={form.office_room}
                                onChange={(e) => setForm({ ...form, office_room: e.target.value })}
                                placeholder="e.g. Central IT Building, Server Room 101"
                            />
                        </label>
                    </>
                )}

                {message && (
                    <div className={message.includes("success") ? "form-message" : "form-error"} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px" }}>
                        {message.includes("success") && <CheckCircle size={14} />} {message}
                    </div>
                )}

                <div style={{ marginTop: "24px" }}>
                    <button className="primary-button" type="submit" disabled={saving}>
                        <Save size={15} /> {saving ? "Saving changes..." : "Save Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
}