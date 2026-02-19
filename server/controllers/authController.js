const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// Helper: build the public user object returned to the client
const buildUserPayload = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    role: user.role,
    username: user.username || '',
    phone: user.phone || '',
    bio: user.bio || '',
    country: user.country || '',
    countryFlag: user.countryFlag || '',
    avatar: user.avatar || '',
    token: generateToken(user._id),
});

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        if (user) {
            res.status(201).json(buildUserPayload(user));
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json(buildUserPayload(user));
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/auth/profile  (protected)
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(buildUserPayload(user));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/auth/profile  (protected)
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update allowed fields
        if (req.body.name !== undefined) user.name = req.body.name;
        if (req.body.username !== undefined) user.username = req.body.username;
        if (req.body.phone !== undefined) user.phone = req.body.phone;
        if (req.body.bio !== undefined) user.bio = req.body.bio;
        if (req.body.country !== undefined) user.country = req.body.country;
        if (req.body.countryFlag !== undefined) user.countryFlag = req.body.countryFlag;
        // Avatar: base64 data URL sent from client
        if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

        // Optional password change
        if (req.body.newPassword) {
            if (!req.body.currentPassword) {
                return res.status(400).json({ message: 'Current password is required' });
            }
            const match = await user.matchPassword(req.body.currentPassword);
            if (!match) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
            user.password = req.body.newPassword; // pre-save hook will hash it
        }

        const updated = await user.save();
        res.json(buildUserPayload(updated));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
