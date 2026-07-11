import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';

export default function MyDeletedBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [restoringId, setRestoringId] = useState(null);

  const fetchDeleted = () => {
    setLoading(true);
    api
      .get('/blogs/my-deleted', { params: { page } })
      .then((res) => {
        setBlogs(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      })
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchDeleted, [page]);

  const handleRestore = async (slug) => {
    setRestoringId(slug);
    try {
      await api.post(`/blogs/my-deleted/${slug}/restore`);
      setBlogs((prev) => prev.filter((b) => b.slug !== slug));
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
            <h1 className="font-display text-2xl text-ink">Deleted Blog Posts</h1>
            <p className="text-sm text-gray-400 mt-1">Restore posts you've deleted</p>
          </div>
          <Link to="/my-blogs" className="text-sm text-gray-400 hover:text-gray-600">
            ← Back to My Blogs
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : blogs.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50/50">
            <p className="text-sm text-gray-400">No deleted blog posts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blogs.map((blog) => (
              <div key={blog.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 opacity-75">
                <div className="w-14 h-14 rounded-lg bg-ink/5 flex-shrink-0 overflow-hidden">
                  {blog.image ? (
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gold font-display">
                      {blog.title?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm text-ink truncate">{blog.title}</h3>
                  <p className="text-xs text-gray-400">{blog.category?.category}</p>
                </div>
                <button
                  onClick={() => handleRestore(blog.slug)}
                  disabled={restoringId === blog.slug}
                  className="text-xs font-medium text-gold-dark hover:underline disabled:opacity-50 flex-shrink-0"
                >
                  {restoringId === blog.slug ? 'Restoring…' : 'Restore'}
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