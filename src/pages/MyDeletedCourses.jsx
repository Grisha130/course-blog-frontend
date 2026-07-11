import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';

export default function MyDeletedCourses() {
  const [courses, setCourses] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [restoringId, setRestoringId] = useState(null);

  const fetchDeleted = () => {
    setLoading(true);
    api
      .get('/courses/my-deleted-courses', { params: { page } })
      .then((res) => {
        setCourses(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchDeleted, [page]);

  const handleRestore = async (slug) => {
    setRestoringId(slug);
    try {
      await api.post(`/courses/my-deleted/${slug}/restore`);
      setCourses((prev) => prev.filter((c) => c.slug !== slug));
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl text-ink">Deleted Courses</h1>
            <p className="text-sm text-gray-400 mt-1">Restore courses you've deleted</p>
          </div>
          <Link to="/my-courses" className="text-sm text-gray-400 hover:text-gray-600">
            ← Back to My Courses
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50/50">
            <p className="text-sm text-gray-400">No deleted courses.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 opacity-75">
                <div className="w-14 h-14 rounded-lg bg-ink/5 flex-shrink-0 overflow-hidden">
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gold font-display">
                      {course.title?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm text-ink truncate">{course.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-1">{course.description}</p>
                </div>
                <button
                  onClick={() => handleRestore(course.slug)}
                  disabled={restoringId === course.slug}
                  className="text-xs font-medium text-gold-dark hover:underline disabled:opacity-50 flex-shrink-0"
                >
                  {restoringId === course.slug ? 'Restoring…' : 'Restore'}
                </button>
              </div>
            ))}
          </div>
        )}

        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </div>
  );
}