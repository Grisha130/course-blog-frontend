import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function ProfileEdit() {
    const { user, refreshAuth } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: user?.name || '',
        lastname: user?.lastname || '',
        email: user?.email || '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [preview, setPreview] = useState(user?.avatar || null);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage(null);
        setLoading(true);

        const payload = new FormData();
        payload.append('name', form.name);
        payload.append('lastname', form.lastname);
        payload.append('email', form.email);
        if (avatarFile) payload.append('avatar', avatarFile);
        payload.append('_method', 'PATCH');

        try {
            await api.post('/profile/update', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const updatedUser = await refreshAuth();
            if (!updatedUser?.email_verified_at) {
                navigate('/verify-email-notice');
            } else {
                navigate('/profile');
            }
        } catch (err) {
            const data = err.response?.data;
            setErrors(data?.errors || {});
            setMessage(data?.message || 'Update failed');
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
            {errors[name] && <p className="text-xs text-red-600 mt-1">{errors[name][0]}</p>}
        </div>
    );

    return (
        <div className="min-h-screen bg-paper">
            <Navbar />

            <div className="max-w-lg mx-auto px-6 py-12">
                <h1 className="font-display text-2xl text-ink mb-1">Edit Profile</h1>
                <p className="text-sm text-gray-500 mb-8">Update your personal information and avatar.</p>

                {message && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                            <img src={preview} alt="avatar preview" className="w-full h-full object-cover" />
                        </div>
                        <label className="cursor-pointer text-sm font-medium text-gold-dark hover:underline">
                            Change avatar
                            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                        </label>
                    </div>

                    {field('name', 'Name')}
                    {field('lastname', 'Lastname')}
                    {field('email', 'Email', 'email')}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-ink text-paper font-medium text-sm rounded-lg py-3 mt-2 hover:bg-ink-light transition disabled:opacity-50"
                    >
                        {loading ? 'Saving…' : 'Save changes'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <Link to="/change-password" className="text-sm text-gold-dark font-medium hover:underline">
                        Change password
                    </Link>
                    <Link to="/profile" className="text-sm text-gray-400 hover:text-gray-600">
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    );
}