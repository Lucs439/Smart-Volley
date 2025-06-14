import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const MatchSetupPage = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('matches')
        .select('id, opponent_name, match_date, location, is_home, team_id, created_by, status')
        .eq('id', matchId)
        .single();
      if (error) setError(error.message);
      else setMatch(data);
      setLoading(false);
    };
    fetchMatch();
  }, [matchId]);

  if (loading) return <div className="p-4">Chargement...</div>;
  if (error) return <div className="p-4 text-red-500">Erreur : {error}</div>;
  if (!match) return <div className="p-4">Aucun match trouvé.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
      <h1 className="text-2xl font-bold mb-4">Configuration du match</h1>
      <div className="mb-6">
        <div><b>Adversaire :</b> {match.opponent_name}</div>
        <div><b>Date :</b> {new Date(match.match_date).toLocaleString('fr-FR')}</div>
        <div><b>Lieu :</b> {match.location}</div>
        <div><b>Domicile :</b> {match.is_home ? 'Oui' : 'Non'}</div>
        <div><b>Statut :</b> {match.status}</div>
      </div>
      <div className="bg-blue-50 p-4 rounded text-blue-700">
        <b>À venir :</b> Sélection des titulaires et remplaçants (composition d'équipe)
      </div>
    </div>
  );
};

export default MatchSetupPage; 