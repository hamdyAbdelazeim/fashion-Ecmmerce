require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

// ─── Curated products: every image matches the product name exactly ────────
const products = [
    // ── MEN'S CLOTHING ────────────────────────────────────────────────────
    {
        name: 'Classic White T-Shirt',
        description: 'Crisp 100% cotton tee with a relaxed fit. A true wardrobe essential for everyday wear.',
        price: 29.99, category: 'Clothing', department: 'Men',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' }],
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'],
        isTrending: true, inStock: true,
    },
    {
        name: 'Oxford Button-Down Shirt',
        description: 'Classic Oxford shirt perfect for smart-casual occasions. Wrinkle-resistant cotton blend.',
        price: 59.99, category: 'Clothing', department: 'Men',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Blue', hex: '#4A90D9' }, { name: 'White', hex: '#FFFFFF' }],
        images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    {
        name: 'Slim Fit Chinos',
        description: 'Modern slim-fit chinos in a versatile neutral tone. Goes from office to weekend seamlessly.',
        price: 69.99, category: 'Clothing', department: 'Men',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Beige', hex: '#D4C5A9' }, { name: 'Brown', hex: '#8B5E3C' }],
        images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    {
        name: 'Denim Jacket',
        description: 'Timeless denim jacket with a tailored fit and contrast stitching. Pairs with everything.',
        price: 89.99, category: 'Clothing', department: 'Men',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Blue', hex: '#5B7FA6' }],
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'],
        isTrending: true, inStock: true,
    },
    {
        name: 'Wool Overcoat',
        description: 'Premium wool-blend overcoat for cold weather elegance. Sharp silhouette, lasting warmth.',
        price: 199.99, category: 'Clothing', department: 'Men',
        sizes: ['M', 'L', 'XL'],
        colors: [{ name: 'Gray', hex: '#808080' }, { name: 'Black', hex: '#000000' }],
        images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    // ── MEN'S SHOES ───────────────────────────────────────────────────────
    {
        name: 'White Leather Sneakers',
        description: 'Clean, minimalist white leather sneakers. Versatile enough for any casual outfit.',
        price: 79.99, category: 'Shoes', department: 'Men',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'White', hex: '#FFFFFF' }],
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'],
        isTrending: true, inStock: true,
    },
    {
        name: 'Classic Running Shoes',
        description: 'Lightweight, breathable running shoes with superior cushioning for all-day comfort.',
        price: 109.99, category: 'Shoes', department: 'Men',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Black', hex: '#000000' }, { name: 'Blue', hex: '#0057B7' }],
        images: ['https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    {
        name: 'Brown Derby Shoes',
        description: 'Handcrafted full-grain leather derby shoes. Timeless, refined and built to last.',
        price: 149.99, category: 'Shoes', department: 'Men',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Brown', hex: '#8B4513' }],
        images: ['https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    {
        name: 'Black Chelsea Boots',
        description: 'Sleek Chelsea boots in polished black leather. Easy pull-on style with elastic side panels.',
        price: 129.99, category: 'Shoes', department: 'Men',
        sizes: ['M', 'L', 'XL'],
        colors: [{ name: 'Black', hex: '#000000' }],
        images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80'],
        isTrending: true, inStock: true,
    },
    {
        name: 'Suede Desert Boots',
        description: 'Classic suede desert boots with a crepe sole. Casual elegance for every season.',
        price: 99.99, category: 'Shoes', department: 'Men',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Brown', hex: '#8B5E3C' }, { name: 'Gray', hex: '#808080' }],
        images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    // ── WOMEN'S CLOTHING ──────────────────────────────────────────────────
    {
        name: 'Floral Wrap Dress',
        description: 'Feminine wrap dress in vibrant floral print with a flattering V-neckline.',
        price: 79.99, category: 'Clothing', department: 'Women',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Red', hex: '#C0392B' }, { name: 'Blue', hex: '#2980B9' }],
        images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'],
        isTrending: true, inStock: true,
    },
    {
        name: 'Classic Black Blazer',
        description: 'Structured black blazer for power dressing. Tailored fit that flatters every figure.',
        price: 119.99, category: 'Clothing', department: 'Women',
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Black', hex: '#000000' }],
        images: ['https://images.unsplash.com/photo-1548549557-dbe9946621da?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    {
        name: 'High-Waist Tailored Pants',
        description: 'Elegant high-waist trousers with a wide-leg silhouette. Effortlessly polished.',
        price: 89.99, category: 'Clothing', department: 'Women',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }],
        images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    {
        name: 'Cashmere Knit Sweater',
        description: 'Luxuriously soft cashmere-blend knit sweater. Ribbed cuffs and hem for a refined finish.',
        price: 149.99, category: 'Clothing', department: 'Women',
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Beige', hex: '#D4C5A9' }, { name: 'Pink', hex: '#E8A0BF' }],
        images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'],
        isTrending: true, inStock: true,
    },
    {
        name: 'Pleated Midi Skirt',
        description: 'Elegant pleated midi skirt in flowing fabric. Moves beautifully and styles with ease.',
        price: 69.99, category: 'Clothing', department: 'Women',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Green', hex: '#2D6A4F' }, { name: 'Blue', hex: '#2980B9' }],
        images: ['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    // ── WOMEN'S SHOES ─────────────────────────────────────────────────────
    {
        name: 'Strappy Heeled Sandals',
        description: 'Elegant strappy heeled sandals with adjustable ankle strap. Ideal for evenings out.',
        price: 89.99, category: 'Shoes', department: 'Women',
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Black', hex: '#000000' }, { name: 'Beige', hex: '#D4C5A9' }],
        images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80'],
        isTrending: true, inStock: true,
    },
    {
        name: 'Leather Ankle Boots',
        description: 'Chunky-sole leather ankle boots. Bold, versatile, and made to turn heads.',
        price: 119.99, category: 'Shoes', department: 'Women',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Brown', hex: '#8B4513' }, { name: 'Black', hex: '#000000' }],
        images: ['https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    {
        name: 'White Platform Sneakers',
        description: 'Chunky platform sneakers that add height with maximum comfort. A street-style staple.',
        price: 99.99, category: 'Shoes', department: 'Women',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'White', hex: '#FFFFFF' }],
        images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'],
        isTrending: true, inStock: true,
    },
    {
        name: 'Block Heel Mules',
        description: 'Comfortable block heel mules with an open toe. Chic, practical and easy to wear.',
        price: 79.99, category: 'Shoes', department: 'Women',
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Beige', hex: '#D4C5A9' }, { name: 'Red', hex: '#C0392B' }],
        images: ['https://images.unsplash.com/photo-1596703263926-422ed835f3c2?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    {
        name: 'Slip-On Leather Loafers',
        description: 'Classic leather loafers that go with anything. Effortlessly chic from day to night.',
        price: 109.99, category: 'Shoes', department: 'Women',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'Black', hex: '#000000' }, { name: 'Brown', hex: '#8B4513' }],
        images: ['https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    // ── KIDS' CLOTHING ────────────────────────────────────────────────────
    {
        name: 'Superhero Graphic Tee',
        description: 'Colorful superhero print tee that kids absolutely love. 100% soft breathable cotton.',
        price: 19.99, category: 'Clothing', department: 'Kids',
        sizes: ['S', 'M'],
        colors: [{ name: 'Blue', hex: '#2980B9' }, { name: 'Red', hex: '#C0392B' }],
        images: ['https://images.unsplash.com/photo-1519238263430-660d12402f09?auto=format&fit=crop&w=800&q=80'],
        isTrending: true, inStock: true,
    },
    {
        name: 'Denim Dungarees',
        description: 'Classic denim dungarees with adjustable straps. Easy to wear and play in all day.',
        price: 34.99, category: 'Clothing', department: 'Kids',
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Blue', hex: '#5B7FA6' }],
        images: ['https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    {
        name: 'Rainbow Zip Hoodie',
        description: 'Fun rainbow-print zip hoodie. Warm, cozy, machine washable, and kid-approved.',
        price: 39.99, category: 'Clothing', department: 'Kids',
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Pink', hex: '#E8A0BF' }, { name: 'Blue', hex: '#2980B9' }],
        images: ['https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    {
        name: 'Floral Summer Dress',
        description: 'Sweet floral dress with smocked bodice. Perfect for sunny days and special occasions.',
        price: 29.99, category: 'Clothing', department: 'Kids',
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Pink', hex: '#E8A0BF' }],
        images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80'],
        isTrending: true, inStock: true,
    },
    {
        name: 'Cozy Fleece Joggers',
        description: 'Super-soft fleece joggers with elastic waistband and cuffs. Built for playtime.',
        price: 24.99, category: 'Clothing', department: 'Kids',
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Gray', hex: '#808080' }, { name: 'Blue', hex: '#2980B9' }],
        images: ['https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    // ── KIDS' SHOES ───────────────────────────────────────────────────────
    {
        name: 'Light-Up Sneakers',
        description: 'Fun light-up sneakers kids adore. Comfortable fit with easy velcro strap closure.',
        price: 34.99, category: 'Shoes', department: 'Kids',
        sizes: ['S', 'M'],
        colors: [{ name: 'Pink', hex: '#E8A0BF' }, { name: 'Blue', hex: '#2980B9' }],
        images: ['https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?auto=format&fit=crop&w=800&q=80'],
        isTrending: true, inStock: true,
    },
    {
        name: 'Canvas Slip-On Shoes',
        description: 'Easy slip-on canvas shoes in fun colors. Lightweight and great for school.',
        price: 24.99, category: 'Shoes', department: 'Kids',
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Red', hex: '#C0392B' }, { name: 'Blue', hex: '#2980B9' }],
        images: ['https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    {
        name: 'Waterproof Rain Boots',
        description: 'Colorful rubber rain boots with non-slip sole. Keep little feet dry and happy.',
        price: 29.99, category: 'Shoes', department: 'Kids',
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Yellow', hex: '#F1C40F' }, { name: 'Green', hex: '#2ECC71' }],
        images: ['https://images.unsplash.com/photo-1583338917451-face2751d8d5?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    {
        name: 'Sports Training Shoes',
        description: 'Durable, lightweight training shoes with extra cushioning for active kids on the move.',
        price: 44.99, category: 'Shoes', department: 'Kids',
        sizes: ['S', 'M', 'L'],
        colors: [{ name: 'Green', hex: '#2ECC71' }, { name: 'Black', hex: '#000000' }],
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'],
        isTrending: false, inStock: true,
    },
    {
        name: 'Mary Jane Flats',
        description: 'Classic Mary Jane flats in shiny patent leather. Adorable, comfortable and easy to wear.',
        price: 32.99, category: 'Shoes', department: 'Kids',
        sizes: ['S', 'M'],
        colors: [{ name: 'Black', hex: '#000000' }, { name: 'Pink', hex: '#E8A0BF' }],
        images: ['https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80'],
        isTrending: true, inStock: true,
    },
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fashion-ecommerce');
        console.log('✓ MongoDB Connected');

        await Product.deleteMany({});
        await User.deleteMany({});
        console.log('✓ Existing data cleared');

        // Pass plain text — the User model's pre('save') hook handles hashing
        await User.create([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin',
                isAdmin: true,
            },
            {
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'password123',
                role: 'user',
                isAdmin: false,
            },
        ]);
        console.log('✓ Users seeded  (admin@example.com / admin123)');

        await Product.insertMany(products);
        console.log(`✓ ${products.length} products seeded — every image matches its product name`);

        process.exit(0);
    } catch (error) {
        console.error('✗ Seeder error:', error);
        process.exit(1);
    }
};

seedData();
