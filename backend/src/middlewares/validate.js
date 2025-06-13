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
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email invalide'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        return true;
      }),
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Le prénom doit contenir entre 1 et 100 caractères'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Le nom doit contenir entre 1 et 100 caractères'),
    handleValidationErrors
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