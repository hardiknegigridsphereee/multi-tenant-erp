import React, { useState, useEffect, useMemo } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useNavigate } from "react-router-dom";
import { getAcademicYears } from '../../services/schoolAdminApi';

export default function AcademicYears() {
  const navigate = useNavigate();
  
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'archived'

  useEffect(() => {
    fetchAcademicYears(currentPage);
  }, [currentPage]);

  const fetchAcademicYears = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAcademicYears(page);
      
      if (data.results) {
        setYears(data.results);
        setTotalCount(data.count);
      } else {
        setYears(data);
        setTotalCount(data.length);
      }
    } catch (err) {
      console.error("Error fetching academic years:", err);
      setError(err.response?.data?.detail || err.message || "Failed to fetch academic years.");
    } finally {
      setLoading(false);
    }
  };

  // Logic: Calculate stats cards dynamically from fetched years
  const stats = useMemo(() => {
    const active = years.find(y => y.is_active);
    const archived = years.filter(y => !y.is_active).length;
    return { active, archived };
  }, [years]);

  // Logic: Filter table data based on status selection
  const filteredYears = useMemo(() => {
    if (statusFilter === "active") return years.filter(y => y.is_active);
    if (statusFilter === "archived") return years.filter(y => !y.is_active);
    return years;
  }, [years, statusFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <SchoolLayout title="Academic Years">
      <div className="pt-6">
        {/* header */}
        <div className="flex justify-between items-end mb-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Cycle Management</h1>
            <p className="text-[#6b7280]">
              Configure and monitor the lifecycle of your institution's academic periods. Ensure seamless transitions between terms.
            </p>
          </div>

          <button
            onClick={() => navigate("/school-admin/academic-years/create")}
            className="px-6 py-3 rounded-md text-white font-semibold bg-gradient-to-r from-[#0058be] to-[#2170e4] shadow-lg flex gap-2 items-center"
          >
            <span className="material-symbols-outlined">add</span>
            Add Academic Year
          </button>
        </div>

        {/* stats - Now dynamic based on years data */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg border-l-4 border-[#0058be] shadow-sm">
            <p className="text-sm text-gray-500">Current Active Year</p>
            <h3 className="text-2xl font-bold text-[#0058be]">{stats.active?.name || "None"}</h3>
            <p className="text-xs text-green-600 mt-2 flex gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Live for all campuses</p>
          </div>

          <div className="bg-white p-6 rounded-lg border-l-4 border-[#924700] shadow-sm">
            <p className="text-sm text-gray-500">Total Cycles</p>
            <h3 className="text-2xl font-bold text-[#924700]">{totalCount}</h3>
            <p className="text-xs text-gray-500 mt-2">Recorded in system</p>
          </div>

          <div className="bg-white p-6 rounded-lg border-l-4 border-[#6b38d4] shadow-sm">
            <p className="text-sm text-gray-500">Archived Periods</p>
            <h3 className="text-2xl font-bold text-[#6b38d4]">{stats.archived}</h3>
            <p className="text-xs text-gray-500 mt-2">Historical Data Retained</p>
          </div>
        </div>

        {/* table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-8 py-6 flex justify-between bg-[#eff4ff]">
            <h3 className="font-bold">Yearly Timeline</h3>
            <div className="flex gap-2">
              {/* Filter Logic: Cycles through All -> Active -> Archived */}
              <button 
                onClick={() => setStatusFilter(prev => prev === "all" ? "active" : prev === "active" ? "archived" : "all")}
                className={`p-2 rounded-md ${statusFilter !== 'all' ? 'bg-blue-200' : 'hover:bg-white'}`}
                title={`Current filter: ${statusFilter}`}
              >
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
          </div>

          {error && <div className="p-4 text-red-600 bg-red-50 text-center border-b border-red-100">{error}</div>}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 border-b">
                  <th className="px-8 py-4">Year Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th className="text-right pr-8">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-10 text-gray-500">Loading...</td></tr>
                ) : filteredYears.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-10 text-gray-500">No matching years found.</td></tr>
                ) : (
                  filteredYears.map((year) => (
                    <tr key={year.id} className="hover:bg-[#f8f9ff]">
                      <td className="px-8 py-5 font-semibold">{year.name}</td>
                      <td>{formatDate(year.start_date)}</td>
                      <td>{formatDate(year.end_date)}</td>
                      <td>
                        <span className={`px-3 py-1 text-xs rounded-full ${year.is_active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                          {year.is_active ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td className="text-right pr-8">
                        <button onClick={() => navigate(`/school-admin/academic-years/edit/${year.id}`)} className="text-[#0058be] font-medium hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-8 py-5 flex justify-between items-center text-sm bg-[#eff4ff]">
            <p className="text-[#6b7280]">Showing {filteredYears.length} results</p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(c => c - 1)}
                className="w-10 h-10 rounded-md border border-[#c2c6d6] flex items-center justify-center hover:bg-white disabled:opacity-50"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 rounded-md bg-[#0058be] text-white font-semibold">{currentPage}</button>
              <button 
                onClick={() => setCurrentPage(c => c + 1)}
                className="w-10 h-10 rounded-md border border-[#c2c6d6] flex items-center justify-center hover:bg-white"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </SchoolLayout>
  );
}