import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from '../../services/schoolAdminApi';
import ActionMenu from "./ActionMenu";
import Pagination from "../../components/erp/global/Pagination";

export default function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 whenever search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch students when page or debounced search changes
  useEffect(() => {
    fetchStudents(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const fetchStudents = async (page, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolAdminApi.getStudents(page, search);
      
      if (data.results) {
        setStudents(data.results);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / 10));
      } else {
        setStudents(data);
        setTotalCount(data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Fetch Students Error:", err);
      setError(err.response?.data?.detail || "Failed to fetch student directory.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "ST";
  };

  return (
    <SchoolLayout title="Student Directory">
      <div className="pt-6 px-8 max-w-7xl mx-auto">
        {/* header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold">Institution Students</h2>
            <p className="text-[#6b7280] mt-1">
              Manage student profiles, track enrollment status, and view basic records.
            </p>
          </div>

          <button
            onClick={() => navigate("/school-admin/students/add")}
            className="bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white px-6 py-3 rounded-md font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <span className="material-symbols-outlined">person_add</span>
            Register Student
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {/* table container */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          {/* filters */}
          <div className="p-6 flex justify-between bg-[#eff4ff] border-b border-blue-50">
            <div className="relative w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or enrollment no..."
                className="w-full bg-white pl-9 pr-9 py-2 rounded-md text-sm border-transparent focus:border-[#0058be]/30 focus:ring-2 focus:ring-[#0058be]/10 outline-none transition-all shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
            <div className="text-sm text-[#6b7280] font-medium flex items-center">
              Showing {students.length} of {totalCount} records
            </div>
          </div>

          {/* table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8f9ff] text-xs text-[#727785] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student Details</th>
                  <th>Enrollment No.</th>
                  <th>Contact Info</th>
                  <th className="text-center">Status</th>
                  <th className="text-right pr-6">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-[#0058be]">progress_activity</span>
                        Loading student profiles...
                      </div>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      {searchQuery ? "No students match your search." : "No students enrolled in this institution yet."}
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id} className="hover:bg-[#fcfdff] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex gap-4 items-center">
                          {s.profile_picture ? (
                            <img src={s.profile_picture} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e5eeff] to-[#cce0ff] text-[#0058be] flex items-center justify-center font-bold text-sm shadow-inner border border-white">
                              {getInitials(s.first_name, s.last_name, s.email)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{s.first_name || s.last_name ? `${s.first_name} ${s.last_name}` : "Pending Name"}</p>
                            <p className="text-xs text-[#6b7280] font-mono mt-0.5">{s.email || "No Email Provided"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm text-gray-900 font-semibold font-mono">{s.enrollment_number || "N/A"}</td>
                      <td className="text-sm text-[#727785]">{s.phone_number || "No Phone"}</td>
                      <td className="text-center">
                        {!s.is_archived ? (
                           <span className="px-3 py-1 bg-[#e5eeff] text-[#0058be] rounded-full text-xs font-semibold flex items-center gap-1 w-max mx-auto border border-blue-100">
                               <span className="material-symbols-outlined text-[14px]">check_circle</span>
                               Active
                           </span>
                        ) : (
                           <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold flex items-center gap-1 w-max mx-auto border border-gray-200">
                               <span className="material-symbols-outlined text-[14px]">archive</span>
                               Archived
                           </span>
                        )}
                      </td>
                      <td className="text-right pr-6">
                        <ActionMenu studentId={s.id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={(page) => setCurrentPage(page)} 
            />
          )}
        </div>
      </div>
    </SchoolLayout>
  );
}