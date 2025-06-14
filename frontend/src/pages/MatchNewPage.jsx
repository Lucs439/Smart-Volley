import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const MatchNewPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    opponent_name: '',
    match_date: '',
    location: '',
    is_home: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userTeams, setUserTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(teamId || '');

  useEffect(() => {
    const fetchTeams = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setUserTeams(data);
    };
    fetchTeams();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectTeam = (e) => {
    setSelectedTeamId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');
      if (!selectedTeamId) throw new Error('Veuillez sélectionner une équipe');
      const { data, error } = await supabase
        .from('matches')
        .insert([
          {
            ...form,
            team_id: selectedTeamId,
            created_by: user.id,
            status: 'scheduled',
          },
        ])
        .select()
        .single();
      if (error) throw error;
      navigate(`/teams/${selectedTeamId}/matches`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
      <h1 className="text-2xl font-bold mb-6">Créer un nouveau match</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium">Équipe *</label>
          <select
            value={selectedTeamId}
            onChange={handleSelectTeam}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Sélectionner une équipe</option>
            {userTeams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Adversaire *</label>
          <input
            type="text"
            name="opponent_name"
            value={form.opponent_name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Date et heure *</label>
          <input
            type="datetime-local"
            name="match_date"
            value={form.match_date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Lieu *</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_home"
            checked={form.is_home}
            onChange={handleChange}
            id="is_home"
          />
          <label htmlFor="is_home">Match à domicile</label>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Création...' : 'Créer le match'}
        </button>
      </form>
    </div>
  );
};

export default MatchNewPage; 