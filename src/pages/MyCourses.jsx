import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';

const STATUS_STYLES = {
    published: 'bg-green-50 text-green-700 border-green-100',
    draft: 'bg-gray-100 text-gray-500 border-gray-200',
    archived: 'bg-amber-50 text-amber-700 border-amber-100',
};

export default function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        setLoading(true);
        api
            .get('/courses/my-courses', { params: { search: search || undefined, status: status || undefined, page } })
            .then((res) => {
                setCourses(res.data.data ?? []);
                setMeta(res.data.meta ?? null);
            })
            .catch(() => setCourses([]))
            .finally(() => setLoading(false));
    }, [search, status, page]);

    const handleDelete = async (slug) => {
        if (!confirm('Delete this course?')) return;
        await api.delete(`/courses/${slug}/delete`);
        setCourses((prev) => prev.filter((c) => c.slug !== slug));
    };

    return (
        <div className="min-h-screen bg-paper">
            <Navbar />

            <div className="max-w-5xl mx-auto px-6 py-10">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-2xl text-ink">My Courses</h1>
                        <p className="text-sm text-gray-400 mt-1">Manage the courses you've created</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/my-courses/deleted" className="text-sm text-gray-400 hover:text-gray-600">
                            View deleted
                        </Link>
                        <Link
                            to="/courses/create"
                            className="bg-ink text-paper text-sm font-medium rounded-lg px-4 py-2 hover:bg-ink-light transition"
                        >
                            + New Course
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <input
                        type="text"
                        placeholder="Search courses…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
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

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />)}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50/50">
                        <p className="text-sm text-gray-400">No courses found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {courses.map((course) => (
                            <div key={course.id} className="flex gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition">
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
                                    <div className="flex items-start justify-between gap-2">
                                        <Link to={`/courses/${course.slug}`} className="font-display text-base text-ink hover:underline truncate">
                                            {course.title}
                                        </Link>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${STATUS_STYLES[course.status]}`}>
                                            {course.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{course.description}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                        <span>{course.price > 0 ? `$${course.price}` : 'Free'}</span>
                                        <span>·</span>
                                        <span>{course.comments?.length ?? 0} comments</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    <Link to={`/courses/${course.slug}/edit`} className="text-xs font-medium text-gold-dark hover:underline">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(course.slug)} className="text-xs font-medium text-red-500 hover:underline">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination meta={meta} onPageChange={setPage} />
            </div>
        </div>
    );
}