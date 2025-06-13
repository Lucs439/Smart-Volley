const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Définition des chemins absolus
const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const ERROR_LOG = path.join(LOG_DIR, 'error.log');
const COMBINED_LOG = path.join(LOG_DIR, 'combined.log');

// Création du dossier logs s'il n'existe pas
try {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  // Création des fichiers s'ils n'existent pas
  if (!fs.existsSync(ERROR_LOG)) {
    fs.writeFileSync(ERROR_LOG, '');
  }
  if (!fs.existsSync(COMBINED_LOG)) {
    fs.writeFileSync(COMBINED_LOG, '');
  }
} catch (error) {
  console.error('Erreur lors de la création des fichiers de logs:', error);
}

// Format personnalisé pour les logs
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

// Configuration du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    }),
    new winston.transports.File({
      filename: ERROR_LOG,
      level: 'error'
    }),
    new winston.transports.File({
      filename: COMBINED_LOG
    })
  ]
});

// Test d'écriture
try {
  logger.info('Logger initialisé avec succès');
} catch (error) {
  console.error('Erreur lors de l\'écriture des logs:', error);
}

module.exports = logger; 
// Test d'écriture
try {
  logger.info('Logger initialisé avec succès');
} catch (error) {
  console.error('Erreur lors de l\'écriture des logs:', error);
}

module.exports = logger; 