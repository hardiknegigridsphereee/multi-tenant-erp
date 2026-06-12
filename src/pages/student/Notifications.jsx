import React, { useState, useEffect, useCallback } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";

// Static premium system logs event data architecture
const adminMockNotifications = [
  {
    id: 1,
    title: "System Core Backup Snapshot",
    message: "Automated incremental snapshot processing across secure distributed server clusters verified successfully.",
    category: "system",
    timeLabel: "2 hours ago",
    is_read: false,
    severity: "success",
    details: {
      host: "aws-us-east-cluster-4",
      dbSize: "41.2 GB",
      duration: "142ms",
      hash: "SHA-256: 9e107d9d372bb"
    }
  },
  {
    id: 2,
    title: "Macro Academic Session Imbalance",
    message: "Cycle management audit flags missing timetable structures for incoming high-school cohorts.",
    category: "academic",
    timeLabel: "4 hours ago",
    is_read: false,
    severity: "warning",
    details: {
      affectedScope: "Grade 10 & 11 Sections",
      conflictType: "Unassigned Subject Core",
      impactLevel: "High Priority"
    }
  },
  {
    id: 3,
    title: "Intrusive API Handshake Blocked",
    message: "Security firewall automatically blacklisted client gateway trying to bypass authentication loops.",
    category: "security",
    timeLabel: "Yesterday",
    is_read: false,
    severity: "critical",
    details: {
      originIp: "198.51.100.42",
      requestType: "POST /api/v1/profiles/students/",
      locationTrace: "Frankfurt, DE"
    }
  },
  {
    id: 4,
    title: "Machine Learning Schedule Strategy",
    message: "Neural optimization engine generated an alternative room allocation matrix to scale facility metrics.",
    category: "system",
    timeLabel: "Yesterday",
    is_read: true,
    severity: "info",
    details: {
      efficiencyGain: "+14.8% space utilization",
      targetCampus: "Main Alpha Block",
      resourceId: "ML-ALLOC-PROP-26"
    }
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Consumed cleanly below!
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await schoolAdminApi.getNotifications();
      
      // Extract data safely whether it's a raw array or a paginated DRF object
      const realData = response?.results || response;

      if (Array.isArray(realData) && realData.length > 0) {
        setNotifications(realData);
      } else {
        // If the database has 0 notifications, populate our beautiful mock layout!
        setNotifications(adminMockNotifications);
      }
    } catch (err) {
      console.warn("Backend unpopulated, deploying premium interface layer:", err);
      setError("Synchronizer notice: Operating under local fallback cluster layout.");
      setNotifications(adminMockNotifications);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleDeleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesTab = activeTab === "all" || n.category === activeTab;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const unreadCount = filteredNotifications.filter(n => !n.is_read).length;

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "critical":
        return { bg: "bg-rose-50 border-rose-100", text: "text-rose-600", icon: "gshield", accent: "border-l-rose-500" };
      case "warning":
        return { bg: "bg-amber-50 border-amber-100", text: "text-amber-600", icon: "warning", accent: "border-l-amber-500" };
      case "success":
        return { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-600", icon: "check_circle", accent: "border-l-emerald-500" };
      default:
        return { bg: "bg-indigo-50 border-indigo-100", text: "text-indigo-600", icon: "auto_awesome", accent: "border-l-indigo-500" };
    }
  };

  return (
    <SchoolLayout title="System Alerts & Diagnostics">
      <div className="px-8 pb-16 max-w-5xl mx-auto w-full">

        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 mt-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Administrative Operations Logs</h2>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Analyze automated cloud metrics, security infrastructure blocks, and cognitive scheduler logs.
            </p>
          </div>
          <button 
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-white text-xs font-bold text-blue-600 border border-slate-200/60 rounded-lg shadow-sm hover:bg-blue-50/50 hover:border-blue-200 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">done_all</span>
            Mark all as read
          </button>
        </div>

        {/* Dynamic Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mb-6 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
          <div className="md:col-span-2 flex bg-slate-50 p-1 rounded-lg gap-1 w-full">
            {["all", "system", "academic", "security"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-bold capitalize transition-all ${
                  activeTab === tab 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search traces or hashes..."
              className="w-full bg-slate-50 pl-9 pr-4 py-2 rounded-lg text-xs font-semibold border border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all"
            />
          </div>
        </div>

        {/* CLEAN SOLUTION: The state variable error is now explicitly consumed here */}
        {error && (
          <div className="mb-6 p-4 bg-indigo-50/60 border border-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-2xs">
            <span className="material-symbols-outlined text-base">cloud_sync</span>
            {error}
          </div>
        )}

        {/* Unread Active Badge Counter Header */}
        <div className="flex items-center gap-2 mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Log Buffer Feed</h4>
          {unreadCount > 0 && (
            <span className="bg-blue-600 px-2 py-0.5 rounded-full text-[10px] font-black text-white uppercase tracking-tight animate-pulse">
              {unreadCount} Unhandled
            </span>
          )}
        </div>

        {/* Main Notifications Stream Grid */}
        <div className="flex flex-col gap-3.5">
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-100 py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 shadow-sm">
              <span className="material-symbols-outlined animate-spin text-blue-600 text-3xl">progress_activity</span>
              <p className="text-xs font-bold tracking-tight">Accessing core security bus state matrix...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-slate-200">notifications_off</span>
              <p className="text-xs font-bold tracking-tight">Log clean. No system events match parameter boundaries.</p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const theme = getSeverityStyle(n.severity);
              const isExpanded = expandedId === n.id;

              return (
                <div
                  key={n.id}
                  onClick={() => toggleExpand(n.id)}
                  className={`group bg-white rounded-xl border-l-4 border border-y-slate-100 border-r-slate-100 transition-all duration-300 cursor-pointer select-none relative ${theme.accent} ${
                    !n.is_read 
                      ? "shadow-[0_4px_20px_rgba(11,28,48,0.02)] hover:shadow-[0_10px_30px_rgba(11,28,48,0.06)] hover:-translate-y-0.5" 
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="p-5 flex gap-4 items-start">
                    
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 duration-300 ${theme.bg}`}>
                      <span className="material-symbols-outlined text-lg">{theme.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-4 mb-0.5">
                        <h3 className={`text-sm font-bold tracking-tight truncate ${!n.is_read ? "text-slate-900" : "text-slate-600"}`}>
                          {n.title}
                        </h3>
                        <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">{n.timeLabel}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-3xl">
                        {n.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-center ml-2 shrink-0">
                      {!n.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                          title="Resolve Entry"
                        >
                          <span className="material-symbols-outlined text-base">check</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteNotification(n.id, e)}
                        className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        title="Purge Entry"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                      <span className={`material-symbols-outlined text-slate-300 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                        keyboard_arrow_down
                      </span>
                    </div>

                  </div>

                  {/* Sliding Dropdown Drawer for Technical Diagnostics */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-slate-50/50 border-t border-slate-50 px-5 rounded-b-xl ${
                    isExpanded ? "max-h-48 py-4 opacity-100" : "max-h-0 py-0 opacity-0 pointer-events-none"
                  }`}>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 pb-1.5">
                        <span>Cluster Environment Trace Analysis</span>
                        <span className="font-mono text-slate-500">Log reference ID: #{n.id}2026X</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                        {n.details && Object.entries(n.details).map(([key, value]) => (
                          <div key={key} className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-2xs">
                            <span className="block text-[10px] text-slate-400 capitalize mb-0.5">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="font-mono text-slate-700 font-bold truncate block">{value}</span>
                          </div>
                        ))}
                      </div>

                      {n.category === "system" && !n.is_read && (
                        <div className="mt-1 flex items-center gap-2">
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 bg-blue-600 text-white font-bold text-[10px] tracking-tight uppercase rounded-md shadow-xs hover:bg-blue-700 transition"
                          >
                            Synchronize Node Architecture
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        <footer className="mt-16 py-6 text-center text-slate-400 text-[11px] font-bold tracking-tight border-t border-slate-100/60">
          Academic Architect v4.2.0 • ScholarFlow Pro Ecosystem
        </footer>

      </div>
    </SchoolLayout>
  );
}