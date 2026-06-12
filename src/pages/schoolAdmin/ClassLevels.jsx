import React, { useState, useEffect, useCallback } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";

export default function ClassLevels() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Master-Detail Interaction States
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [sectionsCache, setSectionsCache] = useState({}); 
  const [loadingSections, setLoadingSections] = useState({}); 

  const fetchLiveClassStructures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await schoolAdminApi.getClassLevels();
      const liveData = response?.results || response;
      if (Array.isArray(liveData)) {
        // Sort classes by numeric_order automatically
        const sortedClasses = liveData.sort((a, b) => (a.numeric_order || 0) - (b.numeric_order || 0));
        setClasses(sortedClasses);
      } else {
        setClasses([]);
      }
    } catch (err) {
      console.error("Live configuration sync paused:", err);
      setError("Failed to synchronize active class levels with the data cluster.");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveClassStructures();
  }, [fetchLiveClassStructures]);

  // 2. Expand Row & Fetch Specific Sections dynamically
  const toggleClassRow = async (classId) => {
    if (expandedClassId === classId) {
      setExpandedClassId(null); 
      return;
    }
    
    setExpandedClassId(classId); 

    if (!sectionsCache[classId]) {
      setLoadingSections(prev => ({ ...prev, [classId]: true }));
      try {
        const response = await schoolAdminApi.getSectionsByClass(classId); 
        let liveSections = response?.results || response || [];
        
        // --- STRICT FRONTEND FILTER ---
        if (liveSections.length > 0) {
          liveSections = liveSections.filter(sec => {
             const secClassId = typeof sec.class_level === 'object' ? sec.class_level?.id : sec.class_level;
             return !secClassId || secClassId === classId; 
          });
        }
        
        setSectionsCache(prev => ({ ...prev, [classId]: liveSections }));
      } catch (err) {
        console.error(`Failed to fetch sections for class ${classId}:`, err);
        setSectionsCache(prev => ({ ...prev, [classId]: [] })); 
      } finally {
        setLoadingSections(prev => ({ ...prev, [classId]: false }));
      }
    }
  };

  // 3. Delete Class Level
  const handleDeleteClass = async (classId, e) => {
    e.stopPropagation(); 
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this Class Level and all its Sections?");
    if (!confirmDelete) return;

    try {
      await schoolAdminApi.deleteClassLevelById(classId);
      setClasses(prev => prev.filter(c => c.id !== classId));
      if (expandedClassId === classId) setExpandedClassId(null);
    } catch (err) {
      console.error("Failed to delete class:", err);
      alert("Error: Could not delete class level. Please check server connection.");
    }
  };

  // 4. Delete Specific Section
  const handleDeleteSection = async (classId, sectionId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this specific section?");
    if (!confirmDelete) return;

    try {
      await schoolAdminApi.deleteSectionById(sectionId);
      setSectionsCache(prev => ({
        ...prev,
        [classId]: prev[classId].filter(sec => sec.id !== sectionId)
      }));
      setClasses(prev => prev.map(c => {
        if (c.id === classId) {
           return { ...c, sectionCount: Math.max(0, (c.sectionCount || c.sections?.length || 1) - 1) };
        }
        return c;
      }));
    } catch (err) {
      console.error("Failed to delete section:", err);
      alert("Error: Could not delete section.");
    }
  };

  const filteredClasses = classes.filter(c => {
    const className = c?.name || "";
    const classCode = c?.code || "";
    return className.toLowerCase().includes(searchQuery.toLowerCase()) ||
           classCode.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <SchoolLayout title="Class Framework Directory">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Institution Class Levels</h2>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Manage grade tiers, expand rows to view mapped section groupings, and strictly govern layout structures.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search classes by name or code..."
            className="w-full bg-slate-50 pl-9 pr-4 py-2 rounded-lg text-xs font-semibold border border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all"
          />
        </div>
        <span className="text-xs font-bold text-slate-400 shrink-0">
          {loading ? "Calculating..." : `Showing ${filteredClasses.length} of ${classes.length} database entries`}
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">cloud_off</span>
          <span>{error}</span>
          <button 
            onClick={fetchLiveClassStructures}
            className="ml-auto underline text-xs font-bold hover:text-amber-950 transition"
          >
            Retry Sync
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 w-10"></th>
                <th className="py-4 px-4">Class Details</th>
                <th className="py-4 px-4">Identification Code</th>
                <th className="py-4 px-4">Allocated Sections</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
              
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[#0058be] text-2xl">progress_activity</span>
                      <span className="font-bold text-xs tracking-tight">Streaming relational dataset tables...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                      <span className="material-symbols-outlined text-3xl text-slate-200">grid_off</span>
                      <p className="font-bold text-xs">No matching live class level clusters recorded.</p>
                      <p className="text-[11px] text-slate-400 font-medium">Seed parameters through your administration interface panel.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => {
                  const isExpanded = expandedClassId === cls.id;
                  const sections = sectionsCache[cls.id] || [];
                  const isLoadingSections = loadingSections[cls.id];

                  return (
                    <React.Fragment key={cls.id}>
                      <tr 
                        onClick={() => toggleClassRow(cls.id)}
                        className={`transition-colors cursor-pointer group ${isExpanded ? "bg-blue-50/30" : "hover:bg-slate-50/40"}`}
                      >
                        <td className="py-4 px-4 text-center">
                          <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                            expand_more
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isExpanded ? "bg-[#0058be] text-white" : "bg-[#eff4ff] text-[#0058be] border border-blue-100"}`}>
                              <span className="material-symbols-outlined text-base">meeting_room</span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {cls.name || "Unnamed Class Level"}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {String(cls.id).substring(0, 8).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4 font-mono text-slate-500 font-bold">
                          {cls.code || "UNASSIGNED"}
                        </td>
                        
                        <td className="py-4 px-4">
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            {(cls.sectionCount || cls.sections?.length || sections.length || 0)} Active Sections
                          </span>
                        </td>
                        
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            cls.status === "Active" || cls.is_active === true
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}>
                            {cls.status || (cls.is_active ? "Active" : "Archived")}
                          </span>
                        </td>
                        
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={(e) => handleDeleteClass(cls.id, e)}
                            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center ml-auto transition-all shadow-sm outline-none"
                            title="Delete Class Level"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="bg-slate-50/60 p-0 border-b border-slate-200">
                            <div className="px-16 py-6 animate-fadeIn">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">
                                  Sections under {cls.name}
                                </h4>
                              </div>

                              {isLoadingSections ? (
                                <div className="text-center py-6 text-slate-400 text-[11px] font-bold flex justify-center items-center gap-2">
                                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                                  Sorting and verifying strict section data...
                                </div>
                              ) : sections.length === 0 ? (
                                <div className="text-center py-6 bg-white border border-slate-100 rounded-lg text-slate-400 text-[11px] font-bold shadow-2xs">
                                  No sections currently deployed to this class level.
                                </div>
                              ) : (
                                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                                  <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 uppercase tracking-wider font-black">
                                      <tr>
                                        <th className="py-2.5 px-4">Section Name</th>
                                        <th className="py-2.5 px-4">Section Level</th>
                                        <th className="py-2.5 px-4 text-right">Remove</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-700">
                                      {sections.map(sec => (
                                        <tr key={sec.id} className="hover:bg-slate-50 transition-colors">
                                          <td className="py-3 px-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#0058be]"></span>
                                            {cls.name} - {sec.name.replace('Section ', 'Sec ')}
                                          </td>
                                          <td className="py-3 px-4 text-[#0058be] font-bold">
                                            {cls.name}
                                          </td>
                                          <td className="py-3 px-4 text-right">
                                            <button 
                                              onClick={() => handleDeleteSection(cls.id, sec.id)}
                                              className="text-slate-300 hover:text-rose-600 transition-colors outline-none"
                                              title="Delete Section"
                                            >
                                              <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </SchoolLayout>
  );
}