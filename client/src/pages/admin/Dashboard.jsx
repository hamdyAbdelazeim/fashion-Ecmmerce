import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingBag, Package, Users, ArrowRight, CheckCircle, Clock, Truck } from 'lucide-react';
import { adminFetchStats, adminFetchOrders, adminFetchProducts, adminFetchUsers } from '../../store/productSlice';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon size={22} className="text-white" />
        </div>
        <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const statusBadge = (order) => {
    if (order.isDelivered) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700"><CheckCircle size={11} />Delivered</span>;
    if (order.isPaid) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700"><Truck size={11} />Shipped</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700"><Clock size={11} />Pending</span>;
};

const Dashboard = () => {
    const dispatch = useDispatch();
    const { adminStats, adminOrders, adminProducts, adminUsers } = useSelector((s) => s.product);
    const { user } = useSelector((s) => s.auth);

    useEffect(() => {
        dispatch(adminFetchStats());
        dispatch(adminFetchOrders());
        dispatch(adminFetchProducts());
        dispatch(adminFetchUsers());
    }, [dispatch]);

    const revenue = adminStats?.totalRevenue ?? adminOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const totalOrders = adminStats?.totalOrders ?? adminOrders.length;
    const totalProducts = adminStats?.totalProducts ?? adminProducts.length;
    const totalUsers = adminStats?.totalUsers ?? adminUsers.length;

    const recentOrders = [...adminOrders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const trendingProducts = adminProducts.filter(p => p.isTrending).slice(0, 4);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {greeting}, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-sm text-gray-400 mt-1">Here's what's happening with your store today.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard icon={TrendingUp} label="Total Revenue" value={`$${Number(revenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub="All time" color="bg-emerald-500" />
                <StatCard icon={ShoppingBag} label="Total Orders" value={totalOrders.toLocaleString()} sub="All time" color="bg-blue-500" />
                <StatCard icon={Package} label="Products" value={totalProducts.toLocaleString()} sub="In catalogue" color="bg-violet-500" />
                <StatCard icon={Users} label="Customers" value={totalUsers.toLocaleString()} sub="Registered" color="bg-rose-500" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent Orders</h2>
                        <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-black transition-colors">
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        {recentOrders.length === 0 ? (
                            <div className="py-16 text-center text-gray-400 text-sm">No orders yet.</div>
                        ) : (
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <th className="px-6 py-3 text-left">Order</th>
                                        <th className="px-6 py-3 text-left">Customer</th>
                                        <th className="px-6 py-3 text-left">Date</th>
                                        <th className="px-6 py-3 text-left">Total</th>
                                        <th className="px-6 py-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-xs font-mono text-gray-500">#{order._id.slice(-6).toUpperCase()}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.user?.name || '—'}</td>
                                            <td className="px-6 py-4 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">${order.totalPrice?.toFixed(2)}</td>
                                            <td className="px-6 py-4">{statusBadge(order)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Trending Products */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Trending</h2>
                        <Link to="/admin/products" className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-black transition-colors">
                            All products <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {trendingProducts.length === 0 ? (
                            <div className="py-16 text-center text-gray-400 text-sm">No trending products.</div>
                        ) : trendingProducts.map((p) => (
                            <div key={p._id} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                                <img
                                    src={p.images?.[0]}
                                    alt={p.name}
                                    className="w-12 h-12 object-cover rounded-xl flex-shrink-0 bg-gray-100"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                    <p className="text-xs text-gray-400">{p.department} · {p.category}</p>
                                </div>
                                <p className="text-sm font-bold text-gray-900 flex-shrink-0">${p.price?.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { to: '/admin/products', label: 'Manage Products', desc: `${totalProducts} items in catalogue`, icon: Package, color: 'bg-violet-50 text-violet-600' },
                    { to: '/admin/orders', label: 'Manage Orders', desc: `${totalOrders} total orders`, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
                    { to: '/admin/users', label: 'Manage Users', desc: `${totalUsers} registered users`, icon: Users, color: 'bg-rose-50 text-rose-600' },
                ].map(({ to, label, desc, icon: Icon, color }) => (
                    <Link key={to} to={to} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} flex-shrink-0`}>
                            <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-black">{label}</p>
                            <p className="text-xs text-gray-400">{desc}</p>
                        </div>
                        <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-gray-600 transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
