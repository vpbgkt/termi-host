const express = require('express');
const session = require('express-session');
const crypto = require('crypto');

const router = express.Router();

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const config = require('./config');
  
  if (!config.get('authentication.enabled')) {
    // If auth is disabled, auto-login
    req.session.authenticated = true;
    req.session.username = 'anonymous';
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Session save failed' });
      }
      return res.json({ success: true, message: 'Authentication disabled' });
    });
    return;
  }
  
  const correctUsername = config.get('authentication.username');
  const correctPassword = config.get('authentication.password');
  
  // Hash comparison for security
  const hashedInput = crypto.createHash('sha256').update(password).digest('hex');
  const hashedStored = crypto.createHash('sha256').update(correctPassword).digest('hex');
  
  if (username === correctUsername && hashedInput === hashedStored) {
    req.session.authenticated = true;
    req.session.username = username;
    
    // Save session before responding
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ success: false, message: 'Session save failed' });
      }
      return res.json({ success: true, message: 'Login successful' });
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out' });
  });
});

// Shutdown server endpoint (authenticated only)
router.post('/shutdown', requireAuth, (req, res) => {
  console.log('Shutdown request received from:', req.session.username);
  res.json({ success: true, message: 'Server shutting down...' });
  
  // Give time for response to be sent
  setTimeout(() => {
    console.log('Server shutdown initiated by web interface');
    process.exit(0);
  }, 1000);
});

// Check auth status
router.get('/status', (req, res) => {
  const config = require('./config');
  res.json({
    authenticated: req.session && req.session.authenticated,
    authEnabled: config.get('authentication.enabled'),
    username: req.session ? req.session.username : null
  });
});

module.exports = { router, requireAuth };
