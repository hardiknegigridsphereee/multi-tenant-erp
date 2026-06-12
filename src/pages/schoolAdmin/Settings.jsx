import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { useState } from "react";

export default function Settings(){

const [form,setForm]=useState({
schoolName:"St. Augustine International Academy",
email:"admin@staugustine.edu",
phone:"+1 (555) 0123-4567",
country:"United States",
address:"742 Evergreen Terrace, Springfield",
language:"English",
timezone:"GMT-05",
grading:"4.0 GPA",
attendance:true,
academicYear:"2023-2024"
});

const change=(e)=>{
setForm({...form,[e.target.name]:e.target.value});
};

const toggleAttendance=()=>{
setForm({...form,attendance:!form.attendance});
};

const save=(e)=>{
e.preventDefault();

alert("Settings saved successfully");
};

const resetForm=()=>{
window.location.reload();
};

return(

<SchoolLayout title="Settings">

<div className="max-w-6xl mx-auto">

{/* heading */}

<div className="mb-10">

<h1 className="text-3xl font-bold mb-2">

School Configuration

</h1>

<p className="text-[#6b7280]">

Manage your institution's identity and academic parameters.

</p>

</div>





<form onSubmit={save} className="space-y-14">


{/* SCHOOL PROFILE */}

<div className="grid lg:grid-cols-3 gap-10">


{/* LEFT TEXT */}

<div>

<h3 className="text-xl font-semibold text-[#0b1c30] mb-2">
School Profile
</h3>

<p className="text-[#6b7280] text-sm leading-relaxed">
Public identity details for your institution. These appear on reports and communication.
</p>

</div>



{/* RIGHT CARD */}

<div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm">


{/* logo */}

<div className="flex gap-8 items-start mb-10">


<div className="relative">

<div className="w-32 h-32 rounded-xl overflow-hidden bg-[#e5eeff] flex items-center justify-center">

<img
  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0PxJ_8SB7PeuHJ6jEs7-sIwRwTikSfENbH1FouMWRNesI1WjU1QhW18afOaKuUkTgzx7xYH-vVcaIRiNE8eNHAuALHoeL_FcyjHHlxYrSLsHIni34it7gZu4Ye4xXRTDGVivmbLWPf6oKR2vyHwQag5cnmHisA22-LERoPtMFtuXddOD2LmYnFZtoNgZ5TfGJ_go7yarLqr4L7lAO_tb-BU5R1HAbQHNbUL-Y95JynVeOYanWM4IzC2dCBlHejLnYTk0geV04Ow"
  alt="Institution Logo"
/>

</div>


<button
type="button"
className="absolute -bottom-2 -right-2 w-10 h-10 rounded-lg bg-[#0058be] text-white flex items-center justify-center shadow">

<span className="material-symbols-outlined text-sm">
edit
</span>

</button>


</div>



<div>

<p className="font-semibold text-[#0b1c30]">
Institution Logo
</p>

<p className="text-sm text-[#6b7280] mb-4">
Recommended size: 400x400px. PNG or SVG preferred.
</p>


<button
type="button"
className="px-5 py-2 bg-[#e5eeff] text-[#0058be] font-semibold rounded-md">

Upload New Logo

</button>


</div>


</div>



{/* fields */}

<div className="grid md:grid-cols-2 gap-6">


{/* school name */}

<div>

<label className="text-xs font-bold tracking-widest text-[#6b7280] uppercase mb-2 block">

School Name

</label>

<input
name="schoolName"
value={form.schoolName}
onChange={change}
className="w-full bg-[#eff4ff] px-4 py-3 rounded-md outline-none"
/>

</div>



{/* email */}

<div>

<label className="text-xs font-bold tracking-widest text-[#6b7280] uppercase mb-2 block">

Official Email

</label>

<input
name="email"
value={form.email}
onChange={change}
className="w-full bg-[#eff4ff] px-4 py-3 rounded-md outline-none"
/>

</div>



{/* phone */}

<div>

<label className="text-xs font-bold tracking-widest text-[#6b7280] uppercase mb-2 block">

Phone Number

</label>

<input
name="phone"
value={form.phone}
onChange={change}
className="w-full bg-[#eff4ff] px-4 py-3 rounded-md outline-none"
/>

</div>



{/* country */}

<div>

<label className="text-xs font-bold tracking-widest text-[#6b7280] uppercase mb-2 block">

Country

</label>

<select
name="country"
value={form.country}
onChange={change}
className="w-full bg-[#eff4ff] px-4 py-3 rounded-md outline-none">

<option>
United States
</option>

<option>
India
</option>

</select>

</div>



{/* address */}

<div className="md:col-span-2">

<label className="text-xs font-bold tracking-widest text-[#6b7280] uppercase mb-2 block">

Street Address

</label>

<input
name="address"
value={form.address}
onChange={change}
className="w-full bg-[#eff4ff] px-4 py-3 rounded-md outline-none"
/>

</div>



{/* language */}

<div>

<label className="text-xs font-bold tracking-widest text-[#6b7280] uppercase mb-2 block">

Preferred Language

</label>

<select
name="language"
value={form.language}
onChange={change}
className="w-full bg-[#eff4ff] px-4 py-3 rounded-md outline-none">

<option>
English (US)
</option>

<option>
Hindi
</option>

</select>

</div>



{/* timezone */}

<div>

<label className="text-xs font-bold tracking-widest text-[#6b7280] uppercase mb-2 block">

Timezone

</label>

<select
name="timezone"
value={form.timezone}
onChange={change}
className="w-full bg-[#eff4ff] px-4 py-3 rounded-md outline-none">

<option>
(GMT-05:00) Eastern Time
</option>

<option>
(GMT+05:30) IST
</option>

</select>

</div>


</div>


</div>


</div>



{/* ACADEMIC PREFERENCES */}

<div className="grid lg:grid-cols-3 gap-10">


<div>

<h3 className="text-xl font-semibold text-[#0b1c30] mb-2">
Academic Preferences
</h3>

<p className="text-sm text-[#6b7280]">
Define the operational logic for grading, attendance, and reporting cycles.
</p>

</div>



<div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm space-y-10">


{/* grading */}

<div className="flex justify-between items-start border-b pb-6">

<div>

<p className="font-semibold text-[#0b1c30]">
Grading Scale System
</p>

<p className="text-sm text-[#6b7280]">
Choose how student performance is evaluated across the platform.
</p>

</div>


<select
name="grading"
value={form.grading}
onChange={change}
className="bg-[#eff4ff] px-5 py-3 rounded-md">

<option>
4.0 GPA Scale
</option>

<option>
Percentage (0-100)
</option>

</select>


</div>



{/* attendance */}

<div className="flex justify-between items-center border-b pb-6">


<div>

<p className="font-semibold text-[#0b1c30]">
Attendance Tracking
</p>

<p className="text-sm text-[#6b7280]">
Enable automated alerts for parents when a student is absent.
</p>

</div>


<button
type="button"
onClick={toggleAttendance}
className={`w-12 h-6 rounded-full transition ${
form.attendance
?"bg-[#0058be]"
:"bg-gray-300"
}`}>

<div
className={`w-5 h-5 bg-white rounded-full transform transition ${
form.attendance
?"translate-x-6"
:"translate-x-1"
}`}
/>

</button>


</div>



{/* academic year */}

<div className="flex justify-between items-start">


<div>

<p className="font-semibold text-[#0b1c30]">
Default Academic Year
</p>

<p className="text-sm text-[#6b7280]">
The active period for current course registrations and schedules.
</p>

</div>


<select
name="academicYear"
value={form.academicYear}
onChange={change}
className="bg-[#eff4ff] px-5 py-3 rounded-md">

<option>
2023-2024 (Current)
</option>

<option>
2024-2025
</option>

</select>


</div>


</div>


</div>



{/* AI recommendation */}

<div className="bg-[#ffdcc6] p-6 rounded-xl flex gap-4">


<span className="material-symbols-outlined text-[#924700]">
auto_awesome
</span>


<div>

<p className="font-semibold text-[#924700]">
Intelligent Recommendation
</p>

<p className="text-sm text-[#924700]">
Based on your region's common standards, switching to a 4.0 GPA scale with weighted honors may improve report card clarity for higher education transfers.
</p>

</div>


</div>



{/* buttons */}

<div className="flex justify-end gap-4 pt-6 border-t">


<button
type="button"
onClick={resetForm}
className="px-6 py-2.5 bg-[#e5eeff] text-[#0b1c30] font-semibold rounded-md">

Discard Changes

</button>


<button
type="submit"
className="px-8 py-2.5 bg-gradient-to-r from-[#0058be] to-[#2170e4] text-white font-semibold rounded-md shadow">

Save Changes

</button>


</div>


</form>


</div>

</SchoolLayout>

);

}