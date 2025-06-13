import React from 'react';
import GraphIconSvg from "../../assets/icons/Graph.svg";

const StatsTable = ({ teamConfig, isConfigured }) => {
  if (!isConfigured) return null;

  return (
    <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <img src={GraphIconSvg} alt="Statistics" className="w-6 h-6 text-blue-600" />
        <h4 className="font-semibold text-gray-900">Statistiques du match</h4>
      </div>

      {/* Équipe A */}
      <div className="mb-8">
        <h5 className="text-lg font-semibold mb-4" style={{ color: teamConfig.teamA.color }}>
          {teamConfig.teamA.name}
        </h5>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Joueur</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Service</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Réception</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Passe</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Attaque</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Bloc</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Défense</th>
              </tr>
            </thead>
            <tbody>
              {teamConfig.teamA.players.map((player, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 font-medium">
                    <span className="inline-flex items-center space-x-2">
                      <span className="w-6 h-6 bg-gray-200 rounded-full text-xs flex items-center justify-center">
                        {player.number}
                      </span>
                      <span>{player.name || `Joueur ${idx + 1}`}</span>
                    </span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-400">-</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-400">-</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-400">-</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-400">-</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-400">-</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-400">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Équipe B */}
      <div className="mb-6">
        <h5 className="text-lg font-semibold mb-4" style={{ color: teamConfig.teamB.color }}>
          {teamConfig.teamB.name}
        </h5>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-red-50">
                <th className="border border-gray-300 px-3 py-2 text-left font-medium">Joueur</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Service</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Réception</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Passe</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Attaque</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Bloc</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium">Défense</th>
              </tr>
            </thead>
            <tbody>
              {teamConfig.teamB.players.map((player, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 font-medium">
                    <span className="inline-flex items-center space-x-2">
                      <span className="w-6 h-6 bg-gray-200 rounded-full text-xs flex items-center justify-center">
                        {player.number}
                      </span>
                      <span>{player.name || `Joueur ${idx + 1}`}</span>
                    </span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-400">-</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-400">-</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-400">-</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-400">-</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-400">-</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-gray-400">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message si pas d'analyse */}
      <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
        <p>Uploadez une vidéo pour voir les statistiques détaillées</p>
        <p className="text-sm">L'IA analysera automatiquement les actions de chaque joueur</p>
      </div>
    </div>
  );
};

export default StatsTable; 