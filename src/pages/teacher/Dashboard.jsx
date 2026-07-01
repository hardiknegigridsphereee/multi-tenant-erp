import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import Card from "../../components/erp/teacher/Card";
import { useStaleData } from "../../hooks/useStaleData";
import { useTheme } from "../../context/ThemeContext";
import { getMyProfile, getMyTeacherAssignments, getAttendanceRecords, getGrades } from "../../services/api";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import { RevalidatingBar, SkeletonBlock } from "../../components/erp/teacher/LoadingPrimitives";

const StatValueSkeleton = ({ darkMode }) => (
  <SkeletonBlock className={`h-9 w-20 mt-2 ${darkMode ? 'bg-white/25' : ''}`} />
);

const ScheduleSkeletonCard = ({ darkMode }) => (
  <Card className={`p-4 flex flex-col sm:flex-row sm:items-center gap-5 border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
    <SkeletonBlock className="w-14 h-14 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBlock className="h-4 w-2/3" />
      <SkeletonBlock className="h-3 w-1/3" />
    </div>
    <div className="flex gap-3">
      <SkeletonBlock className="h-9 w-24 rounded-md" />
      <SkeletonBlock className="h-9 w-28 rounded-md" />
    </div>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // Profile only for teacher name — no longer needed for class fetching
  const { data: profile } = useStaleData("profile:me", getMyProfile);
  const teacherName = profile?.profiles?.teacher?.full_name
    || profile?.profiles?.teacher?.name
    || [profile?.profiles?.teacher?.first_name, profile?.profiles?.teacher?.last_name].filter(Boolean).join(' ')
    || profile?.identity?.name
    || [profile?.identity?.first_name, profile?.identity?.last_name].filter(Boolean).join(' ')
    || 'Teacher';

  // Single efficient fetch — JWT resolves teacher, no teacherId param needed.
  // Returns nested objects: section: { id, name }, academic_year: { id, name }, etc.
  const { data: assignmentsData, loading, revalidating } = useStaleData(
    'teacher:my-assignments',
    () => getMyTeacherAssignments({ status: 'current' }),
  );

  const classes = assignmentsData?.results || [];

  // Stable cache key derived from sorted class IDs
  const metricsKey = useMemo(
    () => classes.map(c => c.id).filter(Boolean).sort().join(','),
    [classes],
  );

  // Stats: deduplicate unique section+year pairs for attendance, unique subjects for grades.
  // Simplified avg performance: total obtained / total max across all grade records.
  const { data: stats, loading: statsLoading, revalidating: statsRevalidating } = useStaleData(
    `teacher:stats:${metricsKey || 'empty'}`,
    async () => {
      if (classes.length === 0) return { avgAttendance: 0, avgPerformancePercentage: 0 };

      // De-dup: one attendance request per unique section+year, one grade request per unique subject
      const sectionMap = new Map(); // sectionId -> academicYearId
      const subjectSet = new Set();

      classes.forEach(cls => {
        const sId = cls.section?.id;
        const ayId = cls.academic_year?.id;
        const subId = cls.subject?.id;
        if (sId && !sectionMap.has(sId)) sectionMap.set(sId, ayId);
        if (subId) subjectSet.add(subId);
      });

      const [attendanceResults, gradesResults] = await Promise.all([
        Promise.all(
          [...sectionMap.entries()].map(([sId, ayId]) =>
            getAttendanceRecords(sId, ayId).catch(() => ({ results: [] }))
          )
        ),
        Promise.all(
          [...subjectSet].map(subId =>
            getGrades(subId).catch(() => ({ results: [] }))
          )
        ),
      ]);

      let totalRecords = 0, totalPresent = 0;
      attendanceResults.forEach(data => {
        const records = Array.isArray(data) ? data : data.results || [];
        totalRecords += records.length;
        records.forEach(r => {
          if (r.status === 'Present' || r.status === 'Late') totalPresent++;
        });
      });

      let totalObtained = 0, totalMax = 0;
      gradesResults.forEach(data => {
        const grades = Array.isArray(data) ? data : data.results || [];
        grades.forEach(g => {
          totalObtained += parseFloat(g.marks_obtained || 0);
          totalMax += parseFloat(g.max_marks || 0);
        });
      });

      return {
        avgAttendance: totalRecords > 0
          ? ((totalPresent / totalRecords) * 100).toFixed(1)
          : 0,
        avgPerformancePercentage: totalMax > 0
          ? ((totalObtained / totalMax) * 100).toFixed(1)
          : 0,
      };
    },
    { skip: loading || classes.length === 0, deps: metricsKey },
  );

  // Circulars visible to this teacher — backend scopes results by role via JWT
  const { data: circularsData, loading: circularsLoading } = useStaleData(
    'teacher:circulars',
    () => schoolAdminApi.getCirculars(1),
  );
  const circulars = circularsData?.results || circularsData || [];

  return (
    <MainLayout title="The Academic Architect">
      <RevalidatingBar show={revalidating || statsRevalidating} />

      {/* TopAppBar Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full mb-4 md:mb-8 gap-4">
        <div>
          <h2 className="font-display text-lg md:text-2xl font-extrabold text-on-surface tracking-tight">{`Good morning, ${teacherName}`}</h2>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        {/* Total Classes */}
        <div className={`px-4 py-3 rounded-xl shadow-sm flex items-center justify-between border transition-all hover:scale-[1.01] ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <span className={`p-2 rounded-md flex-shrink-0 ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
              <span className="material-symbols-outlined text-xl">groups</span>
            </span>
            <div>
              <p className={`text-xs font-medium whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Classes</p>
              {loading && classes.length === 0 ? (
                <StatValueSkeleton darkMode={darkMode} />
              ) : (
                <p className={`text-xl font-bold leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>{classes.length}</p>
              )}
            </div>
          </div>
          <span className={`text-2xs font-bold px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${darkMode ? 'text-slate-300 bg-white/10' : 'text-slate-500 bg-slate-200'}`}>Today</span>
        </div>

        {/* Avg Attendance */}
        <div className={`px-4 py-3 rounded-xl shadow-sm flex items-center justify-between border transition-all hover:scale-[1.01] ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <span className={`p-2 rounded-md flex-shrink-0 ${darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
              <span className="material-symbols-outlined text-xl">how_to_reg</span>
            </span>
            <div>
              <p className={`text-xs font-medium whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Avg Attendance</p>
              {statsLoading && !stats ? (
                <StatValueSkeleton darkMode={darkMode} />
              ) : (
                <p className={`text-xl font-bold leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>{`${stats?.avgAttendance ?? 0}%`}</p>
              )}
            </div>
          </div>
          <span className={`text-2xs font-bold flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${darkMode ? 'text-green-300 bg-green-900/30' : 'text-green-700 bg-green-100'}`}>
            <span className="material-symbols-outlined text-xs">trending_up</span> 2.1%
          </span>
        </div>

        {/* Avg Performance */}
        <div className={`px-4 py-3 rounded-xl shadow-sm flex items-center justify-between border transition-all hover:scale-[1.01] ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <span className={`p-2 rounded-md flex-shrink-0 ${darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-700'}`}>
              <span className="material-symbols-outlined text-xl">query_stats</span>
            </span>
            <div>
              <p className={`text-xs font-medium whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Avg Performance</p>
              {statsLoading && !stats ? (
                <StatValueSkeleton darkMode={darkMode} />
              ) : (
                <p className={`text-xl font-bold leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>{`${stats?.avgPerformancePercentage ?? 0}%`}</p>
              )}
            </div>
          </div>
          <div className={`h-2 w-2 rounded-full flex-shrink-0 animate-pulse ${darkMode ? 'bg-purple-400' : 'bg-purple-500'}`} />
        </div>
      </section>

      {/* Bento Grid Main Content */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Schedule Section */}
        <div className="col-span-12 lg:col-span-8 space-y-4 md:space-y-6">
          <section>
            <div className="flex justify-between items-center mb-3 md:mb-5">
              <h4 className="font-display text-base md:text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg md:text-xl">calendar_today</span>
                Today's Schedule
              </h4>
              <button className="text-2xs md:text-xs font-bold text-primary hover:underline">Full Calendar</button>
            </div>
            <div className="space-y-3 md:space-y-4">
              {loading && classes.length === 0 ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <ScheduleSkeletonCard key={index} darkMode={darkMode} />
                ))
              ) : classes.length === 0 ? (
                <div className="p-5 text-center text-slate-500 bg-surface-container-lowest rounded-xl">No classes assigned for you today.</div>
              ) : (
                classes.map((cls, index) => (
                  <Card key={cls.id} className={`p-3 md:p-4 group border transition-all duration-300 shadow-sm ${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600 shadow-md' : 'bg-slate-100 border-slate-200 hover:border-slate-300'}`}>
                    {/* Mobile Layout */}
                    <div className="flex md:hidden flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300'}`}>
                          <span className={`text-2xs font-bold ${darkMode ? 'text-blue-400' : 'text-primary'}`}>Class</span>
                          <span className={`text-base font-black ${darkMode ? 'text-blue-400' : 'text-primary'}`}>{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className={`font-bold text-sm leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>{cls.subject?.name}</h5>
                          <p className={`text-2xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{cls.class_level?.name} - {cls.section?.name}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/teacher/classes/${cls.id}/performance`)}
                          className={`flex-1 px-3 py-2 rounded-md text-2xs font-semibold transition-colors border ${darkMode ? 'bg-blue-600/20 text-blue-300 border-blue-600/30 hover:bg-blue-600 hover:text-white' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white'}`}
                        >
                          View Class
                        </button>
                        <button
                          onClick={() => navigate(`/teacher/attendance/mark/${cls.id}`)}
                          className={`flex-1 px-3 py-2 text-white rounded-md text-2xs font-semibold transition-colors shadow-md ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-primary hover:bg-primary/90'}`}
                        >
                          Mark Attendance
                        </button>
                      </div>
                    </div>
                    
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center shrink-0 border ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300'}`}>
                        <span className={`text-xs font-bold ${darkMode ? 'text-blue-400' : 'text-primary'}`}>Class</span>
                        <div className={`w-8 h-[2px] my-1 ${darkMode ? 'bg-blue-500/30' : 'bg-primary/20'}`}></div>
                        <span className={`text-lg font-black ${darkMode ? 'text-blue-400' : 'text-primary'}`}>{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h5 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-slate-800'}`}>{cls.subject?.name} ({cls.class_level?.name} - {cls.section?.name})</h5>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Academic Year: {cls.academic_year?.name}</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/teacher/classes/${cls.id}/performance`)}
                          className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors border ${darkMode ? 'bg-blue-600/20 text-blue-300 border-blue-600/30 hover:bg-blue-600 hover:text-white' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white'}`}
                        >
                          View Class
                        </button>
                        <button
                          onClick={() => navigate(`/teacher/attendance/mark/${cls.id}`)}
                          className={`px-3.5 py-2 text-white rounded-md text-xs font-semibold transition-colors shadow-md ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-primary hover:bg-primary/90'}`}
                        >
                          Mark Attendance
                        </button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>

          
          
          {/* Quick Actions */}
<section>
  <h4 className="font-display text-base md:text-lg font-bold mb-3 md:mb-5">
    Quick Actions
  </h4>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">

    {/* Mark Attendance */}
    <Card
      hoverable
      className={`cursor-pointer flex flex-col items-center justify-center text-center gap-2 md:gap-2.5 py-4 md:py-6 group border shadow-sm ${darkMode ? 'bg-gradient-to-br from-purple-600 to-purple-700 border-transparent shadow-lg' : 'bg-slate-100 border-slate-200'}`}
      onClick={() => navigate("/teacher/attendance/mark")}
    >
      <div className={`p-2 md:p-3 rounded-lg group-hover:scale-105 transition ${darkMode ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
        <span className="material-symbols-outlined text-xl md:text-2xl">fact_check</span>
      </div>
      <p className={`text-2xs md:text-xs font-bold tracking-wide leading-tight px-1 ${darkMode ? 'text-white' : 'text-slate-600'}`}>MARK ATTENDANCE</p>
    </Card>

    {/* Create Exam */}
    <Card
      hoverable
      className={`cursor-pointer flex flex-col items-center justify-center text-center gap-2 md:gap-2.5 py-4 md:py-6 group border shadow-sm ${darkMode ? 'bg-gradient-to-br from-amber-600 to-amber-700 border-transparent shadow-lg' : 'bg-slate-100 border-slate-200'}`}
      onClick={() => navigate("/teacher/exams/create")}
    >
      <div className={`p-2 md:p-3 rounded-lg group-hover:scale-105 transition ${darkMode ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
        <span className="material-symbols-outlined text-xl md:text-2xl">quiz</span>
      </div>
      <p className={`text-2xs md:text-xs font-bold tracking-wide leading-tight px-1 ${darkMode ? 'text-white' : 'text-slate-600'}`}>CREATE EXAM</p>
    </Card>

    {/* Assignments */}
    <Card
      hoverable
      className={`cursor-pointer flex flex-col items-center justify-center text-center gap-2 md:gap-2.5 py-4 md:py-6 group border shadow-sm ${darkMode ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 border-transparent shadow-lg' : 'bg-slate-100 border-slate-200'}`}
      onClick={() => navigate("/teacher/assignments")}
    >
      <div className={`p-2 md:p-3 rounded-lg group-hover:scale-105 transition ${darkMode ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
        <span className="material-symbols-outlined text-xl md:text-2xl">assignment</span>
      </div>
      <p className={`text-2xs md:text-xs font-bold tracking-wide leading-tight px-1 ${darkMode ? 'text-white' : 'text-slate-600'}`}>ASSIGNMENTS</p>
    </Card>

    {/* Pending Submissions */}
    <Card
      hoverable
      className={`cursor-pointer flex flex-col items-center justify-center text-center gap-2 md:gap-2.5 py-4 md:py-6 group border shadow-sm ${darkMode ? 'bg-gradient-to-br from-amber-600 to-orange-600 border-transparent shadow-lg' : 'bg-slate-100 border-slate-200'}`}
      onClick={() => navigate("/teacher/submissions/pending")}
    >
      <div className={`p-2 md:p-3 rounded-lg group-hover:scale-105 transition ${darkMode ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
        <span className="material-symbols-outlined text-xl md:text-2xl">pending_actions</span>
      </div>
      <p className={`text-2xs md:text-xs font-bold tracking-wide leading-tight px-1 ${darkMode ? 'text-white' : 'text-slate-600'}`}>PENDING GRADING</p>
    </Card>

    {/* Upload Material */}
    <Card
      hoverable
       className={`cursor-pointer flex flex-col items-center justify-center text-center gap-2 md:gap-2.5 py-4 md:py-6 group border shadow-sm ${darkMode ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-transparent shadow-lg' : 'bg-slate-100 border-slate-200'}`}
      onClick={() => navigate("/teacher/ai-tools")}
    >
      <div className={`p-2 md:p-3 rounded-lg group-hover:scale-105 transition ${darkMode ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
        <span className="material-symbols-outlined text-xl md:text-2xl">upload_file</span>
      </div>
      <p className={`text-2xs md:text-xs font-bold tracking-wide leading-tight px-1 ${darkMode ? 'text-white' : 'text-slate-600'}`}>UPLOAD MATERIAL</p>
    </Card>

  </div>
</section>
</div> 

        {/* Side Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">

          {/* Circulars */}
          <Link to="/teacher/circulars" className="block group">
            <Card className={`p-5 border shadow-sm transition-all duration-200 ${darkMode ? 'bg-slate-900 border-slate-700 group-hover:border-slate-600' : 'bg-slate-100 border-slate-200 group-hover:border-slate-300'}`}>
              <div className="flex items-center justify-between mb-5">
                <h4 className={`font-display text-sm font-black uppercase tracking-widest ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                  Circulars
                </h4>
                <span className={`flex items-center gap-0.5 text-2xs font-bold group-hover:underline ${darkMode ? 'text-blue-400' : 'text-primary'}`}>
                  View all
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </span>
              </div>

              {circularsLoading && circulars.length === 0 ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <SkeletonBlock className="w-1.5 h-1.5 rounded-full mt-1.5" />
                      <div className="flex-1 space-y-1.5">
                        <SkeletonBlock className="h-3 w-3/4" />
                        <SkeletonBlock className="h-2.5 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : circulars.length === 0 ? (
                <p className={`text-xs text-center py-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  No circulars yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {circulars.slice(0, 3).map((c) => (
                    <div key={c.id} className="flex items-start gap-3">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${darkMode ? 'bg-blue-400' : 'bg-primary'}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{c.title}</p>
                        <p className={`text-2xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {c.created_by_name || 'School Administration'}
                          {c.created_at && ` · ${new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Link>

        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
