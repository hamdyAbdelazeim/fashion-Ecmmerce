const Stripe = require('stripe');
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const Order = require('../models/Order');


exports.createCheckoutSession = async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ message: 'Stripe is not configured on the server.' });
    }

    const { cartItems } = req.body;

    try {
        const line_items = cartItems.map((item) => {
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        images: [item.images[0]],
                    },
                    unit_amount: Math.round(item.price * 100),
                },
                quantity: item.qty,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: req.body.email, // Pre-fill user email
            line_items,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/success`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout`,
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB'], // Add more as needed
            },
            metadata: {
                userId: req.body.userId,
                cartItems: JSON.stringify(cartItems.map(item => ({ id: item._id, qty: item.qty, size: item.selectedSize, color: item.selectedColor?.name || '' })))
            }
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Stripe Error:', error);
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

