import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import { motion } from 'framer-motion';
import axios from 'axios';

const ProductDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    // We can fetch single product directly or find in store if already loaded.
    // Implementing direct fetch for better deep link support
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                const { data } = await axios.get(`${baseUrl}/api/products/${id}`);
                setProduct(data);
                if (data.sizes.length > 0) setSelectedSize(data.sizes[0]);
                if (data.colors.length > 0) setSelectedColor(data.colors[0]);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        dispatch(addToCart({
            ...product,
            selectedSize,
            selectedColor,
            qty: quantity
        }));
        // Open cart
        // dispatch(toggleCart()); // Optional
    };

    if (loading) {
        return (
            <div className="pt-32 min-h-screen flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="pt-32 min-h-screen text-center">
                <h2 className="text-2xl font-serif">Product Not Found</h2>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-16 bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">

                    {/* Image Gallery */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        <div className="aspect-[3/4] w-full bg-gray-100 rounded-lg overflow-hidden">
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover object-center"
                            />
                        </div>
                        {/* Additional images grid would go here */}
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-4">{product.name}</h1>
                        <p className="text-2xl text-gray-500 mb-8">${product.price}</p>

                        <div className="prose prose-sm text-gray-500 mb-8">
                            <p>{product.description}</p>
                        </div>

                        {/* Color Selection */}
                        <div className="mb-8">
                            <h3 className="text-sm font-medium text-gray-900 mb-4">Color</h3>
                            <div className="flex space-x-3">
                                {product.colors.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${selectedColor?.name === color.name ? 'border-primary ring-1 ring-primary ring-offset-2' : 'border-transparent hover:border-gray-300'}`}
                                        title={color.name}
                                    >
                                        <span
                                            className="w-8 h-8 rounded-full border border-gray-200"
                                            style={{ backgroundColor: color.hex || color.name }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="mb-8">
                            <h3 className="text-sm font-medium text-gray-900 mb-4">Size</h3>
                            <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`py-3 text-sm font-medium rounded-md border ${selectedSize === size ? 'bg-primary text-white border-primary' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'} transition-colors`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Add to Cart */}
                        <div className="flex space-x-4">
                            <div className="w-24">
                                <label htmlFor="quantity" className="sr-only">Quantity</label>
                                <select
                                    id="quantity"
                                    name="quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="block w-full rounded-md border-gray-300 bg-gray-50 py-3 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                >
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 btn-primary bg-accent hover:bg-black text-white px-8 py-3 text-base font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-full"
                            >
                                Add to bag
                            </button>
                        </div>

                        <div className="mt-8 border-t border-gray-200 pt-8">
                            <ul className="text-sm text-gray-500 list-disc pl-5 space-y-2">
                                <li>Premium materials and craftsmanship</li>
                                <li>Free shipping on orders over $150</li>
                                <li>30-day return policy</li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
