import { useState, useEffect } from 'react';
import { fetchItems, fetchStats, createItem, updateItem, deleteItem } from '../api/itemApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-purple-100 text-purple-800'
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, completed: 0 });
  const [form, setForm] = useState({ title: '', description: '', status: 'active' });
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [ir, sr] = await Promise.all([fetchItems(), fetchStats()]);
      setItems(ir.data.items);
      setStats(sr.data.stats);
    } catch { setError('Failed to load data'); }
  };

  useEffect(() => { loadData(); }, []);

  const flash = (type, msg) => {
    type === 'success' ? setSuccess(msg) : setError(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await updateItem(editId, form);
        flash('success', 'Item updated!');
        setEditId(null);
      } else {
        await createItem(form);
        flash('success', 'Item created!');
      }
      setForm({ title: '', description: '', status: 'active' });
      loadData();
    } catch (err) {
      flash('error', err.response?.data?.message || 'Operation failed');
    } finally { setLoading(false); }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ title: item.title, description: item.description || '', status: item.status });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    try {
      await deleteItem(deleteId);
      flash('success', 'Item deleted');
      setDeleteId(null);
      loadData();
    } catch { flash('error', 'Delete failed'); }
  };

  const statCards = [
    { label: 'Total', value: stats.total, color: 'bg-blue-500' },
    { label: 'Active', value: stats.active, color: 'bg-green-500' },
    { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
    { label: 'Completed', value: stats.completed, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-teal-700">📋 Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium hidden sm:block">👋 {user?.name}</span>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Alerts */}
        {error && <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
        {success && <div className="bg-green-100 border border-green-300 text-green-700 p-3 rounded-lg text-sm">{success}</div>}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map(s => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className={`text-2xl font-bold text-white ${s.color} rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2`}>
                {s.value ?? 0}
              </div>
              <p className="text-gray-500 text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add / Edit Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editId ? '✏️ Edit Item' : '➕ Add New Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" placeholder="Title *" required value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
            <textarea placeholder="Description (optional)" value={form.description} rows={2}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none" />
            <div className="flex flex-wrap gap-3">
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <button type="submit" disabled={loading}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition">
                {loading ? 'Saving...' : editId ? 'Update Item' : 'Add Item'}
              </button>
              {editId && (
                <button type="button"
                  onClick={() => { setEditId(null); setForm({ title: '', description: '', status: 'active' }); }}
                  className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm transition">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-800 px-6 py-4 border-b">Your Items</h2>
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p>No items yet. Add one above!</p>
            </div>
          ) : (
            <div className="divide-y">
              {items.map(item => (
                <div key={item.id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    {item.description && <p className="text-gray-500 text-sm mt-0.5 truncate">{item.description}</p>}
                    <p className="text-gray-400 text-xs mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                      {item.status}
                    </span>
                    <button onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                    <button onClick={() => setDeleteId(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete this item?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)}
                className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm transition">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;