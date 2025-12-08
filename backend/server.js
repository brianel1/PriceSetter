const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pricingRoutes = require('./routes/pricing');
const { router: authRoutes, authMiddleware } = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api', authMiddleware, pricingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`PricerSetter backend running on port ${PORT}`);
});
