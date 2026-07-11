import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function CourseForm() {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    status: 'draft',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/courses/${slug}`)
      .then((res) => {
        const course = res.data.data;
        setForm({
          title: course.title || '',
          description: course.description || '',
          price: course.price ?? '',
          status: course.status || 'draft',
        });
        setPreview(course.image || null);
      })
      .catch(() => setMessage('Could not load this course.'))
      .finally(() => setLoading(false));
  }, [slug, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    setSaving(true);

    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('description', form.description);
    if (form.price !== '') payload.append('price', form.price);
    payload.append('status', form.status);
    if (imageFile) payload.append('image', imageFile);

    try {
      let res;
      if (isEdit) {
        payload.append('_method', 'PATCH');
        res = await api.post(`/courses/${slug}/update`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/courses/create', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate(`/courses/${res.data.data.slug}`);
    } catch (err) {
      const data = err.response?.data;
      setErrors(data?.errors || {});
      setMessage(data?.message || 'Something went wrong, please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-12 animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-1/2" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-display text-2xl text-ink mb-1">{isEdit ? 'Edit Course' : 'New Course'}</h1>
        <p className="text-sm text-gray-500 mb-8">
          {isEdit ? 'Update your course details.' : 'Fill in the details to publish a new course.'}
        </p>

        {message && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Cover image</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-ink/5 border border-gray-200 flex-shrink-0">
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                )}
              </div>
              <label className="cursor-pointer text-sm font-medium text-gold-dark hover:underline">
                {preview ? 'Change image' : 'Upload image'}
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            {errors.image && <p className="text-xs text-red-600 mt-1">{errors.image[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={6}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition resize-none"
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Price (0 = free)</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
              />
              {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              {errors.status && <p className="text-xs text-red-600 mt-1">{errors.status[0]}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-ink text-paper font-medium text-sm rounded-lg px-5 py-2.5 hover:bg-ink-light transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create course'}
            </button>
            <Link to="/my-courses" className="text-sm text-gray-400 hover:text-gray-600">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}