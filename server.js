require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./src/routes/auth'));
// Tu pourras ajouter ici d'autres routes (team, player, etc.)

app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Smart Volley! 🏐' });
});

app.listen(3001, () => console.log('Serveur prêt sur le port 3001')); 