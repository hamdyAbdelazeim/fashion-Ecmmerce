import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { resetPassword, reset } from '../store/authSlice';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [localError, setLocalError] = useState('');
    const [done, setDone] = useState(false);

    const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isSuccess && message) {
            setDone(true);
            setTimeout(() => navigate('/login'), 3000);
        }
        dispatch(reset());
    }, [isSuccess, isError, message, dispatch, navigate]);

    const passwordStrength = () => {
        if (!password) return null;
        if (password.length < 6) return { label: 'Too short', color: 'bg-red-400', width: 'w-1/4' };
        if (password.length < 8) return { label: 'Weak', color: 'bg-orange-400', width: 'w-2/4' };
        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Fair', color: 'bg-yellow-400', width: 'w-3/4' };
        return { label: 'Strong', color: 'bg-green-400', width: 'w-full' };
    };

    const strength = passwordStrength();

    const onSubmit = (e) => {
        e.preventDefault();
        setLocalError('');
        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }
        dispatch(resetPassword({ token, password }));
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=75&fm=webp")' }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
            >
                <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm mb-6 transition-colors"
                >
                    <ArrowLeft size={15} /> Back to login
                </Link>

                <h2 className="text-3xl font-serif font-bold text-white mb-2">Set new password</h2>
                <p className="text-gray-300 text-sm mb-8">
                    Choose a strong password for your account.
                </p>

                {done ? (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 bg-green-500/20 border border-green-400/40 rounded-xl px-5 py-4"
                    >
                        <CheckCircle size={20} className="text-green-300 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-green-200 font-semibold text-sm">Password updated!</p>
                            <p className="text-green-300/80 text-sm mt-1">
                                Your password has been reset. Redirecting you to login…
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-5">
                        {/* New password */}
                        <div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="New password"
                                    required
                                    autoComplete="new-password"
                                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 pr-12 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {strength && (
                                <div className="mt-2 space-y-1">
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                                    </div>
                                    <p className="text-xs text-gray-300">{strength.label} password</p>
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                autoComplete="new-password"
                                className="w-full bg-white/10 border border-white/30 rounded-lg px-4 pr-12 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Errors */}
                        {(localError || (isError && message)) && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 bg-red-500/20 border border-red-400/40 rounded-lg px-4 py-3"
                            >
                                <AlertCircle size={15} className="text-red-300 flex-shrink-0" />
                                <p className="text-red-200 text-sm">{localError || message}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-accent hover:bg-white hover:text-accent text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Updating…' : 'Reset password'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
