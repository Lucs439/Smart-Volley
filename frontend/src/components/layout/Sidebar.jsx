import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoSvg from "../../assets/icons/Logo.svg";
import { HouseLine, UserCircleGear, SlidersHorizontal, Users, Volleyball } from "phosphor-react";
import { supabase } from '../../lib/supabaseClient';

const Sidebar = () => {
  const location = useLocation();
  const [teamId, setTeamId] = useState(null);

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

  const dynamicLinks = [
    {
      to: '/home',
      icon: HouseLine,
      label: 'Home',
      style: (selected) => ({ size: 28, weight: selected ? "fill" : "regular" }),
    },
    {
      to: '/teams',
      icon: Users,
      label: 'Équipes',
      style: (selected) => ({ size: 28, weight: selected ? "fill" : "regular" }),
    },
    {
      to: teamId ? `/teams/${teamId}/matches` : '#',
      icon: Volleyball,
      label: 'Matchs',
      style: (selected) => ({ size: 28, weight: selected ? "fill" : "regular" }),
      disabled: !teamId,
    },
    {
      to: '/profile',
      icon: UserCircleGear,
      label: 'Profil',
      style: (selected) => ({ size: 28, weight: selected ? "duotone" : "regular" }),
    },
    {
      to: '/settings',
      icon: SlidersHorizontal,
      label: 'Réglages',
      style: (selected) => ({ size: 28, weight: selected ? "duotone" : "regular" }),
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 fixed left-0 top-0 h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 h-10">
          <img src={LogoSvg} alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-semibold text-gray-900">Smart Volley</span>
        </div>
      </div>
      <nav className="flex-1 p-6 space-y-2">
        {dynamicLinks.map(link => {
          const Icon = link.icon;
          const selected = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors duration-150 ${selected ? 'bg-blue-50 text-blue-600' : link.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}
              tabIndex={link.disabled ? -1 : 0}
              aria-disabled={link.disabled}
              onClick={e => { if (link.disabled) e.preventDefault(); }}
            >
              <Icon {...link.style(selected)} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar; 