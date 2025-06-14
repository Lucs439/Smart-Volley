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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête de l'équipe */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{team?.name}</h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {team?.description || 'Aucune description'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowPlayerForm(true)}
              className="btn-primary"
            >
              Ajouter un joueur
            </button>
            <div className="relative">
              <button
                onClick={() => setShowImportMenu(!showImportMenu)}
                className="btn-secondary"
              >
                Importer
              </button>
              {showImportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-10">
                  <button
                    onClick={handleImportClick}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    Importer depuis Excel
                  </button>
                  <button
                    onClick={downloadTemplate}
                    className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    Télécharger le template
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-secondary text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Supprimer l'équipe
            </button>
          </div>
        </div>
      </div>

      {/* Liste des joueurs */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('first_name')}
                >
                  Nom
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('position')}
                >
                  Poste
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                >
                  Statut
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {players.map((player) => (
                <tr key={player.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {player.first_name} {player.last_name}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {player.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900 dark:text-white">{player.position}</div>
                    {player.secondary_position && (
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {player.secondary_position}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900 dark:text-white">{player.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      player.status === 'available'
                        ? 'bg-accent-green/10 text-accent-green'
                        : player.status === 'injured'
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                    }`}>
                      {player.status === 'available' ? 'Disponible' : player.status === 'injured' ? 'Blessé' : 'Absent'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditPlayer(player)}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-4"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(player.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulaire d'ajout/modification de joueur */}
      {showPlayerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                {editingPlayer ? 'Modifier le joueur' : 'Ajouter un joueur'}
              </h2>
              <PlayerForm
                onSubmit={handlePlayerFormSubmit}
                onCancel={handlePlayerFormClose}
                initialData={editingPlayer}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
              Supprimer l'équipe
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteTeam}
                className="btn-primary bg-red-600 hover:bg-red-700 active:bg-red-800"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input caché pour l'import de fichier */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx,.xls"
        className="hidden"
      />
    </div>
  );
};

export default TeamDetailPage; 