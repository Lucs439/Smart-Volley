import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoSvg from "../../assets/icons/Logo.svg";
import { HouseLine, UserCircleGear, SlidersHorizontal, Users, Volleyball, ChartLine } from "phosphor-react";
import { supabase } from '../../lib/supabaseClient';

const Sidebar = () => {
  const location = useLocation();
  const [teamId, setTeamId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('teams')
        .select('id')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });
      if (error) return;
      if (data && data.length > 0) {
        setTeamId(data[0].id);
      }
    };
    fetchTeams();
  }, []);

  const navigationItems = [
    {
      to: '/home',
      icon: HouseLine,
      label: 'Accueil',
      style: (selected) => ({ size: 24, weight: selected ? "fill" : "regular" }),
    },
    {
      to: '/teams',
      icon: Users,
      label: 'Équipes',
      style: (selected) => ({ size: 24, weight: selected ? "fill" : "regular" }),
    },
    {
      to: teamId ? `/teams/${teamId}/matches` : '#',
      icon: Volleyball,
      label: 'Matchs',
      style: (selected) => ({ size: 24, weight: selected ? "fill" : "regular" }),
      disabled: !teamId,
    },
    {
      to: '/analytics',
      icon: ChartLine,
      label: 'Analytics',
      style: (selected) => ({ size: 24, weight: selected ? "fill" : "regular" }),
    },
    {
      to: '/profile',
      icon: UserCircleGear,
      label: 'Profil',
      style: (selected) => ({ size: 24, weight: selected ? "fill" : "regular" }),
    },
    {
      to: '/settings',
      icon: SlidersHorizontal,
      label: 'Réglages',
      style: (selected) => ({ size: 24, weight: selected ? "fill" : "regular" }),
    },
    {
      to: '/composition',
      icon: ChartLine,
      label: 'Composition',
      style: (selected) => ({ size: 24, weight: selected ? "fill" : "regular" }),
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <img src={LogoSvg} alt="Smart Volley" className="h-8 w-auto" />
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${isActive ? 'active' : ''} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <Icon {...item.style(isActive)} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
        <button
          onClick={() => document.documentElement.classList.toggle('dark')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors"
        >
          <span className="dark:hidden">🌙</span>
          <span className="hidden dark:inline">☀️</span>
          <span>Mode {document.documentElement.classList.contains('dark') ? 'clair' : 'sombre'}</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex justify-around items-center h-16">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-600 dark:text-neutral-300'
                }`}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <Icon {...item.style(isActive)} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700">
      <SidebarContent />
    </div>
  );
};

export default Sidebar; 