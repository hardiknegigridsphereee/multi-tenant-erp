import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useStudent } from "../../context/StudentProvider";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function GradeCardSkeleton() {
  return (
    <MainLayout title="Grades & Report Card">
      <div className="p-4 md:p-5 h-full flex flex-col gap-4 overflow-hidden">
        {/* Top cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="md:col-span-2 bg-gray-200 animate-pulse rounded-xl h-28" />
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
            <Skeleton className="w-20 h-2.5" />
            <Skeleton className="w-36 h-6" />
            <Skeleton className="w-28 h-2.5" />
            <Skeleton className="w-full h-1.5 rounded-full mt-2" />
            <Skeleton className="w-28 h-5 rounded-full" />
          </div>
        </div>
        {/* Table */}
        <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden min-h-0">
          <div className="p-3 flex justify-between items-center border-b border-gray-100">
            <Skeleton className="w-40 h-5" />
            <div className="flex gap-2">
              <Skeleton className="w-28 h-8 rounded-md" />
              <Skeleton className="w-28 h-8 rounded-md" />
              <Skeleton className="w-8 h-8 rounded-md" />
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2.5 grid grid-cols-7 gap-3">
            {["w-16","w-16","w-20","w-16","w-14","w-20","w-20"].map((w,i) => (
              <Skeleton key={i} className={`${w} h-2.5`} />
            ))}
          </div>
          {[1,2,3,4].map(i => (
            <div key={i} className="px-4 py-3 grid grid-cols-7 gap-3 border-t border-gray-50 items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                <Skeleton className="w-16 h-3" />
              </div>
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-14 h-3" />
              <Skeleton className="w-10 h-3" />
              <Skeleton className="w-8 h-5 rounded-md" />
              <Skeleton className="w-full h-2.5" />
              <Skeleton className="w-20 h-2.5 ml-auto" />
            </div>
          ))}
          <div className="p-3 border-t border-gray-100 flex justify-between">
            <Skeleton className="w-32 h-2.5" />
            <Skeleton className="w-36 h-8 rounded-lg" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function GradeCard() {
  const { dashboard, academic, profile, loading } = useStudent();
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedExam, setSelectedExam]       = useState("all");
  const [downloading, setDownloading]         = useState(false);

  if (loading) return <GradeCardSkeleton />;

  const grades   = dashboard?.grades?.results || [];
  const exams    = dashboard?.exams?.results  || [];
  const subjects = academic?.subs             || [];

  let overallPercentage = 0;
  if (grades.length > 0) {
    const totalMarks = grades.reduce((sum, g) => sum + parseFloat(g.marks_obtained), 0);
    const totalMax   = grades.reduce((sum, g) => sum + parseFloat(g.max_marks), 0);
    overallPercentage = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : 0;
  }

  const pastExams  = exams.filter(e => new Date(e.end_date) < new Date()).sort((a,b) => new Date(b.end_date)-new Date(a.end_date));
  const latestExam = pastExams[0] || null;

  const getGradeDetails = (obtained, max) => {
    const pct = (obtained / max) * 100;
    if (pct >= 90) return { letter: "A+", color: "bg-green-100 text-green-700" };
    if (pct >= 80) return { letter: "A",  color: "bg-blue-100 text-blue-700"   };
    if (pct >= 70) return { letter: "B+", color: "bg-yellow-100 text-yellow-700"};
    if (pct >= 60) return { letter: "B",  color: "bg-orange-100 text-orange-700"};
    return               { letter: "C",  color: "bg-red-100 text-red-700"      };
  };

  const getSubjectIcon = (name) => {
    const n = name?.toLowerCase();
    if (n?.includes("math"))                        return { icon: "calculate",     bg: "bg-blue-50 text-blue-600"    };
    if (n?.includes("phys"))                        return { icon: "rocket_launch", bg: "bg-purple-50 text-purple-600"};
    if (n?.includes("comp") || n?.includes("code")) return { icon: "code",          bg: "bg-orange-50 text-orange-600"};
    if (n?.includes("eng")  || n?.includes("lit"))  return { icon: "history_edu",   bg: "bg-indigo-50 text-indigo-600"};
    return                                                 { icon: "menu_book",     bg: "bg-slate-100 text-slate-600" };
  };

  const filteredGrades = grades.filter(grade => {
    const matchesSubject = selectedSubject === "all" || grade.subject === selectedSubject;
    const matchesExam    = selectedExam    === "all" || grade.exam    === selectedExam;
    return matchesSubject && matchesExam;
  });

  const downloadReportCard = () => {
    setDownloading(true);
    const printWindow  = window.open('', '_blank');
    const studentName  = `${profile?.first_name || 'Student'} ${profile?.last_name || ''}`;
    const enrollmentNo = profile?.enrollment_number || 'N/A';
    const className    = academic?.current_class?.name   || 'N/A';
    const section      = academic?.current_section?.name || 'N/A';

    const reportHTML = `<!DOCTYPE html><html><head><title>Report Card - ${studentName}</title><meta charset="UTF-8">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;padding:40px;color:#333}
    .header{text-align:center;margin-bottom:30px;border-bottom:3px solid #3b82f6;padding-bottom:20px}
    .header h1{font-size:28px;color:#1e293b;margin-bottom:5px}.header h2{font-size:20px;color:#64748b;font-weight:normal}
    .student-info{background:#f8fafc;padding:15px 20px;border-radius:12px;margin-bottom:25px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:15px}
    .info-item{display:flex;gap:10px}.info-label{font-weight:600;color:#64748b;font-size:12px}.info-value{font-weight:700;color:#1e293b;font-size:14px}
    .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:30px}
    .summary-card{background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;padding:20px;border-radius:16px;text-align:center}
    .summary-card h4{font-size:12px;opacity:.9;margin-bottom:8px}.summary-card .value{font-size:32px;font-weight:bold}
    .grades-table{width:100%;border-collapse:collapse;margin-bottom:30px}
    .grades-table th{background:#f1f5f9;padding:12px;text-align:left;font-size:12px;font-weight:600;color:#475569;text-transform:uppercase;border-bottom:2px solid #e2e8f0}
    .grades-table td{padding:12px;font-size:13px;border-bottom:1px solid #e2e8f0}
    .grade-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-weight:bold;font-size:11px}
    .grade-Aplus{background:#dcfce7;color:#166534}.grade-A{background:#dbeafe;color:#1e40af}
    .grade-Bplus{background:#fef3c7;color:#92400e}.grade-B{background:#ffedd5;color:#9a3412}.grade-C{background:#fee2e2;color:#991b1b}
    .footer{margin-top:30px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8}
    .signature{display:flex;justify-content:space-between;margin-top:40px;padding-top:20px}
    .sign-line{text-align:center;width:200px}.sign-line .line{border-top:1px solid #cbd5e1;margin-bottom:8px}</style></head>
    <body><div class="report-container">
    <div class="header"><h1>ACADEMIC REPORT CARD</h1><h2>${className} - ${section}</h2><p>Academic Year ${new Date().getFullYear()}</p></div>
    <div class="student-info">
      <div class="info-item"><span class="info-label">Student Name:</span><span class="info-value">${studentName}</span></div>
      <div class="info-item"><span class="info-label">Enrollment No:</span><span class="info-value">${enrollmentNo}</span></div>
      <div class="info-item"><span class="info-label">Roll Number:</span><span class="info-value">${academic?.roll_number||'N/A'}</span></div>
      <div class="info-item"><span class="info-label">Issue Date:</span><span class="info-value">${new Date().toLocaleDateString()}</span></div>
    </div>
    <div class="summary">
      <div class="summary-card"><h4>Overall Percentage</h4><div class="value">${overallPercentage}%</div><div class="sub">${filteredGrades.length} subjects</div></div>
      <div class="summary-card" style="background:linear-gradient(135deg,#10b981,#059669)"><h4>Subjects Passed</h4><div class="value">${filteredGrades.filter(g=>parseFloat(g.marks_obtained)>=parseFloat(g.max_marks)*0.4).length}</div><div class="sub">Out of ${filteredGrades.length}</div></div>
      <div class="summary-card" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed)"><h4>Latest Exam</h4><div class="value" style="font-size:18px">${latestExam?.name||'N/A'}</div><div class="sub">${latestExam?new Date(latestExam.end_date).toLocaleDateString():''}</div></div>
    </div>
    <table class="grades-table"><thead><tr><th>Subject</th><th>Exam</th><th>Marks</th><th>Max</th><th>%</th><th>Grade</th><th>Remarks</th></tr></thead>
    <tbody>${filteredGrades.map(grade=>{
      const pct=((parseFloat(grade.marks_obtained)/parseFloat(grade.max_marks))*100).toFixed(1);
      const gd=getGradeDetails(parseFloat(grade.marks_obtained),parseFloat(grade.max_marks));
      const gc=gd.letter==='A+'?'grade-Aplus':gd.letter==='A'?'grade-A':gd.letter==='B+'?'grade-Bplus':gd.letter==='B'?'grade-B':'grade-C';
      return `<tr><td><strong>${grade.subject_name}</strong></td><td>${grade.exam_name}</td><td>${grade.marks_obtained}</td><td>${grade.max_marks}</td><td><strong>${pct}%</strong></td><td><span class="grade-badge ${gc}">${gd.letter}</span></td><td style="font-style:italic;color:#64748b">${grade.remarks||'No remarks'}</td></tr>`;
    }).join('')}</tbody></table>
    <div class="signature">
      <div class="sign-line"><div class="line"></div><div>Class Teacher</div></div>
      <div class="sign-line"><div class="line"></div><div>Principal</div></div>
      <div class="sign-line"><div class="line"></div><div>Parent Signature</div></div>
    </div>
    <div class="footer"><p>System-generated report card. Generated on ${new Date().toLocaleString()}</p><p>ScholarFlow Academic Management System</p></div>
    </div><script>window.print();setTimeout(()=>{window.close();},500);</script></body></html>`;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
    setTimeout(() => setDownloading(false), 1000);
  };

  const downloadCSVReport = () => {
    const headers = ['Subject','Exam Type','Marks Obtained','Max Marks','Percentage','Grade','Remarks'];
    const rows = filteredGrades.map(grade => {
      const pct = ((parseFloat(grade.marks_obtained)/parseFloat(grade.max_marks))*100).toFixed(1);
      const gd  = getGradeDetails(parseFloat(grade.marks_obtained),parseFloat(grade.max_marks));
      return [grade.subject_name,grade.exam_name,grade.marks_obtained,grade.max_marks,`${pct}%`,gd.letter,grade.remarks||'No remarks'];
    });
    const csv  = [headers,...rows].map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href=url; a.download=`Report_Card_${profile?.first_name||'Student'}_${new Date().toLocaleDateString()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <MainLayout title="Grades & Report Card">
      {/* Full height, no scroll */}
      <div className="p-4 md:p-5 h-full flex flex-col gap-4 overflow-hidden">

        {/* Top cards — shrink-0 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="md:col-span-2 primary-gradient rounded-xl px-5 py-4 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-xs font-headline font-semibold opacity-90 uppercase tracking-wider">Academic Performance Summary</h3>
                <p className="text-4xl font-headline font-extrabold mt-1 tracking-tight">{overallPercentage}%</p>
                <p className="text-[11px] opacity-75 mt-0.5">Overall Percentage</p>
              </div>
              <div className="flex gap-3 mt-3">
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-1.5 rounded-md text-xs font-semibold transition-all">
                  View Analytics
                </button>
                <button onClick={downloadCSVReport}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">table_chart</span>
                  Export CSV
                </button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-surface-container-lowest rounded-xl px-4 py-3 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-secondary tracking-widest uppercase">Term Progress</span>
              <h4 className="text-base font-headline font-bold text-on-surface mt-1 leading-tight">
                {latestExam ? latestExam.name : "No Exams Yet"}
              </h4>
              <p className="text-[11px] text-on-surface-variant">
                Completed on {latestExam ? new Date(latestExam.end_date).toLocaleDateString() : "--"}
              </p>
            </div>
            <div className="mt-2">
              <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: latestExam ? "100%" : "0%" }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] font-semibold text-on-surface-variant">Completion</span>
                <span className="text-[10px] font-bold text-secondary">{latestExam ? "100%" : "0%"}</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold mt-2 w-fit">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: `'FILL' 1` }}>auto_awesome</span>
              AI Insight: Excelling in STEM
            </span>
          </div>
        </div>

        {/* Table — flex-1 */}
        <div className="flex-1 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden min-h-0 flex flex-col">
          {/* Table header */}
          <div className="px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 shrink-0 border-b border-surface-container">
            <h3 className="text-sm font-headline font-bold text-on-surface">Subject-wise Breakdown</h3>
            <div className="flex items-center gap-2">
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
                className="bg-surface-container-low border-none rounded-md text-xs py-1.5 px-3 focus:ring-2 focus:ring-surface-tint outline-none">
                <option value="all">All Subjects</option>
                {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </select>
              <select value={selectedExam} onChange={e => setSelectedExam(e.target.value)}
                className="bg-surface-container-low border-none rounded-md text-xs py-1.5 px-3 focus:ring-2 outline-none">
                <option value="all">All Exams</option>
                {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
              </select>
              <button className="w-8 h-8 flex items-center justify-center rounded-md bg-surface-container-low hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">filter_list</span>
              </button>
            </div>
          </div>

          {/* Scrollable table body */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low/50 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Subject</th>
                  <th className="px-3 py-2.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Exam</th>
                  <th className="px-3 py-2.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Marks</th>
                  <th className="px-3 py-2.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">%</th>
                  <th className="px-3 py-2.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Grade</th>
                  <th className="px-3 py-2.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Remarks</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {filteredGrades.map(grade => {
                  const gradeDetails = getGradeDetails(parseFloat(grade.marks_obtained), parseFloat(grade.max_marks));
                  const iconDetails  = getSubjectIcon(grade.subject_name);
                  const pct = ((parseFloat(grade.marks_obtained)/parseFloat(grade.max_marks))*100).toFixed(1);
                  return (
                    <tr key={grade.id} className="hover:bg-surface-container-low/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconDetails.bg}`}>
                            <span className="material-symbols-outlined text-sm">{iconDetails.icon}</span>
                          </div>
                          <span className="text-xs font-bold text-on-surface">{grade.subject_name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-on-surface-variant font-medium">{grade.exam_name}</td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-bold text-on-surface">{grade.marks_obtained} / {grade.max_marks}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-bold text-primary">{pct}%</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-widest ${gradeDetails.color}`}>
                          {gradeDetails.letter}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-on-surface-variant italic max-w-[180px] truncate">
                        &quot;{grade.remarks || "No remarks."}&quot;
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-blue-700 hover:text-blue-900 font-semibold text-[11px] hover:underline transition-all">
                          View feedback
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredGrades.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-xs text-on-surface-variant">
                      No grades found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-surface-container-low/20 border-t border-surface-container flex justify-between items-center shrink-0">
            <p className="text-[10px] font-medium text-on-surface-variant italic">
              Showing {filteredGrades.length} subjects graded.
            </p>
            <button onClick={downloadReportCard} disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              {downloading ? 'Preparing...' : 'Download PDF'}
            </button>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}