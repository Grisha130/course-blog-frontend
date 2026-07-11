import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

const STATUS_STYLES = {
  published: 'bg-green-50 text-green-700 border-green-100',
  draft: 'bg-gray-100 text-gray-500 border-gray-200',
  archived: 'bg-amber-50 text-amber-700 border-amber-100',
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const fetchCourses = () => {
    setLoading(true);
    api
      .get('/manage-courses', { params: { search: search || undefined, status: status || undefined, page } })
      .then((res) => {
        setCourses(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCourses, [search, status, page]);

  const handleDelete = async (course) => {
    if (!confirm(`Delete "${course.title}"? It can be restored later from Deleted Courses.`)) return;
    setBusyId(course.id);
    setError(null);
    try {
      await api.delete(`/courses/${course.slug}/delete`);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course');
    } finally {
      setBusyId(null);
    }
  };

  const handleBlockToggle = async (course) => {
    setBusyId(course.id);
    setError(null);
    try {
      const res = await api.post(`/courses/${course.slug}/block`);
      setCourses((prev) => prev.map((c) => (c.id === course.id ? res.data.data : c)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl text-ink">Courses</h1>
        <Link
          to="/admin/deleted-courses"
          className="text-sm font-medium text-gold-dark hover:underline"
        >
          View deleted courses →
        </Link>
      </div>
      <p className="text-sm text-gray-400 mb-6">Every course from every user, regardless of status</p>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50/50">
          <p className="text-sm text-gray-400">No courses found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="flex gap-4 bg-white border border-gray-100 rounded-xl p-4">
              <div className="w-16 h-16 rounded-lg bg-ink/5 flex-shrink-0 overflow-hidden">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gold font-display text-lg">
                    {course.title?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/courses/${course.slug}`} className="font-display text-sm text-ink hover:underline truncate">
                    {course.title}
                  </Link>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${STATUS_STYLES[course.status]}`}>
                    {course.status}
                  </span>
                  {!course.is_active && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border bg-red-50 text-red-600 border-red-100">
                      Blocked
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  by {course.author?.name} {course.author?.lastname} · {course.price > 0 ? `$${course.price}` : 'Free'}
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0 justify-center">
                <button
                  onClick={() => handleBlockToggle(course)}
                  disabled={busyId === course.id}
                  className="text-xs font-medium text-gold-dark hover:underline disabled:opacity-50"
                >
                  {course.is_active ? 'Block' : 'Unblock'}
                </button>
                <button
                  onClick={() => handleDelete(course)}
                  disabled={busyId === course.id}
                  className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => p - 1)} disabled={meta.current_page <= 1} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition">Prev</button>
          <span className="text-sm text-gray-500">Page {meta.current_page} of {meta.last_page}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={meta.current_page >= meta.last_page} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition">Next</button>
        </div>
      )}
    </AdminLayout>
  );
}