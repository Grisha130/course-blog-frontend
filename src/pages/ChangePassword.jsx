import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function ChangePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', new_password: '', new_password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    setLoading(true);
    try {
      await api.patch('/profile/update/password', form);
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      const data = err.response?.data;
      setErrors(data?.errors || {});
      setMessage(data?.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label) => (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      <input
        type="password"
        name={name}
        value={form[name]}
        onChange={handleChange}
        required
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
      />
      {errors[name] && <p className="text-xs text-red-600 mt-1">{errors[name][0]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="font-display text-2xl text-ink mb-1">Change Password</h1>
        <p className="text-sm text-gray-500 mb-8">Enter your current password and choose a new one.</p>

        {message && !success && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700">
            {message}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-100 px-4 py-2.5 text-sm text-green-700">
            Password updated — redirecting…
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {field('password', 'Current password')}
          {field('new_password', 'New password')}
          {field('new_password_confirmation', 'Confirm new password')}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper font-medium text-sm rounded-lg py-3 mt-2 hover:bg-ink-light transition disabled:opacity-50"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <Link to="/profile" className="text-sm text-gray-400 hover:text-gray-600">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}