import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";

export default function EditTeacherAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for form fields - FIXED: Changed to boolean to match database
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [displayData, setDisplayData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await schoolAdminApi.getTeacherAssignmentById(id);
        setDisplayData(data);
        
        // Populate the form data with the existing boolean value
        setIsClassTeacher(data.is_class_teacher || false);
      } catch (err) {
        console.error("Error loading assignment:", err);
      } finally {
        setLoading(false); 
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the correct field name (is_class_teacher) to the backend
      await schoolAdminApi.updateTeacherAssignment(id, { 
        is_class_teacher: isClassTeacher 
      });
      alert("Updated successfully!");
      navigate("/school-admin/teacher-assignment");
    } catch (err) {
      console.error("Error updating assignment:", err);
      alert("Failed to update.");
    }
  };

  if (loading) {
    return (
      <SchoolLayout title="Edit Assignment">
        <div className="p-8 flex justify-center items-center h-64 text-[#0058be]">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
      </SchoolLayout>
    );
  }

  return (
    <SchoolLayout title="Edit Assignment">
      <div className="p-8 max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 text-[#0058be] font-medium flex items-center gap-1 hover:underline transition-all"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> Back
        </button>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Assignment</h1>
        
        {displayData && (
           <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-100">
               <p className="font-semibold text-gray-800 text-lg mb-1">{displayData.teacher_name}</p>
               <div className="flex flex-col gap-1 text-sm text-gray-500">
                 <p><strong>Subject:</strong> {displayData.subject_name}</p>
                 <p><strong>Class/Section:</strong> {displayData.class_level_name} - {displayData.section_name}</p>
                 <p><strong>Academic Year:</strong> {displayData.academic_year_name}</p>
               </div>
           </div>
        )}

        <form onSubmit={handleSubmit}>
            {/* FIXED: Replaced text input with the correct Boolean Checkbox */}
            <div className="mb-8">
              <label className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-md cursor-pointer hover:bg-orange-100/50 transition-colors">
                <div>
                  <span className="font-bold text-[#924700]">Assign as Class Teacher</span>
                  <p className="text-xs text-orange-800/80 mt-0.5">Designate this teacher as the primary academic advisor.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={isClassTeacher} 
                  onChange={() => setIsClassTeacher(!isClassTeacher)}
                  className="w-5 h-5 rounded text-[#924700] focus:ring-[#924700]" 
                />
              </label>
            </div>
            
            <div className="flex gap-3">
                <button type="submit" className="bg-[#0058be] hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                  Save Changes
                </button>
                <button type="button" onClick={() => navigate(-1)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
            </div>
        </form>
      </div>
    </SchoolLayout>
  );
}