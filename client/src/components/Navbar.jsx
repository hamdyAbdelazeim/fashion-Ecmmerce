import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search, Globe, LogOut } from 'lucide-react';
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
    const { t, lang, changeLanguage } = useTranslation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setIsOpen(false); }, [location]);

    const handleLogout = () => {
        dispatch(logout());
        window.location.href = '/login';
    };

    // Language toggle pill — reused in desktop and mobile
    const LangToggle = () => (
        <div className={`flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-0.5 ${scrolled || isOpen ? 'border-gray-200 bg-gray-50' : ''}`}>
            <Globe size={12} className="text-gray-400 ml-1 flex-shrink-0" />
            {['EN', 'DE'].map((l) => (
                <button
                    key={l}
                    onClick={() => changeLanguage(l)}
                    aria-pressed={lang === l}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold tracking-wider transition-all duration-200 ${
                        lang === l
                            ? 'bg-black text-white'
                            : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    {l}
                </button>
            ))}
        </div>
    );

    // Avatar bubble — initials or photo
    const AvatarBubble = ({ size = 8 }) => {
        const px = { 7: 'w-7 h-7', 8: 'w-8 h-8', 9: 'w-9 h-9' }[size] || 'w-8 h-8';
        if (user?.avatar) {
            return (
                <img src={user.avatar} alt={user.name}
                    className={`${px} rounded-full object-cover border border-gray-200 shadow-sm`} />
            );
        }
        const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        return (
            <div className={`${px} bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 border border-gray-200`}>
                {initials}
            </div>
        );
    };

    const navBg = scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5';

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${navBg}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" className="text-xl sm:text-2xl font-serif font-bold tracking-tighter flex-shrink-0">
                        LUXE<span className="text-accent">.</span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex space-x-6 lg:space-x-8 items-center">
                        <Link to="/" className="text-sm font-medium hover:text-accent transition-colors uppercase">{t.home}</Link>
                        <Link to="/shop?department=Women" className="text-sm font-medium hover:text-accent transition-colors uppercase">{t.women}</Link>
                        <Link to="/shop?department=Men" className="text-sm font-medium hover:text-accent transition-colors uppercase">{t.men}</Link>
                        <Link to="/shop?department=Kids" className="text-sm font-medium hover:text-accent transition-colors uppercase">{t.kids}</Link>
                    </div>

                    {/* Desktop right icons */}
                    <div className="hidden md:flex items-center space-x-4 lg:space-x-5">
                        {/* Language switcher */}
                        <LangToggle />

                        <button className="hover:text-accent transition-colors" aria-label="Search">
                            <Search size={20} />
                        </button>

                        {/* User / login */}
                        {user ? (
                            <div className="relative group">
                                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                    <AvatarBubble size={8} />
                                    <span className="text-sm font-medium hidden lg:block">{user.name.split(' ')[0]}</span>
                                </button>
                                {/* Hover dropdown */}
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
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
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={14} />
                                        {t.signOut}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="hover:text-accent transition-colors" aria-label="Account">
                                <User size={20} />
                            </Link>
                        )}

                        {/* Cart */}
                        <button onClick={() => dispatch(toggleCart())} className="relative hover:text-accent transition-colors" aria-label="Cart">
                            <ShoppingBag size={20} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* ── Mobile header bar: cart + hamburger ── */}
                    <div className="md:hidden flex items-center gap-3">
                        {/* Cart visible in header on mobile */}
                        <button
                            onClick={() => dispatch(toggleCart())}
                            className="relative hover:text-accent transition-colors"
                            aria-label="Cart"
                        >
                            <ShoppingBag size={22} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>

                        {/* Hamburger */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-primary hover:text-accent focus:outline-none p-1"
                            aria-label={isOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={isOpen}
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile slide-down menu ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-3 pb-5 space-y-0.5">

                            {/* Nav links */}
                            <Link to="/" className="block px-3 py-2.5 text-sm font-semibold hover:text-accent hover:bg-gray-50 rounded-lg uppercase tracking-wide">{t.home}</Link>
                            <Link to="/shop?department=Women" className="block px-3 py-2.5 text-sm font-semibold hover:text-accent hover:bg-gray-50 rounded-lg uppercase tracking-wide">{t.women}</Link>
                            <Link to="/shop?department=Men" className="block px-3 py-2.5 text-sm font-semibold hover:text-accent hover:bg-gray-50 rounded-lg uppercase tracking-wide">{t.men}</Link>
                            <Link to="/shop?department=Kids" className="block px-3 py-2.5 text-sm font-semibold hover:text-accent hover:bg-gray-50 rounded-lg uppercase tracking-wide">{t.kids}</Link>

                            {/* Language switcher */}
                            <div className="border-t border-gray-100 pt-3 mt-2 px-3">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Language</p>
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1 w-fit">
                                    <Globe size={13} className="text-gray-400 ml-1.5" />
                                    {['EN', 'DE'].map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => changeLanguage(l)}
                                            aria-pressed={lang === l}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 ${
                                                lang === l ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-800'
                                            }`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Account section */}
                            <div className="border-t border-gray-100 pt-3 mt-2 space-y-0.5">
                                {user ? (
                                    <>
                                        {/* User info card */}
                                        <div className="flex items-center gap-3 px-3 py-2 mb-1">
                                            <AvatarBubble size={9} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-accent hover:bg-gray-50 rounded-lg"
                                        >
                                            <User size={16} />
                                            {t.myProfile}
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <LogOut size={16} />
                                            {t.signOut}
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-accent hover:bg-gray-50 rounded-lg"
                                    >
                                        <User size={16} />
                                        Account
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
