import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isSuperAdmin = user?.role?.includes('Super Admin');
  const isAdmin = isSuperAdmin || user?.role?.includes('Admin');
  const isEditor = isSuperAdmin || user?.role?.includes('Editor');
  const isStaff = isAdmin || isEditor;

  const adminHome = isEditor ? '/admin/blogs' : '/admin/categories';

  return (
    <nav className="bg-ink sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-paper font-display text-lg tracking-tight">
          CourseBlog
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link to="/courses" className="text-paper/70 hover:text-paper transition">
            Courses
          </Link>
          <Link to="/blogs" className="text-paper/70 hover:text-paper transition">
            Blogs
          </Link>
          <Link to="/my-courses" className="text-paper/70 hover:text-paper transition">
            My Courses
          </Link>
          <Link to="/my-blogs" className="text-paper/70 hover:text-paper transition">
            My Blogs
          </Link>

          {isStaff && (
            <Link to={adminHome} className="text-paper/70 hover:text-paper transition">
              Admin
            </Link>
          )}

          <Link to="/profile" className="flex items-center gap-2">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border border-white/20"
            />
          </Link>

          <button
            onClick={handleLogout}
            className="text-paper/50 hover:text-paper text-sm transition"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}