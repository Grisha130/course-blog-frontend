import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CommentSection from '../components/CommentSection';

export default function CourseDetail() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const canModerate = user?.role?.includes('Editor') || user?.role?.includes('Super Admin');

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get(`/courses/${slug}`)
      .then((res) => setCourse(res.data.data))
      .catch((err) => {
        setError(err.response?.status === 403 ? 'not-found' : 'error');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleBlockToggle = async () => {
    const res = await api.post(`/courses/${slug}/block`);
    setCourse(res.data.data);
  };
  const handleAddComment = async (text) => {
    const res = await api.post(`/courses/${slug}/comment`, { comment: text });
    setCourse((prev) => ({ ...prev, comments: [...prev.comments, res.data.data] }));
  };

  const handleUpdateComment = async (commentId, text) => {
    const res = await api.patch(`/courses/comments/${commentId}`, { comment: text });
    setCourse((prev) => ({
      ...prev,
      comments: prev.comments.map((c) => (c.id === commentId ? res.data.data : c)),
    }));
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    await api.delete(`/courses/comments/${commentId}`);
    setCourse((prev) => ({ ...prev, comments: prev.comments.filter((c) => c.id !== commentId) }));
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

  if (error || !course) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="font-display text-2xl text-ink mb-2">Course not available</p>
          <p className="text-sm text-gray-400 mb-6">
            This course doesn't exist, or you don't have permission to view it.
          </p>
          <Link to="/courses" className="text-sm font-medium text-gold-dark hover:underline">
            ← Back to courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/courses" className="text-sm text-gray-400 hover:text-gray-600">← Back to courses</Link>

        {course.image && (
          <img src={course.image} alt={course.title} className="w-full h-72 object-cover rounded-2xl mt-4 mb-6" />
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gold-dark bg-gold/10 px-2 py-0.5 rounded-full capitalize">
            {course.status}
          </span>
          <span className="font-display text-xl text-ink">
            {course.price > 0 ? `$${course.price}` : 'Free'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 mb-3">
          <h1 className="font-display text-3xl text-ink">{course.title}</h1>
          {canModerate && (
            <button
              onClick={handleBlockToggle}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border flex-shrink-0 ${course.is_active ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'
                }`}
            >
              {course.is_active ? 'Block course' : 'Unblock course'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <img src={course.author?.avatar} alt={course.author?.name} className="w-8 h-8 rounded-full object-cover" />
          <p className="text-sm text-gray-500">
            {course.author?.name} {course.author?.lastname}
          </p>
        </div>

        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{course.description}</p>

        <CommentSection
          comments={course.comments ?? []}
          onAdd={handleAddComment}
          onUpdate={handleUpdateComment}
          onDelete={handleDeleteComment}
        />
      </div>
    </div>
  );
}