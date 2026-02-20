const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
    try {
        const { category, department, sizes, colors, priceRange } = req.query;
        // page is only present when the new frontend explicitly sends it
        const paginated = req.query.page !== undefined;
        const pageNum = Math.max(1, parseInt(req.query.page) || 1);
        const limitNum = Math.min(48, parseInt(req.query.limit) || 12);
        const skip = (pageNum - 1) * limitNum;

        let query = {};
        if (category) query.category = category;
        if (department) query.department = department;
        if (sizes) query.sizes = { $in: sizes.split(',') };
        if (colors) query['colors.name'] = { $in: colors.split(',').map(c => new RegExp(c, 'i')) };
        if (priceRange) {
            const [min, max] = priceRange.split('-');
            query.price = { $gte: Number(min), $lte: Number(max) };
        }

        if (paginated) {
            // New frontend: return paginated envelope
            const [products, totalCount] = await Promise.all([
                Product.find(query).skip(skip).limit(limitNum).lean(),
                Product.countDocuments(query),
            ]);
            return res.json({
                products,
                page: pageNum,
                totalCount,
                totalPages: Math.ceil(totalCount / limitNum),
                hasMore: skip + products.length < totalCount,
            });
        }

        // Legacy / backward-compat: return plain array (no page param sent)
        const products = await Product.find(query).lean();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        let product;
        try {
            product = await Product.findById(req.params.id);
        } catch (dbError) {
            console.warn('Database error, using in-memory fallback:', dbError.message);
        }

        if (!product) {
            // Check in-memory
            const products = getInMemoryProducts({});
            product = products.find(p => p._id === req.params.id);
        }

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    // Basic creation for seeding/admin
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = req.body.name || product.name;
            product.price = req.body.price || product.price;
            product.description = req.body.description || product.description;
            product.images = req.body.images || product.images;
            product.category = req.body.category || product.category;
            product.countInStock = req.body.countInStock || product.countInStock;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Helper for In-Memory Fallback
const getInMemoryProducts = (query) => {
    let data = [
        {
            _id: '1',
            name: 'Classic White Tee',
            description: 'Premium cotton t-shirt for everyday wear.',
            price: 29.99,
            category: 'Clothing',
            department: 'Men',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' }],
            images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            isTrending: true,
        },
        {
            _id: '2',
            name: 'Slim Fit Jeans',
            description: 'Modern slim fit jeans with stretch.',
            price: 59.99,
            category: 'Clothing',
            department: 'Men',
            sizes: ['M', 'L', 'XL'],
            colors: [{ name: 'Blue', hex: '#0000FF' }],
            images: ['https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        },
        {
            _id: '3',
            name: 'Floral Summer Dress',
            description: 'Light and breezy dress for summer days.',
            price: 49.99,
            category: 'Clothing',
            department: 'Women',
            sizes: ['S', 'M', 'L'],
            colors: [{ name: 'Red', hex: '#FF0000' }],
            images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
            isTrending: true,
        },
        {
            _id: '4',
            name: 'Leather Boots',
            description: 'Genuine leather boots for all seasons.',
            price: 89.99,
            category: 'Shoes',
            department: 'Women',
            sizes: ['S', 'M', 'L'],
            colors: [{ name: 'Brown', hex: '#8B4513' }],
            images: ['https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        },
        {
            _id: '5',
            name: 'Kids Superhero Tee',
            description: 'Fun superhero graphic tee.',
            price: 19.99,
            category: 'Clothing',
            department: 'Kids',
            sizes: ['S', 'M'],
            colors: [{ name: 'Blue', hex: '#0000FF' }],
            images: ['https://images.unsplash.com/photo-1519238263430-660d12402f09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        },
        {
            _id: '6',
            name: 'Running Sneakers',
            description: 'Lightweight sneakers for active kids.',
            price: 39.99,
            category: 'Shoes',
            department: 'Kids',
            sizes: ['S', 'M', 'L'],
            colors: [{ name: 'Green', hex: '#008000' }],
            images: ['https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        }
    ];

    if (query.department) data = data.filter(p => p.department === query.department);
    if (query.category) data = data.filter(p => p.category === query.category);
    if (query.sizes) {
        const querySizes = query.sizes['$in'];
        data = data.filter(p => p.sizes.some(s => querySizes.includes(s)));
    }
    if (query['colors.name']) {
        const queryColors = query['colors.name']['$in'];
        data = data.filter(p => p.colors.some(c => queryColors.includes(c.name)));
    }
    if (query.price) {
        const min = query.price['$gte'];
        const max = query.price['$lte'];
        data = data.filter(p => p.price >= min && p.price <= max);
    }

    return data;
};
