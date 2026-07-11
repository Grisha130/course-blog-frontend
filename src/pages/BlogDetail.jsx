import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import CommentSection from '../components/CommentSection';

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const canModerate = user?.role?.includes('Editor') || user?.role?.includes('Super Admin');

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get(`/blogs/${slug}/show`)
      .then((res) => setBlog(res.data.data))
      .catch((err) => {
        setError(err.response?.status === 403 ? 'not-found' : 'error');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddComment = async (text) => {
    const res = await api.post(`/blogs/${slug}/comment`, { comment: text });
    setBlog((prev) => ({ ...prev, comments: [...prev.comments, res.data.data] }));
  };

  const handleBlockToggle = async () => {
    const res = await api.post(`/blogs/${slug}/block`);
    setBlog(res.data.data);
  };

  const handleUpdateComment = async (commentId, text) => {
    const res = await api.patch(`/blogs/comment/${commentId}/update`, { comment: text });
    setBlog((prev) => ({
      ...prev,
      comments: prev.comments.map((c) => (c.id === commentId ? res.data.data : c)),
    }));
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    await api.delete(`/blogs/comment/${commentId}/delete`);
    setBlog((prev) => ({ ...prev, comments: prev.comments.filter((c) => c.id !== commentId) }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-10 animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-2/3" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="font-display text-2xl text-ink mb-2">Post not available</p>
          <p className="text-sm text-gray-400 mb-6">
            This post doesn't exist, or you don't have permission to view it.
          </p>
          <Link to="/blogs" className="text-sm font-medium text-gold-dark hover:underline">
            ← Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/blogs" className="text-sm text-gray-400 hover:text-gray-600">← Back to blogs</Link>

        {blog.image && (
          <img src={blog.image} alt={blog.title} className="w-full h-72 object-cover rounded-2xl mt-4 mb-6" />
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-gold-dark bg-gold/10 px-2 py-0.5 rounded-full">
            {blog.category?.category}
          </span>
          {blog.tags?.map((t) => (
            <span key={t.id} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {t.tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mb-3">
          <h1 className="font-display text-3xl text-ink">{blog.title}</h1>
          {canModerate && (
            <button
              onClick={handleBlockToggle}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border flex-shrink-0 ${blog.is_active ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'
                }`}
            >
              {blog.is_active ? 'Block post' : 'Unblock post'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <img src={blog.author?.avatar} alt={blog.author?.name} className="w-8 h-8 rounded-full object-cover" />
          <p className="text-sm text-gray-500">
            {blog.author?.name} {blog.author?.lastname}
          </p>
        </div>

        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{blog.content}</p>

        <CommentSection
          comments={blog.comments ?? []}
          onAdd={handleAddComment}
          onUpdate={handleUpdateComment}
          onDelete={handleDeleteComment}
        />
      </div>
    </div>
  );
}