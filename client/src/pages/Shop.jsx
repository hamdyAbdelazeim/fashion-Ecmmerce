import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProducts, filterProducts, saveFilterPrefs, loadFilterPrefs } from '../store/productSlice';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import { Filter } from 'lucide-react';

const PAGE_SIZE = 12;

const SkeletonCard = () => (
    <div className="animate-pulse" aria-hidden="true">
        <div className="bg-gray-200 aspect-[3/4] mb-4 rounded" />
        <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded" />
        <div className="h-4 bg-gray-200 w-1/4 rounded" />
    </div>
);

const Shop = () => {
    const dispatch = useDispatch();
    const { products, isLoading } = useSelector((state) => state.product);

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    // How many products to display (increases as user scrolls)
    const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

    const sentinelRef = useRef(null);

    // Fetch all products once on mount (uses localStorage cache if fresh)
    useEffect(() => {
        dispatch(fetchAllProducts());
    }, [dispatch]);

    // Reset display count when filtered list changes length
    useEffect(() => {
        setDisplayCount(PAGE_SIZE);
    }, [products.length]);

    // IntersectionObserver: increase displayCount when sentinel enters viewport
    const loadMore = useCallback(() => {
        setDisplayCount(prev => Math.min(prev + PAGE_SIZE, products.length));
    }, [products.length]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) loadMore(); },
            { rootMargin: '200px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [loadMore]);

    const handleFilterChange = (filters) => {
        saveFilterPrefs(filters);
        dispatch(filterProducts(filters));
    };

    const displayed   = products.slice(0, displayCount);
    const hasMore     = displayCount < products.length;

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-baseline mb-8">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-primary">Shop Collection</h1>
                        {!isLoading && products.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1" aria-live="polite">
                                {products.length} product{products.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    <button
                        className="lg:hidden flex items-center space-x-2 text-sm font-medium border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 mt-4 md:mt-0"
                        onClick={() => setIsMobileFilterOpen(true)}
                        aria-label="Open filters"
                        aria-expanded={isMobileFilterOpen}
                    >
                        <Filter size={18} aria-hidden="true" />
                        <span>Filters</span>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filter sidebar */}
                    <FilterSidebar
                        isOpen={isMobileFilterOpen}
                        onClose={() => setIsMobileFilterOpen(false)}
                        onFilterChange={handleFilterChange}
                        initialFilters={loadFilterPrefs()}
                    />

                    {/* Backdrop for mobile */}
                    {isMobileFilterOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                            onClick={() => setIsMobileFilterOpen(false)}
                            aria-hidden="true"
                        />
                    )}

                    {/* Product grid */}
                    <main className="flex-1" aria-label="Product listing">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                                aria-busy="true" aria-label="Loading products">
                                {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : displayed.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {displayed.map((product, index) => (
                                        <ProductCard key={product._id} product={product} index={index} />
                                    ))}
                                </div>

                                {/* Sentinel — observed to trigger loading more */}
                                {hasMore && (
                                    <div ref={sentinelRef} aria-hidden="true" className="h-4 mt-8" />
                                )}

                                {!hasMore && (
                                    <p className="text-center text-sm text-gray-400 py-8">
                                        All {products.length} products shown
                                    </p>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20" role="status">
                                <h3 className="text-xl font-medium text-gray-900">No products found</h3>
                                <p className="mt-2 text-gray-500">Try adjusting your filters.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Shop;
