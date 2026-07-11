import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', lastname: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      setErrors(data?.errors || {});
      setMessage(data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        required
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
      />
      {errors[name] && (
        <p className="text-xs text-red-600 mt-1">{errors[name][0]}</p>
      )}
    </div>
  );

  return (
    <AuthLayout
      eyebrow="Join the platform"
      title="Learn, teach, write."
      subtitle="Create courses, publish blog posts, and grow a learning community — all in one place."
    >
      <h2 className="font-display text-2xl text-ink mb-1">Create your account</h2>
      <p className="text-sm text-gray-500 mb-6">
        Already have one?{' '}
        <Link to="/login" className="text-gold-dark font-medium hover:underline">
          Log in
        </Link>
      </p>

      {message && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {field('name', 'Name')}
          {field('lastname', 'Lastname')}
        </div>
        {field('email', 'Email', 'email')}
        {field('password', 'Password', 'password')}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper font-medium text-sm rounded-lg py-3 mt-2 hover:bg-ink-light transition disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}