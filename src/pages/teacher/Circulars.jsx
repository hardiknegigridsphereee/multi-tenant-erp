import React, { useState, useMemo } from "react";
import MainLayout from "../../components/erp/teacher/MainLayout";
import { useTheme } from "../../context/ThemeContext";
import { useStaleData } from "../../hooks/useStaleData";
import { schoolAdminApi } from "../../services/schoolAdminApi";

const AUDIENCE_ICONS = {
  Student: { icon: "school", bg: "bg-blue-50", darkBg: "bg-blue-500/20", text: "text-blue-600", darkText: "text-blue-400" },
  Parent: { icon: "family_restroom", bg: "bg-purple-50", darkBg: "bg-purple-500/20", text: "text-purple-600", darkText: "text-purple-400" },
  Teacher: { icon: "person", bg: "bg-green-50", darkBg: "bg-green-500/20", text: "text-green-600", darkText: "text-green-400" },
  All: { icon: "campaign", bg: "bg-orange-50", darkBg: "bg-orange-500/20", text: "text-orange-600", darkText: "text-orange-400" },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
}

function Skeleton({ className = "", darkMode }) {
  return <div className={`animate-pulse rounded-md ${darkMode ? 'bg-slate-700' : 'bg-gray-200'} ${className}`} />;
}

function CircularsSkeleton({ darkMode }) {
  return (
    <MainLayout title="Circulars & Notices">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton darkMode={darkMode} className="w-48 h-7" />
          <Skeleton darkMode={darkMode} className="w-72 h-4" />
        </div>
        <Skeleton darkMode={darkMode} className="w-full h-10 rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`rounded-xl p-5 shadow-sm space-y-3 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
              <div className="flex gap-3 items-start">
                <Skeleton darkMode={darkMode} className="w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton darkMode={darkMode} className="w-3/4 h-4" />
                  <Skeleton darkMode={darkMode} className="w-1/2 h-3" />
                </div>
                <Skeleton darkMode={darkMode} className="w-20 h-6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

/* ─── Detail Modal ───────────────────────────────────────────────────────── */
function CircularModal({ circular, onClose, loading, darkMode }) {
  const audMeta = AUDIENCE_ICONS[circular.target_audience_display] || AUDIENCE_ICONS.All;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? audMeta.darkBg : audMeta.bg}`}>
            <span className={`material-symbols-outlined text-lg sm:text-xl ${darkMode ? audMeta.darkText : audMeta.text}`}>{audMeta.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-2xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${darkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                {circular.target_audience_display || "All"}
              </span>
            </div>
            <h2 className={`text-sm sm:text-base font-bold leading-snug break-words ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {circular.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition-colors ${darkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-slate-500'}`}
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
          <div className={`flex flex-wrap gap-x-5 gap-y-2 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {formatDate(circular.created_at)}
            </span>
            {circular.created_by_name && (
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">person</span>
                {circular.created_by_name}
              </span>
            )}
          </div>

          {/* Content — shows skeleton while loading */}
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <Skeleton darkMode={darkMode} className="w-full h-3" />
              <Skeleton darkMode={darkMode} className="w-5/6 h-3" />
              <Skeleton darkMode={darkMode} className="w-4/6 h-3" />
              <Skeleton darkMode={darkMode} className="w-full h-3 mt-2" />
              <Skeleton darkMode={darkMode} className="w-3/4 h-3" />
            </div>
          ) : (
            <p className={`text-sm leading-relaxed whitespace-pre-line break-words ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {circular.content || "No content provided."}
            </p>
          )}

          {circular.attachment_name && (
            <div>
              <p className={`text-2xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Attachment
              </p>
              <div className={`flex items-center gap-3 rounded-xl px-3 sm:px-4 py-3 flex-wrap sm:flex-nowrap ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-sm text-red-600">attach_file</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {circular.attachment_name}
                  </p>
                </div>
                <a
                  href={circular.attachment_key}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-1 text-xs font-semibold hover:underline flex-shrink-0 w-full sm:w-auto justify-center sm:justify-start ${darkMode ? 'text-blue-400' : 'text-primary'}`}
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Download</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t flex justify-end ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
          <button
            onClick={onClose}
            className={`w-full sm:w-auto px-5 py-2 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity ${darkMode ? 'bg-blue-600' : 'bg-primary'}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Circular Card ──────────────────────────────────────────────────────── */
function CircularCard({ circular, onClick, darkMode }) {
  const audMeta = AUDIENCE_ICONS[circular.target_audience_display] || AUDIENCE_ICONS.All;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-3.5 sm:p-4 lg:p-5 shadow-sm border transition-all cursor-pointer group
        ${darkMode
          ? 'bg-slate-900 border-slate-700 hover:border-slate-600 hover:shadow-md'
          : 'bg-white border-slate-100 hover:shadow-md hover:border-primary/20'}`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${darkMode ? audMeta.darkBg : audMeta.bg}`}>
          <span className={`material-symbols-outlined text-lg sm:text-xl ${darkMode ? audMeta.darkText : audMeta.text}`}>{audMeta.icon}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-start justify-between gap-1.5 sm:gap-2 mb-1">
            <h3 className={`text-sm font-bold leading-snug transition-colors pr-0 sm:pr-2 break-words ${darkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-800 group-hover:text-primary'}`}>
              {circular.title}
            </h3>
            <span className={`text-2xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 self-start ${darkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
              {circular.target_audience_display || "All"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
            {circular.created_by_name && (
              <span className={`flex items-center gap-1 text-2xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="material-symbols-outlined text-sm">person</span>
                {circular.created_by_name}
              </span>
            )}
            <span className={`flex items-center gap-1 text-2xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined text-sm">schedule</span>
              {daysAgo(circular.created_at)}
            </span>
            {circular.attachment_name && (
              <span className={`flex items-center gap-1 text-2xs font-semibold ${darkMode ? 'text-blue-400' : 'text-primary'}`}>
                <span className="material-symbols-outlined text-sm">attach_file</span>
                Attachment
              </span>
            )}
            <span className={`w-full sm:w-auto sm:ml-auto text-2xs font-semibold flex items-center gap-0.5 group-hover:gap-1 transition-all ${darkMode ? 'text-blue-400' : 'text-primary'}`}>
              Read more
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Circulars() {
  const { darkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCircular, setActiveCircular] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const { data: circularsData, loading } = useStaleData(
    `teacher:circulars:page1`,
    () => schoolAdminApi.getCirculars(1),
  );

  const allCirculars = useMemo(
    () => circularsData?.results || circularsData || [],
    [circularsData],
  );

  // Fetch full detail (including content) when opening a circular,
  // since the list endpoint omits the content field.
  const openCircular = async (circular) => {
    setActiveCircular({ ...circular, content: null }); // open modal immediately with metadata
    setModalLoading(true);
    try {
      const full = await schoolAdminApi.getCircularById(circular.id);
      setActiveCircular(full);
    } catch (err) {
      console.error("Failed to load circular detail:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return allCirculars.filter((c) => {
      const matchSearch =
        !searchQuery ||
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.created_by_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [allCirculars, searchQuery]);

  if (loading && allCirculars.length === 0) return <CircularsSkeleton darkMode={darkMode} />;

  return (
    <MainLayout title="Circulars & Notices">
      <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div>
            <h1 className={`text-lg sm:text-2xl lg:text-3xl font-display font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              Circulars &amp; Notices
            </h1>
            <p className={`text-xs sm:text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Official announcements and updates from the school
            </p>
          </div>
        </div>

        <div className="relative">
          <span className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars, notices…"
            className={`w-full pl-10 pr-4 py-2.5 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30
              ${darkMode
                ? 'bg-slate-800 text-white placeholder:text-slate-500'
                : 'bg-slate-100 text-slate-800 placeholder:text-slate-400'}`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3 text-center px-4">
            <span className={`material-symbols-outlined text-5xl opacity-30 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              campaign
            </span>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {allCirculars.length === 0
                ? "No circulars yet."
                : "No circulars found matching your search."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`text-sm font-semibold hover:underline ${darkMode ? 'text-blue-400' : 'text-primary'}`}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            <p className={`text-2xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Showing {filtered.length} of {allCirculars.length} notices
            </p>

            {filtered.map((circular) => (
              <CircularCard
                key={circular.id}
                circular={circular}
                darkMode={darkMode}
                onClick={() => openCircular(circular)}
              />
            ))}
          </div>
        )}
      </div>

      {activeCircular && (
        <CircularModal
          circular={activeCircular}
          loading={modalLoading}
          darkMode={darkMode}
          onClose={() => setActiveCircular(null)}
        />
      )}
    </MainLayout>
  );
}
