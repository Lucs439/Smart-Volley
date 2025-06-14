import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import TeamForm from '../TeamForm';
import { Link } from 'react-router-dom';

const TeamPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Vous devez être connecté');
      }

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTeams(data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamCreated = (newTeam) => {
    setTeams(prevTeams => [newTeam, ...prevTeams]);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header avec bouton de création */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Mes équipes</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">Gérez vos équipes de volleyball</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary shadow-lg shadow-primary-500/10"
          >
            Créer une équipe
          </button>
        </div>

        {/* Liste des équipes ou message vide */}
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune équipe</h3>
            <p className="text-gray-600 mb-6">Commencez par créer votre première équipe</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25 text-lg"
            >
              Créer une équipe
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map(team => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="card p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">{team.name}</h3>
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300 rounded-full text-sm font-medium">
                    {team.federation}
                  </span>
                </div>
                <div className="space-y-2 text-neutral-600 dark:text-neutral-400">
                  <p><span className="font-medium">Niveau:</span> {team.level || 'Non spécifié'}</p>
                  <p><span className="font-medium">Catégorie:</span> {team.category || 'Non spécifiée'}</p>
                  <p><span className="font-medium">Genre:</span> {team.gender || 'Non spécifié'}</p>
                  <p><span className="font-medium">Saison:</span> {team.season}</p>
                </div>
                {team.description && (
                  <p className="mt-4 text-neutral-500 dark:text-neutral-400 text-sm">{team.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Modal du formulaire */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Créer une équipe</h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <TeamForm onTeamCreated={handleTeamCreated} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage; 