import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const AuthTest = () => {
  const { user, login, register, logout } = useAuth();
  const [testResult, setTestResult] = useState('');

  const testAuth = async () => {
    try {
      // Test d'inscription
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'test123456';
      const testUsername = `testuser${Date.now()}`;

      setTestResult('Test d\'inscription en cours...');
      const registerResult = await register(testEmail, testPassword, testUsername);
      
      if (!registerResult.success) {
        setTestResult(`Erreur d'inscription: ${registerResult.message}`);
        return;
      }

      // Test de déconnexion
      setTestResult('Test de déconnexion en cours...');
      await logout();

      // Test de connexion
      setTestResult('Test de connexion en cours...');
      const loginResult = await login(testEmail, testPassword);

      if (!loginResult.success) {
        setTestResult(`Erreur de connexion: ${loginResult.message}`);
        return;
      }

      // Vérification du profil
      setTestResult('Vérification du profil en cours...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setTestResult(`Erreur de récupération du profil: ${profileError.message}`);
        return;
      }

      setTestResult(`
        ✅ Tests réussis !
        - Inscription: OK
        - Déconnexion: OK
        - Connexion: OK
        - Profil: OK
        Email: ${profile.email}
        Username: ${profile.username}
      `);

    } catch (error) {
      setTestResult(`Erreur: ${error.message}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test d'authentification</h2>
      <button
        onClick={testAuth}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Lancer les tests
      </button>
      {testResult && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {testResult}
        </pre>
      )}
    </div>
  );
};

export default AuthTest; 