const express = require('express');
const router = express.Router();
require('dotenv').config();

// Verify access code
router.post('/login', (req, res) => {
  const { code } = req.body;
  const accessCode = process.env.ACCESS_CODE;

  if (!code || code !== accessCode) {
    return res.status(401).json({ success: false, message: 'Invalid access code' });
  }

  res.json({ success: true, token: Buffer.from(code + ':' + Date.now()).toString('base64') });
});

// Verify token middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [code] = decoded.split(':');
    
    if (code !== process.env.ACCESS_CODE) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { router, authMiddleware };
