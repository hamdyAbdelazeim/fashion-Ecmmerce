import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productSlice';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import { Filter } from 'lucide-react';

const Shop = () => {
    const dispatch = useDispatch();
    const { products, isLoading } = useSelector((state) => state.product);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Initial fetch is handled by filter change which runs on mount via useEffect in FilterSidebar?
    // Actually FilterSidebar runs onMount, calling onFilterChange with initial URL params

    const handleFilterChange = (filters) => {
        dispatch(fetchProducts(filters));
    };

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-baseline mb-8">
                    <h1 className="text-4xl font-serif font-bold text-primary">Shop Collection</h1>
                    <button
                        className="lg:hidden flex items-center space-x-2 text-sm font-medium border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                        onClick={() => setIsMobileFilterOpen(true)}
                    >
                        <Filter size={18} />
                        <span>Filters</span>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <FilterSidebar
                        isOpen={isMobileFilterOpen}
                        onClose={() => setIsMobileFilterOpen(false)}
                        onFilterChange={handleFilterChange}
                    />

                    {/* Backdrop for mobile */}
                    {isMobileFilterOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                            onClick={() => setIsMobileFilterOpen(false)}
                        />
                    )}

                    {/* Product Grid */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="bg-gray-200 aspect-[3/4] mb-4"></div>
                                        <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 w-1/4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {products.map((product, index) => (
                                    <ProductCard key={product._id} product={product} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <h3 className="text-xl font-medium text-gray-900">No products found</h3>
                                <p className="mt-2 text-gray-500">Try adjusting your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;
