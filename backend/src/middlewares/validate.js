const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Middleware pour traiter les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('❌ Erreurs de validation:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Schémas de validation
const validationSchemas = {
  register: [
    (req, res, next) => next()
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email invalide'),
    body('password')
      .notEmpty()
      .withMessage('Mot de passe requis'),
    handleValidationErrors
  ],

  verifyEmail: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email invalide'),
    body('code')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('Le code doit contenir exactement 6 chiffres'),
    handleValidationErrors
  ],

  testUser: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email invalide'),
    handleValidationErrors
  ]
};

module.exports = validationSchemas; 