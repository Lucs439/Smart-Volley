const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');

const router = express.Router();

// ========================================
// ROUTES D'AUTHENTIFICATION
// ========================================

// Route de test (temporaire)
router.post('/test-user', validate.testUser, authController.testUser);

// Inscription
router.post('/register', validate.register, authController.register);

// Connexion
router.post('/login', validate.login, authController.login);

// Vérification email
router.post('/verify-email', validate.verifyEmail, authController.verifyEmail);

// Route de santé pour les auth
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Routes d\'authentification opérationnelles',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 