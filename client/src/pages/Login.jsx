import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login, reset } from '../store/authSlice';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';

const Login = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [shake, setShake] = useState(false);

    const { email, password } = formData;

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

    const redirect = location.search ? location.search.split('=')[1] : '/';

    useEffect(() => {
        if (isSuccess || user) {
            if (user?.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate(redirect);
            }
        }

        if (isError && message) {
            setErrors({ server: message });
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
        // Clear that field's error as the user types
        setErrors(prev => ({ ...prev, [name]: '', server: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!password) {
            newErrors.password = 'Password is required';
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
        dispatch(login({ email, password }));
    };

    const inputClass = (field) =>
        `w-full bg-white/10 border rounded-lg px-4 py-3 text-white placeholder-gray-300
        focus:outline-none focus:ring-2 focus:border-transparent transition-all
        ${errors[field]
            ? 'border-red-400 focus:ring-red-400/50'
            : 'border-white/30 focus:ring-accent'
        }`;

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gray-50 bg-cover bg-center"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <motion.div
                animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="relative bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
            >
                <h2 className="text-3xl font-serif font-bold text-white text-center mb-8">{t.welcomeBack}</h2>

                <form onSubmit={onSubmit} className="space-y-5" noValidate>

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
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-1.5 mt-1.5 text-red-300 text-xs font-medium"
                            >
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
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-1.5 mt-1.5 text-red-300 text-xs font-medium"
                            >
                                <AlertCircle size={12} /> {errors.password}
                            </motion.p>
                        )}
                    </div>

                    {/* Server error (wrong credentials) */}
                    {errors.server && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-2.5 bg-red-500/20 border border-red-400/40 rounded-lg px-4 py-3"
                        >
                            <AlertCircle size={15} className="text-red-300 mt-0.5 flex-shrink-0" />
                            <p className="text-red-200 text-sm">{errors.server}</p>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-accent hover:bg-white hover:text-accent text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t.signingIn : t.signIn}
                    </button>
                </form>

                <div className="mt-8 text-center text-gray-300">
                    <p>{t.noAccount} <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="text-white font-bold hover:underline">{t.signUp}</Link></p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
