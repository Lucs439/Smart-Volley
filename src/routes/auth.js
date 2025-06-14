const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/register', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json({ success: true, user });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findByEmail(req.body.email);
    if (!user) return res.status(401).json({ success: false, error: 'Utilisateur non trouvé' });
    const valid = await User.validatePassword(user, req.body.password);
    if (!valid) return res.status(401).json({ success: false, error: 'Mot de passe incorrect' });
    res.json({ success: true, user });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
});

module.exports = router; 