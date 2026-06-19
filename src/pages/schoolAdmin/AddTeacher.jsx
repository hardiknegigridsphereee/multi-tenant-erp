import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";

/* ─────────────────────────────────────────────
   Skeleton Shimmer Styles
───────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("skeleton-style")) {
  const s = document.createElement("style");
  s.id = "skeleton-style";
  s.textContent = `@keyframes skeleton-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
  document.head.appendChild(s);
}

const SHIMMER = {
  background: "linear-gradient(90deg,color-mix(in srgb,var(--color-outline-variant) 16%,var(--color-surface-container-lowest)) 25%,color-mix(in srgb,var(--color-outline-variant) 28%,var(--color-surface-container-lowest)) 50%,color-mix(in srgb,var(--color-outline-variant) 16%,var(--color-surface-container-lowest)) 75%)",
  backgroundSize: "200% 100%",
  animation: "skeleton-shimmer 1.4s ease infinite",
};

function Sk({ w, h, r = 6, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...SHIMMER, ...style }} />;
}

// ── Full‑page Skeleton ──
function AddTeacherSkeleton() {
  return (
    <SchoolLayout>
      <div className="px-4 md:px-8 pt-4 pb-12 space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <Sk w={140} h={20} />
          <div className="flex gap-2 w-full sm:w-auto"><Sk h={36} className="flex-1 sm:w-20" /><Sk h={36} className="flex-1 sm:w-28" /></div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
            <Sk w={64} h={64} r={16} />
            <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5"><Sk w={70} h={10} /><Sk h={38} className="w-full" /></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2">
            <Sk w={16} h={16} r={999} />
            <Sk w={120} h={16} />
          </div>
          <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5"><Sk w={80} h={10} /><Sk h={38} className="w-full" /></div>
            ))}
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}

/* ─────────────────────────────────────────────
   Design System Tokens
───────────────────────────────────────────── */
const labelClass = "text-[10px] md:text-xs font-bold uppercase tracking-wider text-on-surface-variant/80 mb-1.5 block";
const editFieldClass = "w-full text-xs md:text-sm font-semibold text-on-surface bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none px-3 py-2 rounded-lg transition";

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-primary shrink-0" />
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant/60">{icon}</span>
        <h3 className="text-sm font-headline font-bold text-on-surface">{title}</h3>
      </div>
      <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Form Entry Module
───────────────────────────────────────────── */
export default function AddTeacher() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromQuickAdd = location.state?.fromQuickAdd || false;

  // Account fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Profile fields
  const [employeeId, setEmployeeId] = useState("");
  const [qualification, setQualification] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [joiningDate, setJoiningDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  // ── Toast helper ──
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Simulate page load to show skeleton
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // ── Submit ──
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userData = await schoolAdminApi.createUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      if (userData.id) {
        const profilePayload = { user: userData.id, employee_id: employeeId };
        if (qualification) profilePayload.qualification = qualification;
        if (phoneNumber) profilePayload.phone_number = phoneNumber;
        if (joiningDate) profilePayload.joining_date = joiningDate;

        await schoolAdminApi.createTeacherProfile(profilePayload);
      }

      showToast("Faculty onboarded successfully!");
      setTimeout(() => navigate(fromQuickAdd ? "/school-admin" : "/school-admin/teachers"), 1000);
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string" && data.includes("<!DOCTYPE")) {
          setError("Server error (500). Verify connection setup.");
        } else {
          setError(Object.entries(data).map(([f, v]) => `${f}: ${Array.isArray(v) ? v.join(" ") : v}`).join(" | "));
        }
      } else {
        setError(err.message);
      }
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const initials = firstName && lastName 
    ? `${firstName[0]}${lastName[0]}`.toUpperCase() 
    : firstName ? firstName.slice(0, 2).toUpperCase() : "TC";

  if (pageLoading) return <AddTeacherSkeleton />;

// ── Render ──
  return (
    <SchoolLayout>
      <form onSubmit={handleSave} className="w-full">
        <div className="px-4 md:px-8 pt-4 pb-12 space-y-6 mx-auto">

          {/* Action Status Toast Notifications */}
          {toast && (
            <div className={`fixed top-6 right-4 md:right-6 z-50 px-5 py-3.5 rounded-xl shadow-xl font-bold text-xs md:text-sm flex items-center gap-3 border border-outline-variant/10 transition-all ${
              toast.type === "success" ? "bg-success text-white" : "bg-error text-white"
            }`}>
              <span className="material-symbols-outlined text-base">
                {toast.type === "success" ? "check_circle" : "error"}
              </span>
              {toast.msg}
            </div>
          )}

          {/* ── Top Bar Action Navigation Strip ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(fromQuickAdd ? "/school-admin" : "/school-admin/teachers")}
              className="flex items-center gap-1.5 text-primary text-xs md:text-sm font-bold hover:underline"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              {fromQuickAdd ? "Back to Dashboard" : "Back to Directory"}
            </button>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => navigate(fromQuickAdd ? "/school-admin" : "/school-admin/teachers")}
                className="px-4 py-2 text-xs md:text-sm text-on-surface-variant font-bold hover:bg-surface-container-high rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-primary text-white text-xs md:text-sm font-bold rounded-lg shadow-sm disabled:opacity-60 transition"
              >
                {loading && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
                {loading ? "Saving..." : "Add Faculty"}
              </button>
            </div>
          </div>

          {/* Managed System Error Dashboard Banner */}
          {error && (
            <div className="p-3.5 bg-error/10 text-error rounded-xl border border-error/20 text-xs md:text-sm font-medium flex gap-2.5 items-start">
              <span className="material-symbols-outlined text-lg shrink-0">error</span>
              <div className="break-all">{error}</div>
            </div>
          )}

          {/* ── Core Identity Account Profiles Module ── */}
          <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
              
              {/* Dynamic Live Preview Onboarding Initials Badge */}
              <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg md:text-xl border border-primary/20">
                {initials}
              </div>

              {/* Dynamic Grid Form Blocks for Identity */}
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Divesh"
                      className={editFieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Kumar"
                      className={editFieldClass}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Professional Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="teacher@school.com"
                      className={`${editFieldClass} font-mono`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Temporary Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={editFieldClass}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Professional Placement Specifications Grid ── */}
          <SectionCard title="Professional Details" icon="school">
            <div>
              <label className={labelClass}>Employee ID</label>
              <input
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP-2026-001"
                className={editFieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Qualification</label>
              <input
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. PhD, M.Sc"
                className={editFieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Faculty phone number"
                className={editFieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Joining Date</label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className={editFieldClass}
              />
            </div>
          </SectionCard>

        </div>
      </form>
    </SchoolLayout>
  );
}