const Stripe = require('stripe');
const Order = require('../models/Order');

exports.createCheckoutSession = async (req, res) => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || !key.startsWith('sk_')) {
        return res.status(500).json({
            message: 'Stripe secret key is missing or invalid on the server. Set STRIPE_SECRET_KEY (sk_test_... or sk_live_...) in your environment variables.'
        });
    }

    const stripe = new Stripe(key);
    const { cartItems, shipping } = req.body;

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty.' });
    }

    try {
        const line_items = cartItems.map((item) => {
            const imageUrl = item.images?.[0];
            const images = imageUrl && imageUrl.startsWith('http') ? [imageUrl] : [];

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name || 'Product',
                        ...(images.length > 0 && { images }),
                    },
                    unit_amount: Math.max(Math.round((item.price || 0) * 100), 50),
                },
                quantity: item.qty || 1,
            };
        });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: req.body.email,
            line_items,
            mode: 'payment',
            success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientUrl}/checkout`,
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'AE', 'EG'],
            },
            metadata: {
                userId: req.user ? String(req.user._id) : (req.body.userId || ''),
            },
        });

        // Save a pending order so we can show it in order history after payment
        if (req.user) {
            try {
                const totalPrice = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 1), 0);
                await Order.create({
                    user: req.user._id,
                    orderItems: cartItems.map((item) => ({
                        name: item.name || 'Product',
                        qty: item.qty || 1,
                        image: item.images?.[0] || '',
                        price: item.price || 0,
                        product: item._id,
                    })),
                    shippingAddress: {
                        address: shipping?.address || 'N/A',
                        city: shipping?.city || 'N/A',
                        postalCode: shipping?.postalCode || 'N/A',
                        country: shipping?.country || 'N/A',
                    },
                    paymentMethod: 'Stripe',
                    totalPrice,
                    taxPrice: 0,
                    shippingPrice: 0,
                    isPaid: false,
                    stripeSessionId: session.id,
                });
            } catch (orderErr) {
                console.error('Failed to save pending order:', orderErr.message);
            }
        }

        res.json({ id: session.id });
    } catch (error) {
        console.error('Stripe Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Called from Success page — marks the pending order as paid after Stripe confirms payment
exports.confirmOrder = async (req, res) => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || !key.startsWith('sk_')) {
        return res.status(500).json({ message: 'Stripe not configured.' });
    }

    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'Session ID required.' });

    try {
        const stripe = new Stripe(key);
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed.' });
        }

        const order = await Order.findOne({ stripeSessionId: sessionId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        if (!order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: session.payment_intent,
                status: session.payment_status,
                email_address: session.customer_email,
            };
            await order.save();
        }

        res.json(order);
    } catch (error) {
        console.error('Confirm order error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Returns all orders for the authenticated user, newest first
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'id name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isDelivered = req.body.isDelivered || order.isDelivered;
            order.isPaid = req.body.isPaid || order.isPaid;
            if (req.body.isDelivered) order.deliveredAt = Date.now();
            if (req.body.isPaid) order.paidAt = Date.now();

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalSales = await Order.aggregate([
            { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } }
        ]);

        res.json({
            totalOrders,
            totalSales: totalSales[0]?.totalSales || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
