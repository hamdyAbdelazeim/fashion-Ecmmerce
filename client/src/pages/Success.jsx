import { Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import confetti from 'canvas-confetti';

const Success = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const dispatch = useDispatch();

    useEffect(() => {
        if (sessionId) {
            dispatch(clearCart());
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [sessionId, dispatch]);

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
                        to="/profile"
                        className="block w-full border border-gray-300 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                    >
                        View Order
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Success;
