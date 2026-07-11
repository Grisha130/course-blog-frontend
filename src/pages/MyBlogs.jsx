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

export default function MyBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);

    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('latest');
    const [categoryId, setCategoryId] = useState('');
    const [tagId, setTagId] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        api.get('/blogs/categories').then((res) => setCategories(res.data.data ?? [])).catch(() => setCategories([]));
        api.get('/blogs/tags').then((res) => setTags(res.data.data ?? [])).catch(() => setTags([]));
    }, []);

    useEffect(() => {
        setLoading(true);
        api
            .get('/blogs/my-blogs', {
                params: {
                    search: search || undefined,
                    sort,
                    category_id: categoryId || undefined,
                    tag_id: tagId || undefined,
                    page,
                },
            })
            .then((res) => {
                setBlogs(res.data.data ?? []);
                setMeta(res.data.meta ?? null);
            })
            .catch(() => setBlogs([]))
            .finally(() => setLoading(false));
    }, [search, sort, categoryId, tagId, page]);

    const handleDelete = async (slug) => {
        if (!confirm('Delete this blog post?')) return;
        await api.delete(`/blogs/${slug}/delete`);
        setBlogs((prev) => prev.filter((b) => b.slug !== slug));
    };

    return (
        <div className="min-h-screen bg-paper">
            <Navbar />

            <div className="max-w-5xl mx-auto px-6 py-10">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-2xl text-ink">My Blogs</h1>
                        <p className="text-sm text-gray-400 mt-1">Manage the posts you've written</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/my-blogs/deleted" className="text-sm text-gray-400 hover:text-gray-600">
                            View deleted
                        </Link>
                        <Link
                            to="/blogs/create"
                            className="bg-ink text-paper text-sm font-medium rounded-lg px-4 py-2 hover:bg-ink-light transition"
                        >
                            + New Post
                        </Link>
                    </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-3 mb-6">
                    <input
                        type="text"
                        placeholder="Search posts…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="sm:col-span-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
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

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />)}
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50/50">
                        <p className="text-sm text-gray-400">No blog posts found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {blogs.map((blog) => (
                            <div key={blog.id} className="flex gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition">
                                <div className="w-20 h-20 rounded-lg bg-ink/5 flex-shrink-0 overflow-hidden">
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
                                        <Link to={`/blogs/${blog.slug}`} className="font-display text-base text-ink hover:underline truncate">
                                            {blog.title}
                                        </Link>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${STATUS_STYLES[blog.status]}`}>
                                            {blog.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{blog.category?.category}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                        <span>{blog.comments?.length ?? 0} comments</span>
                                        <div className="flex gap-1">
                                            {blog.tags?.slice(0, 3).map((t) => (
                                                <span key={t.id} className="px-1.5 py-0.5 bg-gold/10 text-gold-dark rounded text-[10px]">{t.tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    <Link to={`/blogs/${blog.slug}/edit`} className="text-xs font-medium text-gold-dark hover:underline">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(blog.slug)} className="text-xs font-medium text-red-500 hover:underline">
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