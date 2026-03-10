import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { forgotPassword, reset } from '../store/authSlice';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const dispatch = useDispatch();
    const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isSuccess && message) {
            setSubmitted(true);
        }
        dispatch(reset());
    }, [isSuccess, isError, message, dispatch]);

    const onSubmit = (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        dispatch(forgotPassword(email.trim().toLowerCase()));
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

                <h2 className="text-3xl font-serif font-bold text-white mb-2">Forgot password?</h2>
                <p className="text-gray-300 text-sm mb-8">
                    Enter your email and we'll send you a link to reset your password.
                </p>

                {submitted ? (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 bg-green-500/20 border border-green-400/40 rounded-xl px-5 py-4"
                    >
                        <CheckCircle size={20} className="text-green-300 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-green-200 font-semibold text-sm">Check your inbox</p>
                            <p className="text-green-300/80 text-sm mt-1">
                                If <strong>{email}</strong> is registered, you'll receive a reset link within a few minutes.
                                Check your spam folder if you don't see it.
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email address"
                                required
                                autoComplete="email"
                                className="w-full bg-white/10 border border-white/30 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                            />
                        </div>

                        {isError && message && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 bg-red-500/20 border border-red-400/40 rounded-lg px-4 py-3"
                            >
                                <AlertCircle size={15} className="text-red-300 flex-shrink-0" />
                                <p className="text-red-200 text-sm">{message}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !email.trim()}
                            className="w-full bg-accent hover:bg-white hover:text-accent text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending…' : 'Send reset link'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
