const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'smart_volley_db',
  user: process.env.DB_USER || 'smart_volley_user',
  password: process.env.DB_PASSWORD || 'smart_volley_password',
  max: 20, // Nombre maximum de connexions dans le pool
  idleTimeoutMillis: 30000, // Fermer les connexions inactives après 30 secondes
  connectionTimeoutMillis: 2000, // Timeout de connexion de 2 secondes
});

// Test de connexion
pool.on('connect', () => {
  logger.info('✅ Connexion à PostgreSQL établie');
});

pool.on('error', (err) => {
  logger.error('❌ Erreur de connexion PostgreSQL:', err);
});

// Fonction pour tester la connexion
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info('✅ Test de connexion PostgreSQL réussi:', result.rows[0]);
    return true;
  } catch (error) {
    logger.error('❌ Erreur lors du test de connexion PostgreSQL:', error);
    return false;
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  testConnection
}; 