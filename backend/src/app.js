const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const requestLogger = require('./middlewares/logger');

const app = express();

// Middleware de sécurité
app.use(helmet());

// Middleware CORS
app.use(cors());

// Middleware de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logs
app.use(requestLogger);

// Route principale
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

// Routes API
app.use('/api/auth', require('./routes/auth.routes'));

// Middleware d'erreur 404
app.use((req, res) => {
  logger.apiError(req.method, req.originalUrl, 'Route non trouvée');
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  logger.apiError(req.method, req.originalUrl, err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur'
  });
});

module.exports = app; 