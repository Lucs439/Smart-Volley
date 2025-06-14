const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour l'upload de vidéos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Utilisez MP4, MOV ou AVI.'));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max
  }
});

// Route pour l'upload et l'analyse de vidéo
router.post('/analyze', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier vidéo fourni'
      });
    }

    // TODO: Appeler l'API Python pour l'analyse
    // Pour l'instant, retournons une réponse simulée
    res.json({
      success: true,
      message: 'Vidéo reçue et en cours d\'analyse',
      data: {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'analyse de la vidéo',
      error: error.message
    });
  }
});

// Route pour obtenir les résultats d'analyse
router.get('/results/:analysisId', (req, res) => {
  try {
    const { analysisId } = req.params;
    // TODO: Récupérer les résultats depuis la base de données
    res.json({
      success: true,
      message: 'Résultats de l\'analyse',
      data: {
        analysisId,
        status: 'completed',
        // Autres données d'analyse...
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des résultats',
      error: error.message
    });
  }
});

module.exports = router; 