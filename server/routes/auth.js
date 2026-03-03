const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, updateProfile, googleAuth, facebookAuth } = require('../controllers/authController');
const { protect } = require('../middleware/adminAuth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/facebook', facebookAuth);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
