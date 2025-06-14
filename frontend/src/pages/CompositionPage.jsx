import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
// On suppose que FormationCreator sera dans ce dossier ou à déplacer
import FormationCreator from '../components/FormationCreator';

const CompositionPage = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreator, setShowCreator] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError('');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Utilisateur non connecté');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setTeams(data);
      setSelectedTeam(data[0]?.id || '');
      setLoading(false);
    };
    fetchTeams();
  }, []);

  // Charger les joueurs de l'équipe sélectionnée
  useEffect(() => {
    if (!selectedTeam) {
      setPlayers([]);
      return;
    }
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, first_name, last_name, position, number')
        .eq('team_id', selectedTeam)
        .order('number', { ascending: true });
      if (!error && data) setPlayers(data);
      else setPlayers([]);
    };
    fetchPlayers();
  }, [selectedTeam]);

  return (
    <div className="max-w-3xl mx-auto py-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">Compositions d'équipe</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium mb-1">Équipe</label>
          {loading ? (
            <div className="text-neutral-400">Chargement...</div>
          ) : teams.length === 0 ? (
            <div className="text-neutral-400">Aucune équipe trouvée</div>
          ) : (
            <select
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
              className="border rounded px-3 py-2 min-w-[180px]"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          )}
        </div>
        <button
          className="btn-primary h-10 px-6 w-full md:w-auto"
          disabled={!selectedTeam}
          onClick={() => setShowCreator(true)}
        >
          Nouvelle composition
        </button>
      </div>
      {/* Affichage du créateur de formation */}
      {showCreator ? (
        <FormationCreator
          teamId={selectedTeam}
          players={players}
          onSave={() => setShowCreator(false)}
        />
      ) : (
        <div className="text-neutral-500 text-center mt-24">
          {error ? error : 'Sélectionnez une équipe et cliquez sur "Nouvelle composition" pour commencer.'}
        </div>
      )}
    </div>
  );
};

export default CompositionPage; 