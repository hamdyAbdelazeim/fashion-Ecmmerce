import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CheckCircle, Clock, Truck, Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { adminFetchOrders, adminUpdateOrderStatus } from '../../store/productSlice';

const STATUS_FILTERS = ['All', 'Pending', 'Paid', 'Delivered'];

const getStatus = (order) => {
    if (order.isDelivered) return 'Delivered';
    if (order.isPaid) return 'Paid';
    return 'Pending';
};

const StatusBadge = ({ order }) => {
    const s = getStatus(order);
    if (s === 'Delivered') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700"><CheckCircle size={11} />Delivered</span>;
    if (s === 'Paid') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700"><Truck size={11} />Paid</span>;
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700"><Clock size={11} />Pending</span>;
};

const Orders = () => {
    const dispatch = useDispatch();
    const { adminOrders, adminLoading } = useSelector(s => s.product);

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [expanded, setExpanded] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => { dispatch(adminFetchOrders()); }, [dispatch]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleUpdateStatus = async (orderId, payload) => {
        setUpdating(orderId);
        try {
            await dispatch(adminUpdateOrderStatus({ id: orderId, ...payload })).unwrap();
            showToast('Order status updated');
        } catch {
            showToast('Failed to update status', 'error');
        } finally {
            setUpdating(null);
        }
    };

    const filtered = adminOrders.filter(o => {
        const q = search.toLowerCase();
        const matchSearch = !q
            || o._id.toLowerCase().includes(q)
            || (o.user?.name || '').toLowerCase().includes(q);
        const matchFilter = filter === 'All' || getStatus(o) === filter;
        return matchSearch && matchFilter;
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
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <p className="text-sm text-gray-400 mt-0.5">{adminOrders.length} total orders</p>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID or customer…"
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black transition-colors" />
                </div>
                <div className="flex gap-2">
                    {STATUS_FILTERS.map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${filter === f ? 'bg-black text-white' : 'border border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {adminLoading ? (
                    <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
                        <Loader2 size={20} className="animate-spin" /> Loading orders…
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
                        <ShoppingBag size={36} className="opacity-30" />
                        <p className="text-sm">{adminOrders.length === 0 ? 'No orders yet.' : 'No orders match your search.'}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {sorted.map(order => {
                            const isExpanded = expanded === order._id;
                            const status = getStatus(order);
                            return (
                                <div key={order._id}>
                                    {/* Row */}
                                    <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr_auto_auto] items-center gap-4 px-6 py-4 hover:bg-gray-50/70 transition-colors">
                                        <div>
                                            <p className="text-xs font-mono font-semibold text-gray-700">#{order._id.slice(-8).toUpperCase()}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                                            <p className="text-xs text-gray-400 truncate max-w-[160px]">{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">{order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">${order.totalPrice?.toFixed(2)}</p>
                                        <StatusBadge order={order} />
                                        <div className="flex items-center gap-1.5">
                                            {/* Actions */}
                                            {status === 'Pending' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order._id, { isPaid: true })}
                                                    disabled={updating === order._id}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50">
                                                    {updating === order._id ? <Loader2 size={11} className="animate-spin" /> : 'Mark Paid'}
                                                </button>
                                            )}
                                            {status === 'Paid' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order._id, { isDelivered: true })}
                                                    disabled={updating === order._id}
                                                    className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50">
                                                    {updating === order._id ? <Loader2 size={11} className="animate-spin" /> : 'Mark Delivered'}
                                                </button>
                                            )}
                                            <button onClick={() => setExpanded(isExpanded ? null : order._id)}
                                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded items */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden bg-gray-50 border-t border-gray-100">
                                                <div className="px-6 py-4">
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Order Items</p>
                                                    <div className="space-y-2">
                                                        {order.orderItems?.map((item, i) => (
                                                            <div key={i} className="flex items-center gap-3">
                                                                {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-white border border-gray-200" />}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                                                                    <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                                                                </div>
                                                                <p className="text-sm font-semibold text-gray-900">${(item.price * item.qty).toFixed(2)}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                                                        <span className="text-xs text-gray-500">Shipping: ${order.shippingPrice?.toFixed(2) || '0.00'}</span>
                                                        <span className="text-sm font-bold text-gray-900">Total: ${order.totalPrice?.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
