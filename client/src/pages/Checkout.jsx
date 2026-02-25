import { useState } from 'react';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import Spinner from '../components/Spinner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const Checkout = () => {
    const { cartItems } = useSelector((state) => state.cart);
    const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const { user } = useSelector((state) => state.auth);
    const [shippingInfo, setShippingInfo] = useState({
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ')[1] || '',
        email: user?.email || '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!shippingInfo.firstName.trim()) newErrors.firstName = 'First Name is required';
        if (!shippingInfo.lastName.trim()) newErrors.lastName = 'Last Name is required';
        if (!shippingInfo.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
        if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
        if (!shippingInfo.postalCode.trim()) newErrors.postalCode = 'Postal Code is required';
        if (!shippingInfo.country.trim()) newErrors.country = 'Country is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCheckout = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const stripe = await stripePromise;
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await axios.post(`${baseUrl}/api/orders/create-checkout-session`, {
                cartItems,
                userId: user?._id,
                email: shippingInfo.email, // Use email from form
                shipping: shippingInfo // Send full shipping info if backend supports it
            });

            const result = await stripe.redirectToCheckout({
                sessionId: response.data.id,
            });

            if (result.error) {
                console.error(result.error.message);
                alert(result.error.message);
            }
        } catch (error) {
            console.error('Checkout Error:', error);
            alert(error.response?.data?.message || 'Checkout failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                    <a href="/shop" className="text-accent underline">Continue Shopping</a>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 min-h-screen bg-gray-50 px-4 pb-12">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {cartItems.map((item) => (
                            <div key={`${item._id}-${item.selectedSize}-${item.selectedColor?.name}`} className="flex gap-4 py-4 border-b last:border-0">
                                <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-sm text-gray-500">{item.selectedColor?.name} | {item.selectedSize}</p>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-sm">Qty: {item.qty}</span>
                                        <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 border-t pt-4 space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span>Calculated at next step</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl pt-2 border-t mt-2">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Shipping & Payment */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-bold mb-4">Shipping Information</h2>
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={shippingInfo.firstName}
                                        onChange={handleChange}
                                        placeholder="First Name"
                                        className={`w-full p-2 border rounded ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={shippingInfo.lastName}
                                        onChange={handleChange}
                                        placeholder="Last Name"
                                        className={`w-full p-2 border rounded ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                                </div>
                            </div>
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    value={shippingInfo.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    name="address"
                                    value={shippingInfo.address}
                                    onChange={handleChange}
                                    placeholder="Address"
                                    className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        name="city"
                                        value={shippingInfo.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={shippingInfo.postalCode}
                                        onChange={handleChange}
                                        placeholder="Postal Code"
                                        className={`w-full p-2 border rounded ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                                </div>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    name="country"
                                    value={shippingInfo.country}
                                    onChange={handleChange}
                                    placeholder="Country"
                                    className={`w-full p-2 border rounded ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                        <p className="text-sm text-gray-500 mb-4">All transactions are secure and encrypted.</p>
                        <button
                            onClick={handleCheckout}
                            disabled={isLoading}
                            className="w-full bg-black text-white py-4 rounded-md hover:bg-gray-800 disabled:opacity-50 font-bold transition-all flex items-center justify-center gap-3"
                        >
                            {isLoading && <Spinner size="sm" />}
                            {isLoading ? 'Processing…' : 'Pay with Stripe'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
