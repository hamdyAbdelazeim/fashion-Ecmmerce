import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-gray-100">
            {/* Background Image Parallax could be added here */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}
            >
                <div className="absolute inset-0 bg-black/30" />
            </div>

            <div className="relative h-full flex items-center justify-center text-center px-4">
                <div className="max-w-4xl mx-auto text-white">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl font-medium tracking-widest mb-4"
                    >
                        NEW COLLECTION
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-8 leading-tight"
                    >
                        ELEGANCE IN <br /><span className="text-accent">EVERY STITCH</span>
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <Link
                            to="/shop"
                            className="inline-block bg-white text-black px-8 py-4 text-sm font-bold tracking-widest hover:bg-accent hover:text-white transition-all duration-300"
                        >
                            SHOP NOW
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
