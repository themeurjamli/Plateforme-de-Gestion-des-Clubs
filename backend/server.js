require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

const authRoutes    = require('./routes/auth.routes');
const clubRoutes    = require('./routes/clubs.routes');
const memberRoutes  = require('./routes/members.routes');
const eventRoutes   = require('./routes/events.routes');
const pollRoutes    = require('./routes/polls.routes');
const userRoutes    = require('./routes/users.routes');

connectDB();

const app = express();

app.use(cors({
  origin:      'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.use((req, res, next) => {
  if (typeof req.url === 'string') {
    if (req.url.includes('%0A') || req.url.includes('%0D') || /[\r\n]/.test(req.url)) {
      req.url = req.url.replace(/%0A/g, '').replace(/%0D/g, '').replace(/[\r\n]/g, '');
    }
  }
  next();
});

app.use('/api/auth',        authRoutes);
app.use('/api/clubs',       clubRoutes);
app.use('/api/memberships', memberRoutes);
app.use('/api/events',      eventRoutes);
app.use('/api/polls',       pollRoutes);
app.use('/api/users',       userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur opérationnel 🚀' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur interne' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});