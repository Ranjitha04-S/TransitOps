const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*',
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
    mode: global.isMockMode ? 'IN-MEMORY MOCK DATA' : 'STANDARD MYSQL',
    timestamp: new Date()
  });
});

// Database Synchronization & Server Startup
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // If environment explicitly requests mock mode, bypass database attempt
  if (process.env.USE_MOCK === 'true') {
    console.log('[INFO] Mock environment requested. Initializing database-less mode...');
    const mockDb = require('./config/mockDb');
    await mockDb.initializeMockData();
    global.isMockMode = true;
    app.listen(PORT, () => {
      console.log(`TransitOps Backend running on port ${PORT} (MOCK DATA MODE ACTIVE)`);
    });
    return;
  }

  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('MySQL Database Connected & Models Synchronized successfully');
    global.isMockMode = false;
    app.listen(PORT, () => {
      console.log(`TransitOps Backend running on port ${PORT} (STANDARD MYSQL ACTIVE)`);
    });
  } catch (err) {
    console.error('MySQL connection failed. Falling back to IN-MEMORY DATABASE...');
    try {
      const mockDb = require('./config/mockDb');
      await mockDb.initializeMockData();
      global.isMockMode = true;
      console.log('IN-MEMORY DATABASE initialized successfully.');
      app.listen(PORT, () => {
        console.log(`TransitOps Backend running on port ${PORT} (MOCK DATA FALLBACK ACTIVE)`);
      });
    } catch (mockErr) {
      console.error('Failed to initialize mock database:', mockErr);
      process.exit(1);
    }
  }
};

startServer();
