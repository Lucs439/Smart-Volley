const { Sequelize } = require('sequelize');
const logger = require('./logger');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'smart_volley_db',
  username: process.env.DB_USER || 'smart_volley_user',
  password: process.env.DB_PASSWORD || 'smart_volley_password',
  logging: (msg) => logger.debug(msg),
  define: {
    underscored: true,
    timestamps: true
  }
});

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Connexion à PostgreSQL établie');
    return true;
  } catch (error) {
    logger.error('❌ Impossible de se connecter à PostgreSQL:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  connectDatabase
}; 