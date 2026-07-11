import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmailNotice from './pages/VerifyEmailNotice';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import ChangePassword from './pages/ChangePassword';
import AllCourses from './pages/AllCourses';
import AllBlogs from './pages/AllBlogs';
import MyCourses from './pages/MyCourses';
import MyBlogs from './pages/MyBlogs';
import MyDeletedCourses from './pages/MyDeletedCourses';
import MyDeletedBlogs from './pages/MyDeletedBlogs';
import BlogDetail from './pages/BlogDetail';
import CourseDetail from './pages/CourseDetail';
import BlogForm from './pages/BlogForm';
import CourseForm from './pages/CourseForm';
import NotFound from './pages/NotFound';
import Users from './pages/admin/Users';
import DeletedUsers from './pages/admin/DeletedUsers';
import Categories from './pages/admin/Categories';
import Tags from './pages/admin/Tags';
import AdminBlogs from './pages/admin/Blogs';
import AdminDeletedBlogs from './pages/admin/DeletedBlogs';
import AdminCourses from './pages/admin/Courses';
import AdminDeletedCourses from './pages/admin/DeletedCourses';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email-notice" element={<VerifyEmailNotice />} />

          <Route path="/" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

          <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="/my-courses/deleted" element={<ProtectedRoute><MyDeletedCourses /></ProtectedRoute>} />
          <Route path="/my-blogs" element={<ProtectedRoute><MyBlogs /></ProtectedRoute>} />
          <Route path="/my-blogs/deleted" element={<ProtectedRoute><MyDeletedBlogs /></ProtectedRoute>} />

          <Route path="/courses" element={<ProtectedRoute><AllCourses /></ProtectedRoute>} />
          <Route path="/courses/create" element={<ProtectedRoute><CourseForm /></ProtectedRoute>} />
          <Route path="/courses/:slug/edit" element={<ProtectedRoute><CourseForm /></ProtectedRoute>} />
          <Route path="/courses/:slug" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />

          <Route path="/blogs" element={<ProtectedRoute><AllBlogs /></ProtectedRoute>} />
          <Route path="/blogs/create" element={<ProtectedRoute><BlogForm /></ProtectedRoute>} />
          <Route path="/blogs/:slug/edit" element={<ProtectedRoute><BlogForm /></ProtectedRoute>} />
          <Route path="/blogs/:slug" element={<ProtectedRoute><BlogDetail /></ProtectedRoute>} />

          <Route path="/admin/categories" element={<AdminRoute roles={['Admin', 'Super Admin']}><Categories /></AdminRoute>} />
          <Route path="/admin/tags" element={<AdminRoute roles={['Admin', 'Super Admin']}><Tags /></AdminRoute>} />

          <Route path="/admin/blogs" element={<AdminRoute roles={['Editor', 'Super Admin']}><AdminBlogs /></AdminRoute>} />
          <Route path="/admin/deleted-blogs" element={<AdminRoute roles={['Editor', 'Super Admin']}><AdminDeletedBlogs /></AdminRoute>} />
          <Route path="/admin/courses" element={<AdminRoute roles={['Editor', 'Super Admin']}><AdminCourses /></AdminRoute>} />
          <Route path="/admin/deleted-courses" element={<AdminRoute roles={['Editor', 'Super Admin']}><AdminDeletedCourses /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute roles={['Super Admin']}><Users /></AdminRoute>} />
          <Route path="/admin/deleted-users" element={<AdminRoute roles={['Super Admin']}><DeletedUsers /></AdminRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;