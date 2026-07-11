import { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState(null);

  const fetchTags = () => {
    setLoading(true);
    api.get('/blogs/tags').then((res) => setTags(res.data.data ?? [])).finally(() => setLoading(false));
  };

  useEffect(fetchTags, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await api.post('/tag/create', { tag: newName });
      setTags((prev) => [...prev, res.data.data]);
      setNewName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tag');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditText(t.tag);
  };

  const saveEdit = async (id) => {
    const res = await api.patch(`/tag/${id}/update`, { tag: editText });
    setTags((prev) => prev.map((t) => (t.id === id ? res.data.data : t)));
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tag?')) return;
    await api.delete(`/tag/${id}/delete`);
    setTags((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl text-ink mb-1">Tags</h1>
      <p className="text-sm text-gray-400 mb-6">Manage blog tags</p>

      <form onSubmit={handleCreate} className="flex gap-3 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New tag name…"
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
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-8 w-20 rounded-full bg-gray-100 animate-pulse" />)}
        </div>
      ) : tags.length === 0 ? (
        <p className="text-sm text-gray-400">No tags yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <div key={t.id} className="flex items-center gap-2 bg-white border border-gray-100 rounded-full pl-3 pr-2 py-1.5">
              {editingId === t.id ? (
                <>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-24 rounded border border-gray-200 px-2 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold/40"
                  />
                  <button onClick={() => saveEdit(t.id)} className="text-xs text-gold-dark font-medium">✓</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">✕</button>
                </>
              ) : (
                <>
                  <span className="text-sm text-ink">{t.tag}</span>
                  <button onClick={() => startEdit(t)} className="text-xs text-gold-dark hover:underline">edit</button>
                  <button onClick={() => handleDelete(t.id)} className="text-xs text-red-500 hover:underline">✕</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}