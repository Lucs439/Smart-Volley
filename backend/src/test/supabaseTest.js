import { supabaseClient } from '../utils/supabaseClient';

async function testSupabaseConnection() {
  try {
    // Test de création de la table 'test'
    const { data: createTableData, error: createTableError } = await supabaseClient.createTable('test', {
      id: 'uuid',
      name: 'text',
      created_at: 'timestamp with time zone',
      description: 'text'
    });

    if (createTableError) {
      console.error('Erreur lors de la création de la table:', createTableError);
      return;
    }

    console.log('Table créée avec succès:', createTableData);

    // Test d'insertion de données
    const { data: insertData, error: insertError } = await supabaseClient
      .from('test')
      .insert([
        {
          name: 'Test Item',
          description: 'Ceci est un test de connexion'
        }
      ])
      .select();

    if (insertError) {
      console.error('Erreur lors de l\'insertion:', insertError);
      return;
    }

    console.log('Données insérées avec succès:', insertData);

    // Test de lecture des données
    const { data: readData, error: readError } = await supabaseClient
      .from('test')
      .select('*');

    if (readError) {
      console.error('Erreur lors de la lecture:', readError);
      return;
    }

    console.log('Données lues avec succès:', readData);

  } catch (error) {
    console.error('Erreur générale:', error);
  }
}

// Exécuter le test
testSupabaseConnection(); 