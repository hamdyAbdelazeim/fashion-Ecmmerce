import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const AdminLayout = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex-shrink-0">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold font-serif">Admin</h1>
                </div>
                <nav className="p-4 space-y-2">
                    <Link
                        to="/admin/dashboard"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${isActive('/admin/dashboard') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        to="/admin/products"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${isActive('/admin/products') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Package size={20} />
                        <span>Products</span>
                    </Link>
                    <Link
                        to="/admin/orders"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${isActive('/admin/orders') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <ShoppingCart size={20} />
                        <span>Orders</span>
                    </Link>
                    <Link
                        to="/admin/users"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${isActive('/admin/users') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Users size={20} />
                        <span>Users</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-red-600 hover:bg-red-50 transition-colors mt-8"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
