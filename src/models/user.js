const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

module.exports = {
  async create({ email, password, first_name, last_name }) {
    const password_hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash, first_name, last_name }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async findByEmail(email) {
    const { data } = await supabase.from('users').select('*').eq('email', email).single();
    return data;
  },
  async validatePassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }
}; 