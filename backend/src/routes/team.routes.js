const express = require('express');
const router = express.Router();
const { Team } = require('../models');
const auth = require('../middleware/auth');

// Obtenir toutes les équipes de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.findByUserId(req.user.id);
    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des équipes',
      error: error.message
    });
  }
});

// Obtenir une équipe spécifique
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Équipe non trouvée'
      });
    }
    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'équipe',
      error: error.message
    });
  }
});

// Créer une nouvelle équipe
router.post('/', auth, async (req, res) => {
  try {
    const teamData = {
      ...req.body,
      user_id: req.user.id
    };
    const team = await Team.create(teamData);
    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'équipe',
      error: error.message
    });
  }
});

// Mettre à jour une équipe
router.put('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Équipe non trouvée'
      });
    }
    
    if (team.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette équipe'
      });
    }

    const updatedTeam = await Team.update(req.params.id, req.body);
    res.json({
      success: true,
      data: updatedTeam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'équipe',
      error: error.message
    });
  }
});

module.exports = router; 