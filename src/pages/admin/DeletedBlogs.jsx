import { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import { Link } from 'react-router-dom';

const STATUS_STYLES = {
    published: 'bg-green-50 text-green-700 border-green-100',
    draft: 'bg-gray-100 text-gray-500 border-gray-200',
    archived: 'bg-amber-50 text-amber-700 border-amber-100',
};

export default function DeletedBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [tagId, setTagId] = useState('');
    const [sort, setSort] = useState('latest');
    const [page, setPage] = useState(1);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/blogs/categories').then((res) => setCategories(res.data.data ?? [])).catch(() => setCategories([]));
        api.get('/blogs/tags').then((res) => setTags(res.data.data ?? [])).catch(() => setTags([]));
    }, []);

    const fetchDeleted = () => {
        setLoading(true);
        api
            .get('/deleted-blogs', {
                params: {
                    search: search || undefined,
                    category_id: categoryId || undefined,
                    tag_id: tagId || undefined,
                    sort,
                    page,
                },
            })
            .then((res) => {
                setBlogs(res.data.data ?? []);
                setMeta(res.data.meta ?? null);
            })
            .catch(() => setBlogs([]))
            .finally(() => setLoading(false));
    };

    useEffect(fetchDeleted, [search, categoryId, tagId, sort, page]);

    const handleRestore = async (blog) => {
        setBusyId(blog.id);
        setError(null);
        try {
            await api.post(`/deleted-blogs/${blog.slug}/restore`);
            setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to restore post');
        } finally {
            setBusyId(null);
        }
    };

    const handleForceDelete = async (blog) => {
        if (!confirm(`Permanently delete "${blog.title}"? This cannot be undone.`)) return;
        setBusyId(blog.id);
        setError(null);
        try {
            await api.delete(`/deleted-blogs/${blog.slug}/force-delete`);
            setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to permanently delete post');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-1">
                <h1 className="font-display text-2xl text-ink">Deleted Blogs</h1>
                <Link to="/admin/blogs" className="text-sm font-medium text-gray-400 hover:text-gray-600">
                    ← Back to Blogs
                </Link>
            </div>
            <p className="text-sm text-gray-400 mb-6">Review, restore, or permanently remove deleted posts from all users</p>
            <div className="grid sm:grid-cols-4 gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
                />
                <select
                    value={categoryId}
                    onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
                >
                    <option value="">All categories</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.category}</option>)}
                </select>
                <select
                    value={tagId}
                    onChange={(e) => { setTagId(e.target.value); setPage(1); }}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
                >
                    <option value="">All tags</option>
                    {tags.map((t) => <option key={t.id} value={t.id}>{t.tag}</option>)}
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

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
                </div>
            ) : blogs.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50/50">
                    <p className="text-sm text-gray-400">No deleted blog posts.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="flex gap-4 bg-white border border-gray-100 rounded-xl p-4">
                            <div className="w-16 h-16 rounded-lg bg-ink/5 flex-shrink-0 overflow-hidden">
                                {blog.image ? (
                                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gold font-display text-lg">
                                        {blog.title?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-display text-sm text-ink truncate">{blog.title}</h3>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${STATUS_STYLES[blog.status] || STATUS_STYLES.draft}`}>
                                        {blog.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    by {blog.author?.name} {blog.author?.lastname} · {blog.category?.category || 'Uncategorized'}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0 justify-center">
                                <button
                                    onClick={() => handleRestore(blog)}
                                    disabled={busyId === blog.id}
                                    className="text-xs font-medium text-gold-dark hover:underline disabled:opacity-50"
                                >
                                    Restore
                                </button>
                                <button
                                    onClick={() => handleForceDelete(blog)}
                                    disabled={busyId === blog.id}
                                    className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
                                >
                                    Delete forever
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