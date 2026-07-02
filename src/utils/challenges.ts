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

  return [
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
      id: 'reach_50_members',
      icon: '👥',
      title: 'Club populaire',
      description: 'Atteins 50 membres actifs',
      current: clubMembers.length,
      target: 50,
      bonusPoints: 30,
      completed: clubMembers.length >= 50,
      type: 'goal',
    },
    {
      id: 'active_poll',
      icon: '📊',
      title: 'À l\'écoute',
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
      description: 'Organise un événement complet (100% inscrits)',
      current: Math.min(fullEvents.length, 1),
      target: 1,
      bonusPoints: 25,
      completed: fullEvents.length >= 1,
      type: 'goal',
    },
  ];
}