import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function BlogForm() {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    content: '',
    category_id: '',
    status: 'draft',
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/blogs/categories').then((res) => setCategories(res.data.data ?? [])).catch(() => setCategories([])),
      api.get('/blogs/tags').then((res) => setTags(res.data.data ?? [])).catch(() => setTags([])),
      isEdit
        ? api.get(`/blogs/${slug}/show`).then((res) => {
            const blog = res.data.data;
            setForm({
              title: blog.title || '',
              content: blog.content || '',
              category_id: blog.category?.id || '',
              status: blog.status || 'draft',
            });
            setSelectedTags((blog.tags ?? []).map((t) => t.id));
            setPreview(blog.image || null);
          })
        : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, [slug, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleTag = (id) => {
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

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
    payload.append('content', form.content);
    payload.append('category_id', form.category_id);
    payload.append('status', form.status);
    selectedTags.forEach((id) => payload.append('tags[]', id));
    if (imageFile) payload.append('image', imageFile);

    try {
      let res;
      if (isEdit) {
        payload.append('_method', 'PATCH');
        res = await api.post(`/blogs/${slug}/update`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/blogs/create', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate(`/blogs/${res.data.data.slug}`);
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
        <h1 className="font-display text-2xl text-ink mb-1">{isEdit ? 'Edit Post' : 'New Post'}</h1>
        <p className="text-sm text-gray-500 mb-8">
          {isEdit ? 'Update your blog post.' : 'Write and publish a new blog post.'}
        </p>

        {message && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Cover image {!isEdit && <span className="text-red-500">*</span>}
            </label>
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
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageChange}
                  required={!isEdit}
                  className="hidden"
                />
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
            <label className="block text-sm font-medium text-ink mb-1.5">Content</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              rows={8}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition resize-none"
            />
            {errors.content && <p className="text-xs text-red-600 mt-1">{errors.content[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Category</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.category}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-xs text-red-600 mt-1">{errors.category_id[0]}</p>}
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

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => {
                const active = selectedTags.includes(t.id);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => toggleTag(t.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      active
                        ? 'bg-gold/15 text-gold-dark border-gold/40'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {t.tag}
                  </button>
                );
              })}
            </div>
            {errors.tags && <p className="text-xs text-red-600 mt-1">{errors.tags[0]}</p>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-ink text-paper font-medium text-sm rounded-lg px-5 py-2.5 hover:bg-ink-light transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish post'}
            </button>
            <Link to="/my-blogs" className="text-sm text-gray-400 hover:text-gray-600">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}