const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, VerificationCode } = require('../models');
const emailService = require('../utils/email');
const logger = require('../utils/logger');

// Utilitaire pour générer des tokens JWT
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET || 'your_secret_key',
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET || 'your_secret_key',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Utilitaire pour générer un code de vérification
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const authController = {
  // ========================================
  // INSCRIPTION
  // ========================================
  register: async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      logger.info(`📝 Tentative d'inscription pour ${email}`);

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        logger.warn(`⚠️ Tentative d'inscription avec email existant: ${email}`);
        return res.status(409).json({
          success: false,
          message: 'Un compte existe déjà avec cette adresse email'
        });
      }

      // Hasher le mot de passe
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Créer l'utilisateur
      const user = await User.create({
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      });

      logger.info(`✅ Utilisateur créé avec succès: ID ${user.id}, email ${email}`);

      // Générer un code de vérification email
      const verificationCode = generateVerificationCode();
      await VerificationCode.create({
        user_id: user.id,
        code: verificationCode,
        type: 'email_verification',
        expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      });

      logger.info(`📧 Code de vérification généré pour ${email}: ${verificationCode}`);

      // Générer les tokens
      const tokens = generateTokens(user.id);

      res.status(201).json({
        success: true,
        message: 'Compte créé avec succès. Vérifiez votre email.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            emailVerified: user.email_verified,
            subscriptionStatus: user.subscription_status,
            trialEndsAt: user.trial_ends_at,
            onboardingCompleted: user.onboarding_completed
          },
          tokens,
          verificationCode // À supprimer en production
        }
      });

    } catch (error) {
      logger.error('💥 Erreur lors de l\'inscription:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  },

  // ========================================
  // CONNEXION
  // ========================================
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      logger.info(`🔐 Tentative de connexion pour ${email}`);

      // Vérifier si l'utilisateur existe
      const user = await User.findOne({ where: { email } });
      if (!user) {
        logger.warn(`❌ Utilisateur non trouvé pour email: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      logger.info(`✅ Utilisateur trouvé - ID: ${user.id}, Email: ${user.email}`);

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        logger.warn(`❌ Mot de passe incorrect pour ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Mettre à jour la dernière connexion
      await user.update({ 
        last_login_at: new Date() 
      });

      logger.info(`🎉 Connexion réussie pour ${email}`);

      // Générer les tokens
      const tokens = generateTokens(user.id);

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            emailVerified: user.email_verified,
            subscriptionStatus: user.subscription_status,
            trialEndsAt: user.trial_ends_at,
            onboardingCompleted: user.onboarding_completed
          },
          tokens
        }
      });

    } catch (error) {
      logger.error('💥 Erreur lors de la connexion:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  },

  // ========================================
  // ROUTE DE TEST
  // ========================================
  testUser: async (req, res) => {
    try {
      const { email } = req.body;
      
      logger.info(`🔍 Test pour email: ${email}`);

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email requis'
        });
      }

      // Chercher l'utilisateur dans la base
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        logger.info(`❌ Utilisateur non trouvé: ${email}`);
        return res.json({
          success: false,
          message: 'Utilisateur non trouvé',
          found: false
        });
      }
      
      // Informations sur l'utilisateur trouvé
      const userInfo = {
        id: user.id,
        email: user.email,
        hasPassword: !!user.password_hash,
        passwordLength: user.password_hash ? user.password_hash.length : 0,
        createdAt: user.created_at,
        subscriptionStatus: user.subscription_status
      };
      
      logger.info('📊 Info utilisateur:', userInfo);
      
      return res.json({
        success: true,
        message: 'Utilisateur trouvé',
        found: true,
        userInfo
      });
      
    } catch (error) {
      logger.error('❌ Erreur test:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur test',
        error: error.message
      });
    }
  },

  // ========================================
  // VÉRIFICATION EMAIL
  // ========================================
  verifyEmail: async (req, res) => {
    try {
      const { email, code } = req.body;
      
      logger.info(`📧 Tentative de vérification email pour ${email}`);

      // Trouver l'utilisateur
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Vérifier le code
      const verification = await VerificationCode.findOne({
        where: {
          user_id: user.id,
          code,
          type: 'email_verification',
          used_at: null,
          expires_at: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!verification) {
        logger.warn(`❌ Code de vérification invalide pour ${email}`);
        return res.status(400).json({
          success: false,
          message: 'Code de vérification invalide ou expiré'
        });
      }

      // Marquer l'email comme vérifié et le code comme utilisé
      await Promise.all([
        user.update({ email_verified: true }),
        verification.update({ used_at: new Date() })
      ]);

      logger.info(`✅ Email vérifié avec succès pour ${email}`);

      res.json({
        success: true,
        message: 'Email vérifié avec succès'
      });

    } catch (error) {
      logger.error('💥 Erreur lors de la vérification:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  },

  // ========================================
  // DEMANDE DE RÉINITIALISATION DE MOT DE PASSE
  // ========================================
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      // Trouver l'utilisateur
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.json({
          success: true,
          message: 'Si cette adresse email existe, vous recevrez un code de réinitialisation'
        });
      }

      // Générer un code de réinitialisation
      const code = generateVerificationCode();
      await VerificationCode.create({
        user_id: user.id,
        code,
        type: 'password_reset',
        expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      });

      // Envoyer l'email
      await emailService.sendVerificationCode(email, code);

      res.json({
        success: true,
        message: 'Si cette adresse email existe, vous recevrez un code de réinitialisation'
      });

    } catch (error) {
      console.error('Erreur lors de la demande de reset:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  },

  // ========================================
  // RÉINITIALISATION DU MOT DE PASSE
  // ========================================
  resetPassword: async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;

      // Trouver l'utilisateur
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Vérifier le code
      const verification = await VerificationCode.findOne({
        where: {
          user_id: user.id,
          code,
          type: 'password_reset',
          used: false,
          expires_at: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!verification) {
        return res.status(400).json({
          success: false,
          message: 'Code de réinitialisation invalide ou expiré'
        });
      }

      // Mettre à jour le mot de passe
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password_hash = hashedPassword;
      await user.save();

      // Marquer le code comme utilisé
      verification.used = true;
      await verification.save();

      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès'
      });

    } catch (error) {
      console.error('Erreur lors du reset:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  },

  // ========================================
  // RAFRAÎCHISSEMENT DU TOKEN
  // ========================================
  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token requis'
        });
      }

      // Vérifier le refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          message: 'Token invalide'
        });
      }

      // Vérifier si l'utilisateur existe toujours
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Générer de nouveaux tokens
      const tokens = generateTokens(decoded.userId);

      res.json({
        success: true,
        data: { tokens }
      });

    } catch (error) {
      console.error('Erreur lors du refresh:', error);
      res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
  }
};

module.exports = authController; 