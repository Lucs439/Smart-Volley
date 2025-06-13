import React from 'react';

const ConfigModal = ({
  showConfigModal,
  setShowConfigModal,
  teamConfig,
  updateTeamName,
  updateTeamColor,
  updatePlayerName,
  updatePlayerNumber,
  generateTeamNames,
  saveConfiguration
}) => {
  if (!showConfigModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Configuration du match</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Équipe A */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'équipe</label>
              <input
                type="text"
                value={teamConfig.teamA.name}
                onChange={(e) => updateTeamName('teamA', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Équipe A"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur des maillots</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={teamConfig.teamA.color}
                  onChange={(e) => updateTeamColor('teamA', e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{teamConfig.teamA.color}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Composition</h4>
                <button
                  onClick={() => generateTeamNames('teamA')}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                  title="Générer des noms automatiquement"
                >
                  🎲 Générer des noms
                </button>
              </div>
              <div className="space-y-2">
                {teamConfig.teamA.players.map((player, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={player.number}
                      onChange={(e) => updatePlayerNumber('teamA', idx, e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      placeholder="#"
                    />
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayerName('teamA', idx, e.target.value)}
                      className={`flex-1 px-3 py-1 border rounded ${
                        player.name.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={`Nom du ${player.position} (obligatoire)`}
                      required
                    />
                    <span className="text-sm text-gray-500 w-24">{player.position}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Équipe B */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'équipe</label>
              <input
                type="text"
                value={teamConfig.teamB.name}
                onChange={(e) => updateTeamName('teamB', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Équipe B"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur des maillots</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={teamConfig.teamB.color}
                  onChange={(e) => updateTeamColor('teamB', e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{teamConfig.teamB.color}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Composition</h4>
                <button
                  onClick={() => generateTeamNames('teamB')}
                  className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  title="Générer des noms automatiquement"
                >
                  🎲 Générer des noms
                </button>
              </div>
              <div className="space-y-2">
                {teamConfig.teamB.players.map((player, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={player.number}
                      onChange={(e) => updatePlayerNumber('teamB', idx, e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      placeholder="#"
                    />
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayerName('teamB', idx, e.target.value)}
                      className={`flex-1 px-3 py-1 border rounded ${
                        player.name.trim() === '' ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={`Nom du ${player.position} (obligatoire)`}
                      required
                    />
                    <span className="text-sm text-gray-500 w-24">{player.position}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowConfigModal(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={saveConfiguration}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sauvegarder
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          * Tous les noms de joueurs sont obligatoires pour valider la configuration
        </p>
      </div>
    </div>
  );
};

export default ConfigModal; 