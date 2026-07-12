const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Driver } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'transitops_secret_key_2026_super_secure_hash';

// Register User (with automatic Driver profile binding if role is Driver)
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Additional checks for driver role
    if (role === 'Driver') {
      if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
        return res.status(400).json({ message: 'Driver registration requires: name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber' });
      }
      const existingDriver = await Driver.findOne({ where: { licenseNumber } });
      if (existingDriver) {
        return res.status(400).json({ message: 'License number is already registered' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      email,
      password: hashedPassword,
      role
    });

    // Create Driver profile if role is Driver
    let driver = null;
    if (role === 'Driver') {
      driver = await Driver.create({
        userId: user.id,
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiryDate,
        contactNumber,
        safetyScore: 100,
        status: 'Available'
      });
    }

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        driver: driver ? {
          id: driver.id,
          name: driver.name,
          licenseNumber: driver.licenseNumber,
          status: driver.status
        } : null
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server registration error', error: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server login error', error: error.message });
  }
});

// Get Current User Profile (Resolving associated Driver details if role is Driver)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Driver, as: 'driver' }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Server profile fetch error', error: error.message });
  }
});

module.exports = router;
