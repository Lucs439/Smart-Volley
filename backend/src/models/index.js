const { Sequelize } = require('sequelize');

// Configuration de la base de données
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'paww_db',
  username: process.env.DB_USER || 'paww_user',
  password: process.env.DB_PASSWORD || 'paww_password',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// ========================================
// MODÈLE USER
// ========================================
const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: Sequelize.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  first_name: {
    type: Sequelize.STRING(100),
    allowNull: true
  },
  last_name: {
    type: Sequelize.STRING(100),
    allowNull: true
  },
  phone: {
    type: Sequelize.STRING(20),
    allowNull: true
  },
  email_verified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  subscription_status: {
    type: Sequelize.STRING(20),
    defaultValue: 'trial'
  },
  trial_ends_at: {
    type: Sequelize.DATE,
    allowNull: true
  },
  onboarding_completed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  last_login_at: {
    type: Sequelize.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// ========================================
// MODÈLE VERIFICATION CODE
// ========================================
const VerificationCode = sequelize.define('VerificationCode', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  code: {
    type: Sequelize.STRING(10),
    allowNull: false
  },
  type: {
    type: Sequelize.STRING(20),
    allowNull: false // email_verification, phone_verification, password_reset
  },
  expires_at: {
    type: Sequelize.DATE,
    allowNull: false
  },
  used_at: {
    type: Sequelize.DATE,
    allowNull: true
  }
}, {
  tableName: 'verification_codes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// ========================================
// RELATIONS
// ========================================
User.hasMany(VerificationCode, { 
  foreignKey: 'user_id', 
  as: 'verificationCodes' 
});
VerificationCode.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// ========================================
// INITIALISATION
// ========================================
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion PostgreSQL établie');
    
    // Synchroniser les modèles (crée les tables si elles n'existent pas)
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur base de données:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  User,
  VerificationCode,
  initDatabase
}; 