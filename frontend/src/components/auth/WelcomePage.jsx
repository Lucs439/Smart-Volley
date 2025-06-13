import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            className="h-24 w-auto"
            src="/logo.png"
            alt="Smart Volley Logo"
          />
        </div>

        {/* Titre */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Bienvenue sur Smart Volley
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Votre assistant intelligent pour l'analyse de volley-ball
          </p>
        </div>

        {/* Bouton Création de compte */}
        <div>
          <button
            onClick={() => navigate('/register')}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Créer un compte
          </button>
        </div>

        {/* Lien de connexion */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Cliquez ici pour vous connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage; 