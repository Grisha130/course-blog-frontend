import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';

export default function DeletedUsers() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const fetchDeleted = () => {
    setLoading(true);
    api
      .get('/super_admin/deleted-users', { params: { search: search || undefined, page } })
      .then((res) => {
        setUsers(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchDeleted, [search, page]);

  const handleRestore = async (u) => {
    setBusyId(u.id);
    setError(null);
    try {
      await api.post(`/super_admin/deleted-users/${u.id}/restore`);
      setUsers((prev) => prev.filter((usr) => usr.id !== u.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to restore user');
    } finally {
      setBusyId(null);
    }
  };

  const handleForceDelete = async (u) => {
    if (!confirm(`Permanently delete "${u.name} ${u.lastname}"? This cannot be undone.`)) return;
    setBusyId(u.id);
    setError(null);
    try {
      await api.delete(`/super_admin/deleted-users/${u.id}/force-delete`);
      setUsers((prev) => prev.filter((usr) => usr.id !== u.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to permanently delete user');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl text-ink">Deleted Users</h1>
        <Link to="/admin/users" className="text-sm font-medium text-gray-400 hover:text-gray-600">
          ← Back to Users
        </Link>
      </div>
      <p className="text-sm text-gray-400 mb-6">Restore or permanently remove deleted accounts</p>

      <input
        type="text"
        placeholder="Search by email…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full sm:w-72 rounded-lg border border-gray-200 px-4 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
      />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50/50">
          <p className="text-sm text-gray-400">No deleted users.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
              <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm text-ink">{u.name} {u.lastname}</p>
                <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
              </div>
              <button
                onClick={() => handleRestore(u)}
                disabled={busyId === u.id}
                className="text-xs font-medium text-gold-dark hover:underline disabled:opacity-50"
              >
                Restore
              </button>
              <button
                onClick={() => handleForceDelete(u)}
                disabled={busyId === u.id}
                className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
              >
                Delete forever
              </button>
            </div>
          ))}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => p - 1)} disabled={meta.current_page <= 1} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition">Prev</button>
          <span className="text-sm text-gray-500">Page {meta.current_page} of {meta.last_page}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={meta.current_page >= meta.last_page} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition">Next</button>
        </div>
      )}
    </AdminLayout>
  );
}