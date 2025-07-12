require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const { initDatabase } = require('./models');

const PORT = process.env.PORT || 3001;
const ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    // Connexion à la base de données et initialisation des modèles
    const dbConnected = await initDatabase();
    if (!dbConnected) {
      logger.error('❌ Impossible de démarrer le serveur sans connexion à la base de données');
      process.exit(1);
    }

    // Démarrage du serveur
    app.listen(PORT, () => {
      logger.info(`Serveur démarré sur le port ${PORT} en mode ${ENV}`);
      logger.info(`📍 http://localhost:${PORT}`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    logger.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Promesse rejetée non gérée:', { reason, promise });
  // Ne pas quitter le processus, juste logger l'erreur
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Exception non capturée:', error);
  // Quitter le processus de manière propre
  process.exit(1);
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  logger.shutdown('Signal SIGTERM reçu. Arrêt gracieux...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.shutdown('Signal SIGINT reçu. Arrêt gracieux...');
  process.exit(0);
});

startServer(); 