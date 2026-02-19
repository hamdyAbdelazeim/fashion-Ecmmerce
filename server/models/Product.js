const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Clothing', 'Shoes'],
    },
    department: {
        type: String,
        required: true,
        enum: ['Men', 'Women', 'Kids'],
    },
    sizes: [{
        type: String,
        enum: ['S', 'M', 'L', 'XL'],
    }],
    colors: [{
        name: String,
        hex: String,
    }],
    images: [{
        type: String,
    }],
    inStock: {
        type: Boolean,
        default: true,
    },
    isTrending: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
