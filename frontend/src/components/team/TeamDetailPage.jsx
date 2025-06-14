import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import PlayerForm from './PlayerForm';

const TeamDetailPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const fileInputRef = React.useRef();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const downloadTemplate = async () => {
    try {
      const XLSX = await import('xlsx');
      
      // Feuille 1 : Instructions
      const instructions = [
        ['Instructions pour l\'import des joueurs'],
        [''],
        ['Les champs marqués d\'un astérisque (*) sont obligatoires.'],
        ['Format de date recommandé : JJ/MM/AAAA'],
        ['Format de téléphone : +33 6 XX XX XX XX'],
        ['Format d\'email : exemple@email.com'],
        [''],
        ['Postes disponibles : Passeur, Central, Réceptionneur, Pointu, Libéro'],
        ['Niveaux disponibles : Loisir, Départemental, Régional, National, Pro'],
        [''],
        ['Pour toute question, contactez votre administrateur.']
      ];
      const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
      wsInstructions['!cols'] = [{ wch: 80 }];

      // Feuille 2 : Import joueurs
      const headers = [
        'Prénom*',
        'Nom*', 
        'Poste principal*',
        'Poste secondaire',
        'Date de naissance',
        'Téléphone',
        'Email',
        'Niveau',
        'Contact urgence - Nom',
        'Contact urgence - Téléphone',
        'Numéro de licence',
        'Certificat médical',
        'Assurance'
      ];
      // Générer 10 lignes vides pour l'utilisateur
      const emptyRows = Array.from({ length: 10 }, () => Array(headers.length).fill(''));
      const data = [headers, ...emptyRows];
      const wsImport = XLSX.utils.aoa_to_sheet(data);
      wsImport['!cols'] = headers.map(() => ({ wch: 20 }));

      // Style pour l'en-tête
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "3B82F6" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "1E40AF" } },
          bottom: { style: "thin", color: { rgb: "1E40AF" } },
          left: { style: "thin", color: { rgb: "1E40AF" } },
          right: { style: "thin", color: { rgb: "1E40AF" } }
        }
      };
      // Appliquer le style à chaque cellule d'en-tête
      for (let C = 0; C < headers.length; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
        if (wsImport[cellRef]) wsImport[cellRef].s = headerStyle;
      }

      // Créer le workbook et ajouter les deux feuilles
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");
      XLSX.utils.book_append_sheet(wb, wsImport, "Import joueurs");

      // Générer le fichier Excel
      XLSX.writeFile(wb, "template_import_joueurs.xlsx");
    } catch (error) {
      console.error('Erreur lors du téléchargement du template:', error);
      alert('Une erreur est survenue lors du téléchargement du template');
    }
  };

  const fetchTeamDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      setTeam(teamData);

      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (playersError) throw playersError;
      setPlayers(playersData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  const handleDeletePlayer = async (playerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) return;

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;
      setPlayers(players.filter(p => p.id !== playerId));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setShowPlayerForm(true);
  };

  const handlePlayerFormClose = () => {
    setShowPlayerForm(false);
    setEditingPlayer(null);
  };

  const handlePlayerFormSubmit = async (playerData) => {
    try {
      if (editingPlayer) {
        const { error } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', editingPlayer.id);

        if (error) throw error;
        setPlayers(players.map(p => p.id === editingPlayer.id ? { ...p, ...playerData } : p));
      } else {
        const { data, error } = await supabase
          .from('players')
          .insert([{ ...playerData, team_id: teamId }])
          .select()
          .single();

        if (error) throw error;
        setPlayers([data, ...players]);
      }
      handlePlayerFormClose();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      setError(error.message);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      navigate('/teams');
    } catch (error) {
      setError(error.message);
    }
  };

  // Fonction pour ouvrir le sélecteur de fichier
  const handleImportClick = () => {
    setShowImportMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = null;
    fileInputRef.current?.click();
  };

  // Fonction pour gérer l'import du fichier
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        // On prend la première feuille qui contient les joueurs
        const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('import')) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        // Colonnes acceptées (français ou anglais)
        const getVal = (row, keys) => {
          for (const k of keys) {
            if (row[k] !== undefined && row[k] !== '') return row[k];
          }
          return '';
        };
        // Vérification des colonnes obligatoires
        const required = [
          ['Prénom*', 'first_name'],
          ['Nom*', 'last_name'],
          ['Poste principal*', 'position']
        ];
        const firstRow = Object.keys(rows[0] || {});
        for (const colArr of required) {
          if (!colArr.some(col => firstRow.includes(col))) {
            alert(`Colonne obligatoire manquante : ${colArr.join(' ou ')}`);
            return;
          }
        }
        // Récupérer les joueurs déjà présents pour update/insert
        const { data: existingPlayers } = await supabase
          .from('players')
          .select('*')
          .eq('team_id', teamId);
        // Création ou update des joueurs en base
        let newPlayers = [];
        let errors = [];
        for (const row of rows) {
          const first_name = getVal(row, ['Prénom*', 'first_name']);
          const last_name = getVal(row, ['Nom*', 'last_name']);
          const main_position = getVal(row, ['Poste principal*', 'position']);
          if (!first_name || !last_name || !main_position) continue;

          // Conversion des champs
          const parseDate = (val) => {
            if (!val) return null;
            if (typeof val === 'string' && val.includes('/')) {
              const [d, m, y] = val.split('/');
              if (d && m && y) return `${y.padStart(4, '20')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
            if (typeof val === 'string' && val.includes('-')) {
              const [d, m, y] = val.split('-');
              if (d && m && y) return `${y.padStart(4, '20')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
            if (typeof val === 'number') {
              const date = XLSX.SSF.parse_date_code(val);
              if (date) return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
            }
            return null;
          };
          const parseBool = (val) => {
            if (typeof val === 'string') {
              return val.trim().toLowerCase() === 'oui';
            }
            if (typeof val === 'boolean') return val;
            return false;
          };

          const birth_date = parseDate(getVal(row, ['Date de naissance', 'birth_date']));
          // Chercher si le joueur existe déjà (prénom, nom, date de naissance)
          const existing = existingPlayers.find(p =>
            p.first_name?.toLowerCase() === first_name.toLowerCase() &&
            p.last_name?.toLowerCase() === last_name.toLowerCase() &&
            (!birth_date || !p.birth_date || p.birth_date === birth_date)
          );

          const playerData = {
            first_name,
            last_name,
            birth_date,
            position: main_position,
            secondary_position: getVal(row, ['Poste secondaire', 'secondary_position']) || null,
            status: getVal(row, ['Statut', 'status']) || 'available',
            level: getVal(row, ['Niveau', 'level']) || null,
            phone: getVal(row, ['Téléphone', 'phone']) || null,
            email: getVal(row, ['Email', 'email']) || null,
            emergency_contact_name: getVal(row, ['Contact urgence - Nom', 'emergency_contact_name']) || null,
            emergency_contact_phone: getVal(row, ['Contact urgence - Téléphone', 'emergency_contact_phone']) || null,
            license_number: getVal(row, ['Numéro de licence', 'license_number']) || null,
            medical_certificate_date: parseDate(getVal(row, ['Certificat médical', 'medical_certificate_date'])),
            insurance: parseBool(getVal(row, ['Assurance', 'insurance'])),
            team_id: teamId
          };
          Object.keys(playerData).forEach(k => playerData[k] === undefined && delete playerData[k]);

          let dbResult;
          if (existing) {
            // Update
            const { data, error } = await supabase
              .from('players')
              .update(playerData)
              .eq('id', existing.id)
              .select()
              .single();
            dbResult = { data, error };
          } else {
            // Insert
            const { data, error } = await supabase
              .from('players')
              .insert([playerData])
              .select()
              .single();
            dbResult = { data, error };
          }
          if (!dbResult.error && dbResult.data) {
            newPlayers.push(dbResult.data);
          } else {
            errors.push({ row: row, error: dbResult.error });
            console.error('Erreur Supabase :', dbResult.error, playerData);
          }
        }
        // Rafraîchir la liste des joueurs depuis la base (pour éviter les doublons)
        const { data: refreshedPlayers } = await supabase
          .from('players')
          .select('*')
          .eq('team_id', teamId)
          .order('created_at', { ascending: false });
        setPlayers(refreshedPlayers || []);
        if (newPlayers.length > 0) {
          alert(`${newPlayers.length} joueurs importés ou mis à jour avec succès !`);
        }
        if (errors.length > 0) {
          alert(`${errors.length} erreurs lors de l'import. Regarde la console pour le détail.`);
        }
        if (newPlayers.length === 0 && errors.length === 0) {
          alert('Aucun joueur importé. Vérifiez le fichier.');
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      alert('Erreur lors de l\'import : ' + err.message);
    }
  };

  // Fonction de tri
  const sortedPlayers = React.useMemo(() => {
    if (!sortConfig.key) return players;
    const sorted = [...players].sort((a, b) => {
      const valA = a[sortConfig.key] ? a[sortConfig.key].toString().toLowerCase() : '';
      const valB = b[sortConfig.key] ? b[sortConfig.key].toString().toLowerCase() : '';
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [players, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Fonction pour exporter la liste des joueurs au format Excel
  const handleExportPlayers = async () => {
    const XLSX = await import('xlsx');
    // Colonnes à exporter
    const headers = [
      'Prénom',
      'Nom',
      'Poste principal',
      'Poste secondaire',
      'Date de naissance',
      'Téléphone',
      'Email',
      'Niveau',
      'Contact urgence - Nom',
      'Contact urgence - Téléphone',
      'Numéro de licence',
      'Certificat médical',
      'Assurance'
    ];
    // Générer les données à partir des joueurs
    const data = players.map(player => ([
      player.first_name || '',
      player.last_name || '',
      player.position || '',
      player.secondary_position || '',
      player.birth_date || '',
      player.phone || '',
      player.email || '',
      player.level || '',
      player.emergency_contact_name || '',
      player.emergency_contact_phone || '',
      player.license_number || '',
      player.medical_certificate_date || '',
      player.insurance ? 'Oui' : 'Non'
    ]));
    // Créer la feuille et le workbook
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws['!cols'] = headers.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Joueurs');
    // Exporter le fichier
    XLSX.writeFile(wb, `joueurs_${team?.name || 'equipe'}.xlsx`);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 pl-72 flex items-center justify-center">Chargement...</div>;
  if (error) return <div className="min-h-screen bg-gray-50 pl-72 p-6 text-red-600">Erreur: {error}</div>;
  if (!team) return <div className="min-h-screen bg-gray-50 pl-72 p-6">Équipe non trouvée</div>;

  return (
    <div className="min-h-screen bg-gray-50 pl-72">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header de l'équipe */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{team.name}</h1>
              <div className="space-y-1 text-gray-600">
                <p><span className="font-medium">Niveau:</span> {team.level || 'Non spécifié'}</p>
                <p><span className="font-medium">Catégorie:</span> {team.category || 'Non spécifiée'}</p>
                <p><span className="font-medium">Genre:</span> {team.gender || 'Non spécifié'}</p>
                <p><span className="font-medium">Saison:</span> {team.season}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  onClick={() => setShowImportMenu(!showImportMenu)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Gérer les données
                </button>
                {showImportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                    <button
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={handleImportClick}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      Importer
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={handleExportPlayers}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Exporter
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => {
                        downloadTemplate();
                        setShowImportMenu(false);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Télécharger un template
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-800 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Supprimer l'équipe
              </button>
            </div>
          </div>
        </div>

        {/* Liste des joueurs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Joueurs</h2>
            <button
              onClick={() => setShowPlayerForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter un joueur
            </button>
          </div>
          {players.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun joueur dans cette équipe</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort('photo_url')}>Photo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort('last_name')}>Nom</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort('first_name')}>Prénom</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort('position')}>Poste</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map(player => (
                    <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {player.photo_url ? (
                          <img
                            src={player.photo_url}
                            alt={`${player.first_name} ${player.last_name}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              {player.first_name?.[0]}{player.last_name?.[0]}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-900">{player.last_name}</td>
                      <td className="py-3 px-4 text-gray-900">{player.first_name}</td>
                      <td className="py-3 px-4 text-gray-900">{player.position}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPlayer(player)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal du formulaire de joueur */}
      {showPlayerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingPlayer ? 'Modifier le joueur' : 'Ajouter un joueur'}
                </h2>
                <button
                  onClick={handlePlayerFormClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <PlayerForm
                onSubmit={handlePlayerFormSubmit}
                initialData={editingPlayer}
                onCancel={handlePlayerFormClose}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Supprimer l'équipe
            </h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible et vous perdrez toutes les informations associées.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteTeam}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input file caché pour l'import */}
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default TeamDetailPage; 