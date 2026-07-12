const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*', // Allow all origins for the hackathon
  credentials: true
}));

app.use(express.json());

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));

// Root Health Check Route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TransitOps Backend API Server is healthy',
    timestamp: new Date()
  });
});

// Database Synchronization & Server Startup
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('MySQL Database Connected & Models Synchronized successfully');
    app.listen(PORT, () => {
      console.log(`TransitOps Backend running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to sync MySQL database:', err);
  });
