import {
  User,
  Club,
  Membership,
  Event,
  EventRegistration,
  Poll,
  PollVote,
} from '../types/index';

// ─── UTILISATEURS ────────────────────────────────────────────
// 4 emails = 4 rôles différents pour tester

export const mockUsers: User[] = [
  {
    id: 'u0',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@test.com',
    role: 'admin',
    status: 'active',
    bio: 'Administrateur global de la plateforme.',
    interests: [],
    createdAt: '2025-01-01',
  },
  {
    id: 'u1',
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    email: 'president@test.com',
    role: 'president',
    status: 'active',
    bio: 'Passionné de robotique et de sciences.',
    interests: ['Tech', 'Science'],
    clubId: 'c1',
    createdAt: '2025-01-10',
  },
  {
    id: 'u2',
    firstName: 'Sara',
    lastName: 'Trabelsi',
    email: 'member@test.com',
    role: 'member',
    status: 'active',
    bio: 'Étudiante en informatique.',
    interests: ['Tech', 'Culture'],
    createdAt: '2025-02-05',
  },
  {
    id: 'u3',
    firstName: 'Mohamed',
    lastName: 'Karim',
    email: 'member2@test.com',
    role: 'member',
    status: 'active',
    bio: 'Sportif et curieux.',
    interests: ['Sport', 'Science'],
    createdAt: '2025-02-20',
  },
  {
    id: 'u4',
    firstName: 'Sana',
    lastName: 'Jlassi',
    email: 'sana@test.com',
    role: 'member',
    status: 'banned',
    bio: '',
    interests: ['Art'],
    createdAt: '2025-03-01',
  },
];

// ─── CLUBS ───────────────────────────────────────────────────
// 3 actifs, 2 en attente de validation par l'admin

export const mockClubs: Club[] = [
  {
    id: 'c1',
    name: 'Club de Robotique',
    description:
      'Passionnés de robotique, électronique et intelligence artificielle. Nous organisons des ateliers hebdomadaires et participons à des compétitions nationales.',
    category: 'Tech',
    status: 'active',
    presidentId: 'u1',
    membersCount: 38,
    eventsCount: 5,
    createdAt: '2025-01-15',
  },
  {
    id: 'c2',
    name: 'Troupe de Théâtre',
    description:
      "Créations théâtrales originales et ateliers d'improvisation ouverts à tous les niveaux.",
    category: 'Culture',
    status: 'active',
    presidentId: 'u3',
    membersCount: 22,
    eventsCount: 3,
    createdAt: '2025-01-20',
  },
  {
    id: 'c3',
    name: 'Club Football',
    description:
      'Entraînements deux fois par semaine et matchs inter-clubs. Tous niveaux acceptés.',
    category: 'Sport',
    status: 'active',
    presidentId: 'u2',
    membersCount: 55,
    eventsCount: 8,
    createdAt: '2025-02-01',
  },
  {
    id: 'c4',
    name: 'Cercle Littéraire',
    description:
      "Lectures, discussions et ateliers d'écriture créative. Chaque mois un nouveau livre.",
    category: 'Culture',
    status: 'pending',
    presidentId: 'u4',
    membersCount: 0,
    eventsCount: 0,
    createdAt: '2025-06-10',
  },
  {
    id: 'c5',
    name: 'Club Photographie',
    description:
      'Sorties photo, partage de techniques et expositions. Tous photographes bienvenus.',
    category: 'Art',
    status: 'pending',
    presidentId: 'u3',
    membersCount: 0,
    eventsCount: 0,
    createdAt: '2025-06-12',
  },
];

// ─── ADHÉSIONS ───────────────────────────────────────────────
// Qui appartient à quel club, avec quel statut

export const mockMemberships: Membership[] = [
  { id: 'm1', userId: 'u1', clubId: 'c1', status: 'member',  joinedAt: '2025-01-15' },
  { id: 'm2', userId: 'u2', clubId: 'c1', status: 'member',  joinedAt: '2025-02-10' },
  { id: 'm3', userId: 'u3', clubId: 'c1', status: 'member',  joinedAt: '2025-02-15' },
  { id: 'm4', userId: 'u2', clubId: 'c2', status: 'pending', joinedAt: '2025-06-01' },
  { id: 'm5', userId: 'u3', clubId: 'c3', status: 'member',  joinedAt: '2025-03-01' },
  { id: 'm6', userId: 'u4', clubId: 'c1', status: 'pending', joinedAt: '2025-06-12' },
];

// ─── ÉVÉNEMENTS ──────────────────────────────────────────────

export const mockEvents: Event[] = [
  {
    id: 'e1',
    clubId: 'c1',
    title: 'Atelier robotique — niveau débutant',
    description: 'Introduction à la programmation de robots avec Arduino. Matériel fourni.',
    location: 'Salle B14, Bâtiment principal',
    date: '2026-06-20',
    time: '18:00',
    maxCapacity: 30,
    registeredCount: 18,
    visibility: 'public',
    status: 'upcoming',
    createdAt: '2025-06-01',
  },
  {
    id: 'e2',
    clubId: 'c1',
    title: 'Compétition inter-clubs',
    description: 'Affrontez les équipes des autres clubs sur des défis de programmation.',
    location: 'Amphithéâtre A',
    date: '2026-07-05',
    time: '14:00',
    maxCapacity: 20,
    registeredCount: 6,
    visibility: 'public',
    status: 'upcoming',
    createdAt: '2025-06-05',
  },
  {
    id: 'e3',
    clubId: 'c2',
    title: "Atelier improvisation théâtrale",
    description: "Séance d'impro ouverte à tous. Venez comme vous êtes !",
    location: 'Salle des arts',
    date: '2026-06-25',
    time: '17:00',
    maxCapacity: 15,
    registeredCount: 10,
    visibility: 'members_only',
    status: 'upcoming',
    createdAt: '2025-06-08',
  },
  {
    id: 'e4',
    clubId: 'c3',
    title: 'Match amical',
    description: 'Match amical contre le club de la faculté voisine.',
    location: 'Terrain de sport',
    date: '2026-05-10',
    time: '10:00',
    registeredCount: 22,
    visibility: 'public',
    status: 'past',
    createdAt: '2025-05-01',
  },
];

export const mockRegistrations: EventRegistration[] = [
  { id: 'r1', eventId: 'e1', userId: 'u2', registeredAt: '2025-06-02' },
  { id: 'r2', eventId: 'e2', userId: 'u2', registeredAt: '2025-06-06' },
  { id: 'r3', eventId: 'e3', userId: 'u3', registeredAt: '2025-06-09' },
];

// ─── SONDAGES ────────────────────────────────────────────────

export const mockPolls: Poll[] = [
  {
    id: 'p1',
    clubId: 'c1',
    question: "Quel jour préférez-vous pour l'atelier mensuel ?",
    options: [
      { id: 'o1', label: 'Samedi matin',        votesCount: 14 },
      { id: 'o2', label: 'Dimanche après-midi', votesCount: 8  },
      { id: 'o3', label: 'Vendredi soir',       votesCount: 6  },
    ],
    status: 'active',
    totalVotes: 28,
    createdAt: '2025-06-10',
  },
  {
    id: 'p2',
    clubId: 'c1',
    question: 'Quel thème pour la prochaine sortie ?',
    options: [
      { id: 'o4', label: 'Nature / randonnée', votesCount: 16 },
      { id: 'o5', label: 'Musée',              votesCount: 8  },
      { id: 'o6', label: 'Cinéma',             votesCount: 4  },
    ],
    status: 'closed',
    totalVotes: 28,
    createdAt: '2025-05-20',
    closedAt: '2025-06-05',
  },
];

export const mockVotes: PollVote[] = [
  { id: 'v1', pollId: 'p1', userId: 'u2', optionId: 'o1', votedAt: '2025-06-11' },
  { id: 'v2', pollId: 'p2', userId: 'u2', optionId: 'o4', votedAt: '2025-05-21' },
];