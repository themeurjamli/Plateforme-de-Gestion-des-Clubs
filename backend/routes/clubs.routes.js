const express    = require('express');
const Club       = require('../models/Club.model');
const Event      = require('../models/Event.model');
const { Poll }   = require('../models/Poll.model');
const Membership = require('../models/Membership.model');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const SCORE_RULES = {
  MEMBER: 5,
  EVENT: 10,
  EVENT_FULL: 15,
  POLL_ACTIVE: 8,
  WEEKLY_STREAK: 5,
  LOCATION_MATCH: 5,
};

const LEVELS = [
  { level: 'Bronze',  icon: '🥉', color: '#CD7F32', minPoints: 0,   maxPoints: 99,  nextLevel: 'Argent'  },
  { level: 'Argent',  icon: '🥈', color: '#A8A9AD', minPoints: 100, maxPoints: 299, nextLevel: 'Or'      },
  { level: 'Or',      icon: '🥇', color: '#FFD700', minPoints: 300, maxPoints: 599, nextLevel: 'Platine' },
  { level: 'Platine', icon: '💎', color: '#B9F2FF', minPoints: 600, maxPoints: null, nextLevel: null      },
];

function getLevelInfo(points) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) return LEVELS[i];
  }
  return LEVELS[0];
}

function getWeekStartKey(dateValue) {
  const date = new Date(dateValue);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 1 - day);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

function calculateWeeklyEventStreak(events) {
  const pastEvents = events.filter((e) => e.status === 'past');
  const weekKeys = [
    ...new Set(pastEvents.map((e) => getWeekStartKey(e.date)))
  ].sort((a, b) => b.localeCompare(a));

  if (weekKeys.length === 0) return 0;

  let streak = 1;
  for (let i = 0; i < weekKeys.length - 1; i++) {
    const current = new Date(weekKeys[i]);
    const previous = new Date(weekKeys[i + 1]);
    const diff = Math.round((current - previous) / (7 * 24 * 60 * 60 * 1000));
    if (diff === 1) streak++;
    else break;
  }

  return streak;
}

function getWeeklyStreakLabel(streak) {
  if (streak === 0) return '';
  if (streak === 1) return '🔥 1 semaine active';
  return `🔥 Actif ${streak} semaines de suite`;
}

function getClubChallenges(club, events, memberships, polls) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const clubId = club._id.toString();

  const clubEvents = events.filter((e) => e.clubId.toString() === clubId);
  const clubMembers = memberships.filter((m) => m.clubId.toString() === clubId);
  const activePolls = polls.filter((p) => p.clubId.toString() === clubId && p.status === 'active');
  const thisMonthEvents = clubEvents.filter((e) => e.date.toISOString().startsWith(thisMonth));
  const fullEvents = clubEvents.filter((e) => e.maxCapacity != null && e.registeredCount >= e.maxCapacity);

  const allChallenges = [
    {
      id: 'event_this_month',
      icon: '📅',
      title: 'Organisateur du mois',
      description: 'Organise 1 événement ce mois-ci',
      current: Math.min(thisMonthEvents.length, 1),
      target: 1,
      bonusPoints: 20,
      completed: thisMonthEvents.length >= 1,
      type: 'monthly',
    },
    {
      id: 'full_event',
      icon: '🎯',
      title: 'Sold out !',
      description: 'Organise un événement complet',
      current: Math.min(fullEvents.length, 1),
      target: 1,
      bonusPoints: 25,
      completed: fullEvents.length >= 1,
      type: 'goal',
    },
    {
      id: 'active_poll',
      icon: '📊',
      title: 'À l’écoute',
      description: 'Lance un sondage actif',
      current: Math.min(activePolls.length, 1),
      target: 1,
      bonusPoints: 15,
      completed: activePolls.length >= 1,
      type: 'monthly',
    },
    {
      id: 'member_growth',
      icon: '👥',
      title: 'Club en croissance',
      description: 'Atteins 10 membres ce mois-ci',
      current: clubMembers.length,
      target: 10,
      bonusPoints: 30,
      completed: clubMembers.length >= 10,
      type: 'goal',
    },
  ];

  const seed = Array.from(clubId).reduce((sum, char) => sum + char.charCodeAt(0), 0) + now.getMonth();
  const start = seed % allChallenges.length;
  return Array.from({ length: 3 }, (_, idx) => allChallenges[(start + idx) % allChallenges.length]);
}

function scoreClub(club, events, polls, memberships, userCity) {
  const clubId = club._id.toString();
  const clubMembers = memberships.filter((m) => m.clubId.toString() === clubId);
  const clubEvents = events.filter((e) => e.clubId.toString() === clubId);
  const clubPolls = polls.filter((p) => p.clubId.toString() === clubId);

  const membersCount = clubMembers.length;
  const eventsCount = clubEvents.length;
  const fullEventsCount = clubEvents.filter(
    (e) => e.maxCapacity && e.registeredCount >= e.maxCapacity
  ).length;
  const activePollsCount = clubPolls.filter((p) => p.status === 'active').length;
  const weeklyStreak = calculateWeeklyEventStreak(clubEvents);
  const weeklyStreakPoints = weeklyStreak * SCORE_RULES.WEEKLY_STREAK;

  const membersPoints = membersCount * SCORE_RULES.MEMBER;
  const eventsPoints = eventsCount * SCORE_RULES.EVENT;
  const eventFullPoints = fullEventsCount * SCORE_RULES.EVENT_FULL;
  const pollsPoints = activePollsCount * SCORE_RULES.POLL_ACTIVE;

  const isLocationMatch = !!userCity && Array.isArray(club.cities) && club.cities.includes(userCity);
  const locationPoints = isLocationMatch ? SCORE_RULES.LOCATION_MATCH : 0;

  const challenges = getClubChallenges(club, events, memberships, polls);
  const challengeBonus = challenges.filter((c) => c.completed).reduce((sum, c) => sum + c.bonusPoints, 0);

  const totalPoints = membersPoints + eventsPoints + eventFullPoints + pollsPoints + weeklyStreakPoints + challengeBonus + locationPoints;

  const levelInfo = getLevelInfo(totalPoints);
  let progressPct = 100;
  if (levelInfo.maxPoints !== null) {
    const range = levelInfo.maxPoints - levelInfo.minPoints + 1;
    const earned = totalPoints - levelInfo.minPoints;
    progressPct = Math.min(100, Math.round((earned / range) * 100));
  }

  return {
    clubId,
    totalPoints,
    breakdown: {
      membersCount,
      membersPoints,
      eventsCount,
      eventsPoints,
      fullEventsCount,
      eventFullPoints,
      activePollsCount,
      pollsPoints,
      weeklyStreak,
      weeklyStreakPoints,
      challengeBonus,
      locationPoints,
      isLocationMatch,
    },
    challenges,
    levelInfo,
    progressPct,
    weeklyStreakLabel: getWeeklyStreakLabel(weeklyStreak),
  };
}

router.get('/', async (req, res) => {
  try {
    const { category, search , city} = req.query;
    const filter = { status: 'active' };

    if (category) filter.category = category;
    if (search)   filter.name = { $regex: search, $options: 'i' };
    if(city) filter.cities = city;

    const clubs = await Club.find(filter)
      .populate('presidentId', 'firstName lastName')
      .populate('membersCount')
      .populate('eventsCount')
      .sort({ createdAt: -1 });

    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/ranking', async (req, res) => {
  try {
    const{userCity} = req.query;
    const [clubs, events, polls, memberships] = await Promise.all([
      Club.find({ status: 'active' }),
      Event.find().populate('registeredCount'),
      Poll.find(),
      Membership.find({ status: 'member' }),
    ]);

    const ranked = clubs
      .map((club) => ({ club, score: scoreClub(club, events, polls, memberships, userCity) }))
      .sort((a, b) => b.score.totalPoints - a.score.totalPoints)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/score', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club introuvable' });

    const [events, polls, memberships] = await Promise.all([
      Event.find({ clubId: club._id }).populate('registeredCount'),
      Poll.find({ clubId: club._id }),
      Membership.find({ clubId: club._id, status: 'member' }),
    ]);

    const { userCity } = req.query;
    const score = scoreClub(club, events, polls, memberships, userCity);
    res.json({ club, score });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const clubs = await Club.find()
      .populate('presidentId', 'firstName lastName')
      .populate('membersCount')
      .populate('eventsCount')
      .sort({ createdAt: -1 });
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('presidentId', 'firstName lastName email')
      .populate('membersCount')
      .populate('eventsCount');

    if (!club) {
      return res.status(404).json({ message: 'Club introuvable' });
    }
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, description, category, cities } = req.body;

    const existing = await Club.findOne({ presidentId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Vous gérez déjà un club' });
    }

    const club = await Club.create({
      name,
      description,
      category,
      cities,
      presidentId: req.user._id,
      status:      'pending', 
    });

    req.user.role   = 'president';
    req.user.clubId = club._id;
    await req.user.save();

    res.status(201).json(club);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club introuvable' });

    if (
      req.user.role !== 'admin' &&
      club.presidentId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const { name, description, category,cities} = req.body;
    const updated = await Club.findByIdAndUpdate(
      req.params.id,
      { name, description, category,cities},
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const club = await Club.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!club) return res.status(404).json({ message: 'Club introuvable' });
    res.json(club);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club introuvable' });

    if (
      req.user.role !== 'admin' &&
      club.presidentId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await club.deleteOne();
    res.json({ message: 'Club supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function verifyClubAdminOrPresident(req, club) {
  return req.user.role === 'admin' || club.presidentId.toString() === req.user._id.toString();
}

router.post('/:id/gallery', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club introuvable' });

    if (!verifyClubAdminOrPresident(req, club)) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const { url, caption = '' } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL de la photo est requise' });
    }

    club.gallery = club.gallery || [];
    club.gallery.push({ url, caption, uploadedAt: new Date(), uploadedBy: req.user._id });
    await club.save();

    const photo = club.gallery[club.gallery.length - 1];
    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id/gallery/:photoId', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club introuvable' });

    if (!verifyClubAdminOrPresident(req, club)) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const originalCount = club.gallery.length;
    club.gallery = club.gallery.filter((photo) => {
      const photoId = photo._id ? photo._id.toString() : photo.id?.toString();
      return photoId !== req.params.photoId;
    });

    if (club.gallery.length === originalCount) {
      return res.status(404).json({ message: 'Photo introuvable' });
    }

    await club.save();
    res.json({ message: 'Photo supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/members', protect, async (req, res) => {
  try {
    const members = await Membership.find({
      clubId: req.params.id,
      status: 'member',
    }).populate('userId', 'firstName lastName email createdAt');
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/pending', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const pending = await Membership.find({
      clubId: req.params.id,
      status: 'pending',
    }).populate('userId', 'firstName lastName email');
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;