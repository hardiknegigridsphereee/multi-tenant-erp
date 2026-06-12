import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await schoolAdminApi.getNotifications();
      // Adjust based on if your API returns {results: []} or just []
      setNotifications(data.results || data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SchoolLayout title="Notifications">
      <div className="max-w-4xl mx-auto py-10 px-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">System Notifications</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading notifications...</div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className="p-6 hover:bg-gray-50 transition-colors flex gap-4">
                <span className="material-symbols-outlined text-[#0058be] bg-blue-50 p-2 rounded-lg h-10 w-10 text-center">
                  notifications
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{n.title || "New Update"}</p>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">No new notifications.</div>
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}