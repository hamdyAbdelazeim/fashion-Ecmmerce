import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsPage, resetProducts, saveFilterPrefs, loadFilterPrefs } from '../store/productSlice';
import FilterSidebar from '../components/FilterSidebar';
import ProductCard from '../components/ProductCard';
import { Filter } from 'lucide-react';

const SKELETON_COUNT = 12;

const SkeletonCard = () => (
    <div className="animate-pulse" aria-hidden="true">
        <div className="bg-gray-200 aspect-[3/4] mb-4 rounded" />
        <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded" />
        <div className="h-4 bg-gray-200 w-1/4 rounded" />
    </div>
);

const Shop = () => {
    const dispatch = useDispatch();
    const { products, hasMore, currentPage, totalCount, isLoading, isLoadingMore } = useSelector(
        (state) => state.product
    );

    // Restore saved filters from localStorage on first mount
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState(() => loadFilterPrefs());

    // sentinel ref for IntersectionObserver
    const sentinelRef = useRef(null);
    // guard to prevent duplicate in-flight fetches
    const fetchingRef = useRef(false);

    // Fetch page 1 whenever filters change
    useEffect(() => {
        dispatch(resetProducts(activeFilters));
        dispatch(fetchProductsPage({ filters: activeFilters, page: 1 }));
    }, [activeFilters, dispatch]);

    // Load next page — guarded so it only fires once per scroll event
    const loadMore = useCallback(() => {
        if (fetchingRef.current || isLoadingMore || !hasMore) return;
        fetchingRef.current = true;
        dispatch(fetchProductsPage({ filters: activeFilters, page: currentPage + 1 }))
            .finally(() => { fetchingRef.current = false; });
    }, [dispatch, activeFilters, currentPage, hasMore, isLoadingMore]);

    // Attach IntersectionObserver to sentinel div at bottom of list
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
        setActiveFilters(filters);
        saveFilterPrefs(filters);   // persist to localStorage
    };

    const showInitialSkeleton = isLoading && products.length === 0;

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-baseline mb-8">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-primary">Shop Collection</h1>
                        {totalCount > 0 && !isLoading && (
                            <p
                                className="text-sm text-gray-500 mt-1"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                Showing {products.length} of {totalCount} products
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
                    {/* Sidebar */}
                    <FilterSidebar
                        isOpen={isMobileFilterOpen}
                        onClose={() => setIsMobileFilterOpen(false)}
                        onFilterChange={handleFilterChange}
                        initialFilters={activeFilters}
                    />

                    {/* Backdrop for mobile */}
                    {isMobileFilterOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                            onClick={() => setIsMobileFilterOpen(false)}
                            aria-hidden="true"
                        />
                    )}

                    {/* Product Grid */}
                    <main className="flex-1" aria-label="Product listing">
                        {showInitialSkeleton ? (
                            <div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                                aria-busy="true"
                                aria-label="Loading products"
                            >
                                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                                >
                                    {products.map((product, index) => (
                                        <ProductCard
                                            key={product._id}
                                            product={product}
                                            index={index}
                                        />
                                    ))}
                                </div>

                                {/* Infinite scroll sentinel — observed by IntersectionObserver */}
                                <div ref={sentinelRef} aria-hidden="true" className="h-4 mt-8" />

                                {/* Spinner shown while next page loads */}
                                {isLoadingMore && (
                                    <div
                                        className="flex justify-center py-8"
                                        role="status"
                                        aria-label="Loading more products"
                                    >
                                        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}

                                {/* End of results message */}
                                {!hasMore && !isLoadingMore && (
                                    <p className="text-center text-sm text-gray-400 py-8">
                                        All {totalCount} products loaded
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
