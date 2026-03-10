const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, updateProfile, googleAuth, facebookAuth, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/adminAuth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/facebook', facebookAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
