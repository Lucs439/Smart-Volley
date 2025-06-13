const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET || 'development_secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const generateTokens = (userId) => {
  try {
    logger.info(`🎟️ Génération des tokens pour l'utilisateur ${userId}`);

    const accessToken = jwt.sign(
      { userId, type: 'access' },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    logger.info('✅ Tokens générés avec succès');

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRY
    };
  } catch (error) {
    logger.error('❌ Erreur lors de la génération des tokens:', error);
    throw error;
  }
};

const generateVerificationCode = () => {
  try {
    // Générer un code à 6 chiffres
    const code = crypto.randomInt(100000, 999999).toString();
    logger.info(`🎲 Code de vérification généré: ${code}`);
    return code;
  } catch (error) {
    logger.error('❌ Erreur lors de la génération du code:', error);
    throw error;
  }
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    logger.info(`✅ Token vérifié pour l'utilisateur ${decoded.userId}`);
    return decoded;
  } catch (error) {
    logger.error('❌ Erreur lors de la vérification du token:', error);
    throw error;
  }
};

module.exports = {
  generateTokens,
  generateVerificationCode,
  verifyToken
}; 