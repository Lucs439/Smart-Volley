const logger = require('./logger');

class EmailService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.templates = {
      verification: {
        subject: 'Vérifiez votre compte PAWW 🐾',
        template: (code) => `
          Bonjour !
          
          Votre code de vérification PAWW est : ${code}
          
          Ce code expire dans 15 minutes.
          
          Si vous n'avez pas créé de compte, ignorez cet email.
          
          L'équipe PAWW
        `
      },
      passwordReset: {
        subject: 'Réinitialisez votre mot de passe PAWW 🔐',
        template: (code) => `
          Bonjour !
          
          Votre code de réinitialisation PAWW est : ${code}
          
          Ce code expire dans 30 minutes.
          
          Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          
          L'équipe PAWW
        `
      },
      welcome: {
        subject: 'Bienvenue chez PAWW ! 🎉',
        template: (firstName) => `
          Bonjour ${firstName || ''} !
          
          Bienvenue dans la communauté PAWW. Nous sommes ravis de vous compter parmi nous !
          
          Voici quelques étapes pour bien démarrer :
          1. Vérifiez votre email
          2. Complétez votre profil
          3. Ajoutez votre premier animal
          4. Connectez son collier PAWW
          
          Si vous avez des questions, notre équipe est là pour vous aider.
          
          L'équipe PAWW
        `
      }
    };
  }

  async sendEmail(to, subject, content, template = 'basic') {
    try {
      if (this.isProduction) {
        // TODO: Intégrer SendGrid, Mailgun, etc.
        logger.emailSent(to, subject);
      } else {
        logger.info('📧 [DEV] Email simulé :');
        logger.info(`À: ${to}`);
        logger.info(`Sujet: ${subject}`);
        logger.info(`Contenu:\n${content}`);
        
        // Ajout d'un log spécial pour le code de vérification en mode dev
        if (template === 'verification') {
          const code = content.match(/code de vérification PAWW est : (\d+)/)[1];
          logger.info(`🔑 CODE DE VÉRIFICATION: ${code}`);
        }
      }
      
      return {
        success: true,
        messageId: `msg_${Date.now()}`
      };
    } catch (error) {
      logger.emailError(to, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendVerificationCode(email, code) {
    const { subject, template } = this.templates.verification;
    logger.verificationCode(email, code);
    return this.sendEmail(email, subject, template(code), 'verification');
  }

  async sendPasswordReset(email, code) {
    const { subject, template } = this.templates.passwordReset;
    logger.verificationCode(email, code);
    return this.sendEmail(email, subject, template(code), 'passwordReset');
  }

  async sendWelcome(email, firstName) {
    const { subject, template } = this.templates.welcome;
    return this.sendEmail(email, subject, template(firstName), 'welcome');
  }
}

module.exports = new EmailService(); 