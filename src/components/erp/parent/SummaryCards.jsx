// src/components/erp/parent/SummaryCards.jsx

import React, { useMemo } from "react";
import { useParent } from "../../../context/ParentProvider";

const getGradeLetter = (pct) => {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  return "C";
};

const attendanceColor = (status) => {
  if (status === "Good") return "text-tertiary";
  if (status === "Needs Attention") return "text-error";
  return "text-on-surface-variant";
};

const SummaryCards = () => {
  // ✅ attendanceSummary — full /attendance/ endpoint data (22 days, 81.82%)
  // ✅ dashboard — for grades, assignments, exams stats
  const { dashboard, attendanceSummary, loading } = useParent();

  const cards = useMemo(() => {
    if (!dashboard) return [];

    // ✅ FIX: Use attendanceSummary (full data) instead of dashboard.attendance (limited 6-day bundle)
    const att = attendanceSummary || dashboard.attendance || {};
    const overallPct = dashboard.overall_percentage ?? 0;
    const upcomingExams = dashboard.upcoming_exams || [];
    const upcomingAssignments = dashboard.upcoming_assignments || [];
    const stats = dashboard.stats || {};

    return [
      {
        icon: "calendar_check",
        iconColor: "text-primary",
        bgHover: "hover:bg-primary/5",
        badge: (
          <span
            className={`font-bold text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-wider whitespace-nowrap ${attendanceColor(att.status)}`}
          >
            {att.status || "—"}
          </span>
        ),
        label: "Attendance",
        // ✅ attendanceSummary.attendance_percentage = 81.82% (full year data)
        value: `${att.attendance_percentage ?? 0}%`,
      },
      {
        icon: "star_rate",
        iconColor: "text-secondary",
        bgHover: "hover:bg-secondary/5",
        badge: (
          <span className="text-primary font-bold text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-wider whitespace-nowrap">
            {overallPct}%
          </span>
        ),
        label: "Avg Grade",
        value: getGradeLetter(overallPct),
      },
      {
        icon: "pending_actions",
        iconColor: "text-tertiary",
        bgHover: "hover:bg-tertiary/5",
        badge: (
          <span
            className={`font-bold text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-wider whitespace-nowrap ${
              upcomingAssignments.length ? "text-error" : "text-on-surface-variant"
            }`}
          >
            {upcomingAssignments.length ? "Due Soon" : "Total"}
          </span>
        ),
        label: "Assignments",
        value: stats.total_assignments ?? 0,
      },
      {
        icon: "event_note",
        iconColor: "text-primary",
        bgHover: "hover:bg-primary/5",
        badge: (
          <span className="text-on-surface-variant font-bold text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-wider leading-tight block">
            {upcomingExams.length > 0
              ? `Next: ${upcomingExams[0].name || upcomingExams[0].exam_name || ""}`
              : "None"}
          </span>
        ),
        label: "Upcoming Exams",
        value: upcomingExams.length,
      },
    ];
  }, [dashboard, attendanceSummary]); // ✅ attendanceSummary dependency add ki

  if (loading || !dashboard) {
    return (
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface-container-lowest p-3 sm:p-4 lg:p-6 rounded-xl border border-outline-variant/10 animate-pulse"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-surface-container-low rounded-lg" />
              <div className="w-10 sm:w-12 h-3 bg-surface-container-low rounded" />
            </div>
            <div className="w-16 sm:w-20 h-3 bg-surface-container-low rounded mb-2" />
            <div className="w-12 sm:w-14 h-6 sm:h-7 bg-surface-container-low rounded" />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {cards.map(({ icon, iconColor, bgHover, badge, label, value }) => (
        <div
          key={label}
          className={`bg-surface-container-lowest dark:bg-slate-800/60
                      p-3 sm:p-4 lg:p-6 rounded-xl group ${bgHover}
                      transition-colors border border-outline-variant/10 dark:border-slate-700/40
                      min-w-0 overflow-hidden`}
        >
          <div className="flex justify-between items-start mb-2.5 sm:mb-3 lg:mb-4 gap-1">
            <div className="p-1.5 sm:p-2 bg-surface-container-low dark:bg-slate-700 rounded-lg group-hover:bg-primary-fixed-dim transition-colors flex-shrink-0">
              <span
                className={`material-symbols-outlined ${iconColor} text-base sm:text-lg lg:text-xl`}
              >
                {icon}
              </span>
            </div>
            <div className="min-w-0 text-right">{badge}</div>
          </div>
          <p className="text-on-surface-variant dark:text-slate-400 text-[11px] sm:text-xs lg:text-sm font-medium leading-tight truncate">
            {label}
          </p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-on-surface dark:text-white mt-1 leading-none truncate">
            {value}
          </h3>
        </div>
      ))}
    </section>
  );
};

export default SummaryCards;