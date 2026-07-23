require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User       = require('./models/User.model');
const Club       = require('./models/Club.model');
const Membership = require('./models/Membership.model');
const Event      = require('./models/Event.model');
const { Poll }   = require('./models/Poll.model');

const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  console.log('🧹 Nettoyage de la base...');
  await Promise.all([
    User.deleteMany(),
    Club.deleteMany(),
    Membership.deleteMany(),
    Event.deleteMany(),
    Poll.deleteMany(),
  ]);

  console.log('👤 Création des utilisateurs...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await User.insertMany([
    {
      firstName: 'Super',
      lastName:  'Admin',
      email:     'admin@test.com',
      password:  hashedPassword,
      role:      'admin',
      status:    'active',
      bio:       'Administrateur global de la plateforme.',
      interests: [],
    },
    {
      firstName: 'Ahmed',
      lastName:  'Ben Ali',
      email:     'president@test.com',
      password:  hashedPassword,
      role:      'president',
      status:    'active',
      bio:       'Passionné de robotique et de sciences.',
      interests: ['Tech', 'Science'],
    },
    {
      firstName: 'Sara',
      lastName:  'Trabelsi',
      email:     'member@test.com',
      password:  hashedPassword,
      role:      'member',
      status:    'active',
      bio:       'Étudiante en informatique.',
      interests: ['Tech', 'Culture'],
    },
    {
      firstName: 'Mohamed',
      lastName:  'Karim',
      email:     'member2@test.com',
      password:  hashedPassword,
      role:      'member',
      status:    'active',
      bio:       'Sportif et curieux.',
      interests: ['Sport', 'Science'],
    },
    {
      firstName: 'Sana',
      lastName:  'Jlassi',
      email:     'sana@test.com',
      password:  hashedPassword,
      role:      'member',
      status:    'banned',
      bio:       '',
      interests: ['Art'],
    },
  ]);

  const [admin, ahmed, sara, mohamed, sana] = users;

  console.log('🏛 Création des clubs...');
  const clubs = await Club.insertMany([
    {
      name:        'Club de Robotique',
      description: 'Passionnés de robotique, électronique et intelligence artificielle.',
      category:    'Tech',
      status:      'active',
      presidentId: ahmed._id,
    },
    {
      name:        'Troupe de Théâtre',
      description: "Créations théâtrales originales et ateliers d'improvisation.",
      category:    'Culture',
      status:      'active',
      presidentId: mohamed._id,
    },
    {
      name:        'Club Football',
      description: 'Entraînements deux fois par semaine et matchs inter-clubs.',
      category:    'Sport',
      status:      'active',
      presidentId: sara._id,
    },
    {
      name:        'Cercle Littéraire',
      description: "Lectures, discussions et ateliers d'écriture créative.",
      category:    'Culture',
      status:      'pending',
      presidentId: sana._id,
    },
    {
      name:        'Club Photographie',
      description: 'Sorties photo, partage de techniques et expositions.',
      category:    'Art',
      status:      'pending',
      presidentId: mohamed._id,
    },
  ]);

  const [robotique, theatre, football, litteraire, photo] = clubs;

  await User.findByIdAndUpdate(ahmed._id,   { clubId: robotique._id });
  await User.findByIdAndUpdate(sara._id,    { clubId: football._id  });
  await User.findByIdAndUpdate(mohamed._id, { clubId: theatre._id   });

  console.log('👥 Création des adhésions...');
  await Membership.insertMany([
    { userId: ahmed._id,   clubId: robotique._id, status: 'member'  },
    { userId: sara._id,    clubId: robotique._id, status: 'member'  },
    { userId: mohamed._id, clubId: robotique._id, status: 'member'  },
    { userId: sara._id,    clubId: theatre._id,   status: 'pending' },
    { userId: mohamed._id, clubId: football._id,  status: 'member'  },
    { userId: sana._id,    clubId: robotique._id, status: 'pending' },
  ]);

  console.log('📅 Création des événements...');
  await Event.insertMany([
    {
      clubId:      robotique._id,
      title:       'Atelier robotique — niveau débutant',
      description: 'Introduction à la programmation de robots avec Arduino.',
      location:    'Salle B14, Bâtiment principal',
      date:        new Date('2026-06-20'),
      time:        '18:00',
      maxCapacity: 30,
      visibility:  'public',
      status:      'upcoming',
    },
    {
      clubId:      robotique._id,
      title:       'Compétition inter-clubs',
      description: 'Affrontez les équipes des autres clubs sur des défis de programmation.',
      location:    'Amphithéâtre A',
      date:        new Date('2026-07-05'),
      time:        '14:00',
      maxCapacity: 20,
      visibility:  'public',
      status:      'upcoming',
    },
    {
      clubId:      theatre._id,
      title:       "Atelier improvisation théâtrale",
      description: "Séance d'impro ouverte à tous.",
      location:    'Salle des arts',
      date:        new Date('2026-06-25'),
      time:        '17:00',
      maxCapacity: 15,
      visibility:  'members_only',
      status:      'upcoming',
    },
    {
      clubId:      football._id,
      title:       'Match amical',
      description: 'Match amical contre le club de la faculté voisine.',
      location:    'Terrain de sport',
      date:        new Date('2026-05-10'),
      time:        '10:00',
      visibility:  'public',
      status:      'past',
    },
  ]);

  console.log('📊 Création des sondages...');
  await Poll.insertMany([
    {
      clubId:   robotique._id,
      question: "Quel jour préférez-vous pour l'atelier mensuel ?",
      options:  [
        { label: 'Samedi matin',        votesCount: 14 },
        { label: 'Dimanche après-midi', votesCount: 8  },
        { label: 'Vendredi soir',       votesCount: 6  },
      ],
      status:     'active',
    },
    {
      clubId:   robotique._id,
      question: 'Quel thème pour la prochaine sortie ?',
      options:  [
        { label: 'Nature / randonnée', votesCount: 16 },
        { label: 'Musée',              votesCount: 8  },
        { label: 'Cinéma',             votesCount: 4  },
      ],
      status:   'closed',
      closedAt: new Date('2026-06-05'),
    },
  ]);

  console.log('');
  console.log('✅ Seed terminé avec succès !');
  console.log('');
  console.log('📋 Comptes de test (mot de passe : password123) :');
  console.log('   admin@test.com      → Super Admin');
  console.log('   president@test.com  → Président (Club Robotique)');
  console.log('   member@test.com     → Membre');
  console.log('   member2@test.com    → Membre');
  console.log('');

  mongoose.disconnect();
};

seed().catch((err) => {
  console.error('❌ Erreur seed :', err);
  mongoose.disconnect();
  process.exit(1);
});