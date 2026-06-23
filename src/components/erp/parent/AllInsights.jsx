// src/components/erp/parent/AIInsights.jsx

import React, { useMemo } from "react";
import { useParent } from "../../../context/ParentProvider";

const AIInsights = () => {
  const { activeChild, dashboard } = useParent();

  const { topSubject, topPct, checklist } = useMemo(() => {
    const grades = dashboard?.recent_grades || [];
    if (!grades.length) return { topSubject: null, topPct: null, checklist: [] };

    const sorted = [...grades].sort((a, b) => b.percentage - a.percentage);
    const top = sorted[0];

    const items = [];
    if (dashboard?.attendance?.status) {
      items.push(`Attendance status: ${dashboard.attendance.status}`);
    }
    if (dashboard?.stats?.total_grades) {
      items.push(`${dashboard.stats.total_grades} grade${dashboard.stats.total_grades > 1 ? "s" : ""} recorded so far`);
    }
    return { topSubject: top.subject, topPct: top.percentage, checklist: items };
  }, [dashboard]);

  const name = activeChild?.name?.split(" ")[0] || "Your child";

  return (
    <div className="ai-insight-card h-full min-h-[280px] sm:min-h-[320px] bg-surface-container-lowest dark:bg-slate-800/60 rounded-xl border-2 border-primary/5 dark:border-slate-700/40 relative flex flex-col overflow-hidden">
      <style>{`
        .ai-insight-card {
          container-type: inline-size;
          container-name: aicard;
          padding: 0.75rem;
          gap: 0.5rem;
        }
        .ai-insight-card .ai-bg-icon { padding: 0.5rem; }
        .ai-insight-card .ai-bg-icon .material-symbols-outlined { font-size: 2rem; }
        .ai-insight-card .ai-header { gap: 0.5rem; }
        .ai-insight-card .ai-header-icon-wrap { padding: 0.375rem; }
        .ai-insight-card .ai-header-icon-wrap .material-symbols-outlined { font-size: 1rem; }
        .ai-insight-card .ai-title { font-size: 0.875rem; }
        .ai-insight-card .ai-quote { padding: 0.5rem; }
        .ai-insight-card .ai-quote p { font-size: 0.75rem; }
        .ai-insight-card .ai-checklist { font-size: 0.75rem; }
        .ai-insight-card .ai-checklist li { gap: 0.375rem; }
        .ai-insight-card .ai-checklist li + li { margin-top: 0.375rem; }
        .ai-insight-card .ai-checklist .material-symbols-outlined { font-size: 0.875rem; }
        .ai-insight-card .ai-button { font-size: 0.6875rem; padding: 0.5rem 0.5rem; }

        @container aicard (min-width: 250px) {
          .ai-insight-card { padding: 1rem; gap: 0.75rem; }
          .ai-insight-card .ai-bg-icon { padding: 0.75rem; }
          .ai-insight-card .ai-bg-icon .material-symbols-outlined { font-size: 3rem; }
          .ai-insight-card .ai-header { gap: 0.75rem; }
          .ai-insight-card .ai-header-icon-wrap { padding: 0.5rem; }
          .ai-insight-card .ai-header-icon-wrap .material-symbols-outlined { font-size: 1.25rem; }
          .ai-insight-card .ai-title { font-size: 1rem; }
          .ai-insight-card .ai-quote { padding: 0.75rem; }
          .ai-insight-card .ai-quote p { font-size: 0.875rem; }
          .ai-insight-card .ai-checklist { font-size: 0.875rem; }
          .ai-insight-card .ai-checklist li { gap: 0.5rem; }
          .ai-insight-card .ai-checklist li + li { margin-top: 0.5rem; }
          .ai-insight-card .ai-checklist .material-symbols-outlined { font-size: 1rem; }
          .ai-insight-card .ai-button { font-size: 0.75rem; padding: 0.625rem 0.5rem; }
        }

        @container aicard (min-width: 320px) {
          .ai-insight-card { padding: 1.25rem; gap: 1rem; }
          .ai-insight-card .ai-bg-icon .material-symbols-outlined { font-size: 3.75rem; }
          .ai-insight-card .ai-title { font-size: 1.125rem; }
          .ai-insight-card .ai-button { font-size: 0.875rem; }
        }
      `}</style>

      <div className="ai-bg-icon absolute top-0 right-0 opacity-10 pointer-events-none">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          psychology
        </span>
      </div>

      <div className="ai-header flex items-center flex-shrink-0 min-w-0">
        <div className="ai-header-icon-wrap bg-tertiary-fixed dark:bg-purple-900/30 rounded-lg flex-shrink-0">
          <span className="material-symbols-outlined text-tertiary dark:text-purple-400" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
        </div>
        <h3 className="ai-title font-bold font-headline text-on-surface dark:text-white leading-tight min-w-0">
          AI Insight Alert
        </h3>
      </div>

      <div className="ai-quote bg-tertiary/5 dark:bg-purple-900/20 rounded-xl border-l-4 border-tertiary dark:border-purple-500 flex-shrink-0">
        <p className="text-on-surface dark:text-slate-200 font-medium leading-relaxed">
          {topSubject ? (
            <>
              "{name} is performing strongly in{" "}
              <span className="text-tertiary dark:text-purple-300 font-bold">{topSubject}</span>
              , currently at {topPct}%."
            </>
          ) : (
            `"Not enough grade data yet for ${name} to generate an insight."`
          )}
        </p>
      </div>

      <ul className="ai-checklist flex-1 flex flex-col text-on-surface-variant dark:text-slate-400 min-h-0">
        {checklist.length ? (
          checklist.map((item, i) => (
            <li key={i} className="flex items-start">
              <span className="material-symbols-outlined text-tertiary dark:text-purple-400 mt-0.5 flex-shrink-0">
                check_circle
              </span>
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="flex items-start">
            <span className="material-symbols-outlined text-tertiary dark:text-purple-400 mt-0.5 flex-shrink-0">info</span>
            <span>Check back after more data is recorded.</span>
          </li>
        )}
      </ul>

      <button
        className="ai-button w-full rounded-xl font-bold flex-shrink-0 leading-snug
                   bg-surface-container-high dark:bg-slate-700
                   text-primary dark:text-blue-300
                   hover:bg-primary hover:text-white
                   dark:hover:bg-blue-600 dark:hover:text-white
                   transition-all"
      >
        View Detailed Insights
      </button>
    </div>
  );
};

export default AIInsights;