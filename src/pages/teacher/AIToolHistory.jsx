import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import Card from "../../components/erp/teacher/Card";
import { getSavedAIContent, deleteSavedAIContent } from '../../services/api';

const getTypeVisuals = (type) => {
  switch(type) {
    case 'LessonPlan': return { icon: 'assignment', iconColor: 'text-blue-500', badgeColor: 'bg-blue-50 text-blue-700', path: 'lesson-plan' };
    case 'Worksheet': return { icon: 'description', iconColor: 'text-indigo-500', badgeColor: 'bg-indigo-50 text-indigo-700', path: 'worksheet' };
    case 'Quiz': return { icon: 'quiz', iconColor: 'text-[#6b38d4]', badgeColor: 'bg-purple-50 text-purple-700', path: 'quiz' };
    case 'QuestionPaper': return { icon: 'history_edu', iconColor: 'text-red-500', badgeColor: 'bg-red-50 text-red-700', path: 'question-paper' };
    case 'StudyNotes': return { icon: 'menu_book', iconColor: 'text-green-500', badgeColor: 'bg-green-50 text-green-700', path: 'study-notes' };
    case 'PresentationOutline': return { icon: 'speaker_notes', iconColor: 'text-teal-500', badgeColor: 'bg-teal-50 text-teal-700', path: 'presentation-outline' };
    case 'Rubric': return { icon: 'rule', iconColor: 'text-[#b75b00]', badgeColor: 'bg-orange-50 text-orange-700', path: 'rubric' };
    default: return { icon: 'article', iconColor: 'text-gray-500', badgeColor: 'bg-gray-50 text-gray-700', path: 'lesson-plan' };
  }
};

const AIToolHistory = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getSavedAIContent({ limit: itemsPerPage, offset: (page - 1) * itemsPerPage });
      setHistoryData(data.results || data);
      
      if (data.count) {
        setTotalPages(Math.ceil(data.count / itemsPerPage));
      } else {
        setTotalPages(1); // Fallback if count is not available
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this saved content?")) {
      try {
        await deleteSavedAIContent(id);
        fetchHistory(currentPage); // Refresh list
      } catch (error) {
        console.error("Failed to delete item:", error);
        alert("Failed to delete content");
      }
    }
  };

  const getTitle = (item) => {
    if (item.data && item.data.title) return item.data.title;
    return `${item.subject} ${item.content_type}`;
  };

  return (
    <MainLayout title="Saved AI Content">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/teacher/ai-tools"
              className="flex items-center gap-2 text-primary font-semibold text-sm mb-4 hover:-translate-x-1 transition-transform w-max font-display"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Dashboard
            </Link>
            <h2 className="text-3xl font-display font-bold text-on-surface">Content History</h2>
            <p className="text-on-surface-variant font-body">All your saved AI-generated content in one place.</p>
          </div>
        </div>

        {/* History List */}
        <Card className="p-0 overflow-hidden" style={{boxShadow: '0px 12px 32px rgba(11,28,48,0.06)'}}>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-on-surface-variant flex flex-col items-center gap-3">
                <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
                <p>Loading your history...</p>
              </div>
            ) : historyData.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">folder_open</span>
                <h3 className="text-xl font-bold text-on-surface font-display mb-2">No Content Saved</h3>
                <p className="text-on-surface-variant font-body mb-6">You haven't saved any AI generated content yet.</p>
                <Link to="/teacher/ai-tools" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors">
                  Create Content
                </Link>
              </div>
            ) : (
              <>
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-container">
                      <th className="px-6 py-4 font-display font-bold text-sm text-on-surface">Content Title</th>
                      <th className="px-6 py-4 font-display font-bold text-sm text-on-surface">Type</th>
                      <th className="px-6 py-4 font-display font-bold text-sm text-on-surface">Subject</th>
                      <th className="px-6 py-4 font-display font-bold text-sm text-on-surface">Class</th>
                      <th className="px-6 py-4 font-display font-bold text-sm text-on-surface">Date Modified</th>
                      <th className="px-6 py-4 font-display font-bold text-sm text-on-surface text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container/50">
                    {historyData.map(item => {
                      const visuals = getTypeVisuals(item.content_type);
                      return (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined ${visuals.iconColor} block`}>{visuals.icon}</span>
                            <span className="font-bold text-sm text-on-surface truncate max-w-sm block" title={getTitle(item)}>{getTitle(item)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 ${visuals.badgeColor} rounded-full text-[11px] font-bold uppercase tracking-tight whitespace-nowrap`}>
                            {item.content_type.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-on-surface-variant font-medium whitespace-nowrap">{item.subject}</td>
                        <td className="px-6 py-5 text-sm text-on-surface-variant font-medium whitespace-nowrap">{item.class_name}</td>
                        <td className="px-6 py-5 text-sm text-on-surface-variant font-medium whitespace-nowrap">
                          {new Date(item.updated_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => navigate(`/teacher/ai-tools/${visuals.path}?id=${item.id}`)}
                              className="p-2 hover:bg-white rounded-lg transition-colors text-primary shadow-sm outline-none border-none cursor-pointer bg-transparent" 
                              title="Open/Edit"
                            >
                              <span className="material-symbols-outlined text-lg block">open_in_new</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2 hover:bg-white rounded-lg transition-colors text-red-500 shadow-sm outline-none border-none cursor-pointer bg-transparent" 
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-lg block">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 flex items-center justify-between border-t border-surface-container bg-surface-container-lowest">
                    <span className="text-sm text-on-surface-variant font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-outline-variant text-on-surface-variant disabled:opacity-50 hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm block">chevron_left</span>
                      </button>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-outline-variant text-on-surface-variant disabled:opacity-50 hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm block">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AIToolHistory;
