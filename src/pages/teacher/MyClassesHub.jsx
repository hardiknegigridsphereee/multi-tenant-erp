import React from 'react';
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/erp/teacher/MainLayout";
import Button from "../../components/erp/teacher/Button";
import Card from "../../components/erp/teacher/Card";
import Input from "../../components/erp/teacher/Input";
import Select from "../../components/erp/teacher/Select";
import { getMyProfile, getTeacherClasses, getSectionEnrollments } from "../../services/api";
import { useStaleData } from "../../hooks/useStaleData";
import { RevalidatingBar, SkeletonCard } from "../../components/erp/teacher/LoadingPrimitives";

const MyClassesHub = () => {
  const navigate = useNavigate();

  // ─── Fetch profile + classes together, cached ───────────────────────────────
  const {
    data: classesPayload,
    loading,
    revalidating,
    error,
  } = useStaleData('teacher:classes', async () => {
    const profileData = await getMyProfile();
    const teacherId = profileData.profiles?.teacher?.id;
    if (!teacherId) throw new Error('You are not assigned a teacher profile.');

    const classesData = await getTeacherClasses(teacherId);
    const classesArray = Array.isArray(classesData) ? classesData : classesData.results || [];

    // Fetch student counts for each class concurrently
    const studentCounts = await Promise.all(
      classesArray.map(async (cls) => {
        const sectionId = typeof cls.section === 'object' ? cls.section?.id : cls.section || cls.section_id;
        const academicYearId = typeof cls.academic_year === 'object' ? cls.academic_year?.id : cls.academic_year || cls.academic_year_id;
        if (!sectionId) return { sectionId: null, count: 0 };
        try {
          const enrollmentsData = await getSectionEnrollments(sectionId, academicYearId);
          const arr = Array.isArray(enrollmentsData) ? enrollmentsData : enrollmentsData.results || [];
          return { sectionId, count: arr.length };
        } catch {
          return { sectionId, count: 0 };
        }
      })
    );

    const studentsMap = {};
    studentCounts.forEach(({ sectionId, count }) => {
      if (sectionId) studentsMap[sectionId] = count;
    });

    return { profile: profileData, classes: classesArray, studentsMap };
  });

  const profile = classesPayload?.profile ?? null;
  const classes = classesPayload?.classes ?? [];
  const studentsMap = classesPayload?.studentsMap ?? {};

  if (error && !classesPayload) {
    return (
      <MainLayout title="My Classes">
        <div className="p-6 bg-red-50 text-red-900 rounded-lg border border-red-200">
          <p className="font-semibold">Error loading data:</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Classes">
      <RevalidatingBar show={revalidating} />

      {/* Filter Section — always visible, even while loading */}
      <section className="mb-10 flex flex-col md:flex-row gap-4 items-end justify-between">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-2/3">
          <Input label="Search Directory" icon="search" placeholder="Search by name or code..." />
          <Select label="Subject" options={['All Subjects', 'Mathematics', 'Physics', 'Social Sciences']} />
          <Select label="Class/Section" options={['All Sections', '10-A', '11-B', '12-C']} />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Reset</Button>
          <Button variant="primary">Apply Filters</Button>
        </div>
      </section>

      {/* Classes Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // First-ever load: show skeleton cards
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : classes.length > 0 ? (
          classes.map((cls) => {
            const sectionId = typeof cls.section === 'object' ? cls.section?.id : cls.section || cls.section_id;
            const studentCount = studentsMap[sectionId] ?? 0;
            const subjectName = cls.subject_name || 'Subject';
            const levelClean = cls.class_level_name?.replace('Grade ', '') || '';
            const className = `${subjectName} ${levelClean}-${cls.section_name || ''}`;
            const description = cls.is_class_teacher
              ? `Class Teacher • ${cls.academic_year_name}`
              : `${cls.academic_year_name}`;

            const icon = subjectName.toLowerCase().includes('math') ? 'functions'
              : subjectName.toLowerCase().includes('phys') || subjectName.toLowerCase().includes('scien') ? 'biotech'
              : subjectName.toLowerCase().includes('hist') ? 'history_edu'
              : 'menu_book';

            return (
              <Card key={cls.id} hoverable>
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-primary/5 p-3 rounded-xl">
                    <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
                  </div>
                  <div className="glass-card px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-primary/20 text-primary">
                    Active
                  </div>
                </div>
                <div className="mb-8">
                  <h2 className="font-display text-xl font-bold text-on-surface mb-1">{className}</h2>
                  <p className="text-on-surface-variant text-sm font-medium">{description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-surface-container-low p-4 rounded-md">
                    <p className="text-[10px] uppercase font-bold text-outline tracking-wider mb-1">Students</p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">groups</span>
                      <span className="text-lg font-bold font-display">{studentCount}</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-md">
                    <p className="text-[10px] uppercase font-bold text-outline tracking-wider mb-1">Avg. Performance</p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-slate-400">horizontal_rule</span>
                      <span className="text-lg font-bold font-display text-slate-400">N/A</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/teacher/classes/${cls.id}/performance`)}
                  className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-surface-container-high text-primary font-bold rounded-md hover:bg-primary hover:text-white transition-all duration-200"
                >
                  View Class Details
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full p-6 bg-amber-50 text-amber-900 rounded-lg border border-amber-200">
            <p className="font-semibold">No classes assigned</p>
            <p className="text-sm">You don't have any active classes assigned for the current semester.</p>
          </div>
        )}

      </div>

      {/* Empty State / Callout */}
      {!loading && (
        <div className="mt-16 flex flex-col items-center justify-center py-12 px-6 bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant/30 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-outline-variant mb-4 shadow-sm">
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <h3 className="font-display text-lg font-bold mb-2">Assign New Class?</h3>
          <p className="text-on-surface-variant max-w-sm text-sm mb-6">Manage your teaching load or request additional sections for the upcoming semester.</p>
          <button className="bg-white border border-outline-variant text-on-surface font-semibold px-8 py-3 rounded-md hover:bg-surface-container-highest transition-all">
            Request Assignment
          </button>
        </div>
      )}
    </MainLayout>
  );
};

export default MyClassesHub;