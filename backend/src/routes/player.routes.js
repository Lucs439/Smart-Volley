const express = require('express');
const router = express.Router();
const { Player, Team } = require('../models');
const auth = require('../middleware/auth');

// Obtenir tous les joueurs d'une équipe
router.get('/team/:teamId', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Équipe non trouvée'
      });
    }

    if (team.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à voir les joueurs de cette équipe'
      });
    }

    const players = await Player.findByTeamId(req.params.teamId);
    res.json({
      success: true,
      data: players
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des joueurs',
      error: error.message
    });
  }
});

// Obtenir un joueur spécifique
router.get('/:id', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    const team = await Team.findById(player.team_id);
    if (team.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à voir ce joueur'
      });
    }

    res.json({
      success: true,
      data: player
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du joueur',
      error: error.message
    });
  }
});

// Ajouter un joueur à une équipe
router.post('/', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.body.team_id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Équipe non trouvée'
      });
    }

    if (team.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à ajouter des joueurs à cette équipe'
      });
    }

    const player = await Player.create(req.body);
    res.status(201).json({
      success: true,
      data: player
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du joueur',
      error: error.message
    });
  }
});

// Mettre à jour un joueur
router.put('/:id', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    const team = await Team.findById(player.team_id);
    if (team.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce joueur'
      });
    }

    const updatedPlayer = await Player.update(req.params.id, req.body);
    res.json({
      success: true,
      data: updatedPlayer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du joueur',
      error: error.message
    });
  }
});

// Supprimer un joueur
router.delete('/:id', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    const team = await Team.findById(player.team_id);
    if (team.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce joueur'
      });
    }

    await Player.delete(req.params.id);
    res.json({
      success: true,
      message: 'Joueur supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du joueur',
      error: error.message
    });
  }
});

module.exports = router; 