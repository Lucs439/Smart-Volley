import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChartLine, Users, Volleyball, Trophy, ArrowRight } from 'phosphor-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMatches: 0,
    totalPlayers: 0,
    winRate: 0,
    recentMatches: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Récupérer les équipes de l'utilisateur
        const { data: teams } = await supabase
          .from('teams')
          .select('id')
          .eq('coach_id', user.id);

        if (!teams?.length) return;

        const teamIds = teams.map(team => team.id);

        // Récupérer les statistiques
        const { data: matches } = await supabase
          .from('matches')
          .select('*')
          .in('team_id', teamIds)
          .order('match_date', { ascending: false });

        const { data: players } = await supabase
          .from('players')
          .select('*')
          .in('team_id', teamIds);

        // Calculer le taux de victoire
        const wins = matches?.filter(match => match.result === 'win')?.length || 0;
        const winRate = matches?.length ? (wins / matches.length) * 100 : 0;

        setStats({
          totalMatches: matches?.length || 0,
          totalPlayers: players?.length || 0,
          winRate: Math.round(winRate),
          recentMatches: matches?.slice(0, 5) || []
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Matchs joués</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stats.totalMatches}</p>
            </div>
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <Volleyball size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Joueurs</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stats.totalPlayers}</p>
            </div>
            <div className="p-3 bg-accent-violet/10 rounded-lg">
              <Users size={24} className="text-accent-violet" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Taux de victoire</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stats.winRate}%</p>
            </div>
            <div className="p-3 bg-accent-green/10 rounded-lg">
              <Trophy size={24} className="text-accent-green" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Analyses</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">12</p>
            </div>
            <div className="p-3 bg-accent-blue/10 rounded-lg">
              <ChartLine size={24} className="text-accent-blue" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Matchs récents</h2>
          <div className="space-y-4">
            {stats.recentMatches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                onClick={() => navigate(`/matches/${match.id}`)}
              >
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">{match.opponent_name}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {new Date(match.match_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    match.result === 'win'
                      ? 'bg-accent-green/10 text-accent-green'
                      : match.result === 'loss'
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                  }`}>
                    {match.result === 'win' ? 'Victoire' : match.result === 'loss' ? 'Défaite' : 'En cours'}
                  </span>
                  <ArrowRight size={20} className="text-neutral-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/teams/new')}
              className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
            >
              <Users size={24} className="text-primary-600 dark:text-primary-400 mb-2" />
              <p className="font-medium text-neutral-900 dark:text-white">Nouvelle équipe</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Créer une équipe</p>
            </button>

            <button
              onClick={() => navigate('/matches/new')}
              className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
            >
              <Volleyball size={24} className="text-accent-violet mb-2" />
              <p className="font-medium text-neutral-900 dark:text-white">Nouveau match</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Planifier un match</p>
            </button>

            <button
              onClick={() => navigate('/analytics')}
              className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
            >
              <ChartLine size={24} className="text-accent-blue mb-2" />
              <p className="font-medium text-neutral-900 dark:text-white">Analyses</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Voir les statistiques</p>
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
            >
              <Trophy size={24} className="text-accent-green mb-2" />
              <p className="font-medium text-neutral-900 dark:text-white">Objectifs</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Définir des objectifs</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 