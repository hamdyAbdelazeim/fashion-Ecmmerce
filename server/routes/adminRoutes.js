const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/adminAuth');
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { getAllOrders, updateOrderStatus, getOrderStats } = require('../controllers/orderController');
const { getAllUsers, updateUserRole, deleteUser, getDashboardStats } = require('../controllers/adminController');

// Dashboard Stats
router.get('/dashboard/stats', protect, admin, getDashboardStats);

// Products Management
router.get('/products', protect, admin, getProducts);
router.post('/products', protect, admin, createProduct);
router.put('/products/:id', protect, admin, updateProduct); // Need to implement updateProduct
router.delete('/products/:id', protect, admin, deleteProduct); // Need to implement deleteProduct

// Orders Management
router.get('/orders', protect, admin, getAllOrders);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);
router.get('/orders/stats', protect, admin, getOrderStats);

// Users Management
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
