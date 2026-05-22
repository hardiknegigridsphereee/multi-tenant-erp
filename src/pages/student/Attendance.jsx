import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";
import {
  calculateAttendance,
  calculateMonthlyTrends,
  getMonthName,
  getPastSixMonths,
} from "../../utils/calculations";

export default function Attendance() {
  const {attendanceRecords: records, academic, loading} = useStudent();

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const attendanceMap = useMemo(() => {
    if(!records || !Array.isArray(records)) return {};
    return records.reduce((acc, record) => {
      const dateKey = new Date(record.date).toISOString().split('T')[0];
      acc[dateKey] = record;
      return acc;
    }, {})
  }, [records]);

  if (loading) return <MainLayout title="Attendance">Loading...</MainLayout>

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysCount = getDaysInMonth(year, month);
  const days = Array.from({ length: daysCount }, (_, i) => i + 1);
  const monthWord = getMonthName(month);

  const academicYears = academic?.years || [];
  const subjects = academic?.subs || [];

  const attendance = calculateAttendance(records);
  const trends = records && records.length > 0 ? calculateMonthlyTrends(records) : [0, 0, 0, 0, 0, 0];
  const monthLabels = getPastSixMonths();

  return (
    <MainLayout title="Attendance">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <section className="flex flex-wrap items-center gap-4">
          <div className="flex-1 flex gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-surface-container-low border-none rounded-md px-4 py-2.5 text-sm font-['Inter'] focus:ring-2 focus:ring-surface-tint outline-none"
            >
              <option value="">All Academic Years</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-surface-container-low border-none rounded-md px-4 py-2.5 text-sm font-['Inter'] focus:ring-2 focus:ring-surface-tint outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <button className="bg-surface-container-high text-primary px-6 py-2.5 rounded-md font-['Inter'] font-semibold text-sm hover:bg-blue-200 transition-colors">
            Apply Filters
          </button>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4 shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-start">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <span className="material-symbols-outlined">analytics</span>
              </span>
            </div>
            <div>
              <p className="text-on-surface-variant text-sm font-['Inter']">
                Overall Attendance
              </p>
              <h2 className="text-4xl font-extrabold font-headline text-on-surface">
                {attendance}%
              </h2>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full"
                style={{ width: `96%` }}
              />
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4 shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-start">
              <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <span className="material-symbols-outlined">gavel</span>
              </span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Requirement Met
              </span>
            </div>
            <div>
              <p className="text-on-surface-variant text-sm font-['Inter']">
                Min. Requirement
              </p>
              <h2 className="text-4xl font-extrabold font-headline text-on-surface">
                75%
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant italic">
              You are 21% above the limit.
            </p>
          </div>

          <div className="flex flex-col h-64">
            {/* CHART AREA - Fixed height container */}
            <div className="flex-1 flex items-end gap-2 pb-2">
              {trends.map((percentage, index) => (
                <div
                  key={index}
                  className="flex-1 bg-primary rounded-t-md relative group transition-all duration-500"
                  style={{ height: `${percentage}%` }}
                >
                  <div className="absolute bottom-full left-0 right-0 text-[10px] text-center opacity-0 group-hover:opacity-100 mb-1 font-bold">
                    {percentage}%
                  </div>
                </div>
              ))}
            </div>

            {/* LABEL AREA - Separate row aligned to the flex-1 bars */}
            <div className="flex gap-2">
              {monthLabels.map((monthLabel, index) => (
                <span
                  key={index}
                  className="flex-1 text-[10px] text-center text-slate-400 font-['Inter']"
                >
                  {monthLabel}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold font-headline text-on-surface">
                  {monthWord} {year}
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Visual Presence Log
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                </button>
                <button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
            <div>
              {/* Attendance Calendar */}
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-bold text-slate-400 pb-2 w-12"
                    >
                      {day}
                    </div>
                  ),
                )}

                {days.map((day) => {
                  const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const record = attendanceMap?.[dateKey];

                  const baseClass =
                    "h-12 w-12 rounded-lg flex items-center justify-center text-sm font-semibold border";
                  const statusClasses = {
                    Present: "bg-green-100 text-green-700 border-green-200",
                    Absent: "bg-red-100 text-red-700 border-red-200",
                    Late: "bg-yellow-100 text-yellow-700 border-yellow-200",
                  };

                  return (
                    <div
                      key={day}
                      className={`${baseClass} ${record ? statusClasses[record.status] : "bg-surface-container-lowest border-surface-container"}`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-surface-container-low">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs font-semibold text-on-surface-variant">
                  Present
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-xs font-semibold text-on-surface-variant">
                  Absent
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-xs font-semibold text-on-surface-variant">
                  Late
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="text-xs font-semibold text-on-surface-variant">
                  Holiday/Weekend
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
