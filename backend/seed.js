require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User       = require('./models/User.model');
const Club       = require('./models/Club.model');
const Membership = require('./models/Membership.model');
const Event      = require('./models/Event.model');
const { Poll, EventRegistration } = require('./models/Poll.model');
const Post       = require('./models/Post.model');

const connectDB  = require('./config/db');

const seed = async () => {
  await connectDB();

  // ── Nettoyage complet ─────────────────────────────────────
  console.log('🧹 Nettoyage de la base...');
  await Promise.all([
    User.deleteMany(),
    Club.deleteMany(),
    Membership.deleteMany(),
    Event.deleteMany(),
    Poll.deleteMany(),
    EventRegistration.deleteMany(),
    Post.deleteMany(),
  ]);

  // ── Utilisateurs ──────────────────────────────────────────
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
      city:      null,
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
      city:      'Sousse',
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
      city:      'Tunis',
    },
    {
      firstName: 'Mohamed',
      lastName:  'Karim',
      email:     'member2@test.com',
      password:  hashedPassword,
      role:      'president',
      status:    'active',
      bio:       'Sportif et curieux.',
      interests: ['Sport', 'Science'],
      city:      'Sfax',
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
      city:      'Monastir',
    },
    {
      firstName: 'Ines',
      lastName:  'Maaloul',
      email:     'ines@test.com',
      password:  hashedPassword,
      role:      'member',
      status:    'active',
      bio:       'Passionnée de culture et de lecture.',
      interests: ['Culture', 'Art'],
      city:      'Sousse',
    },
    {
      firstName: 'Youssef',
      lastName:  'Gharbi',
      email:     'youssef@test.com',
      password:  hashedPassword,
      role:      'member',
      status:    'active',
      bio:       'Fan de foot et de voyages.',
      interests: ['Sport'],
      city:      'Ariana',
    },
  ]);

  const [admin, ahmed, sara, mohamed, sana, ines, youssef] = users;

  // ── Clubs ─────────────────────────────────────────────────
  console.log('🏛 Création des clubs...');
  const clubs = await Club.insertMany([
    {
      name:        'Club de Robotique',
      description: 'Passionnés de robotique, électronique et intelligence artificielle. Nous organisons des ateliers mensuels et participons à des compétitions nationales.',
      category:    'Tech',
      status:      'active',
      presidentId: ahmed._id,
      cities:      ['Sousse', 'Monastir'],
    },
    {
      name:        'Troupe de Théâtre',
      description: "Créations théâtrales originales et ateliers d'improvisation ouverts à tous les niveaux.",
      category:    'Culture',
      status:      'active',
      presidentId: mohamed._id,
      cities:      ['Sfax'],
    },
    {
      name:        'Club Football',
      description: 'Entraînements deux fois par semaine et matchs inter-clubs. Rejoignez-nous pour partager votre passion du football.',
      category:    'Sport',
      status:      'active',
      presidentId: sara._id,
      cities:      ['Tunis', 'Ariana'],
    },
    {
      name:        'Cercle Littéraire',
      description: "Lectures, discussions et ateliers d'écriture créative. Un espace d'échange autour de la littérature tunisienne et mondiale.",
      category:    'Culture',
      status:      'pending',
      presidentId: sana._id,
      cities:      ['Monastir'],
    },
    {
      name:        'Club Photographie',
      description: 'Sorties photo, partage de techniques et expositions. Capturez le monde à travers votre objectif.',
      category:    'Art',
      status:      'pending',
      presidentId: youssef._id,
      cities:      ['Sfax', 'Gabès'],
    },
  ]);

  const [robotique, theatre, football, litteraire, photo] = clubs;

  // ── Mettre à jour le clubId des présidents ────────────────
  console.log('🔗 Mise à jour des clubIds...');
  await User.findByIdAndUpdate(ahmed._id,   { clubId: robotique._id });
  await User.findByIdAndUpdate(mohamed._id, { clubId: theatre._id   });
  await User.findByIdAndUpdate(sara._id,    { clubId: football._id  });

  // ── Adhésions ─────────────────────────────────────────────
  console.log('👥 Création des adhésions...');
  const memberships = await Membership.insertMany([
    // Club Robotique
    { userId: ahmed._id,   clubId: robotique._id, status: 'member'  },
    { userId: sara._id,    clubId: robotique._id, status: 'member'  },
    { userId: ines._id,    clubId: robotique._id, status: 'member'  },
    { userId: youssef._id, clubId: robotique._id, status: 'pending' },
    { userId: sana._id,    clubId: robotique._id, status: 'pending' },

    // Troupe de Théâtre
    { userId: mohamed._id, clubId: theatre._id,   status: 'member'  },
    { userId: ines._id,    clubId: theatre._id,   status: 'member'  },
    { userId: sara._id,    clubId: theatre._id,   status: 'pending' },

    // Club Football
    { userId: sara._id,    clubId: football._id,  status: 'member'  },
    { userId: youssef._id, clubId: football._id,  status: 'member'  },
    { userId: mohamed._id, clubId: football._id,  status: 'member'  },
  ]);

  // ── Événements ────────────────────────────────────────────
  console.log('📅 Création des événements...');
  const events = await Event.insertMany([
    // Club Robotique — upcoming
    {
      clubId:      robotique._id,
      title:       'Atelier robotique — niveau débutant',
      description: 'Introduction à la programmation de robots avec Arduino. Matériel fourni, aucune expérience requise.',
      location:    'Salle B14, Bâtiment principal',
      date:        new Date('2026-09-15'),
      time:        '14:00',
      maxCapacity: 20,
      visibility:  'public',
      status:      'upcoming',
    },
    {
      clubId:      robotique._id,
      title:       'Compétition inter-clubs Sousse 2026',
      description: 'Affrontez les équipes des autres clubs sur des défis de programmation et de construction.',
      location:    'Amphithéâtre A',
      date:        new Date('2026-09-28'),
      time:        '09:00',
      maxCapacity: 30,
      visibility:  'public',
      status:      'upcoming',
    },
    {
      clubId:      robotique._id,
      title:       'Séance de conception 3D',
      description: 'Atelier de modélisation 3D pour les membres du club.',
      location:    'Lab informatique',
      date:        new Date('2026-10-05'),
      time:        '16:00',
      maxCapacity: 15,
      visibility:  'members_only',
      status:      'upcoming',
    },

    // Club Robotique — passés
    {
      clubId:      robotique._id,
      title:       'Atelier capteurs IR — juin 2026',
      description: 'Séance pratique sur les capteurs infrarouges et le suivi de ligne.',
      location:    'Salle B14',
      date:        new Date('2026-06-10'),
      time:        '14:00',
      maxCapacity: 20,
      visibility:  'public',
      status:      'past',
    },
    {
      clubId:      robotique._id,
      title:       'Présentation des projets de fin d\'année',
      description: 'Chaque équipe présente son projet devant les membres et invités.',
      location:    'Grande salle',
      date:        new Date('2026-07-20'),
      time:        '10:00',
      visibility:  'public',
      status:      'past',
    },

    // Troupe de Théâtre
    {
      clubId:      theatre._id,
      title:       "Atelier improvisation théâtrale",
      description: "Séance d'impro ouverte à tous les niveaux. Venez vous amuser et découvrir le théâtre !",
      location:    'Salle des arts, Sfax',
      date:        new Date('2026-09-20'),
      time:        '17:00',
      maxCapacity: 15,
      visibility:  'members_only',
      status:      'upcoming',
    },
    {
      clubId:      theatre._id,
      title:       'Spectacle de fin de saison',
      description: 'Représentation finale de la pièce travaillée tout au long de la saison.',
      location:    'Théâtre municipal de Sfax',
      date:        new Date('2026-10-15'),
      time:        '19:00',
      visibility:  'public',
      status:      'upcoming',
    },

    // Club Football
    {
      clubId:      football._id,
      title:       'Match amical — FC Ariana',
      description: 'Match amical contre le club de football de la faculté voisine.',
      location:    'Terrain synthétique, Ariana',
      date:        new Date('2026-09-12'),
      time:        '10:00',
      visibility:  'public',
      status:      'upcoming',
    },
    {
      clubId:      football._id,
      title:       'Tournoi inter-facultés',
      description: 'Grand tournoi annuel regroupant 8 équipes.',
      location:    'Complexe sportif, Tunis',
      date:        new Date('2026-05-20'),
      time:        '09:00',
      visibility:  'public',
      status:      'past',
    },
  ]);

  const [
    atelierRobot, competitionRobot, conception3D,
    atelierIR, presentation,
    impro, spectacle,
    matchAmical, tournoi
  ] = events;

  // ── Inscriptions aux événements ───────────────────────────
  console.log('✅ Création des inscriptions...');
  await EventRegistration.insertMany([
    // Atelier robotique
    { eventId: atelierRobot._id, userId: sara._id    },
    { eventId: atelierRobot._id, userId: ines._id    },
    { eventId: atelierRobot._id, userId: youssef._id },

    // Compétition
    { eventId: competitionRobot._id, userId: ahmed._id },
    { eventId: competitionRobot._id, userId: sara._id  },
    { eventId: competitionRobot._id, userId: ines._id  },

    // Match amical
    { eventId: matchAmical._id, userId: youssef._id },
    { eventId: matchAmical._id, userId: sara._id    },
    { eventId: matchAmical._id, userId: mohamed._id },
  ]);

  // ── Sondages ──────────────────────────────────────────────
  console.log('📊 Création des sondages...');
  await Poll.insertMany([
    // Club Robotique — actif
    {
      clubId:   robotique._id,
      question: "Quel jour préférez-vous pour l'atelier mensuel ?",
      options:  [
        { label: 'Samedi matin',        votesCount: 14 },
        { label: 'Dimanche après-midi', votesCount: 8  },
        { label: 'Vendredi soir',       votesCount: 6  },
      ],
      status: 'active',
    },
    // Club Robotique — clôturé
    {
      clubId:   robotique._id,
      question: 'Quel thème pour la prochaine sortie ?',
      options:  [
        { label: 'Nature / randonnée', votesCount: 16 },
        { label: 'Musée',              votesCount: 8  },
        { label: 'Cinéma',             votesCount: 4  },
      ],
      status:   'closed',
      closedAt: new Date('2026-07-05'),
    },
    // Troupe de Théâtre — actif
    {
      clubId:   theatre._id,
      question: 'Quelle pièce voulez-vous jouer cette saison ?',
      options:  [
        { label: 'Comédie musicale',  votesCount: 9 },
        { label: 'Drame historique',  votesCount: 5 },
        { label: 'Improvisation pure', votesCount: 7 },
      ],
      status: 'active',
    },
    // Club Football — actif
    {
      clubId:   football._id,
      question: 'Quel format pour le prochain tournoi ?',
      options:  [
        { label: '5 contre 5',  votesCount: 12 },
        { label: '7 contre 7',  votesCount: 8  },
        { label: '11 contre 11', votesCount: 3 },
      ],
      status: 'active',
    },
  ]);

  // ── Articles de blog ──────────────────────────────────────
  console.log('📝 Création des articles de blog...');
  await Post.insertMany([
    {
      clubId:     robotique._id,
      authorId:   ahmed._id,
      title:      'Retour sur notre atelier robotique de juin : Suivi de ligne et capteurs IR',
      content:    `Le mois de juin a été riche en apprentissages pour notre club de robotique ! Lors de notre atelier mensuel, nous avons accueilli 12 jeunes passionnés pour un défi autour du suivi de ligne avec capteurs infrarouges.

Au programme :

-Rappel des bases de l'électronique (pont en H, moteurs DC, batteries).
-Programmation des capteurs IR sous Arduino IDE.
-Réglage des seuils de détection.
-Compétition finale entre les équipes.

Bravo à tous les participants pour leur enthousiasme et leur créativité ! Rendez-vous en septembre pour notre prochain atelier.`,
      coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
      tags:       ['robotique', 'atelier', 'Arduino', 'capteurs IR'],
    },
    {
      clubId:     robotique._id,
      authorId:   ahmed._id,
      title:      'Notre équipe représentera Sousse à la compétition nationale de robotique',
      content:    `Excellente nouvelle pour le Club de Robotique ! Après notre victoire lors du tournoi régional, nous avons été sélectionnés pour représenter la région de Sousse à la compétition nationale.

L'équipe est composée de 4 membres :

-Ahmed Ben Ali (capitaine)
-Sara Trabelsi (programmation)
-Ines Maaloul (mécanique)
-Youssef Gharbi (électronique)

La compétition aura lieu en octobre 2026. Nous vous tiendrons informés de nos résultats. Merci pour votre soutien !`,
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      tags:       ['compétition', 'robotique', 'Sousse', 'nationale'],
    },
    {
      clubId:     theatre._id,
      authorId:   mohamed._id,
      title:      'La saison théâtrale 2026 est lancée !',
      content:    `La Troupe de Théâtre de Sfax est heureuse d'annoncer le lancement de sa nouvelle saison artistique ! Cette année, nous avons choisi de travailler sur une pièce originale écrite par nos membres.

Le thème central : l'identité et l'appartenance dans la Tunisie contemporaine.

-Ateliers hebdomadaires tous les mercredis à 17h
-Séances d'improvisation ouvertes à tous
-Représentation finale prévue en octobre

Rejoignez-nous pour vivre une aventure artistique unique !`,
      coverImage: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800',
      tags:       ['théâtre', 'saison 2026', 'Sfax', 'improvisation'],
    },
  ]);

  // ── Résumé ────────────────────────────────────────────────
  console.log('');
  console.log('✅ Seed terminé avec succès !');
  console.log('');
  console.log('📋 Comptes de test (mot de passe : password123) :');
  console.log('   admin@test.com      → Super Admin');
  console.log('   president@test.com  → Président (Club de Robotique, Sousse)');
  console.log('   member2@test.com    → Président (Troupe de Théâtre, Sfax)');
  console.log('   member@test.com     → Membre (Tunis)');
  console.log('   ines@test.com       → Membre (Sousse)');
  console.log('   youssef@test.com    → Membre (Ariana)');
  console.log('   sana@test.com       → Banni (Monastir)');
  console.log('');
  console.log('🏛 Clubs créés :');
  console.log('   Club de Robotique (active) — Sousse, Monastir');
  console.log('   Troupe de Théâtre (active) — Sfax');
  console.log('   Club Football (active)      — Tunis, Ariana');
  console.log('   Cercle Littéraire (pending) — Monastir');
  console.log('   Club Photographie (pending) — Sfax, Gabès');
  console.log('');

  mongoose.disconnect();
};

seed().catch((err) => {
  console.error('❌ Erreur seed :', err);
  mongoose.disconnect();
  process.exit(1);
});