import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';

const DURATION = 3000; // ms before auto-dismiss

// Animated SVG checkmark
const Checkmark = () => (
    <motion.svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
    >
        {/* Circle */}
        <motion.circle
            cx="10"
            cy="10"
            r="9"
            stroke="#22c55e"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        {/* Tick */}
        <motion.path
            d="M6 10l3 3 5-5"
            stroke="#22c55e"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.25 }}
        />
    </motion.svg>
);

const CartToast = ({ product, onDismiss }) => {
    const [paused, setPaused] = useState(false);
    const progressRef = useRef(null);

    // CSS-animation-based progress bar — pauseable via animationPlayState
    useEffect(() => {
        const el = progressRef.current;
        if (!el) return;
        // Start the shrink animation
        el.style.animation = `toast-progress ${DURATION}ms linear forwards`;
        el.style.animationPlayState = 'running';
    }, []);

    useEffect(() => {
        if (!progressRef.current) return;
        progressRef.current.style.animationPlayState = paused ? 'paused' : 'running';
    }, [paused]);

    // Auto-dismiss when animation ends
    const handleAnimationEnd = () => onDismiss();

    const imgSrc = product.images?.[0];
    const size = product.sizes?.[0];
    const color = product.colors?.[0]?.name;
    const colorHex = product.colors?.[0]?.hex;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 80, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.88, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 480, damping: 38 }}
            className="pointer-events-auto w-[320px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            role="status"
        >
            {/* Top accent line */}
            <div className="h-0.5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />

            <div className="flex items-center gap-3 px-4 py-3">
                {/* Product thumbnail */}
                <div className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                    {imgSrc ? (
                        <img
                            src={imgSrc}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={20} className="text-gray-300" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Checkmark />
                        <span className="text-xs font-bold tracking-widest text-green-600 uppercase">
                            Added to cart
                        </span>
                    </div>

                    <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                        {product.name}
                    </p>

                    {(size || color) && (
                        <div className="flex items-center gap-2 mt-1">
                            {size && (
                                <span className="text-[11px] text-gray-400 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 font-medium">
                                    {size}
                                </span>
                            )}
                            {color && colorHex && (
                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                    <span
                                        className="inline-block w-2.5 h-2.5 rounded-full border border-black/10"
                                        style={{ backgroundColor: colorHex }}
                                    />
                                    {color}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Dismiss button */}
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 p-1 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Dismiss notification"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-gray-100">
                <div
                    ref={progressRef}
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 origin-left"
                    onAnimationEnd={handleAnimationEnd}
                    style={{ willChange: 'transform' }}
                />
            </div>

            {/* Keyframe injection */}
            <style>{`
                @keyframes toast-progress {
                    from { transform: scaleX(1); }
                    to   { transform: scaleX(0); }
                }
            `}</style>
        </motion.div>
    );
};

export default CartToast;
