import React, { useState, useEffect } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import api from "../../services/axiosClient";

export default function Settings() {
  const [form, setForm] = useState({
    schoolName: "", email: "", phone: "", country: "India", address: "",
    language: "English (US)", timezone: "(GMT+05:30) IST", grading: "Percentage (0-100)",
    attendance: true, academicYear: "" 
  });

  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const contextFetch = async () => {
      try {
        const yearsResponse = await api.get(`academics/academic-years/`);
        setAcademicYears(Array.isArray(yearsResponse.data) ? yearsResponse.data : yearsResponse.data.results || []);

        const settingsResponse = await api.get(`school/settings/`);
        const data = settingsResponse.data;
        setForm({
          schoolName: data.school_name || "", email: data.email || "", phone: data.phone || "",
          country: data.country || "India", address: data.address || "", language: data.language || "English (US)",
          timezone: data.timezone || "(GMT+05:30) IST", grading: data.grading_system || "Percentage (0-100)",
          attendance: data.attendance_tracking ?? true, academicYear: data.default_academic_year_id || ""
        });
      } catch (err) {
        console.error("Failed to load configs:", err);
      } finally {
        setPageLoading(false);
      }
    };
    contextFetch();
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleAttendance = () => setForm({ ...form, attendance: !form.attendance });

  const save = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);

    try {
      const payload = {
        school_name: form.schoolName, email: form.email, phone: form.phone, country: form.country,
        address: form.address, language: form.language, timezone: form.timezone, grading_system: form.grading,
        attendance_tracking: form.attendance, default_academic_year_id: form.academicYear
      };

      await api.put(`school/settings/`, payload);
      alert("Settings saved successfully!");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update configuration.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <SchoolLayout title="Settings"><div className="flex items-center justify-center min-h-[40vh]">Loading...</div></SchoolLayout>;

  return (
    <SchoolLayout title="Settings">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-10"><h1 className="text-3xl font-bold mb-2">School Configuration</h1></div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={save} className="space-y-14">
          <div className="grid lg:grid-cols-3 gap-10">
            <div><h3 className="text-xl font-semibold mb-2">School Profile</h3></div>
            <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="grid md:grid-cols-2 gap-6">
                <div><label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">School Name</label><input required name="schoolName" value={form.schoolName} onChange={change} className="w-full bg-[#eff4ff] px-3 py-2.5 rounded outline-none" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Email</label><input required type="email" name="email" value={form.email} onChange={change} className="w-full bg-[#eff4ff] px-3 py-2.5 rounded outline-none" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Phone</label><input required name="phone" value={form.phone} onChange={change} className="w-full bg-[#eff4ff] px-3 py-2.5 rounded outline-none" /></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Country</label><select name="country" value={form.country} onChange={change} className="w-full bg-[#eff4ff] px-3 py-2.5 rounded outline-none"><option value="India">India</option><option value="United States">United States</option></select></div>
                <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Address</label><input required name="address" value={form.address} onChange={change} className="w-full bg-[#eff4ff] px-3 py-2.5 rounded outline-none" /></div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            <div><h3 className="text-xl font-semibold mb-2">Academic Preferences</h3></div>
            <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
              <div className="flex justify-between items-center border-b pb-6">
                <div><p className="font-semibold">Grading Scale System</p></div>
                <select name="grading" value={form.grading} onChange={change} className="bg-[#eff4ff] px-4 py-2 rounded text-sm"><option value="4.0 GPA Scale">4.0 GPA Scale</option><option value="Percentage (0-100)">Percentage (0-100)</option></select>
              </div>
              <div className="flex justify-between items-center border-b pb-6">
                <div><p className="font-semibold">Attendance Tracking</p></div>
                <button type="button" onClick={toggleAttendance} className={`w-10 h-5 rounded-full transition ${form.attendance ? "bg-[#0058be]" : "bg-gray-300"}`}><div className={`w-3 h-3 bg-white rounded-full transform transition ${form.attendance ? "translate-x-5" : "translate-x-1"}`} /></button>
              </div>
              <div className="flex justify-between items-center">
                <div><p className="font-semibold">Default Academic Year</p></div>
                <select required name="academicYear" value={form.academicYear} onChange={change} className="bg-[#eff4ff] px-4 py-2 rounded text-sm">
                  <option value="">Select Year</option>
                  {academicYears.map(year => <option key={year.id} value={year.id}>{year.name} {year.is_active ? "(Active)" : ""}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t pt-6"><button type="submit" disabled={loading} className="px-8 py-2.5 bg-[#0058be] text-white rounded font-bold">{loading ? "Saving..." : "Save Changes"}</button></div>
        </form>
      </div>
    </SchoolLayout>
  );
}