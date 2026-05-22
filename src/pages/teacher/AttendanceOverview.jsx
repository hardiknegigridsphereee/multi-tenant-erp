import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import Button from "../../components/erp/teacher/Button";
import Card from "../../components/erp/teacher/Card";

import { getMyProfile, getTeacherClasses } from "../../services/api";
import { useStaleData } from "../../hooks/useStaleData";

const AttendanceOverview = () => {
  const navigate = useNavigate();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  const { data: profileData } = useStaleData("profile:me", getMyProfile);
  const teacherId = profileData?.profiles?.teacher?.id || profileData?.identity?.id;

  const { data: assignmentsData, loading: classesLoading } = useStaleData(
    `teacher:classes:${teacherId}`,
    () => getTeacherClasses(teacherId),
    { skip: !teacherId }
  );

  const classes = assignmentsData?.results || [];

  useEffect(() => {
    let isMounted = true;
    const fetchTeacherAttendance = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        if (!teacherId || !isMounted || classes.length === 0) {
          if (isMounted) setAttendanceLoading(false);
          return;
        }

        // Extract unique section IDs
        const sectionIds = [...new Set(classes.map(a => a.section || a.section_id))].filter(Boolean);

        // 3. Fetch attendance for those sections
        const sectionPromises = sectionIds.map(sectionId => 
          fetch(`http://localhost:8000/api/v1/operations/attendance/?section=${sectionId}&page_size=1000`, {
            headers: { "Authorization": `Bearer ${token}` }
          }).then(res => res.ok ? res.json() : { results: [] })
        );

        const responses = await Promise.all(sectionPromises);
        
        if (isMounted) {
          let allAttendance = [];
          responses.forEach(data => {
            if (data.results) {
              allAttendance = [...allAttendance, ...data.results];
            }
          });
          
          setAttendanceRecords(allAttendance);
          setAttendanceLoading(false);
        }
        
      } catch (error) {
        console.error("Error fetching teacher attendance:", error);
        if (isMounted) setAttendanceLoading(false);
      }
    };

    if (classes.length > 0) {
      fetchTeacherAttendance();
    } else if (!classesLoading) {
      setAttendanceLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [classes, teacherId, classesLoading]);

  return (
    
    <MainLayout title="The Academic Architect">
      {/* Header Section */}
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-on-surface font-display tracking-tight">Attendance Overview</h2>
          <p className="text-on-surface-variant font-medium mt-1">Academic Session: 2023-24 • Monday, Oct 23</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-primary font-semibold bg-surface-container-high hover:bg-surface-container-highest transition-colors text-sm">
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            <span>Export Report</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-br from-primary to-primary-container shadow-md active:scale-95 duration-150 transition-all text-sm">
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Bulk Marking</span>
          </button>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="flex flex-col justify-between relative overflow-hidden group shadow-ambient" style={{boxShadow: '0px 12px 32px rgba(11,28,48,0.04)'}}>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Today's Presence</p>
            <h3 className="text-4xl font-extrabold text-primary">94.2%</h3>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-green-600 relative z-10">
            <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
            <span>2.1% from yesterday</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between relative overflow-hidden group shadow-ambient" style={{boxShadow: '0px 12px 32px rgba(11,28,48,0.04)'}}>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Weekly Avg</p>
            <h3 className="text-4xl font-extrabold text-[#6b38d4]">88.5%</h3>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-slate-500 relative z-10">
            <span className="material-symbols-outlined text-[16px] mr-1">history</span>
            <span>Steady state maintain</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between relative overflow-hidden group shadow-ambient" style={{boxShadow: '0px 12px 32px rgba(11,28,48,0.04)'}}>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Absent Students</p>
            <h3 className="text-4xl font-extrabold text-red-600">12</h3>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-red-600 relative z-10">
            <span className="material-symbols-outlined text-[16px] mr-1">warning</span>
            <span>3 students flagged for low attendance</span>
          </div>
        </Card>
      </div>

      {/* Intelligent Insights (Asymmetric Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Class List Section (8 cols) */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-on-surface">Scheduled Classes Today</h3>
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{classes.length} Classes Total</span>
          </div>
          <div className="space-y-4">
            
            {classesLoading ? (
              <div className="p-5 text-center text-slate-500 font-semibold bg-surface-container-lowest rounded-xl shadow-sm">Loading classes...</div>
            ) : classes.length === 0 ? (
              <div className="p-5 text-center text-slate-500 font-semibold bg-surface-container-lowest rounded-xl shadow-sm">No classes scheduled for today.</div>
            ) : (
              classes.map((cls, idx) => {
                const colors = ['blue', 'purple', 'orange', 'green', 'rose'];
                const icons = ['calculate', 'science', 'menu_book', 'computer', 'history_edu'];
                const color = colors[idx % colors.length];
                const icon = icons[idx % icons.length];

                return (
                  <div key={cls.id} className="bg-surface-container-lowest rounded-xl p-5 flex flex-col sm:flex-row sm:items-center shadow-sm hover:shadow-md transition-shadow group gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-600 shrink-0`}>
                      <span className="material-symbols-outlined text-3xl">{icon}</span>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-on-surface text-lg">{cls.subject_name}</h4>
                      <p className="text-sm text-on-surface-variant">{cls.class_level_name} - {cls.section_name}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/teacher/attendance/mark/${cls.id}`)}
                      className="px-5 py-2 bg-primary text-white rounded-md font-semibold text-sm hover:opacity-90 transition whitespace-nowrap sm:ml-6"
                    >
                      Mark Attendance
                    </button>
                    <button
                      onClick={() => navigate(`/teacher/classes/${cls.id}/performance`)}
                      className="sm:ml-2 px-5 py-2 rounded-xl bg-surface-container-high text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                    >
                      View Details
                    </button>
                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* Side Insight Section (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Intelligence Insight */}
          <div className="bg-orange-50 p-6 rounded-xl relative overflow-hidden border border-amber-900/10">
            <div className="absolute top-0 right-0 p-4">
              <span className="material-symbols-outlined text-amber-900/20 text-4xl">psychology</span>
            </div>
            <h4 className="text-[#924700] font-bold text-lg mb-2 flex items-center relative z-10">
              <span className="material-symbols-outlined mr-2 text-xl">auto_awesome</span>
              Attendance AI Insight
            </h4>
            <p className="text-[#723600] text-sm leading-relaxed mb-4 relative z-10">
              James Miller has missed 3 consecutive Lab sessions. This correlates with a 15% drop in his last quiz performance.
            </p>
            <button className="text-xs font-bold text-[#924700] underline decoration-[#b75b00]/30 underline-offset-4 hover:decoration-[#924700] transition-all relative z-10">
              Review Intervention Plan
            </button>
          </div>

          {/* Attendance Distribution */}
          <Card className="shadow-sm">
            <h4 className="font-bold text-on-surface mb-6">Presence Distribution</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-on-surface-variant">Physical Presence</span>
                  <span className="text-primary">88%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: '88%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-on-surface-variant">Late Arrivals</span>
                  <span className="text-amber-600">6%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: '6%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-on-surface-variant">Authorized Leaves</span>
                  <span className="text-[#6b38d4]">4%</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-[#6b38d4] rounded-full transition-all" style={{ width: '4%' }}></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Contact */}
          <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
            <h4 className="font-bold text-on-surface text-sm mb-3">Notify Guardians</h4>
            <p className="text-xs text-on-surface-variant mb-4">Send automatic alerts for the 12 absent students today.</p>
            <button className="w-full py-2.5 bg-white text-primary border border-primary rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all">
              Send Notifications
            </button>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default AttendanceOverview;
