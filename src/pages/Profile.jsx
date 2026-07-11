import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Profile() {
  const { user } = useAuth();

  const [courseCount, setCourseCount] = useState(null);
  const [blogCount, setBlogCount] = useState(null);

  useEffect(() => {
    api.get('/courses/my-courses').then((res) => setCourseCount((res.data.data ?? []).length)).catch(() => setCourseCount(0));
    api.get('/blogs/my-blogs').then((res) => setBlogCount((res.data.data ?? []).length)).catch(() => setBlogCount(0));
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="bg-ink relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold/40 flex-shrink-0">
                <img src={user?.avatar} alt={user?.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-gold font-sans text-xs tracking-widest uppercase mb-1">
                  {user?.role?.[0] || 'Member'}
                </p>
                <h1 className="text-paper font-display text-3xl leading-tight">
                  {user?.name} {user?.lastname}
                </h1>
                <p className="text-paper/50 text-sm mt-1">{user?.email}</p>
              </div>
            </div>

            <Link
              to="/profile/edit"
              className="bg-white/10 text-paper text-sm font-medium rounded-lg px-4 py-2 hover:bg-white/20 transition border border-white/10"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-lg text-ink mb-4">Account Information</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Status</p>
              {user?.email_verified_at ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Pending
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Member since</p>
              <p className="text-sm text-ink font-medium">{formatDate(user?.created_at)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Role</p>
              <div className="flex flex-wrap gap-1.5">
                {(user?.role?.length ? user.role : ['User']).map((r) => (
                  <span
                    key={r}
                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold-dark border border-gold/20"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Link
            to="/my-courses"
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex items-center justify-between"
          >
            <div>
              <h3 className="font-display text-lg text-ink">My Courses</h3>
              <p className="text-sm text-gray-400 mt-1">Manage the courses you've created</p>
            </div>
            <span className="text-3xl font-display text-gold">{courseCount ?? '—'}</span>
          </Link>

          <Link
            to="/my-blogs"
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex items-center justify-between"
          >
            <div>
              <h3 className="font-display text-lg text-ink">My Blogs</h3>
              <p className="text-sm text-gray-400 mt-1">Manage the posts you've written</p>
            </div>
            <span className="text-3xl font-display text-gold">{blogCount ?? '—'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}