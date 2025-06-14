import React, { useState, useEffect } from 'react';

const FormationCreator = ({ teamId, players = [], onSave }) => {
  const [formationData, setFormationData] = useState({
    name: '',
    system: '',
    description: '',
    sets: {
      1: { rotations: {} },
      2: { rotations: {} },
      3: { rotations: {} },
      4: { rotations: {} },
      5: { rotations: {} }
    }
  });

  const [currentSet, setCurrentSet] = useState(1);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [loading, setLoading] = useState(false);

  // Données exemple pour démonstration
  const examplePlayers = [
    { id: 1, first_name: 'Alexandre', last_name: 'Dupont', position: 'Passeur', number: 5 },
    { id: 2, first_name: 'Sophie', last_name: 'Martin', position: 'Attaquant', number: 12 },
    { id: 3, first_name: 'Thomas', last_name: 'Bernard', position: 'Central', number: 8 },
    { id: 4, first_name: 'Marie', last_name: 'Durand', position: 'Réceptionneur', number: 3 },
    { id: 5, first_name: 'Pierre', last_name: 'Moreau', position: 'Libéro', number: 7 },
    { id: 6, first_name: 'Julie', last_name: 'Petit', position: 'Opposé', number: 15 },
    { id: 7, first_name: 'Lucas', last_name: 'Blanc', position: 'Central', number: 9 },
    { id: 8, first_name: 'Emma', last_name: 'Rousseau', position: 'Attaquant', number: 4 }
  ];

  const availablePlayers = players.length > 0 ? players : examplePlayers;

  const systems = [
    { value: 'loisir', label: 'Loisir', description: 'Système simple, rotations basiques' },
    { value: '4-2', label: '4-2', description: '4 attaquants, 2 passeurs' },
    { value: '5-1', label: '5-1', description: '5 attaquants, 1 passeur' }
  ];

  const positions = {
    1: { label: 'Poste 1', zone: 'Arrière droit (Serveur)' },
    2: { label: 'Poste 2', zone: 'Avant droit' },
    3: { label: 'Poste 3', zone: 'Avant centre' },
    4: { label: 'Poste 4', zone: 'Avant gauche' },
    5: { label: 'Poste 5', zone: 'Arrière gauche' },
    6: { label: 'Poste 6', zone: 'Arrière centre' }
  };

  // Initialiser les rotations pour un set
  const initializeRotations = (setNumber) => {
    const rotations = {};
    for (let r = 0; r < 6; r++) {
      rotations[r] = {
        1: null, 2: null, 3: null, 4: null, 5: null, 6: null
      };
    }
    return rotations;
  };

  // Mettre à jour une position dans la rotation actuelle
  const updatePosition = (position, playerId) => {
    setFormationData(prev => ({
      ...prev,
      sets: {
        ...prev.sets,
        [currentSet]: {
          ...prev.sets[currentSet],
          rotations: {
            ...prev.sets[currentSet].rotations,
            [currentRotation]: {
              ...prev.sets[currentSet].rotations[currentRotation],
              [position]: playerId
            }
          }
        }
      }
    }));
  };

  // Copier la rotation actuelle vers toutes les rotations du set
  const copyToAllRotations = () => {
    const currentPositions = formationData.sets[currentSet].rotations[currentRotation] || {};
    const newRotations = {};
    
    for (let r = 0; r < 6; r++) {
      newRotations[r] = { ...currentPositions };
      // Appliquer la rotation
      if (r > 0) {
        const rotatedPositions = {};
        for (let pos = 1; pos <= 6; pos++) {
          const newPos = ((pos - r - 1 + 6) % 6) + 1;
          rotatedPositions[pos] = currentPositions[newPos];
        }
        newRotations[r] = rotatedPositions;
      }
    }

    setFormationData(prev => ({
      ...prev,
      sets: {
        ...prev.sets,
        [currentSet]: {
          ...prev.sets[currentSet],
          rotations: newRotations
        }
      }
    }));
  };

  // Copier vers tous les sets
  const copyToAllSets = () => {
    const currentSetData = formationData.sets[currentSet];
    const newSets = {};
    
    for (let s = 1; s <= 5; s++) {
      newSets[s] = { ...currentSetData };
    }

    setFormationData(prev => ({
      ...prev,
      sets: newSets
    }));
  };

  // Obtenir la composition actuelle
  const getCurrentLineup = () => {
    return formationData.sets[currentSet]?.rotations?.[currentRotation] || {};
  };

  // Sauvegarder la composition
  const handleSave = async () => {
    if (!formationData.name || !formationData.system) {
      alert('Veuillez remplir le nom et le système');
      return;
    }

    setLoading(true);
    try {
      // Ici, intégration avec Supabase
      console.log('Sauvegarde composition:', formationData);
      
      if (onSave) {
        await onSave(formationData);
      }
      
      alert('Composition sauvegardée avec succès !');
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Box pleine largeur */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-10 w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer une composition</h1>
          <p className="text-gray-600 mb-6">Définissez votre schéma tactique avec rotations par set</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Configuration */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom de la composition *</label>
                <input
                  type="text"
                  value={formationData.name}
                  onChange={(e) => setFormationData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-5 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 shadow-sm"
                  placeholder="Ex: Composition défensive"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Système de jeu *</label>
                <select
                  value={formationData.system}
                  onChange={(e) => setFormationData(prev => ({ ...prev, system: e.target.value }))}
                  className="w-full px-5 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 shadow-sm"
                >
                  <option value="">Choisir un système</option>
                  {systems.map(system => (
                    <option key={system.value} value={system.value}>
                      {system.label} - {system.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formationData.description}
                  onChange={(e) => setFormationData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-5 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 resize-none shadow-sm"
                  placeholder="Utilisation, points forts, situations..."
                />
              </div>
            </div>
            {/* Navigation Sets/Rotations + Actions */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Set</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map(set => (
                    <button
                      key={set}
                      onClick={() => setCurrentSet(set)}
                      className={`px-5 py-2 rounded-xl font-medium shadow-sm transition-all text-base border border-transparent ${
                        currentSet === set
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Set {set}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rotation</label>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2, 3, 4, 5].map(rotation => (
                    <button
                      key={rotation}
                      onClick={() => setCurrentRotation(rotation)}
                      className={`px-5 py-2 rounded-xl font-medium shadow-sm transition-all text-base border border-transparent ${
                        currentRotation === rotation
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      R{rotation}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={copyToAllRotations}
                  className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium shadow"
                >
                  📋 Copier vers toutes les rotations
                </button>
                <button
                  onClick={copyToAllSets}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium shadow"
                >
                  📚 Copier vers tous les sets
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Split horizontal sous le header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Colonne gauche : joueurs disponibles */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Joueurs disponibles</h3>
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                Cliquez sur un joueur puis sur une position sur le terrain pour l'assigner
              </p>
            </div>
            {['Passeur', 'Attaquant', 'Central', 'Réceptionneur', 'Libéro', 'Opposé'].map(position => {
              const positionPlayers = availablePlayers.filter(p => p.position === position);
              return (
                <div key={position} className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">{position}s</h4>
                  <div className="space-y-2">
                    {positionPlayers.map(player => {
                      const isAssigned = Object.values(getCurrentLineup()).includes(player.id);
                      return (
                        <div
                          key={player.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isAssigned
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                          onClick={() => {
                            // Logique de sélection (à implémenter)
                            console.log('Sélectionné:', player);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {player.first_name} {player.last_name}
                              </div>
                              <div className="text-sm text-gray-600">
                                N°{player.number}
                              </div>
                            </div>
                            {isAssigned && (
                              <div className="text-green-600">
                                ✓
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Colonne droite : terrain et titulaires */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Set {currentSet} - Rotation {currentRotation}
              </h3>
              <div className="text-sm text-gray-600">
                {formationData.system && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg">
                    {systems.find(s => s.value === formationData.system)?.label}
                  </span>
                )}
              </div>
            </div>
            {/* Terrain avec joueurs titulaires dynamiques */}
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '2/1' }}>
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('data:image/svg+xml;base64,${btoa(`
                    <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
                      <rect width="800" height="400" fill="#2563eb"/>
                      <rect x="125" y="120" width="550" height="160" fill="#fb923c"/>
                      <rect x="125" y="120" width="550" height="160" fill="none" stroke="white" stroke-width="4"/>
                      <line x1="400" y1="120" x2="400" y2="280" stroke="white" stroke-width="2" stroke-dasharray="5,5"/>
                      <line x1="125" y1="200" x2="675" y2="200" stroke="white" stroke-width="3"/>
                      <line x1="125" y1="160" x2="675" y2="160" stroke="white" stroke-width="1" opacity="0.7"/>
                      <line x1="125" y1="240" x2="675" y2="240" stroke="white" stroke-width="1" opacity="0.7"/>
                      <circle cx="400" cy="120" r="6" fill="white"/>
                      <circle cx="400" cy="280" r="6" fill="white"/>
                      <line x1="125" y1="100" x2="125" y2="130" stroke="white" stroke-width="3"/>
                      <line x1="675" y1="100" x2="675" y2="130" stroke="white" stroke-width="3"/>
                      <line x1="125" y1="270" x2="125" y2="300" stroke="white" stroke-width="3"/>
                      <line x1="675" y1="270" x2="675" y2="300" stroke="white" stroke-width="3"/>
                    </svg>
                  `)}')`
                }}
              ></div>
              <div className="absolute inset-0 p-8">
                {Object.entries(positions).map(([pos, info]) => {
                  const coords = {
                    1: { x: '83%', y: '75%' }, 2: { x: '83%', y: '25%' },
                    3: { x: '50%', y: '25%' }, 4: { x: '17%', y: '25%' },
                    5: { x: '17%', y: '75%' }, 6: { x: '50%', y: '75%' }
                  };
                  const currentLineup = getCurrentLineup();
                  const assignedPlayer = availablePlayers.find(p => p.id === currentLineup[pos]);
                  return (
                    <div
                      key={pos}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: coords[pos].x, top: coords[pos].y }}
                    >
                      <div className="text-center">
                        <div
                          className={
                            "w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-3 cursor-pointer transition-all " +
                            (assignedPlayer ? "bg-red-600 border-red-400 hover:bg-red-500" : "bg-gray-400 border-gray-300 hover:bg-gray-500")
                          }
                        >
                          {assignedPlayer ? assignedPlayer.number : pos}
                        </div>
                        <div className="mt-2 text-xs text-white font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                          {assignedPlayer ? assignedPlayer.first_name : info.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Footer Actions */}
        <div className="mt-8 flex justify-between">
          <button className="px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder la composition'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormationCreator; 