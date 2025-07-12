const Joi = require('joi');

const schemas = {
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Format d\'email invalide',
        'any.required': 'L\'email est requis'
      }),
    password: Joi.string()
      .min(4)
      .max(72)
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 4 caractères',
        'string.max': 'Le mot de passe ne peut pas dépasser 72 caractères',
        'any.required': 'Le mot de passe est requis'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .optional()
      .messages({
        'any.only': 'Les mots de passe ne correspondent pas'
      }),
    firstName: Joi.string()
      .optional(),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Le nom doit contenir au moins 2 caractères',
        'string.max': 'Le nom ne peut pas dépasser 50 caractères'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Format d\'email invalide',
        'any.required': 'L\'email est requis'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Le mot de passe est requis'
      })
  })
};

module.exports = schemas; 