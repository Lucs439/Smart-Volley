const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: true
  },
  address_line1: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  address_line2: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  postal_code: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'France'
  },
  profile_picture_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  terms_accepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  privacy_policy_accepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  marketing_emails: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  account_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active'
  },
  subscription_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'trial'
  },
  trial_ends_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  onboarding_completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User; 