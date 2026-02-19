import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleCart, removeFromCart, addToCart, clearCart } from '../store/cartSlice'; // Added addToCart for quantity adjustment logic if needed, or implement qty update logic separately

const CartSidebar = () => {
    const { isCartOpen, cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleCheckout = () => {
        dispatch(toggleCart());
        if (user) {
            navigate('/checkout');
        } else {
            navigate('/login?redirect=/checkout');
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * (item.qty || 1), 0);

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => dispatch(toggleCart())}
                        className="fixed inset-0 bg-black/50 z-[60]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-xl z-[70] flex flex-col"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-serif font-bold">Shopping Cart ({cartItems.length})</h2>
                            <button
                                onClick={() => dispatch(toggleCart())}
                                className="text-gray-400 hover:text-black transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                    <p>Your cart is empty.</p>
                                    <button
                                        onClick={() => dispatch(toggleCart())}
                                        className="mt-4 text-accent font-medium hover:underline"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                <ul className="space-y-6">
                                    {cartItems.map((item, index) => (
                                        <li key={`${item._id}-${item.selectedSize}-${item.selectedColor.name}-${index}`} className="flex py-2">
                                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                <img
                                                    src={item.images[0]}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            </div>
                                            <div className="ml-4 flex flex-1 flex-col">
                                                <div>
                                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                                        <h3>{item.name}</h3>
                                                        <p className="ml-4">${item.price}</p>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-500">{item.selectedColor.name} | {item.selectedSize}</p>
                                                </div>
                                                <div className="flex flex-1 items-end justify-between text-sm">
                                                    <div className="text-gray-500 flex items-center space-x-2">
                                                        <span>Qty {item.qty || 1}</span>
                                                        {/* Add quantity controls here if time permits */}
                                                    </div>
                                                    <div className="flex">
                                                        <button
                                                            type="button"
                                                            onClick={() => dispatch(removeFromCart(item))}
                                                            className="font-medium text-red-500 hover:text-red-700 flex items-center"
                                                        >
                                                            <Trash2 size={16} className="mr-1" /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <div className="border-t border-gray-100 p-6 bg-gray-50">
                                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                                    <p>Subtotal</p>
                                    <p>${subtotal.toFixed(2)}</p>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500 mb-6">
                                    Shipping and taxes calculated at checkout.
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full btn-primary bg-accent hover:bg-black"
                                    >
                                        Checkout
                                    </button>
                                    <button
                                        onClick={() => dispatch(toggleCart())}
                                        className="w-full btn-outline"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartSidebar;
