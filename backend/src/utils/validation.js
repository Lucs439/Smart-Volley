const Joi = require('joi');

const schemas = {
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email invalide',
        'any.required': 'Email requis'
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre',
        'any.required': 'Mot de passe requis'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Les mots de passe ne correspondent pas',
        'any.required': 'Confirmation du mot de passe requise'
      }),
    firstName: Joi.string().min(1).max(100).optional(),
    lastName: Joi.string().min(1).max(100).optional()
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email invalide',
        'any.required': 'Email requis'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Mot de passe requis'
      })
  }),

  verifyEmail: Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().length(6).pattern(/^\d+$/).required()
      .messages({
        'string.length': 'Le code doit contenir 6 chiffres',
        'string.pattern.base': 'Le code doit contenir uniquement des chiffres'
      })
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().length(6).pattern(/^\d+$/).required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'string.pattern.base': 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
      })
  }),

  addPet: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    breedId: Joi.number().integer().positive().required(),
    gender: Joi.string().valid('male', 'female', 'unknown').optional(),
    dateOfBirth: Joi.date().optional(),
    weight: Joi.number().positive().max(200).optional(),
    height: Joi.number().positive().max(200).optional(),
    color: Joi.string().max(100).optional(),
    microchipNumber: Joi.string().max(50).optional(),
    medicalNotes: Joi.string().max(1000).optional()
  })
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors
      });
    }
    
    next();
  };
};

module.exports = {
  schemas,
  validate
}; 