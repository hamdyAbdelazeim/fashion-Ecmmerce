import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Users as UsersIcon, Shield, ShieldOff, Trash2, Search, Loader2, UserCircle } from 'lucide-react';
import { adminFetchUsers, adminUpdateUserRole, adminDeleteUser } from '../../store/productSlice';

const RoleBadge = ({ role }) => (
    role === 'admin'
        ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700"><Shield size={10} />Admin</span>
        : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600"><UserCircle size={10} />User</span>
);

const DeleteConfirm = ({ user, onClose, onConfirm, deleting }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm z-10 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete User?</h3>
            <p className="text-sm text-gray-500 mb-6">
                <span className="font-semibold text-gray-800">{user?.name}</span> ({user?.email}) will be permanently removed.
            </p>
            <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:border-gray-400 transition-colors">Cancel</button>
                <button onClick={onConfirm} disabled={deleting}
                    className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {deleting && <Loader2 size={14} className="animate-spin" />}
                    {deleting ? 'Deleting…' : 'Delete'}
                </button>
            </div>
        </motion.div>
    </div>
);

const Avatar = ({ user }) => {
    if (user.avatar) return <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />;
    const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return (
        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
            {initials}
        </div>
    );
};

const Users = () => {
    const dispatch = useDispatch();
    const { adminUsers, adminLoading } = useSelector(s => s.product);
    const { user: currentUser } = useSelector(s => s.auth);

    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [delTarget, setDelTarget] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => { dispatch(adminFetchUsers()); }, [dispatch]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleToggleRole = async (user) => {
        if (user._id === currentUser?._id) {
            showToast("You can't change your own role.", 'error');
            return;
        }
        setUpdating(user._id);
        try {
            const newRole = user.role === 'admin' ? 'user' : 'admin';
            await dispatch(adminUpdateUserRole({ id: user._id, role: newRole })).unwrap();
            showToast(`${user.name} is now ${newRole === 'admin' ? 'an admin' : 'a regular user'}`);
        } catch {
            showToast('Failed to update role.', 'error');
        } finally {
            setUpdating(null);
        }
    };

    const handleDelete = async () => {
        if (delTarget._id === currentUser?._id) {
            showToast("You can't delete your own account.", 'error');
            setDelTarget(null);
            return;
        }
        setDeleting(true);
        try {
            await dispatch(adminDeleteUser(delTarget._id)).unwrap();
            showToast('User deleted');
            setDelTarget(null);
        } catch {
            showToast('Failed to delete user.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const filtered = adminUsers.filter(u => {
        const q = search.toLowerCase();
        const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        const matchRole = filterRole === 'All' || u.role === filterRole.toLowerCase();
        return matchSearch && matchRole;
    });

    const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div className="space-y-6">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <p className="text-sm text-gray-400 mt-0.5">{adminUsers.length} registered users</p>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition-colors" />
                </div>
                <div className="flex gap-2">
                    {['All', 'Admin', 'User'].map(r => (
                        <button key={r} onClick={() => setFilterRole(r)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${filterRole === r ? 'bg-black text-white' : 'border border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {adminLoading ? (
                    <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 size={20} className="animate-spin" /> Loading users…
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
                        <UsersIcon size={36} className="opacity-30" />
                        <p className="text-sm">{adminUsers.length === 0 ? 'No users yet.' : 'No users match your search.'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-6 py-3 text-left">User</th>
                                    <th className="px-6 py-3 text-left">Email</th>
                                    <th className="px-6 py-3 text-left">Role</th>
                                    <th className="px-6 py-3 text-left">Joined</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {sorted.map(u => {
                                    const isSelf = u._id === currentUser?._id;
                                    return (
                                        <tr key={u._id} className={`hover:bg-gray-50/70 transition-colors ${isSelf ? 'bg-violet-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar user={u} />
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {u.name}
                                                            {isSelf && <span className="ml-2 text-[10px] font-bold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded">You</span>}
                                                        </p>
                                                        {u.username && <p className="text-xs text-gray-400">@{u.username}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                                            <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                                            <td className="px-6 py-4 text-xs text-gray-400">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleToggleRole(u)}
                                                        disabled={updating === u._id || isSelf}
                                                        title={u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                                                        className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${u.role === 'admin' ? 'text-violet-500 hover:bg-violet-50' : 'text-gray-400 hover:text-violet-600 hover:bg-violet-50'}`}>
                                                        {updating === u._id
                                                            ? <Loader2 size={15} className="animate-spin" />
                                                            : u.role === 'admin' ? <ShieldOff size={15} /> : <Shield size={15} />}
                                                    </button>
                                                    <button
                                                        onClick={() => setDelTarget(u)}
                                                        disabled={isSelf}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete modal */}
            <AnimatePresence>
                {delTarget && (
                    <DeleteConfirm
                        user={delTarget}
                        onClose={() => setDelTarget(null)}
                        onConfirm={handleDelete}
                        deleting={deleting}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Users;
