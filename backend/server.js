require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./src/config/config');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');
const { initDatabase } = require('./src/models');

// Import des routes
const authRoutes = require('./src/routes/auth.routes.js');
const petRoutes = require('./src/routes/pets');
const metricsRoutes = require('./src/routes/metrics');
const userRoutes = require('./src/routes/users');

// Middlewares globaux
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message: 'Trop de requêtes depuis cette IP, réessayez dans 15 minutes.'
});

const app = express();

// Middleware de base
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Initialisation de la base de données
(async () => {
  try {
    const dbInitialized = await initDatabase();
    if (dbInitialized) {
      logger.info('✅ Base de données initialisée avec succès');
    } else {
      logger.error('❌ Échec de l\'initialisation de la base de données');
      process.exit(1);
    }
  } catch (error) {
    logger.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    process.exit(1);
  }
})();

// Routes de base
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API PAWW! 🐾',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      pets: '/api/pets',
      metrics: '/api/metrics'
    }
  });
});

// ========================================
// ROUTE DE TEST TEMPORAIRE
// ========================================
app.post('/api/auth/debug-test', async (req, res) => {
  try {
    console.log('🧪 Route de test appelée');
    console.log('📝 Corps de la requête:', req.body);
    
    res.json({
      success: true,
      message: 'Route de test fonctionne',
      timestamp: new Date().toISOString(),
      body: req.body
    });
  } catch (error) {
    console.error('Erreur route test:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur route test',
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/metrics', metricsRoutes);

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.originalUrl} n'existe pas`
  });
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Démarrage du serveur
const PORT = config.server.port;
app.listen(PORT, () => {
  logger.info(`🚀 Serveur démarré sur le port ${PORT} en mode ${config.server.env}`);
  logger.info(`📍 http://localhost:${PORT}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Gestion des erreurs non catchées
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app; 