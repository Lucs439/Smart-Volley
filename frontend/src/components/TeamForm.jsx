import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const TeamForm = ({ onTeamCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    federation: '',
    level: '',
    category: '',
    gender: '',
    season: '2024-2025',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userTeams, setUserTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const federations = [
    'FFVB',
    'FFGT', 
    'UNSS',
    'UGSEL',
    'FSGT',
    'Loisir'
  ];

  const levels = [
    'Loisir',
    'Départemental 3',
    'Départemental 2',
    'Départemental 1',
    'Régional 3',
    'Régional 2',
    'Régional 1',
    'Pré-National',
    'National 3',
    'National 2',
    'National 1',
    'Ligue A',
    'Ligue B'
  ];

  const categories = [
    'M9',
    'M11',
    'M13',
    'M15',
    'M18',
    'M20',
    'Senior',
    'Vétéran'
  ];

  const genders = [
    'Masculin',
    'Féminin',
    'Mixte'
  ];

  useEffect(() => {
    const fetchTeams = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setUserTeams(data);
    };
    fetchTeams();
  }, []);

  const handleSelectTeam = (e) => {
    const teamId = e.target.value;
    setSelectedTeamId(teamId);
    if (!teamId) {
      setFormData({
        name: '', federation: '', level: '', category: '', gender: '', season: '2024-2025', description: ''
      });
      return;
    }
    const team = userTeams.find(t => t.id === teamId);
    if (team) {
      setFormData({
        name: team.name || '',
        federation: team.federation || '',
        level: team.level || '',
        category: team.category || '',
        gender: team.gender || '',
        season: team.season || '2024-2025',
        description: team.description || ''
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.federation) {
      setError('Le nom et la fédération sont obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Vous devez être connecté');
      }

      const { data, error } = await supabase
        .from('teams')
        .insert([
          {
            ...formData,
            coach_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      alert('Équipe créée avec succès !');
      setFormData({
        name: '',
        federation: '',
        level: '',
        category: '',
        gender: '',
        season: '2024-2025',
        description: ''
      });

      if (onTeamCreated) {
        onTeamCreated(data);
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dropdown de sélection d'équipe existante */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Sélectionner une équipe existante
        </label>
        <select
          value={selectedTeamId}
          onChange={handleSelectTeam}
          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
        >
          <option value="">Créer une nouvelle équipe</option>
          {userTeams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nom de l'équipe */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Nom de l'équipe *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
          placeholder="Ex: VBC Paris Seniors"
        />
      </div>

      {/* Grille pour les selects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fédération */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Fédération *
          </label>
          <select
            name="federation"
            value={formData.federation}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
          >
            <option value="">Choisir</option>
            {federations.map(fed => (
              <option key={fed} value={fed}>{fed}</option>
            ))}
          </select>
        </div>

        {/* Niveau */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Niveau
          </label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
          >
            <option value="">Choisir</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Catégorie */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Catégorie d'âge
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
          >
            <option value="">Choisir</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Genre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Genre
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
          >
            <option value="">Choisir</option>
            {genders.map(gender => (
              <option key={gender} value={gender}>{gender}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Saison */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Saison
        </label>
        <input
          type="text"
          name="season"
          value={formData.season}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
          placeholder="Ex: 2024-2025"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Description
          <span className="text-gray-400 font-normal"> (optionnel)</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 resize-none"
          placeholder="Objectifs de la saison, informations complémentaires..."
        />
      </div>

      {/* Footer avec boutons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4">
        <button
          type="button"
          onClick={() => onTeamCreated && onTeamCreated(null)}
          className="px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
        >
          Annuler
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Création...
            </div>
          ) : (
            'Créer l\'équipe'
          )}
        </button>
      </div>
    </div>
  );
};

export default TeamForm; 