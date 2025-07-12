module.exports = {
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'development_secret',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d'
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  }
}; 