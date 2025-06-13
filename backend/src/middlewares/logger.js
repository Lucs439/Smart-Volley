const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  // Log de la requête entrante
  logger.info(`${method} ${originalUrl} - IP: ${ip}`);

  // Interception de la fin de la requête
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const message = `${method} ${originalUrl} - Status: ${status} - ${duration}ms`;

    if (status >= 500) {
      logger.error(message);
    } else if (status >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }

    // Log de performance si la requête est lente (> 1s)
    if (duration > 1000) {
      logger.warn(`Requête lente détectée: ${message}`);
    }
  });

  next();
};

module.exports = requestLogger; 