import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { fetchProfile } from './store/authSlice';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import Footer from './components/Footer';
import Spinner from './components/Spinner';

// Lazy-loaded pages — each becomes its own JS chunk (code splitting)
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Success = lazy(() => import('./pages/Success'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin pages — loaded only when the user visits /admin/*
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Products = lazy(() => import('./pages/admin/Products'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Users = lazy(() => import('./pages/admin/Users'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppContent() {
  const dispatch = useDispatch();
  const { user, profileLoading } = useSelector((state) => state.auth);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (user?.token) {
      dispatch(fetchProfile());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Block rendering until the stored token is verified with the server.
  // This prevents a flash of stale auth state on hard-refresh.
  if (profileLoading) {
    return <Spinner fullscreen />;
  }

  return (
    <div className="min-h-screen bg-white">
      {!isAdmin && <Navbar />}
      {!isAdmin && <CartSidebar />}

      <Suspense fallback={<Spinner fullscreen />}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected User Routes */}
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="users" element={<Users />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>

      {!isAdmin && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  );
}

export default App;
