import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import confetti from 'canvas-confetti';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/orders';

const Success = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (!sessionId) return;

        dispatch(clearCart());
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

        // Confirm the order server-side so it shows in order history
        if (user?.token) {
            setConfirming(true);
            axios.post(`${API_URL}/confirm`, { sessionId }, {
                headers: { Authorization: `Bearer ${user.token}` },
            }).catch(() => {
                // Non-fatal — order history will show as "Payment Pending" until confirmed
            }).finally(() => setConfirming(false));
        }
    }, [sessionId, dispatch, user]);

    return (
        <div className="min-h-screen pt-24 bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
                <p className="text-gray-600 mb-8">
                    Thank you for your purchase. We'll send you an email with your order details shortly.
                </p>
                <div className="space-y-4">
                    <Link
                        to="/shop"
                        className="block w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                    <Link
                        to="/profile?tab=orders"
                        className="block w-full border border-gray-300 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                    >
                        {confirming ? 'Saving order…' : 'View My Orders'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Success;
