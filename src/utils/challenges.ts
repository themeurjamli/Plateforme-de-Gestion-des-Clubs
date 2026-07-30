import { Club, Event, Membership, Poll } from '../types/index';

export interface Challenge {
  id: string;
  icon: string;
  title: string;
  description: string;
  current: number;
  target: number;
  bonusPoints: number;
  completed: boolean;
  type: 'monthly' | 'goal';
}

export function getClubChallenges(
  club: Club,
  events: Event[],
  memberships: Membership[],
  polls: Poll[]
): Challenge[] {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const clubMembers = memberships.filter(
    (m) => m.clubId === club.id && m.status === 'member'
  );
  const clubEvents = events.filter((e) => e.clubId === club.id);
  const thisMonthEvents = clubEvents.filter((e) => e.date.startsWith(thisMonth));
  const activePolls = polls.filter(
    (p) => p.clubId === club.id && p.status === 'active'
  );
  const fullEvents = clubEvents.filter(
    (e) => e.maxCapacity != null && e.registeredCount >= (e.maxCapacity ?? 0)
  );

  const allChallenges: Challenge[] = [
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
      id: 'new_members',
      icon: '🤝',
      title: 'Nouveaux adhérents',
      description: 'Atteins 10 membres actifs',
      current: Math.min(clubMembers.length, 10),
      target: 10,
      bonusPoints: 25,
      completed: clubMembers.length >= 10,
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
  ];

  const seed = Array.from(club.id).reduce((sum, char) => sum + char.charCodeAt(0), 0) + now.getMonth();

  return allChallenges
    .map((challenge, index) => ({
      challenge,
      sortIndex: (seed + index) % allChallenges.length,
    }))
    .sort((a, b) => a.sortIndex - b.sortIndex)
    .slice(0, 2)
    .map(({ challenge }) => challenge);
}