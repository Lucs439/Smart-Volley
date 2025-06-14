import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const MatchPage = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userTeams, setUserTeams] = useState([]);
  const [filterTeamId, setFilterTeamId] = useState('');
  const [filterOpponent, setFilterOpponent] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  useEffect(() => {
    fetchUserTeams();
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [userTeams, filterTeamId, filterOpponent, filterStart, filterEnd]);

  const fetchUserTeams = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('teams')
      .select('id, name')
      .eq('coach_id', user.id);
    if (!error && data) setUserTeams(data);
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Récupère tous les matchs des équipes du coach
      let query = supabase
        .from('matches')
        .select('*, teams(name)')
        .in('team_id', userTeams.map(t => t.id));
      if (filterTeamId) query = query.eq('team_id', filterTeamId);
      if (filterOpponent) query = query.ilike('opponent_name', `%${filterOpponent}%`);
      if (filterStart) query = query.gte('match_date', filterStart);
      if (filterEnd) query = query.lte('match_date', filterEnd);
      query = query.order('match_date', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      setMatches(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = () => {
    navigate(`/teams/${userTeams[0]?.id || ''}/matches/new`);
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Supprimer ce match ?')) return;
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);
    if (!error) fetchMatches();
  };

  if (loading) return <div className="p-4">Chargement...</div>;
  if (error) return <div className="p-4 text-red-500">Erreur: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tous les matchs</h1>
        <button
          onClick={handleCreateMatch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Nouveau Match
        </button>
      </div>
      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Équipe du coach</label>
          <select
            value={filterTeamId}
            onChange={e => setFilterTeamId(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Toutes</option>
            {userTeams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Équipe adverse</label>
          <input
            type="text"
            value={filterOpponent}
            onChange={e => setFilterOpponent(e.target.value)}
            className="border rounded px-3 py-2"
            placeholder="Nom adversaire"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Début</label>
          <input
            type="date"
            value={filterStart}
            onChange={e => setFilterStart(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fin</label>
          <input
            type="date"
            value={filterEnd}
            onChange={e => setFilterEnd(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
      </div>
      <div className="grid gap-4">
        {matches.length === 0 ? (
          <p className="text-gray-500">Aucun match trouvé</p>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    {match.is_home
                      ? `${match.teams?.name || ''} vs ${match.opponent_name}`
                      : `${match.opponent_name} vs ${match.teams?.name || ''}`}
                  </h2>
                  <p className="text-gray-600">
                    {new Date(match.match_date).toLocaleDateString('fr-FR', {
                      dateStyle: 'full',
                    })}
                  </p>
                  <p className="text-gray-600">{match.location}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    match.status === 'completed' ? 'bg-green-100 text-green-800' :
                    match.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    match.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {match.status === 'completed' ? 'Terminé' :
                     match.status === 'in_progress' ? 'En cours' :
                     match.status === 'cancelled' ? 'Annulé' :
                     'Programmé'}
                  </span>
                  {match.status === 'completed' && (
                    <p className="mt-2 text-lg font-bold">
                      {match.score_team} - {match.score_opponent}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                {match.status === 'scheduled' && (
                  <button
                    onClick={() => navigate(`/matches/${match.id}/setup`)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Configurer
                  </button>
                )}
                {match.status === 'in_progress' && (
                  <button
                    onClick={() => navigate(`/matches/${match.id}/live`)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Live
                  </button>
                )}
                {match.status === 'completed' && (
                  <button
                    onClick={() => navigate(`/matches/${match.id}/summary`)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Résumé
                  </button>
                )}
                <button
                  onClick={() => handleDeleteMatch(match.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MatchPage; 