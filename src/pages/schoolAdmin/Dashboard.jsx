import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";
import { getDashboardStats, getEnrollmentTrends } from "../../services/schoolAdminApi";

export default function Dashboard() {
  const navigate = useNavigate();

  // State for Live Data strictly tracking database rows
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_classes: 0,
    attendance_rate: 0,
    academic_year: "..."
  });
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemError, setSystemError] = useState(null);

  // Premium Interactions State
  const [activeCardPanel, setActiveCardPanel] = useState(null); 
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false); 

  // Time-range filter selection: "1M" | "3M" | "6M" | "12M"
  const [timeRange, setTimeRange] = useState("6M");

  // Fetch Data on Component Mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setSystemError(null);
      try {
        const [statsData, trendsData] = await Promise.all([
          getDashboardStats(),
          getEnrollmentTrends()
        ]);
        
        if (statsData) {
          setStats(statsData);
        }
        
        const liveTrends = trendsData?.trends || trendsData || [];
        setTrends(Array.isArray(liveTrends) ? liveTrends : []);
        
      } catch (error) {
        console.error("Critical database connection link trace:", error);
        setSystemError("Database connection warning: Dashboard is unable to pull operational telemetry due to a backend exception.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute chart elements based on the active timeframe selector filter
  const getVisibleTrends = () => {
    if (!Array.isArray(trends) || trends.length === 0) return [];
    if (timeRange === "1M") return trends.slice(-1);
    if (timeRange === "3M") return trends.slice(-3);
    if (timeRange === "6M") return trends.slice(-6);
    return trends;
  };

  const visibleTrends = getVisibleTrends();
  const maxEnrollment = visibleTrends.length > 0 ? Math.max(...visibleTrends.map(t => t.enrollments || 1)) : 1;
  
  // For the SVG Ring: Total circumference is 440
  const attendancePercentage = stats.attendance_rate || 0;
  const strokeDashoffset = 440 - (440 * (attendancePercentage / 100));

  return (
    <SchoolLayout title="Academic Architecture Workspace">
      
      {/* System Server Error Banner Warning Module */}
      {systemError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-3xs">
          <span className="material-symbols-outlined text-base">dns</span>
          <span>{systemError}</span>
        </div>
      )}

      {/* Title Layout Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Academic Overview</h2>
          <p className="text-[#6b7280] mt-1 text-sm font-medium">
            Welcome back, Administrator. Real-time multi-tenant telemetry maps are active.
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => navigate("/school-admin/manage-classes")}
            className="px-5 py-2.5 bg-[#0058be] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition flex items-center gap-1.5 outline-none"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Manage Classes & Sections
          </button>
        </div>
      </div>

      {/* STAGE 1: DYNAMIC STAT CARDS LINKED DIRECTLY INTO ROUTING CHANNELS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        
        {/* Card 1: Students */}
        <div 
          onClick={() => navigate("/school-admin/students")}
          className="bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(11,28,48,0.02)] hover:shadow-[0_12px_32px_rgba(11,28,48,0.06)] border-l-4 border-[#0058be] transition-all duration-300 cursor-pointer select-none hover:-translate-y-0.5 group"
          title="Inspect Student Directory"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="p-2.5 bg-[#d8e2ff] rounded-lg transition-transform group-hover:scale-105 duration-300">
              <span className="material-symbols-outlined text-[#0058be] block">school</span>
            </div>
            <span className="text-[10px] font-black tracking-tight bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px] font-bold">trending_up</span>+4%
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1 tracking-tight group-hover:text-[#0058be] transition-colors">
            {loading ? "..." : stats.total_students}
          </h3>
        </div>

        {/* Card 2: Teachers */}
        <div 
          onClick={() => navigate("/school-admin/teachers")}
          className="bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(11,28,48,0.02)] hover:shadow-[0_12px_32px_rgba(11,28,48,0.06)] border-l-4 border-[#6b38d4] transition-all duration-300 cursor-pointer select-none hover:-translate-y-0.5 group"
          title="Inspect Teacher Management Matrix"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="p-2.5 bg-[#e9ddff] rounded-lg transition-transform group-hover:scale-105 duration-300">
              <span className="material-symbols-outlined text-[#6b38d4] block">supervisor_account</span>
            </div>
            <span className="text-[10px] font-black tracking-tight bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full uppercase">Stable</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Teachers</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1 tracking-tight group-hover:text-[#6b38d4] transition-colors">
            {loading ? "..." : stats.total_teachers}
          </h3>
        </div>

        {/* Card 3: Classes */}
        <div 
          onClick={() => navigate("/school-admin/class-levels")}
          className="bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(11,28,48,0.02)] hover:shadow-[0_12px_32px_rgba(11,28,48,0.06)] border-l-4 border-[#924700] transition-all duration-300 cursor-pointer select-none hover:-translate-y-0.5 group"
          title="Inspect Class Framework Configuration"
        >
          <div className="p-2.5 bg-[#ffdcc6] rounded-lg mb-4 w-fit transition-transform group-hover:scale-105 duration-300">
            <span className="material-symbols-outlined text-[#924700] block">meeting_room</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Classes</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1 tracking-tight group-hover:text-[#924700] transition-colors">
            {loading ? "..." : stats.total_classes}
          </h3>
        </div>

        {/* Card 4: Academic Year */}
        <div 
          onClick={() => navigate("/school-admin/academic-years")}
          className="bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(11,28,48,0.02)] hover:shadow-[0_12px_32px_rgba(11,28,48,0.06)] border-l-4 border-[#c2c6d6] transition-all duration-300 cursor-pointer select-none hover:-translate-y-0.5 group"
          title="Inspect Timeline Calendar Cycles"
        >
          <div className="p-2.5 bg-[#e5eeff] rounded-lg mb-4 w-fit transition-transform group-hover:scale-105 duration-300">
            <span className="material-symbols-outlined text-[#727785] block">calendar_today</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Cycle</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1 tracking-tight group-hover:text-blue-500 transition-colors">
            {loading ? "..." : stats.academic_year}
          </h3>
        </div>

        {/* Card 5: Attendance */}
        <div 
          onClick={() => { setActiveCardPanel(activeCardPanel === "attendance" ? null : "attendance") }}
          className={`p-5 rounded-xl border-l-4 border border-y-slate-100 border-r-slate-100 transition-all duration-300 cursor-pointer select-none hover:-translate-y-0.5 group ${
            activeCardPanel === "attendance" ? "bg-red-50/20 shadow-md border-red-200" : "bg-white shadow-[0_4px_20px_rgba(11,28,48,0.02)] hover:shadow-[0_12px_32px_rgba(11,28,48,0.06)]"
          }`}
          title="Click to Open Inline Diagnostic Panel"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="p-2.5 bg-[#ffdad6] rounded-lg transition-transform group-hover:scale-105 duration-300">
              <span className="material-symbols-outlined text-[#ba1a1a] block">how_to_reg</span>
            </div>
            <span className="text-[10px] font-black tracking-tight bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px] font-bold">trending_down</span>-0.2%
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Engagement Rate</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1 tracking-tight group-hover:text-[#ffdad6] transition-colors">
            {loading ? "..." : `${stats.attendance_rate}%`}
          </h3>
        </div>

      </div>

      {/* INLINE EXTENSION DRAWER */}
      {activeCardPanel === "attendance" && (
        <div className="mb-8 p-5 bg-gradient-to-r from-red-50/40 to-white rounded-xl border border-red-100/60 shadow-xs animate-fadeIn flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="max-w-2xl">
            <h5 className="text-xs font-black uppercase text-[#ba1a1a] tracking-wider mb-1">Engagement Analytics Trace</h5>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              Macro dashboard monitoring indicates morning register logs compiled a slight dip within Grade 9 cohorts. Classroom availability tracking is functional across all active floor maps.
            </p>
          </div>
        </div>
      )}

      {/* STAGE 2: HIGH-FIDELITY CHARTS & ANALYTICAL METRICS VISUALIZER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* ENROLLMENT GROWTH MATRIX CARD */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-100 shadow-[0_12px_32px_rgba(11,28,48,0.06)] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-800">Enrollment Growth Matrix</h3>
              <p className="text-sm text-[#6b7280] mt-0.5">Annual student registration trends</p>
            </div>
            
            {/* Timeframe pill selector filters */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/40">
              {["1M", "3M", "6M", "12M"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all outline-none ${
                    timeRange === range 
                      ? "bg-white text-[#0058be] shadow-xs" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {range === "1M" ? "1 Month" : range === "3M" ? "3 Months" : range === "6M" ? "6 Months" : "1 Year"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-5 h-64 px-2 relative justify-center">
            {visibleTrends.length === 0 ? (
              <div className="w-full text-center text-xs font-semibold text-slate-400 pb-12 flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-2xl text-slate-200">bar_chart</span>
                <span>No live historical enrollment tracking data found in database app logs.</span>
              </div>
            ) : (
              visibleTrends.map((b, i) => {
                const isActive = i === visibleTrends.length - 1;
                const dynamicHeight = Math.max((b.enrollments / maxEnrollment) * 100, 12);
                
                return (
                  <div key={i} className="flex flex-col items-center gap-2 w-full h-full justify-end group/bar relative">
                    <div className="absolute -top-5 opacity-0 group-hover/bar:opacity-100 bg-slate-800 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm transition-opacity pointer-events-none z-10">
                      {b.enrollments} Enrolled
                    </div>

                    <div
                      style={{ height: `${dynamicHeight}%` }}
                      className={`${
                        isActive 
                          ? "bg-[#0058be] shadow-md shadow-[#0058be]/15" 
                          : "bg-[#d3e4fe] hover:bg-[#0058be]/80"
                      } w-full rounded-t-sm transition-all duration-300`}
                    ></div>
                    
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? "text-[#0058be]" : "text-[#727785]"}`}>
                      {b.month?.substring(0, 3) || b.month || "N/A"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Attendance Donut Chart */}
        <div className="bg-white p-8 rounded-lg shadow-[0_12px_32px_rgba(11,28,48,0.06)] flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-800">Attendance Trend</h3>
            <p className="text-sm text-[#6b7280] mt-0.5">Weekly average engagement</p>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <svg className="w-44 h-44 -rotate-90">
              <circle cx="88" cy="88" r="70" stroke="#e5eeff" strokeWidth="12" fill="none" />
              <circle
                cx="88"
                cy="88"
                r="70"
                stroke="#6b38d4"
                strokeWidth="12"
                fill="none"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
              />
            </svg>

            <div className="absolute text-center">
              <h3 className="text-3xl font-black text-slate-800">{loading ? "..." : `${stats.attendance_rate}%`}</h3>
              <p className="text-[10px] tracking-widest text-[#6b38d4] font-bold uppercase mt-0.5">
                {attendancePercentage >= 90 ? "EXCELLENT" : attendancePercentage >= 75 ? "GOOD" : "NEEDS WORK"}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100/60">
              <p className="flex items-center gap-2 text-[#6b7280]">
                <span className="w-2 h-2 rounded-full bg-[#6b38d4]"></span>
                Present / Total Target
              </p>
              <p className="font-bold text-slate-700">{stats.total_students}</p>
            </div>
          </div>
        </div>
      </div>

      {/* STAGE 4: FLOATING ACTION HUB */}
      <div className="fixed bottom-8 right-8 z-40">
        
        {isFloatingMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsFloatingMenuOpen(false)} />
            <div className="absolute bottom-16 right-0 flex flex-col gap-2.5 items-end z-20 animate-fadeIn">
              
              <button 
                onClick={() => { setIsFloatingMenuOpen(false); navigate("/school-admin/students"); }}
                className="bg-white px-3.5 py-1.5 text-[10px] font-black uppercase tracking-tight text-slate-700 border border-slate-100 shadow-sm rounded-lg hover:bg-slate-50 flex items-center gap-1.5 whitespace-nowrap outline-none transition"
              >
                <span>Add Student Record</span>
                <span className="material-symbols-outlined text-sm text-blue-600">person_add</span>
              </button>

            </div>
          </>
        )}

        <button 
          onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
          className={`w-14 h-14 rounded-full bg-[#0058be] text-white text-2xl shadow-[0_12px_30px_rgba(0,88,190,0.35)] hover:shadow-[0_12px_30px_rgba(0,88,190,0.5)] flex items-center justify-center transition-all duration-300 transform outline-none ${
            isFloatingMenuOpen ? "rotate-45 bg-slate-800 shadow-none" : "active:scale-95 hover:scale-102"
          }`}
          title="Open Quick Configuration Operations Panel"
        >
          <span className="material-symbols-outlined font-black text-xl">add</span>
        </button>

      </div>

    </SchoolLayout>
  );
}