const Joi = require('joi');

const schemas = {
  register: Joi.object({
    email: Joi.any(),
    password: Joi.any(),
    confirmPassword: Joi.any(),
    firstName: Joi.any(),
    lastName: Joi.any()
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