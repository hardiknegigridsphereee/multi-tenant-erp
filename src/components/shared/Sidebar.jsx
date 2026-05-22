import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', path: '/student' },
  { icon: 'menu_book', label: 'My Subjects', path: '/student/subjects' },
  { icon: 'book', label: 'Learning Materials', path: '/student/materials' },
  { icon: 'assignment', label: 'Assignments', path: '/student/assignments' },
  { icon: 'description', label: 'Grades & Report Card', path: '/student/grades' },
  { icon: 'event_available', label: 'Attendance', path: '/student/attendance' },
  { icon: 'psychology', label: 'AI Tutor', path: '/student/ai-tutor' },
  { icon: 'quiz', label: 'Practice & Quiz', path: '/student/quiz' },
  { icon: 'auto_awesome', label: 'Recommendations', path: '/student/recommendations' },
];


export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col h-screen w-72 left-0 top-0 fixed bg-surface-container-low dark:bg-white border-r border-outline-variant/30 z-50 overflow-y-auto">
      <div className="flex flex-col h-full py-8 gap-2">
        <div className="px-8 mb-8">
          <span className="text-xl font-headline font-bold text-primary">Academic Architect</span>
        </div>
        
        <div className="px-8 mb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest border-2 border-primary-container">
             <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4LdDXGxUTIj7HONBN-CW82BGC6EFYuHPaHMAz6iW8UEXuuCT3zciyD0shypraeKaWTvVsV441roXBXes6KJauvXAIOdDGtrEtm-cEwnnIAkoYgpP1Yw--PtNzgrsuo5VK1mtG2j9neJr3yMZN7wz4XZGUGptnG1_dzKJZtFlD5ACkwx6xGhU3i5P1pkg1JQ7sxojTwzbsLIVQ_1rdxqVCQmpbt9WBfGB5Gej7XxjuUbCWSutuKvzc-AX7Ovp3gp-NRpGpaMCAvg" alt="Alex Rivers" className="object-cover w-full h-full" />
          </div>
          <div>
            <p className="font-bold font-body text-on-surface">Alex Rivers</p>
            <p className="text-xs text-on-surface-variant font-medium">Grade 11-B</p>
            <p className="text-[10px] text-primary font-bold mt-0.5">ID: 20240912</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 pr-4 mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 py-3 px-6 transition-all duration-300 ease-in-out font-body text-sm font-semibold border-l-4 ${
                  isActive
                    ? 'text-primary bg-white dark:bg-gray-200 rounded-r-full border-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest/50 rounded-r-full border-transparent'
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <div className="mt-8 space-y-1">
             <NavLink to="/student/profile" className="flex items-center gap-4 py-3 px-6 text-on-surface-variant hover:text-primary transition-all font-body text-sm font-semibold border-l-4 border-transparent">
                <span className="material-symbols-outlined">person</span> Profile
             </NavLink>
             <NavLink to="/student/settings" className="flex items-center gap-4 py-3 px-6 text-on-surface-variant hover:text-primary transition-all font-body text-sm font-semibold border-l-4 border-transparent">
                <span className="material-symbols-outlined">settings</span> Settings
             </NavLink>
          </div>

        </nav>
      </div>
    </aside>
  );
}
