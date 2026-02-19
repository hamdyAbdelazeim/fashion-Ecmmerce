require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'https://fashion-ecmmerce-wtxj.vercel.app',
        process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true,
}));

// Database Connection & Server Start
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fashion-ecommerce', {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error (Running in Offline Mode):', err.message);
    }

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/admin', adminRoutes);

    // Base Route
    app.get('/', (req, res) => {
        res.send('Fashion E-commerce API is running');
    });

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
