import supabase from '../config/supabase';

export const supabaseClient = {
  // Authentification
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Gestion des données
  async getAnalysis(id) {
    const { data, error } = await supabase
      .from('analysis')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async createAnalysis(analysisData) {
    const { data, error } = await supabase
      .from('analysis')
      .insert([analysisData])
      .select();
    return { data, error };
  },

  async updateAnalysis(id, updates) {
    const { data, error } = await supabase
      .from('analysis')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  async deleteAnalysis(id) {
    const { error } = await supabase
      .from('analysis')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Gestion des fichiers
  async uploadVideo(file, path) {
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(path, file);
    return { data, error };
  },

  async getVideoUrl(path) {
    const { data } = await supabase.storage
      .from('videos')
      .getPublicUrl(path);
    return data.publicUrl;
  }
}; 