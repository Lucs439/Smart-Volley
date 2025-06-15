import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Composant pour le bouton de position passeur
const PasseurSelector = ({ selected, onSelect }) => (
  <div className="flex justify-start gap-2 mb-8">
    {[1,2,3,4,5,6].map((p) => (
      <button
        key={p}
        className={`px-4 py-2 rounded font-bold border transition-all ${selected === p ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-100'}`}
        onClick={() => onSelect(p)}
      >
        P{p}
      </button>
    ))}
  </div>
);

// Composant terrain de volley
const TerrainVolley = ({ joueurs, passeurPos }) => {
  // Coordonnées adaptées au SVG
  const coords = {
    1: { x: '80%', y: '80%' },
    2: { x: '80%', y: '40%' },
    3: { x: '50%', y: '40%' },
    4: { x: '20%', y: '40%' },
    5: { x: '20%', y: '80%' },
    6: { x: '50%', y: '80%' },
  };
  const rotation = [passeurPos, ...[1,2,3,4,5,6].filter(p=>p!==passeurPos)];
  const joueursTournes = [...joueurs];
  while (rotation[0] !== 1) {
    rotation.push(rotation.shift());
    joueursTournes.push(joueursTournes.shift());
  }
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ minHeight: '32rem' }}
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          width: '40rem',
          height: '44rem',
          background: '#007BFF',
          borderRadius: '0.625rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto',
          overflow: 'hidden',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="700"
          height="700"
          viewBox="0 0 549 494"
          fill="none"
          style={{
            display: 'block',
            transform: 'none',
            margin: 'auto',
            maxWidth: '95%',
            maxHeight: '95%',
          }}
        >
          <path d="M49 449L49 -0.999969H500V449H49Z" fill="#FF7F50"/>
          <path d="M49 449H47V451H49V449ZM49 -0.999969V-2.99997H47V-0.999969H49ZM500 -0.999969H502V-2.99997H500V-0.999969ZM500 449V451H502V449H500ZM538 9.66667C543.891 9.66667 548.667 4.89104 548.667 -1C548.667 -6.89104 543.891 -11.6667 538 -11.6667C532.109 -11.6667 527.333 -6.89104 527.333 -1C527.333 4.89104 532.109 9.66667 538 9.66667ZM11 9.6667C16.891 9.6667 21.6667 4.89107 21.6667 -0.999969C21.6667 -6.89101 16.891 -11.6666 11 -11.6666C5.10896 -11.6666 0.333333 -6.89101 0.333333 -0.999969C0.333333 4.89107 5.10896 9.6667 11 9.6667ZM49 449H51L51 -0.999969H49H47L47 449H49ZM49 -0.999969V1.00003H500V-0.999969V-2.99997H49V-0.999969ZM500 -0.999969H498V449H500H502V-0.999969H500ZM500 449V447H49V449V451H500V449ZM538 -1L538 -3L11 -2.99997L11 -0.999969L11 1.00003L538 1L538 -1ZM498 494H500V470H498H496V494H498ZM51 493H53V469H51H49V493H51ZM500 149V147H49V149V151H500V149Z" fill="white"/>
        </svg>
        {joueursTournes.map((joueur, idx) => (
          <div
            key={joueur?.id || idx}
            className="absolute flex flex-col items-center"
            style={{
              left: coords[idx+1].x,
              top: coords[idx+1].y,
              transform: 'translate(-50%, -50%)',
              zIndex: 2
            }}
          >
            <div className="w-12 h-12 rounded-full bg-white border-4 border-blue-700 flex items-center justify-center text-base font-bold text-blue-700 shadow">
              {joueur ? joueur.number : idx+1}
            </div>
            <div className="mt-1 text-xs text-white font-semibold bg-blue-700 bg-opacity-80 px-2 py-1 rounded">
              {joueur ? `${joueur.first_name}` : 'Libre'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CompositionNewPage = () => {
  const [nom, setNom] = useState('');
  const [equipes, setEquipes] = useState([]);
  const [equipeId, setEquipeId] = useState('');
  const [joueurs, setJoueurs] = useState([]);
  const [passeurPos, setPasseurPos] = useState(1);
  const [compositionType, setCompositionType] = useState('universelle');
  const [joueursError, setJoueursError] = useState('');

  // Récupère les équipes de l'utilisateur
  useEffect(() => {
    const fetchEquipes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setEquipes(data);
    };
    fetchEquipes();
  }, []);

  // Récupère les joueurs de l'équipe sélectionnée
  useEffect(() => {
    if (!equipeId) { setJoueurs([]); setJoueursError(''); return; }
    const fetchJoueurs = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, first_name, last_name, number, position')
        .eq('team_id', equipeId)
        .order('number', { ascending: true });
      if (!error && data) {
        setJoueurs(data);
        setJoueursError(data.length < 6 ? 'Il faut au moins 6 joueurs dans l\'équipe pour créer une composition.' : '');
      }
    };
    fetchJoueurs();
  }, [equipeId]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header sur toute la largeur, titre à gauche, trait de séparation */}
      <div className="bg-white shadow-sm px-8 py-4 flex items-center w-full border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Créer une composition</h1>
      </div>
      <div className="flex flex-1 flex-row w-full">
        {/* Sidebar paramètres collée à la sidebar principale, sans padding latéral */}
        <div className="w-80 bg-white border-r px-0 py-8 flex flex-col gap-6">
          <div className="px-6">
            <label className="block text-sm font-medium mb-1">Nom de la composition</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={nom}
              onChange={e => setNom(e.target.value)}
              placeholder="Ex: 4-2 Rotation 1"
            />
          </div>
          <div className="px-6">
            <label className="block text-sm font-medium mb-1">Équipe</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={equipeId}
              onChange={e => setEquipeId(e.target.value)}
            >
              <option value="">Sélectionner une équipe</option>
              {equipes.map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>
          <div className="px-6">
            <label className="block text-sm font-medium mb-1">Type de composition</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={compositionType}
              onChange={e => setCompositionType(e.target.value)}
            >
              <option value="universelle">Compos universelle (loisir)</option>
              <option value="4-2">Compos 4-2</option>
              <option value="5-1">Compos 5-1</option>
            </select>
          </div>
          <div className="px-6">
            <label className="block text-sm font-medium mb-1">Joueurs sélectionnés</label>
            {joueursError && (
              <div className="text-red-600 text-sm mb-2">{joueursError}</div>
            )}
            {joueurs.length > 0 && (
              <div className="space-y-2">
                <div>
                  <div className="font-semibold text-gray-700 mb-1">Titulaire{joueurs.length > 1 ? 's' : ''}</div>
                  <ul className="space-y-1">
                    {joueurs.slice(0, 6).map(j => (
                      <li key={j.id} className="flex items-center gap-2">
                        <span className="font-semibold">{j.number}</span>
                        <span>{j.first_name} {j.last_name}</span>
                        <span className="text-xs text-gray-400">{j.position}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {joueurs.length > 6 && (
                  <div>
                    <div className="font-semibold text-gray-700 mt-2 mb-1">Remplaçant{joueurs.length - 6 > 1 ? 's' : ''}</div>
                    <ul className="space-y-1">
                      {joueurs.slice(6).map(j => (
                        <li key={j.id} className="flex items-center gap-2">
                          <span className="font-semibold">{j.number}</span>
                          <span>{j.first_name} {j.last_name}</span>
                          <span className="text-xs text-gray-400">{j.position}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {joueurs.length === 0 && !joueursError && <div className="text-gray-400">Aucun joueur</div>}
          </div>
        </div>
        {/* Terrain prend toute la largeur restante, sans padding latéral */}
        <div className="flex-1 flex flex-col items-start justify-center pb-12 p-8">
          <div className="w-full px-8">
            <PasseurSelector selected={passeurPos} onSelect={setPasseurPos} />
            <TerrainVolley joueurs={joueurs} passeurPos={passeurPos} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompositionNewPage; 