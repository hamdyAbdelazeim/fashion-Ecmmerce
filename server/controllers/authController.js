const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { sendPasswordResetEmail } = require('../utils/emailService');

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
    hasPassword: !!user.password,
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

// POST /api/auth/google
exports.googleAuth = async (req, res) => {
    try {
        const { access_token } = req.body;
        if (!access_token) return res.status(400).json({ message: 'Google access token is required' });

        // Verify token by fetching user info from Google server-side
        const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        // data: { sub, email, name, picture, email_verified }

        if (!data.email_verified) {
            return res.status(400).json({ message: 'Google account email is not verified' });
        }

        // Find by googleId → then by email (account linking) → create new
        let user = await User.findOne({ googleId: data.sub });
        if (!user) {
            user = await User.findOne({ email: data.email });
            if (user) {
                user.googleId = data.sub;
                if (!user.avatar && data.picture) user.avatar = data.picture;
                await user.save();
            } else {
                user = await User.create({
                    name: data.name,
                    email: data.email,
                    googleId: data.sub,
                    avatar: data.picture || '',
                });
            }
        }

        res.json(buildUserPayload(user));
    } catch (error) {
        console.error('Google auth error:', error.message);
        res.status(500).json({ message: 'Google authentication failed' });
    }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email });
        // Always respond success to avoid email enumeration
        if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

        // OAuth-only users have no password to reset
        if (!user.password && (user.googleId || user.facebookId)) {
            return res.json({ message: 'If that email exists, a reset link has been sent.' });
        }

        // Generate a plain token, store its hash in DB
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
        await sendPasswordResetEmail({ to: user.email, resetUrl, name: user.name });

        res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error.message);
        res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
        }

        user.password = password; // pre-save hook will hash it
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        console.error('Reset password error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/auth/facebook
exports.facebookAuth = async (req, res) => {
    try {
        const { accessToken, userID } = req.body;
        if (!accessToken || !userID) {
            return res.status(400).json({ message: 'Facebook access token and user ID are required' });
        }

        // Verify token belongs to our app
        const appToken = `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`;
        const debugRes = await axios.get(
            `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appToken}`
        );
        const debug = debugRes.data.data;
        if (!debug.is_valid || debug.user_id !== userID) {
            return res.status(401).json({ message: 'Invalid Facebook token' });
        }

        // Fetch user profile
        const profileRes = await axios.get(
            `https://graph.facebook.com/${userID}?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
        );
        const fb = profileRes.data;

        if (!fb.email) {
            return res.status(400).json({
                message: 'Email permission is required. Please allow email access when signing in with Facebook.',
            });
        }

        // Find by facebookId → then by email → create new
        let user = await User.findOne({ facebookId: fb.id });
        if (!user) {
            user = await User.findOne({ email: fb.email });
            if (user) {
                user.facebookId = fb.id;
                if (!user.avatar && fb.picture?.data?.url) user.avatar = fb.picture.data.url;
                await user.save();
            } else {
                user = await User.create({
                    name: fb.name,
                    email: fb.email,
                    facebookId: fb.id,
                    avatar: fb.picture?.data?.url || '',
                });
            }
        }

        res.json(buildUserPayload(user));
    } catch (error) {
        console.error('Facebook auth error:', error.message);
        res.status(500).json({ message: 'Facebook authentication failed' });
    }
};
