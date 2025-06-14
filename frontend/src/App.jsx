import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import WelcomePage from './components/auth/WelcomePage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProfilePage from './components/profile/ProfilePage';
import HomePage from './components/home/HomePage';
import AuthTest from './components/auth/AuthTest';
import SettingsPage from './components/settings/SettingsPage';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import UploadSection from './components/UploadSection';
import StatsTable from './components/tables/StatsTable';
import ConfigModal from './components/modals/ConfigModal';
import LimitModal from './components/modals/LimitModal';
import TeamForm from './components/TeamForm';
import TeamPage from './components/team/TeamPage';
import TeamDetailPage from './components/team/TeamDetailPage';
import MatchPage from './pages/MatchPage';
import MatchNewPage from './pages/MatchNewPage';
import MatchSetupPage from './pages/MatchSetupPage';
import CompositionPage from './pages/CompositionPage';

const API_BASE_URL = 'http://127.0.0.1:8000';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/welcome" />;
  }

  return children;
};

const App = () => {
  const [activeTab, setActiveTab] = useState('Match 1');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  
  // Configuration des équipes
  const [teamConfig, setTeamConfig] = useState({
    teamA: {
      name: 'Équipe A',
      color: '#3B82F6',
      players: [
        { number: 1, name: '', position: 'Passeur' },
        { number: 2, name: '', position: 'Central' },
        { number: 3, name: '', position: 'Réceptionneur' },
        { number: 4, name: '', position: 'Pointu' },
        { number: 5, name: '', position: 'Central' },
        { number: 6, name: '', position: 'Libéro' }
      ]
    },
    teamB: {
      name: 'Équipe B',
      color: '#EF4444',
      players: [
        { number: 1, name: '', position: 'Passeur' },
        { number: 2, name: '', position: 'Central' },
        { number: 3, name: '', position: 'Réceptionneur' },
        { number: 4, name: '', position: 'Pointu' },
        { number: 5, name: '', position: 'Central' },
        { number: 6, name: '', position: 'Libéro' }
      ]
    }
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const maxSizeInMB = 25;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    if (file.size > maxSizeInBytes) {
      setShowLimitModal(true);
      event.target.value = '';
      return;
    }
    
    setSelectedFile(file);
    setUploadStatus('');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadStatus('');
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Veuillez sélectionner une vidéo');
      return;
    }

    if (!isConfigured) {
      setShowConfigModal(true);
      return;
    }

    // Vérifier que tous les joueurs ont un nom
    const allPlayersNamed = [
      ...teamConfig.teamA.players,
      ...teamConfig.teamB.players
    ].every(player => player.name.trim() !== '');

    if (!allPlayersNamed) {
      setUploadStatus('❌ Erreur: Tous les joueurs doivent avoir un nom');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Upload en cours...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('team_config', JSON.stringify(teamConfig));

      const response = await fetch(`${API_BASE_URL}/video/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus(`✅ Succès: ${result.message}`);
        if (result.match_id) {
          console.log('Match ID:', result.match_id);
        }
      } else {
        setUploadStatus(`❌ Erreur: ${result.detail || 'Erreur inconnue'}`);
      }
    } catch (error) {
      setUploadStatus('❌ Erreur: Erreur lors de la mise en ligne');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto pl-64">
            <Routes>
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/teams" element={<PrivateRoute><TeamPage /></PrivateRoute>} />
              <Route path="/teams/:teamId" element={<PrivateRoute><TeamDetailPage /></PrivateRoute>} />
              <Route path="/teams/:teamId/matches" element={<PrivateRoute><MatchPage /></PrivateRoute>} />
              <Route path="/teams/:teamId/matches/new" element={<PrivateRoute><MatchNewPage /></PrivateRoute>} />
              <Route path="/team/create" element={<PrivateRoute><TeamForm /></PrivateRoute>} />
              <Route path="/test" element={<PrivateRoute><AuthTest /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
              <Route path="/matches/:matchId/setup" element={<PrivateRoute><MatchSetupPage /></PrivateRoute>} />
              <Route path="/composition" element={<PrivateRoute><CompositionPage /></PrivateRoute>} />
              <Route path="/" element={<Navigate to="/home" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;