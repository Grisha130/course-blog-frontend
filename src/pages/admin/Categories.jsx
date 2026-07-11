import { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState(null);

  const fetchCategories = () => {
    setLoading(true);
    api.get('/blogs/categories').then((res) => setCategories(res.data.data ?? [])).finally(() => setLoading(false));
  };

  useEffect(fetchCategories, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await api.post('/category/create', { category: newName });
      setCategories((prev) => [...prev, res.data.data]);
      setNewName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditText(cat.category);
  };

  const saveEdit = async (id) => {
    const res = await api.patch(`/category/${id}/update`, { category: editText });
    setCategories((prev) => prev.map((c) => (c.id === id ? res.data.data : c)));
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    await api.delete(`/category/${id}/delete`);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl text-ink mb-1">Categories</h1>
      <p className="text-sm text-gray-400 mb-6">Manage blog categories</p>

      <form onSubmit={handleCreate} className="flex gap-3 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name…"
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-ink text-paper text-sm font-medium rounded-lg px-5 py-2.5 hover:bg-ink-light transition disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />)}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-400">No categories yet.</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3">
              {editingId === cat.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                  <button onClick={() => saveEdit(cat.id)} className="text-xs text-gold-dark font-medium">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">Cancel</button>
                </div>
              ) : (
                <>
                  <span className="text-sm text-ink">{cat.category}</span>
                  <div className="flex gap-3">
                    <button onClick={() => startEdit(cat)} className="text-xs text-gold-dark font-medium hover:underline">Edit</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-xs text-red-500 font-medium hover:underline">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}