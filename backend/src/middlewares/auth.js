const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token d\'accès requis'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token invalide'
      });
    }

    if (decoded.type !== 'access') {
      return res.status(403).json({
        success: false,
        message: 'Type de token invalide'
      });
    }

    req.userId = decoded.userId;
    next();
  });
};

// Middleware optionnel - n'échoue pas si pas de token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err && decoded.type === 'access') {
        req.userId = decoded.userId;
      }
    });
  }

  next();
};

// Middleware pour vérifier si l'email est vérifié
const requireEmailVerification = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user || !user.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Email non vérifié. Veuillez vérifier votre email pour accéder à cette fonctionnalité.'
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware pour vérifier l'abonnement actif
const requireActiveSubscription = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'utilisateur a un abonnement actif ou est en période d'essai
    const isSubscriptionActive = user.subscription_status === 'active';
    const isInTrialPeriod = user.subscription_status === 'trial' && 
                           new Date() < new Date(user.trial_ends_at);

    if (!isSubscriptionActive && !isInTrialPeriod) {
      return res.status(403).json({
        success: false,
        message: 'Abonnement requis pour accéder à cette fonctionnalité'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireEmailVerification,
  requireActiveSubscription
}; 