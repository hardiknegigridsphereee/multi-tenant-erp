import React, { useState, useRef, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";
import { API_BASE_URL } from "../../services/api";

// ─── helpers ────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function ProfileSkeleton() {
  return (
    <MainLayout title="Student Profile">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 md:mb-12">
          <div className="md:col-span-8 bg-white rounded-xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 shadow-sm">
            <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-2xl flex-shrink-0" />
            <div className="flex-1 w-full">
              <Skeleton className="w-64 h-10 mb-4" />
              <Skeleton className="w-32 h-7 rounded-full mb-4" />
              <Skeleton className="w-48 h-6 mb-6" />
            </div>
          </div>
          <div className="md:col-span-4 grid grid-cols-1 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 flex items-center justify-between shadow-sm">
                <div><Skeleton className="w-20 h-3 mb-2" /><Skeleton className="w-16 h-9" /></div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {[1, 2].map(i => (
            <section key={i} className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="w-48 h-7" />
              </div>
              <div className="bg-white rounded-xl p-6 space-y-6 shadow-sm">
                {[1, 2, 3].map(j => (
                  <div key={j}><Skeleton className="w-24 h-3 mb-2" /><Skeleton className="w-40 h-5" /></div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

// ─── upload helpers (raw fetch — no axiosClient, avoids interceptors) ────────

/**
 * Step 1 — Ask our backend for a signed R2 upload URL.
 * POST /api/v1/uploads/generate-url/
 * Returns: { url, file_path, file_id, file_url, expires_at, expires_in }
 */
// Uses the same endpoint + flow that works in the parent portal
async function generateUploadUrl(fileName, fileType) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/uploads/profile-image/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      file_name: fileName,
      content_type: fileType,
      profile_type: "student",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `generate-url failed: ${res.status}`);
  }
  return res.json(); // { upload_url, file_path, ... }
}

/**
 * Step 2 — PUT the file directly to R2.
 * This endpoint does NOT sign content-type (same as parent portal),
 * so no Content-Type header needed on the PUT.
 */
async function putFileToR2(signedUrl, file) {
  const res = await fetch(signedUrl, {
    method: "PUT",
    body: file,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`R2 upload failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

/**
 * Step 3 — Save file_path on the student profile.
 * PATCH /api/v1/profiles/students/me/
 */
async function saveProfilePicture(filePath) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_BASE_URL}/api/v1/profiles/students/me/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ profile_picture: filePath }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `profile update failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch signed view URL for an existing profile picture path.
 * GET /api/v1/uploads/view-url/?file_path={path}
 */
async function fetchViewUrl(filePath) {
  if (!filePath) return null;
  const token = localStorage.getItem("access_token");
  const res = await fetch(
    `${API_BASE_URL}/api/v1/uploads/view-url/?file_path=${encodeURIComponent(filePath)}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  // Response may be { url: "..." } or { view_url: "..." }
  return data.url || data.view_url || null;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function Profile() {
  const {
    profile: student,
    dashboard: studentData,
    enrollment: enroll,
    parents,
    loading,
    reload,
  } = useStudent();

  // Upload state
  const fileInputRef                      = useRef(null);
  const [picPreview, setPicPreview]       = useState(null); // blob URL while pending
  const [picFile, setPicFile]             = useState(null);
  const [uploading, setUploading]         = useState(false);
  const [uploadMsg, setUploadMsg]         = useState(null); // { type: "success"|"error", text }

  // Fetch signed view URL for existing profile picture on mount / when student changes
  useEffect(() => {
    if (!student?.profile_picture) return;
    // If it's already a full URL (http...), use directly
    if (student.profile_picture.startsWith("http")) {
      setPicPreview(student.profile_picture);
      return;
    }
    // Otherwise fetch a signed view URL from the backend
    fetchViewUrl(student.profile_picture).then((url) => {
      if (url) setPicPreview(url);
    });
  }, [student?.profile_picture]);

  if (loading) return <ProfileSkeleton />;

  if (!student)
    return (
      <MainLayout title="Student Profile">
        <div className="p-4 sm:p-6 md:p-8">No profile data found.</div>
      </MainLayout>
    );

  // ── derived stats ────────────────────────────────────────────────────────
  const attendanceRate =
    studentData?.attendanceSummary?.attendance_percentage?.toFixed(1) ?? "0.0";

  const recentGrades  = studentData?.dashboardRaw?.recent_grades ?? [];
  const totalMarks    = recentGrades.reduce((s, g) => s + parseFloat(g.marks    ?? 0), 0);
  const totalMax      = recentGrades.reduce((s, g) => s + parseFloat(g.max_marks ?? 1), 0);
  const scorePercent  = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : "0.0";

  // ── avatar source priority: local preview → profile_picture from API ─────
  const avatarSrc = picPreview || student.profile_picture || null;

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate type & size (max 5 MB)
    if (!file.type.startsWith("image/")) {
      setUploadMsg({ type: "error", text: "Please select an image file." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadMsg({ type: "error", text: "Image must be under 5 MB." });
      return;
    }
    setPicFile(file);
    setPicPreview(URL.createObjectURL(file));
    setUploadMsg(null);
    // Reset input so the same file can be re-selected after cancel
    e.target.value = "";
  };

  const handleCancel = () => {
    setPicFile(null);
    if (picPreview) URL.revokeObjectURL(picPreview);
    setPicPreview(null);
    setUploadMsg(null);
  };

  const handleSave = async () => {
    if (!picFile) return;
    setUploading(true);
    setUploadMsg(null);

    try {
      // 1. Get signed URL from our backend
      // /uploads/profile-image/ returns { upload_url, file_path } — same as parent portal
      const { upload_url: signedUrl, file_path } = await generateUploadUrl(picFile.name, picFile.type);

      // 2. Upload file directly to R2
      await putFileToR2(signedUrl, picFile);

      // 3. Save file_path on student profile
      await saveProfilePicture(file_path);

      // 4. Fetch the signed view URL for the newly uploaded picture
      //    so the avatar persists correctly after reload
      const viewUrl = await fetchViewUrl(file_path);
      if (picPreview) URL.revokeObjectURL(picPreview);
      setPicPreview(viewUrl || null);
      setPicFile(null);
      setUploadMsg({ type: "success", text: "Photo updated!" });

      // Silently reload context so profile_picture field stays in sync
      reload?.();

    } catch (err) {
      console.error("[Profile] photo upload failed:", err);
      setUploadMsg({ type: "error", text: err.message || "Upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <MainLayout title="Student Profile">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">

        {/* ── Top grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 md:mb-12">

          {/* Left card */}
          <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-5 sm:p-6 md:p-8 flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8 shadow-sm overflow-hidden">

            {/* Avatar column */}
            <div className="flex flex-col items-center gap-3 flex-shrink-0">

              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-2xl bg-blue-100 flex items-center justify-center shadow-xl overflow-hidden">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-5xl sm:text-6xl text-blue-300">
                      person
                    </span>
                  )}
                </div>

                {/* Camera button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Change photo"
                  disabled={uploading}
                  className="absolute -bottom-3 -right-3 bg-primary text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Pending upload: file name + action buttons */}
              {picFile && (
                <div className="flex flex-col items-center gap-2 w-full max-w-[12rem]">
                  <p className="text-xs text-on-surface-variant truncate w-full text-center">
                    {picFile.name}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={uploading}
                      className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {uploading ? "hourglass_empty" : "upload"}
                      </span>
                      {uploading ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={uploading}
                      className="flex items-center gap-1 bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-80 transition-all disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Status message */}
              {uploadMsg && (
                <p className={`text-xs font-semibold flex items-center gap-1 text-center ${
                  uploadMsg.type === "success" ? "text-green-600" : "text-red-500"
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {uploadMsg.type === "success" ? "check_circle" : "error"}
                  </span>
                  {uploadMsg.text}
                </p>
              )}

              {/* Change photo link (only when no file pending) */}
              {/* {!picFile && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Change photo
                </button>
              )} */}
            </div>

            {/* Name / status / enroll */}
            <div className="flex-1 w-full min-w-0 flex flex-col items-center lg:items-start">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-headline text-on-surface text-center lg:text-left break-words leading-tight">
                {student.name || `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim()}
              </h1>

              <span className={`mt-3 inline-flex items-center px-4 py-1.5 text-xs font-bold rounded-full ${
                student.is_archived
                  ? "bg-red-100 text-red-700"
                  : "bg-surface-container-highest text-primary"
              }`}>
                {student.is_archived ? "ARCHIVED" : "ACTIVE STUDENT"}
              </span>

              <p className="text-on-surface-variant font-medium text-base sm:text-lg mt-4 mb-4 sm:mb-6 text-center lg:text-left">
                Enrolled via {enroll?.academic_year_name ?? "N/A"}
              </p>
            </div>
          </div>

          {/* Right stats */}
          <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-6">
            {[
              { label: "Overall Score", value: scorePercent,    icon: "grade"           },
              { label: "Attendance",    value: attendanceRate,  icon: "event_available" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-surface-container-lowest rounded-xl p-6 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-3xl font-black text-on-surface font-headline">
                    {value}<span className="text-lg font-semibold">%</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-3xl">{icon}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom sections ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

          {/* Academic Information */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <span className="material-symbols-outlined text-primary">school</span>
              <h2 className="text-lg sm:text-xl font-bold font-headline">Academic Information</h2>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-sm">
              <div className="p-4 sm:p-6 space-y-6">
                {[
                  {
                    label: "Class / Grade",
                    value: enroll
                      ? `${enroll.class_level_name} - ${enroll.section_name}`
                      : "Not Assigned",
                  },
                  { label: "Enrollment Number", value: student.enrollment_number },
                  { label: "Roll Number",        value: enroll?.roll_number ?? "Unassigned" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>
                    <p className="text-on-surface font-semibold text-base sm:text-lg mt-1 break-all">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Personal Contact */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <span className="material-symbols-outlined text-primary">contact_page</span>
              <h2 className="text-lg sm:text-xl font-bold font-headline">Personal Contact</h2>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-sm">
              <div className="p-4 sm:p-6 space-y-6">
                {[
                  { icon: "mail",           label: "Email Address",     value: student.email },
                  { icon: "home",           label: "Residence",         value: student.address || "Not provided" },
                  {
                    icon: "emergency_share",
                    label: "Emergency Contact",
                    value: parents.length > 0
                      ? `${parents[0].name || parents[0].parent_name} (${parents[0].relationship})`
                      : "No Contact Registered",
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>
                      <p className="text-on-surface font-semibold break-words">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </div>
    </MainLayout>
  );
}
