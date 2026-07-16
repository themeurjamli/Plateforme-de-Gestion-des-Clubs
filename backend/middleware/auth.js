const jwt  = require('jsonwebtoken');
const User = require('../models/User.model');


const protect = async (req, res, next) => {
  let token;

  
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé — token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }
    if (req.user.status === 'banned') {
      return res.status(403).json({ message: 'Compte banni' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};


const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Accès refusé — rôle requis : ${roles.join(' ou ')}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };