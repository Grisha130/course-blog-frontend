import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api
      .get('/courses', {
        params: {
          search: search || undefined,
          type: type || undefined,
          sort,
          page,
        },
      })
      .then((res) => {
        setCourses(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [search, type, sort, page]);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-2xl text-ink mb-1">Courses</h1>
        <p className="text-sm text-gray-400 mb-8">Browse all published courses</p>

        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          <input
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
          />
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
          >
            <option value="">All courses</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
          >
            <option value="latest">Latest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50/50">
            <p className="text-sm text-gray-400">No courses found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.slug}`}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition flex gap-4"
              >
                <div className="w-20 h-20 rounded-lg bg-ink/5 flex-shrink-0 overflow-hidden">
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gold font-display text-lg">
                      {course.title?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base text-ink truncate">{course.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="font-medium text-gold-dark">
                      {course.price > 0 ? `$${course.price}` : 'Free'}
                    </span>
                    <span>·</span>
                    <span>{course.author?.name} {course.author?.lastname}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </div>
  );
}