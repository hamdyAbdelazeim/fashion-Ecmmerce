import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

// Optimize Unsplash URLs for card thumbnails (smaller, faster)
const optimizeImage = (url) => {
    if (!url || !url.includes('unsplash.com')) return url;
    return url.replace(/w=\d+/, 'w=600').replace(/q=\d+/, 'q=70');
};

const ProductCard = ({ product, index }) => {
    const dispatch = useDispatch();

    const handleAddToCart = (e) => {
        e.preventDefault();
        dispatch(addToCart({
            ...product,
            selectedSize: product.sizes[0],
            selectedColor: product.colors[0],
            qty: 1
        }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
            className="group relative"
        >
            <div className="aspect-[3/4] w-full overflow-hidden bg-gray-200 relative">
                <img
                    src={optimizeImage(product.images[0])}
                    alt={product.name}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=70'; }}
                />
                {product.isTrending && (
                    <div className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-2 py-1 tracking-wider">
                        TRENDING
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-center bg-opacity-95">
                    <button
                        onClick={handleAddToCart}
                        className="text-xs font-bold tracking-wider hover:text-accent transition-colors"
                    >
                        ADD TO CART
                    </button>
                    <span className="text-sm font-medium">${product.price}</span>
                </div>
            </div>
            <div className="mt-4 flex justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-900">
                        <Link to={`/product/${product._id}`}>
                            <span aria-hidden="true" className="absolute inset-0" />
                            {product.name}
                        </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">${product.price}</p>
            </div>
        </motion.div>
    );
};

export default memo(ProductCard);
