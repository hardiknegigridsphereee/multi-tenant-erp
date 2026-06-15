import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";
import { calculateAttendance, calculateGPA } from "../../utils/calculations";

// Skeleton Components
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function ProfileSkeleton() {
  return (
    <MainLayout title="Student Profile">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 md:mb-12">
          {/* Left Card Skeleton */}
          <div className="md:col-span-8 bg-white rounded-xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 shadow-sm">
            <div className="relative group">
              <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-2xl" />
            </div>
            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <Skeleton className="w-64 h-10 mx-auto md:mx-0" />
                <Skeleton className="w-32 h-7 rounded-full mx-auto md:mx-0" />
              </div>
              <Skeleton className="w-48 h-6 mb-6 mx-auto md:mx-0" />
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Skeleton className="w-36 h-12 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Right Stats Cards Skeleton */}
          <div className="md:col-span-4 grid grid-cols-1 gap-6">
            <div className="bg-white rounded-xl p-6 flex items-center justify-between shadow-sm">
              <div>
                <Skeleton className="w-20 h-3 mb-2" />
                <Skeleton className="w-16 h-9" />
              </div>
              <Skeleton className="w-12 h-12 rounded-lg" />
            </div>

            <div className="bg-white rounded-xl p-6 flex items-center justify-between shadow-sm">
              <div>
                <Skeleton className="w-24 h-3 mb-2" />
                <Skeleton className="w-16 h-9" />
              </div>
              <Skeleton className="w-12 h-12 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Academic Information Skeleton */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-48 h-7" />
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="w-24 h-3 mb-2" />
                    <Skeleton className="w-40 h-5" />
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="w-32 h-3 mb-2" />
                    <Skeleton className="w-48 h-7" />
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="w-24 h-3 mb-2" />
                    <Skeleton className="w-32 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Personal Contact Skeleton */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-40 h-7" />
            </div>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="w-24 h-3 mb-2" />
                    <Skeleton className="w-48 h-5" />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="w-24 h-3 mb-2" />
                    <Skeleton className="w-56 h-5" />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="w-32 h-3 mb-2" />
                    <Skeleton className="w-48 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}

export default function Profile() {
  const {
    profile: student,
    dashboard: studentData,
    enrollment: enroll,
    parents,
    loading,
  } = useStudent();

  // Show skeleton while loading
  if (loading) return <ProfileSkeleton />;

  if (!student)
    return (
      <MainLayout title="Student Profile">
        <div className="p-4 sm:p-6 md:p-8">No profile data found.</div>
      </MainLayout>
    );

  const attendance = studentData?.attendance?.results || [];
  const attendanceRate = calculateAttendance(attendance);
  const grades = studentData?.grades?.results || [];
  const gpa = calculateGPA(grades);

  return (
    <MainLayout title="Student Profile">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 md:mb-12">

          {/* Left Card - Profile Info */}
          <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 shadow-sm border border-outline-variant/10">
            <div className="relative group flex-shrink-0">
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-50 shadow-xl overflow-hidden">
                {student.profile_picture ? (
                  <img
                    src={student.profile_picture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-5xl sm:text-6xl">
                    person
                  </span>
                )}
              </div>
              <button className="absolute -bottom-3 -right-3 bg-primary-container text-white p-2.5 sm:p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
                <span
                  className="material-symbols-outlined text-base sm:text-lg"
                  data-icon="photo_icon"
                >
                  photo_camera
                </span>
              </button>
            </div>

            <div className="flex-1 text-center md:text-left w-full min-w-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold font-headline text-on-surface break-words leading-tight">
                  {student.first_name} {student?.last_name}
                </h1>
                <span
                  className={`px-3 py-1 text-[10px] font-bold rounded-full self-center md:self-auto whitespace-nowrap ${
                    student.is_archived
                      ? "bg-red-100 text-red-700"
                      : "bg-surface-container-highest text-primary"
                  }`}
                >
                  {student?.is_archived ? "ARCHIVED" : "ACTIVE STUDENT"}
                </span>
              </div>
              <p className="text-on-surface-variant font-medium text-xs mb-4 sm:mb-5">
                Enrolled via {enroll ? enroll.academic_year_name : "N/A"}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button className="bg-primary text-white px-5 sm:px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined text-base" data-icon="edit">
                    edit
                  </span>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Right Stats Cards — matches attendance card style */}
          <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">

            {/* GPA Card */}
            <div className="bg-surface-container-lowest px-4 py-3 rounded-xl shadow-sm border border-outline-variant/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0">
                  <span className="material-symbols-outlined text-xl" data-icon="grade">
                    grade
                  </span>
                </span>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant">GPA Score</p>
                  <p className="text-2xl font-bold font-headline text-on-surface leading-tight">
                    {gpa}
                  </p>
                </div>
              </div>
              <div className="w-14 flex flex-col items-end gap-1 flex-shrink-0">
                <div className="w-full bg-surface-container rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((gpa / 4) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[9px] text-on-surface-variant">{gpa} of 4.0</span>
              </div>
            </div>

            {/* Attendance Card */}
            <div className="bg-surface-container-lowest px-4 py-3 rounded-xl shadow-sm border border-outline-variant/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-purple-50 text-purple-600 rounded-lg flex-shrink-0">
                  <span className="material-symbols-outlined text-xl" data-icon="event_available">
                    event_available
                  </span>
                </span>
                <div>
                  <p className="text-[10px] font-medium text-on-surface-variant">Attendance</p>
                  <p className="text-2xl font-bold font-headline text-on-surface leading-tight">
                    {attendanceRate}<span className="text-sm font-semibold">%</span>
                  </p>
                  <p className="text-[9px] text-on-surface-variant italic">
                    {attendanceRate >= 75
                      ? `${Math.abs(attendanceRate - 75)}% above limit`
                      : `${Math.abs(attendanceRate - 75)}% below limit`}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full self-start whitespace-nowrap flex-shrink-0 ${
                attendanceRate >= 75 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
              }`}>
                {attendanceRate >= 75 ? "Met" : "Not Met"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

          {/* Academic Information Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <span
                className="material-symbols-outlined text-primary text-base"
                data-icon="school"
              >
                school
              </span>
              <h2 className="text-sm font-bold font-headline text-on-surface">
                Academic Information
              </h2>
            </div>
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
              <div className="px-4 py-3 space-y-5">

                <div className="flex justify-between items-start">
                  <div>
                    <label className="text-[10px] font-medium text-on-surface-variant">
                      Class / Grade
                    </label>
                    <p className="text-on-surface font-semibold text-sm mt-0.5">
                      {enroll
                        ? `${enroll.class_level_name} - ${enroll.section_name}`
                        : "Not Assigned"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <label className="text-[10px] font-medium text-on-surface-variant">
                      Enrollment Number
                    </label>
                    <p className="text-on-surface font-semibold text-sm mt-0.5 break-all">
                      {student.enrollment_number}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <label className="text-[10px] font-medium text-on-surface-variant">
                      Roll Number
                    </label>
                    <p className="text-on-surface font-semibold text-sm mt-0.5">
                      {enroll?.roll_number || "Unassigned"}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Personal Contact Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <span
                className="material-symbols-outlined text-primary text-base"
                data-icon="contact_page"
              >
                contact_page
              </span>
              <h2 className="text-sm font-bold font-headline text-on-surface">
                Personal Contact
              </h2>
            </div>
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
              <div className="px-4 py-3 space-y-5">

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center flex-shrink-0">
                    <span
                      className="material-symbols-outlined text-primary text-base"
                      data-icon="mail"
                    >
                      mail
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-medium text-on-surface-variant">
                      Email Address
                    </label>
                    <p className="text-on-surface font-semibold text-sm break-all mt-0.5">
                      {student.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center flex-shrink-0">
                    <span
                      className="material-symbols-outlined text-primary text-base"
                      data-icon="call"
                    >
                      call
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-medium text-on-surface-variant">
                      Residence
                    </label>
                    <p className="text-on-surface font-semibold text-sm break-words mt-0.5">
                      {student.address || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center flex-shrink-0">
                    <span
                      className="material-symbols-outlined text-primary text-base"
                      data-icon="emergency_share"
                    >
                      emergency_share
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-medium text-on-surface-variant">
                      Emergency Contact
                    </label>
                    <p className="text-on-surface font-semibold text-sm break-words mt-0.5">
                      {parents.length > 0
                        ? `${parents[0].parent_name} (${parents[0].relationship})`
                        : "No Contact Registered"}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}