import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleCart } from '../store/cartSlice';
import { logout } from '../store/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import useTranslation from '../hooks/useTranslation';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();
    const { t } = useTranslation();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    // Avatar: photo if saved, otherwise initials
    const AvatarBubble = ({ size = 8 }) => {
        const sizeClass = `w-${size} h-${size}`;
        if (user?.avatar) {
            return (
                <img
                    src={user.avatar}
                    alt={user.name}
                    className={`${sizeClass} rounded-full object-cover border border-gray-200 shadow-sm`}
                />
            );
        }
        const initials = (user?.name || 'U')
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        return (
            <div className={`${sizeClass} bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 border border-gray-200`}>
                {initials}
            </div>
        );
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" className="text-2xl font-serif font-bold tracking-tighter">
                        LUXE<span className="text-accent">.</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link to="/" className="text-sm font-medium hover:text-accent transition-colors uppercase">{t.home}</Link>
                        <Link to="/shop?department=Women" className="text-sm font-medium hover:text-accent transition-colors uppercase">{t.women}</Link>
                        <Link to="/shop?department=Men" className="text-sm font-medium hover:text-accent transition-colors uppercase">{t.men}</Link>
                        <Link to="/shop?department=Kids" className="text-sm font-medium hover:text-accent transition-colors uppercase">{t.kids}</Link>
                    </div>

                    {/* Icons */}
                    <div className="hidden md:flex items-center space-x-6">
                        <button className="hover:text-accent transition-colors"><Search size={20} /></button>

                        {/* User Profile / Login */}
                        {user ? (
                            <div className="relative group">
                                <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                                    <AvatarBubble size={8} />
                                    <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                                </Link>
                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2.5">
                                            <AvatarBubble size={8} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">{t.myProfile}</Link>
                                    <button
                                        onClick={() => {
                                            dispatch(logout());
                                            window.location.href = '/login';
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 transition-colors"
                                    >
                                        {t.signOut}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="hover:text-accent transition-colors"><User size={20} /></Link>
                        )}

                        <button onClick={() => dispatch(toggleCart())} className="relative hover:text-accent transition-colors">
                            <ShoppingBag size={20} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-primary hover:text-accent focus:outline-none">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100"
                    >
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            <Link to="/" className="block px-3 py-2 text-base font-medium hover:text-accent hover:bg-gray-50 rounded-md uppercase">{t.home}</Link>
                            <Link to="/shop?department=Women" className="block px-3 py-2 text-base font-medium hover:text-accent hover:bg-gray-50 rounded-md uppercase">{t.women}</Link>
                            <Link to="/shop?department=Men" className="block px-3 py-2 text-base font-medium hover:text-accent hover:bg-gray-50 rounded-md uppercase">{t.men}</Link>
                            <Link to="/shop?department=Kids" className="block px-3 py-2 text-base font-medium hover:text-accent hover:bg-gray-50 rounded-md uppercase">{t.kids}</Link>
                            <div className="border-t border-gray-100 pt-4 mt-2 space-y-1">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 px-3 py-2">
                                            <AvatarBubble size={9} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <Link to="/profile" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-accent hover:bg-gray-50 rounded-md">{t.myProfile}</Link>
                                        <button
                                            onClick={() => { dispatch(logout()); window.location.href = '/login'; }}
                                            className="block w-full text-left px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-md"
                                        >
                                            {t.signOut}
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:text-accent hover:bg-gray-50 rounded-md"><User size={18} /> <span>Account</span></Link>
                                )}
                                <button onClick={() => dispatch(toggleCart())} className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:text-accent hover:bg-gray-50 rounded-md w-full">
                                    <ShoppingBag size={18} />
                                    <span>Cart</span>
                                    {cartItems.length > 0 && (
                                        <span className="ml-auto bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartItems.length}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
