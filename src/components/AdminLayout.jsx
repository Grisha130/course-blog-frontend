import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  const isSuperAdmin = user?.role?.includes('Super Admin');
  const isAdmin = isSuperAdmin || user?.role?.includes('Admin');
  const isEditor = isSuperAdmin || user?.role?.includes('Editor');

  const linkClass = (path) =>
    `block px-3 py-2 rounded-lg text-sm transition ${
      location.pathname === path
        ? 'bg-ink text-paper font-medium'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10 flex gap-8">
        <aside className="w-56 flex-shrink-0 space-y-4">
          {isEditor && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-3 mb-1">Content</p>
              <Link to="/admin/blogs" className={linkClass('/admin/blogs')}>Blogs</Link>
              <Link to="/admin/deleted-blogs" className={linkClass('/admin/deleted-blogs')}>Deleted Blogs</Link>
              <Link to="/admin/courses" className={linkClass('/admin/courses')}>Courses</Link>
              <Link to="/admin/deleted-courses" className={linkClass('/admin/deleted-courses')}>Deleted Courses</Link>
            </div>
          )}

          {isAdmin && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-3 mb-1">Taxonomy</p>
              <Link to="/admin/categories" className={linkClass('/admin/categories')}>Categories</Link>
              <Link to="/admin/tags" className={linkClass('/admin/tags')}>Tags</Link>
            </div>
          )}

          {isSuperAdmin && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-3 mb-1">Users</p>
              <Link to="/admin/users" className={linkClass('/admin/users')}>Users</Link>
              <Link to="/admin/deleted-users" className={linkClass('/admin/deleted-users')}>Deleted Users</Link>
            </div>
          )}
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}