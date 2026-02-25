require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const user = await User.findOneAndUpdate(
        { email: 'hamdyabdelazeim@gmail.com' },
        { role: 'admin', isAdmin: true },
        { new: true }
    );
    console.log('Updated user:', user.name, '| role:', user.role);
    mongoose.disconnect();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
