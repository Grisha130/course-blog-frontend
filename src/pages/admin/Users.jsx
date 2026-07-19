import { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    api
      .get('/super_admin/users', { params: { search: search || undefined, status: status || undefined, page } })
      .then((res) => {
        setUsers(res.data.data ?? []);
        setMeta(res.data.meta ?? null);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchUsers, [search, status, page]);

  const handleBlockToggle = async (u) => {
    setBusyId(u.id);
    setError(null);
    try {
      const newStatus = u.is_active ? 'block' : 'unblock';
      const res = await api.post(`/super_admin/users/${u.id}/status`, { status: newStatus });
      setUsers((prev) => prev.map((usr) => (usr.id === u.id ? res.data.data : usr)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setBusyId(null);
    }
  };

  const handleRoleChange = async (u, role) => {
    setBusyId(u.id);
    setError(null);
    try {
      const res = await api.post(`/super_admin/users/${u.id}/role`, { role });
      setUsers((prev) => prev.map((usr) => (usr.id === u.id ? res.data.data : usr)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (u) => {
    if (!confirm(`Delete "${u.name} ${u.lastname}"? It can be restored later from Deleted Users.`)) return;
    setBusyId(u.id);
    setError(null);
    try {
      await api.delete(`/super_admin/users/${u.id}`);
      setUsers((prev) => prev.filter((usr) => usr.id !== u.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setBusyId(null);
    }
  };

  const currentRole = (u) => {
    if (u.role?.includes('Super Admin')) return 'Super Admin';
    if (u.role?.includes('Admin')) return 'Admin';
    if (u.role?.includes('Editor')) return 'Editor';
    return 'user';
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl text-ink">Users</h1>
        <a href="/admin/deleted-users" className="text-sm font-medium text-gold-dark hover:underline">
          View deleted users →
        </a>
      </div>
      <p className="text-sm text-gray-400 mb-6">Manage roles, block access, or remove accounts</p>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
        >
          <option value="">All users</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center bg-gray-50/50">
          <p className="text-sm text-gray-400">No users found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => {
            const isSelf = u.id === currentUser?.id;
            return (
              <div key={u.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
                <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display text-sm text-ink">{u.name} {u.lastname}</p>
                    {!u.is_active && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border bg-red-50 text-red-600 border-red-100">
                        Blocked
                      </span>
                    )}
                    {isSelf && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border bg-gold/10 text-gold-dark border-gold/20">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                </div>

                {currentRole(u) === 'Super Admin' ? (
                  <span className="text-xs font-medium text-gold-dark px-3 py-1.5">
                    Super Admin
                  </span>
                ) : (
                  <select
                    value={currentRole(u)}
                    onChange={(e) => handleRoleChange(u, e.target.value)}
                    disabled={isSelf || busyId === u.id}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="Editor">Editor</option>
                    <option value="Admin">Admin</option>
                  </select>
                )}

                <button
                  onClick={() => handleBlockToggle(u)}
                  disabled={isSelf || busyId === u.id}
                  className="text-xs font-medium text-gold-dark hover:underline disabled:opacity-50 flex-shrink-0"
                >
                  {u.is_active ? 'Block' : 'Unblock'}
                </button>

                <button
                  onClick={() => handleDelete(u)}
                  disabled={isSelf || busyId === u.id}
                  className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50 flex-shrink-0"
                >
                  Delete
                </button>
              </div>
            );
          })}
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