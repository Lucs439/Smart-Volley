const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const UserSession = sequelize.define('UserSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  session_token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  refresh_token: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  last_used_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ip_address: {
    type: DataTypes.INET,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'user_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = UserSession; 