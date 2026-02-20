import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProducts } from '../store/productSlice';
import useTranslation from '../hooks/useTranslation';

const Home = () => {
    const dispatch = useDispatch();
    const { allProducts, isLoading } = useSelector((state) => state.product);
    const { t } = useTranslation();

    // Fetch all products once (uses localStorage cache if fresh — zero network cost on repeat visits)
    useEffect(() => {
        dispatch(fetchAllProducts());
    }, [dispatch]);

    const trendingProducts = allProducts.filter(p => p.isTrending).slice(0, 4);

    return (
        <div>
            <Hero />

            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">{t.trendingNow}</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">{t.trendingDesc}</p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 aspect-[3/4] mb-4"></div>
                                    <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {trendingProducts.map((product, index) => (
                                <ProductCard key={product._id} product={product} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <img
                                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                                alt="Fashion Collection"
                                className="w-full h-[600px] object-cover shadow-2xl"
                                loading="lazy"
                            />
                        </div>
                        <div>
                            <h2 className="text-4xl font-serif font-bold mb-6">{t.artOfFashion}</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {t.artOfFashionDesc}
                            </p>
                            <button className="btn-primary">
                                {t.viewLookbook}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
