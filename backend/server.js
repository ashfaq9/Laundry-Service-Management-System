const express = require('express');
const dotenv = require('dotenv');
const configureDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware'); 
const cartRoutes =require('./routes/cartRoute')
const cors = require('cors');
const path = require('path');

dotenv.config();
configureDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart',cartRoutes)
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY); // Ensure the key is being loaded correctly



app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
