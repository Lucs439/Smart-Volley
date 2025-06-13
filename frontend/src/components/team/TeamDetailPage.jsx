import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import PlayerForm from './PlayerForm';

const TeamDetailPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchTeamDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      setTeam(teamData);

      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (playersError) throw playersError;
      setPlayers(playersData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) return;

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;
      setPlayers(players.filter(p => p.id !== playerId));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setShowPlayerForm(true);
  };

  const handlePlayerFormClose = () => {
    setShowPlayerForm(false);
    setEditingPlayer(null);
  };

  const handlePlayerFormSubmit = async (playerData) => {
    try {
      if (editingPlayer) {
        const { error } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', editingPlayer.id);

        if (error) throw error;
        setPlayers(players.map(p => p.id === editingPlayer.id ? { ...p, ...playerData } : p));
      } else {
        const { data, error } = await supabase
          .from('players')
          .insert([{ ...playerData, team_id: teamId }])
          .select()
          .single();

        if (error) throw error;
        setPlayers([data, ...players]);
      }
      handlePlayerFormClose();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      setError(error.message);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      navigate('/teams');
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 pl-72 flex items-center justify-center">Chargement...</div>;
  if (error) return <div className="min-h-screen bg-gray-50 pl-72 p-6 text-red-600">Erreur: {error}</div>;
  if (!team) return <div className="min-h-screen bg-gray-50 pl-72 p-6">Équipe non trouvée</div>;

  return (
    <div className="min-h-screen bg-gray-50 pl-72">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header de l'équipe */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{team.name}</h1>
              <div className="space-y-1 text-gray-600">
                <p><span className="font-medium">Niveau:</span> {team.level || 'Non spécifié'}</p>
                <p><span className="font-medium">Catégorie:</span> {team.category || 'Non spécifiée'}</p>
                <p><span className="font-medium">Genre:</span> {team.gender || 'Non spécifié'}</p>
                <p><span className="font-medium">Saison:</span> {team.season}</p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-800 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              Supprimer l'équipe
            </button>
          </div>
        </div>

        {/* Liste des joueurs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Joueurs</h2>
            <button
              onClick={() => setShowPlayerForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter un joueur
            </button>
          </div>
          {players.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun joueur dans cette équipe</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Photo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nom</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Prénom</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Poste</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Numéro</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(player => (
                    <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {player.photo_url ? (
                          <img
                            src={player.photo_url}
                            alt={`${player.first_name} ${player.last_name}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              {player.first_name?.[0]}{player.last_name?.[0]}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-900">{player.last_name}</td>
                      <td className="py-3 px-4 text-gray-900">{player.first_name}</td>
                      <td className="py-3 px-4 text-gray-900">{player.primary_position}</td>
                      <td className="py-3 px-4 text-gray-900">{player.number}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPlayer(player)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal du formulaire de joueur */}
      {showPlayerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingPlayer ? 'Modifier le joueur' : 'Ajouter un joueur'}
                </h2>
                <button
                  onClick={handlePlayerFormClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <PlayerForm
                onSubmit={handlePlayerFormSubmit}
                initialData={editingPlayer}
                onCancel={handlePlayerFormClose}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Supprimer l'équipe
            </h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible et vous perdrez toutes les informations associées.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteTeam}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetailPage; 