import { useState, useRef, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Save, X, Globe, ChevronDown, Search,
    User, Mail, Phone, MapPin, Lock, Bell, Shield,
    Check, Loader2,
} from 'lucide-react';
import { updateProfile, reset } from '../store/authSlice';
import useTranslation from '../hooks/useTranslation';

// ─── Countries ────────────────────────────────────────────────────────────────
const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'AT', name: 'Austria', flag: '🇦🇹' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
];

// ─── Toggle ───────────────────────────────────────────────────────────────────
const Toggle = ({ enabled, onToggle }) => (
    <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none ${enabled ? 'bg-black' : 'bg-gray-200'
            }`}
    >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
        />
    </button>
);

// ─── Clean Input ──────────────────────────────────────────────────────────────
const CleanInput = ({ icon: Icon, type = 'text', placeholder, value, onChange, id }) => (
    <div className="relative group">
        {Icon && (
            <Icon
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors duration-200"
            />
        )}
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full bg-white border border-gray-200 rounded-lg py-2.5 text-sm text-gray-900 placeholder-gray-400
        focus:outline-none focus:border-black focus:ring-0
        transition-colors duration-200 ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
        />
    </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2.5 mb-5">
        <Icon size={15} className="text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-500 tracking-widest uppercase">{title}</h3>
        <div className="flex-1 h-px bg-gray-100" />
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Profile = () => {
    const dispatch = useDispatch();
    const { user, isLoading, isSuccess, isError, message } = useSelector((state) => state.auth);

    const { t, lang, changeLanguage } = useTranslation();

    // Avatar — start from what's already saved in the user object
    const [avatarSrc, setAvatarSrc] = useState(user?.avatar || null);
    const [avatarHover, setAvatarHover] = useState(false);
    const fileInputRef = useRef(null);

    const [countryOpen, setCountryOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(
        user?.country ? { code: '', name: user.country, flag: user.countryFlag || '' } : null
    );

    const [notifications, setNotifications] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);

    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [activeTab, setActiveTab] = useState('profile');

    const [form, setForm] = useState({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Sync form when Redux user updates (e.g. after save)
    useEffect(() => {
        if (user) {
            setForm((f) => ({
                ...f,
                name: user.name || f.name,
                username: user.username || f.username,
                email: user.email || f.email,
                phone: user.phone || f.phone,
                bio: user.bio || f.bio,
            }));
            if (user.avatar) setAvatarSrc(user.avatar);
            if (user.country) {
                setSelectedCountry({ code: '', name: user.country, flag: user.countryFlag || '' });
            }
        }
    }, [user]);

    // Show saved toast when Redux reports success
    useEffect(() => {
        if (isSuccess) {
            setSaved(true);
            setSaveError('');
            const timer = setTimeout(() => {
                setSaved(false);
                dispatch(reset());
            }, 2500);
            return () => clearTimeout(timer);
        }
        if (isError) {
            setSaveError(message);
            dispatch(reset());
        }
    }, [isSuccess, isError, message, dispatch]);

    const handleField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleAvatarChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Resize to max 300px before storing as base64 to keep payload small
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const MAX = 300;
                const scale = Math.min(MAX / img.width, MAX / img.height, 1);
                const canvas = document.createElement('canvas');
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                setAvatarSrc(dataUrl);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }, []);

    const filteredCountries = countries.filter((c) =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase())
    );

    const handleSave = () => {
        setSaveError('');

        // Validate passwords if user is trying to change them
        if (form.newPassword || form.confirmPassword) {
            if (form.newPassword !== form.confirmPassword) {
                setSaveError(t.errorPw);
                return;
            }
        }

        const payload = {
            name: form.name,
            username: form.username,
            phone: form.phone,
            bio: form.bio,
            country: selectedCountry?.name || '',
            countryFlag: selectedCountry?.flag || '',
            avatar: avatarSrc || '',
        };

        if (form.newPassword) {
            payload.currentPassword = form.currentPassword;
            payload.newPassword = form.newPassword;
        }

        dispatch(updateProfile(payload));
    };

    const handleCancel = () => {
        // Reset form to last saved user data
        if (user) {
            setForm({
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setAvatarSrc(user.avatar || null);
            setSelectedCountry(
                user.country ? { code: '', name: user.country, flag: user.countryFlag || '' } : null
            );
        }
        setSaveError('');
    };

    const initials = (user?.name || 'U')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-16">

            {/* ── Banner ── */}
            <div className="relative h-52 bg-gray-100 overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,0,0,0.03) 39px, rgba(0,0,0,0.03) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,0,0,0.03) 39px, rgba(0,0,0,0.03) 40px)',
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(245,240,235,0.9) 0%, rgba(230,225,220,0.6) 50%, rgba(215,210,205,0.4) 100%)',
                    }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent" />
            </div>

            {/* ── Content wrapper ── */}
            <div className="max-w-3xl mx-auto px-4 -mt-16 relative">

                {/* ── Avatar + Name row ── */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-end gap-5 mb-8"
                >
                    {/* Avatar */}
                    <div
                        className="relative w-28 h-28 flex-shrink-0 cursor-pointer"
                        onMouseEnter={() => setAvatarHover(true)}
                        onMouseLeave={() => setAvatarHover(false)}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-full h-full rounded-full overflow-hidden bg-white border-4 border-white shadow-md flex items-center justify-center">
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-gray-700 select-none font-serif">
                                    {initials}
                                </span>
                            )}
                        </div>
                        <AnimatePresence>
                            {avatarHover && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute inset-0 rounded-full flex flex-col items-center justify-center gap-1 border-4 border-white"
                                    style={{ background: 'rgba(0,0,0,0.45)' }}
                                >
                                    <Camera size={18} className="text-white" />
                                    <span className="text-white text-[10px] font-semibold tracking-wide">
                                        {t.editPhoto}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        id="avatar-upload"
                    />

                    {/* Name + email */}
                    <div className="pb-1">
                        <h1 className="text-2xl font-bold text-gray-900 font-serif leading-tight">
                            {user?.name || 'Your Name'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
                        <span className="inline-block mt-2 text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-0.5 tracking-wide">
                            {t.member}
                        </span>
                    </div>

                    {/* Language switcher */}
                    <div className="ml-auto pb-1 flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                        <Globe size={13} className="text-gray-400 ml-1.5" />
                        {['EN', 'DE'].map((l) => (
                            <button
                                key={l}
                                onClick={() => changeLanguage(l)}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wider transition-all duration-200 ${lang === l ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* ── Tab Bar ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex border-b border-gray-200 mb-6"
                >
                    {[
                        { key: 'profile', label: t.publicProfile, icon: User },
                        { key: 'account', label: t.accountSettings, icon: Shield },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 -mb-px ${activeTab === key
                                    ? 'border-black text-black'
                                    : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </motion.div>

                {/* ── Main Card ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22 }}
                        className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
                    >
                        {activeTab === 'profile' ? (
                            <div className="space-y-5">
                                <SectionHeader icon={User} title={t.publicProfile} />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide uppercase">
                                            {t.fullName}
                                        </label>
                                        <CleanInput
                                            id="profile-name"
                                            icon={User}
                                            placeholder={t.namePlaceholder}
                                            value={form.name}
                                            onChange={handleField('name')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide uppercase">
                                            {t.username}
                                        </label>
                                        <CleanInput
                                            id="profile-username"
                                            placeholder={t.usernamePlaceholder}
                                            value={form.username}
                                            onChange={handleField('username')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide uppercase">
                                            {t.email}
                                        </label>
                                        <CleanInput
                                            id="profile-email"
                                            icon={Mail}
                                            type="email"
                                            placeholder={t.emailPlaceholder}
                                            value={form.email}
                                            onChange={handleField('email')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide uppercase">
                                            {t.phone}
                                        </label>
                                        <CleanInput
                                            id="profile-phone"
                                            icon={Phone}
                                            placeholder={t.phonePlaceholder}
                                            value={form.phone}
                                            onChange={handleField('phone')}
                                        />
                                    </div>
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide uppercase">
                                        {t.bio}
                                    </label>
                                    <textarea
                                        id="profile-bio"
                                        rows={3}
                                        placeholder={t.bioPlaceholder}
                                        value={form.bio}
                                        onChange={handleField('bio')}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400
                      focus:outline-none focus:border-black transition-colors duration-200 resize-none"
                                    />
                                </div>

                                {/* Country Selector */}
                                <div className="relative">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide uppercase">
                                        {t.region}
                                    </label>
                                    <button
                                        id="country-selector"
                                        onClick={() => setCountryOpen((o) => !o)}
                                        className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm
                      focus:outline-none hover:border-gray-400 transition-colors duration-200"
                                    >
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-gray-400" />
                                            {selectedCountry ? (
                                                <span className="text-gray-900 flex items-center gap-2">
                                                    <span>{selectedCountry.flag}</span>
                                                    <span>{selectedCountry.name}</span>
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">{t.searchRegion}</span>
                                            )}
                                        </div>
                                        <ChevronDown
                                            size={14}
                                            className={`text-gray-400 transition-transform duration-200 ${countryOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {countryOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                                            >
                                                <div className="p-2 border-b border-gray-100">
                                                    <div className="relative">
                                                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            id="country-search"
                                                            autoFocus
                                                            placeholder={t.searchRegion}
                                                            value={countrySearch}
                                                            onChange={(e) => setCountrySearch(e.target.value)}
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-52 overflow-y-auto py-1">
                                                    {filteredCountries.map((c) => (
                                                        <button
                                                            key={c.code}
                                                            onClick={() => {
                                                                setSelectedCountry(c);
                                                                setCountryOpen(false);
                                                                setCountrySearch('');
                                                            }}
                                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-100 ${selectedCountry?.name === c.name ? 'text-black font-medium' : 'text-gray-700'
                                                                }`}
                                                        >
                                                            <span className="text-base">{c.flag}</span>
                                                            <span>{c.name}</span>
                                                            {selectedCountry?.name === c.name && (
                                                                <Check size={13} className="ml-auto text-black" />
                                                            )}
                                                        </button>
                                                    ))}
                                                    {filteredCountries.length === 0 && (
                                                        <p className="text-center text-gray-400 text-sm py-4">No results</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Password */}
                                <div>
                                    <SectionHeader icon={Lock} title={t.accountSettings} />
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide uppercase">
                                                {t.currentPassword}
                                            </label>
                                            <CleanInput
                                                id="current-password"
                                                icon={Lock}
                                                type="password"
                                                placeholder={t.currentPwPlaceholder}
                                                value={form.currentPassword}
                                                onChange={handleField('currentPassword')}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide uppercase">
                                                    {t.newPassword}
                                                </label>
                                                <CleanInput
                                                    id="new-password"
                                                    icon={Lock}
                                                    type="password"
                                                    placeholder={t.newPwPlaceholder}
                                                    value={form.newPassword}
                                                    onChange={handleField('newPassword')}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 tracking-wide uppercase">
                                                    {t.confirmPassword}
                                                </label>
                                                <CleanInput
                                                    id="confirm-password"
                                                    icon={Lock}
                                                    type="password"
                                                    placeholder={t.confirmPwPlaceholder}
                                                    value={form.confirmPassword}
                                                    onChange={handleField('confirmPassword')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Preferences */}
                                <div>
                                    <SectionHeader icon={Bell} title={t.notifications} />
                                    <div className="space-y-3">
                                        {[
                                            {
                                                id: 'toggle-notifications',
                                                label: t.notifications,
                                                desc: t.notificationsDesc,
                                                value: notifications,
                                                toggle: () => setNotifications((v) => !v),
                                            },
                                            {
                                                id: 'toggle-2fa',
                                                label: t.twoFactor,
                                                desc: t.twoFactorDesc,
                                                value: twoFactor,
                                                toggle: () => setTwoFactor((v) => !v),
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors duration-200"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                                                </div>
                                                <Toggle enabled={item.value} onToggle={item.toggle} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* ── Footer ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between mt-5 gap-4"
                >
                    {/* Status messages */}
                    <div className="flex-1">
                        <AnimatePresence>
                            {saved && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium"
                                >
                                    <Check size={14} />
                                    {t.saved}
                                </motion.div>
                            )}
                            {saveError && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="text-red-500 text-sm font-medium"
                                >
                                    {saveError}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            id="cancel-btn"
                            onClick={handleCancel}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200
                hover:border-gray-400 hover:text-gray-800 transition-all duration-200 disabled:opacity-40"
                        >
                            <span className="flex items-center gap-2">
                                <X size={13} />
                                {t.cancel}
                            </span>
                        </motion.button>

                        <motion.button
                            id="save-btn"
                            onClick={handleSave}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-black
                hover:bg-gray-800 transition-colors duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center gap-2">
                                {isLoading ? (
                                    <Loader2 size={13} className="animate-spin" />
                                ) : (
                                    <Save size={13} />
                                )}
                                {isLoading ? t.saving : t.save}
                            </span>
                        </motion.button>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default Profile;
