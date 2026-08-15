import { Club, Event, Poll, Membership } from '../types/index';


const POINTS = {
  PAR_MEMBRE:           5,
  PAR_EVENEMENT:       10,
  EVENEMENT_COMPLET:   15,  
  PAR_SONDAGE_ACTIF:    8,
  LOCALISATION:        5,
};


export type ClubLevel = 'Bronze' | 'Argent' | 'Or' | 'Platine';

export interface LevelInfo {
  level:      ClubLevel;
  icon:       string;
  color:      string;
  minPoints:  number;
  maxPoints:  number | null; 
  nextLevel:  ClubLevel | null;
}

const LEVELS: LevelInfo[] = [
  { level: 'Bronze',  icon: '🥉', color: '#CD7F32', minPoints: 0,   maxPoints: 99,  nextLevel: 'Argent'  },
  { level: 'Argent',  icon: '🥈', color: '#A8A9AD', minPoints: 100, maxPoints: 299, nextLevel: 'Or'      },
  { level: 'Or',      icon: '🥇', color: '#FFD700', minPoints: 300, maxPoints: 599, nextLevel: 'Platine' },
  { level: 'Platine', icon: '💎', color: '#B9F2FF', minPoints: 600, maxPoints: null, nextLevel: null      },
];


export interface ClubScore {
  clubId:        string;
  totalPoints:   number;
  breakdown: {
    membres:           number;
    evenements:        number;
    evenementsComplets: number;
    sondagesActifs:    number;
    localisation:      number;
  };
  levelInfo:     LevelInfo;
  progressPct:   number; 
}

export function calculateClubScore(
  club:        Club,
  events:      Event[],
  polls:       Poll[],
  memberships: Membership[],
  userCity:    string | null = null
): ClubScore {
  const clubEvents   = events.filter((e) => e.clubId === club.id);
  const clubPolls    = polls.filter((p) => p.clubId === club.id);
  const clubMembers  = memberships.filter((m) => m.clubId === club.id && m.status === 'member');

  const ptsMembers   = clubMembers.length * POINTS.PAR_MEMBRE;
  const ptsEvents    = clubEvents.length  * POINTS.PAR_EVENEMENT;
  const ptsComplete  = clubEvents.filter(
    (e) => e.maxCapacity && e.registeredCount >= e.maxCapacity
  ).length * POINTS.EVENEMENT_COMPLET;
  const ptsPolls     = clubPolls.filter((p) => p.status === 'active').length * POINTS.PAR_SONDAGE_ACTIF;

  const isLocationMatch = !!userCity && Array.isArray(club.cities) && club.cities.includes(userCity);
  const ptsLocalisation = isLocationMatch ? POINTS.LOCALISATION : 0;

  const total = ptsMembers + ptsEvents + ptsComplete + ptsPolls + ptsLocalisation;

  const levelInfo = getLevelInfo(total);

  let progressPct = 100;
  if (levelInfo.maxPoints !== null) {
    const range = levelInfo.maxPoints - levelInfo.minPoints + 1;
    const earned = total - levelInfo.minPoints;
    progressPct = Math.min(100, Math.round((earned / range) * 100));
  }

  return {
    clubId:      club.id,
    totalPoints: total,
    breakdown: {
      membres:            ptsMembers,
      evenements:         ptsEvents,
      evenementsComplets: ptsComplete,
      sondagesActifs:     ptsPolls,
      localisation:       ptsLocalisation,
    },
    levelInfo,
    progressPct,
  };
}

export function getLevelInfo(points: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) return LEVELS[i];
  }
  return LEVELS[0];
}

export function rankClubs(
  clubs:       Club[],
  events:      Event[],
  polls:       Poll[],
  memberships: Membership[],
  userCity:    string | null = null
): { club: Club; score: ClubScore; rank: number }[] {
  return clubs
    .filter((c) => c.status === 'active')
    .map((club) => ({
      club,
      score: calculateClubScore(club, events, polls, memberships, userCity),
    }))
    .sort((a, b) => b.score.totalPoints - a.score.totalPoints)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}