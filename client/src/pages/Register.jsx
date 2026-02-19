import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { register, reset } from '../store/authSlice';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';

const Register = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [shake, setShake] = useState(false);

    const { name, email, password, confirmPassword } = formData;

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

    const redirect = location.search ? location.search.split('=')[1] : '/';

    useEffect(() => {
        if (isSuccess || user) {
            navigate(redirect);
        }

        if (isError && message) {
            // Map server messages to the right field
            if (message.toLowerCase().includes('email') || message.toLowerCase().includes('exists')) {
                setErrors(prev => ({ ...prev, email: message }));
            } else {
                setErrors(prev => ({ ...prev, server: message }));
            }
            triggerShake();
        }

        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch, redirect]);

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '', server: '' }));
    };

    const validate = () => {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password && confirmPassword !== password) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            triggerShake();
            return;
        }
        dispatch(register({ name, email, password }));
    };

    const inputClass = (field) =>
        `w-full bg-white/10 border rounded-lg px-4 py-3 text-white placeholder-gray-300
        focus:outline-none focus:ring-2 focus:border-transparent transition-all
        ${errors[field]
            ? 'border-red-400 focus:ring-red-400/50'
            : 'border-white/30 focus:ring-accent'
        }`;

    const passwordStrength = () => {
        if (!password) return null;
        if (password.length < 6) return { label: 'Too short', color: 'bg-red-400', width: 'w-1/4' };
        if (password.length < 8) return { label: 'Weak', color: 'bg-orange-400', width: 'w-2/4' };
        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Fair', color: 'bg-yellow-400', width: 'w-3/4' };
        return { label: 'Strong', color: 'bg-green-400', width: 'w-full' };
    };

    const strength = passwordStrength();
    const passwordsMatch = confirmPassword && password === confirmPassword;

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gray-50 bg-cover bg-center"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1485230946086-1d99d529a763?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <motion.div
                animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="relative bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
            >
                <h2 className="text-3xl font-serif font-bold text-white text-center mb-8">{t.createAccount}</h2>

                <form onSubmit={onSubmit} className="space-y-4" noValidate>

                    {/* Full Name */}
                    <div>
                        <input
                            type="text"
                            className={inputClass('name')}
                            placeholder={t.fullName}
                            id="name"
                            name="name"
                            value={name}
                            onChange={onChange}
                            autoComplete="name"
                        />
                        {errors.name && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-1.5 mt-1.5 text-red-300 text-xs font-medium">
                                <AlertCircle size={12} /> {errors.name}
                            </motion.p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <input
                            type="email"
                            className={inputClass('email')}
                            placeholder={t.emailAddress}
                            id="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            autoComplete="email"
                        />
                        {errors.email && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-1.5 mt-1.5 text-red-300 text-xs font-medium">
                                <AlertCircle size={12} /> {errors.email}
                            </motion.p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className={inputClass('password') + ' pr-12'}
                                placeholder={t.password}
                                id="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                autoComplete="new-password"
                            />
                            <button type="button" onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {/* Strength bar */}
                        {strength && (
                            <div className="mt-2 space-y-1">
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}
                                    />
                                </div>
                                <p className="text-xs text-gray-300">{strength.label} password</p>
                            </div>
                        )}
                        {errors.password && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-1.5 mt-1.5 text-red-300 text-xs font-medium">
                                <AlertCircle size={12} /> {errors.password}
                            </motion.p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                className={inputClass('confirmPassword') + ' pr-12'}
                                placeholder={t.confirmPassword}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={onChange}
                                autoComplete="new-password"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {passwordsMatch && <CheckCircle size={14} className="text-green-400" />}
                                <button type="button" onClick={() => setShowConfirm(v => !v)}
                                    className="text-gray-300 hover:text-white transition-colors">
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        {errors.confirmPassword && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-1.5 mt-1.5 text-red-300 text-xs font-medium">
                                <AlertCircle size={12} /> {errors.confirmPassword}
                            </motion.p>
                        )}
                    </div>

                    {/* Server error */}
                    {errors.server && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-2.5 bg-red-500/20 border border-red-400/40 rounded-lg px-4 py-3">
                            <AlertCircle size={15} className="text-red-300 mt-0.5 flex-shrink-0" />
                            <p className="text-red-200 text-sm">{errors.server}</p>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-accent hover:bg-white hover:text-accent text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    >
                        {isLoading ? t.creatingAccount : t.signUp}
                    </button>
                </form>

                <div className="mt-6 text-center text-gray-300">
                    <p>{t.alreadyHaveAccount} <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="text-white font-bold hover:underline">{t.signIn}</Link></p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
