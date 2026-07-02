import { User, Membership, EventRegistration, PollVote } from '../types/index';

export interface MemberBadge {
  id:          string;
  icon:        string;
  label:       string;
  description: string;
  color:       string;
  unlocked:    boolean;
}


export function getMemberBadges(
  user:          User,
  memberships:   Membership[],
  registrations: EventRegistration[],
  votes:         PollVote[],
): MemberBadge[] {

  const myMemberships   = memberships.filter((m) => m.userId === user.id && m.status === 'member');
  const myRegistrations = registrations.filter((r) => r.userId === user.id);
  const myVotes         = votes.filter((v) => v.userId === user.id);

  const createdAt   = new Date(user.createdAt);
  const now         = new Date();
  const monthsOld   = (now.getFullYear() - createdAt.getFullYear()) * 12
                    + (now.getMonth() - createdAt.getMonth());

  const allBadges: MemberBadge[] = [
    {
      id:          'premier_pas',
      icon:        '🚀',
      label:       'Premier pas',
      description: 'A rejoint son premier club',
      color:       '#3B82F6',
      unlocked:    myMemberships.length >= 1,
    },
    {
      id:          'explorateur',
      icon:        '🗺️',
      label:       'Explorateur',
      description: 'A rejoint 3 clubs ou plus',
      color:       '#10B981',
      unlocked:    myMemberships.length >= 3,
    },
    {
      id:          'assidu',
      icon:        '📅',
      label:       'Assidu',
      description: "S'est inscrit à 3 événements ou plus",
      color:       '#F59E0B',
      unlocked:    myRegistrations.length >= 3,
    },
    {
      id:          'votant',
      icon:        '🗳️',
      label:       'Votant actif',
      description: 'A participé à 2 sondages ou plus',
      color:       '#8B5CF6',
      unlocked:    myVotes.length >= 2,
    },
    {
      id:          'fondateur',
      icon:        '⭐',
      label:       'Fidèle',
      description: 'Membre de la plateforme depuis plus de 3 mois',
      color:       '#EC4899',
      unlocked:    monthsOld >= 3,
    },
    {
      id:          'hyperactif',
      icon:        '⚡',
      label:       'Hyperactif',
      description: "Membre de 2 clubs + inscrit à 2 événements + voté",
      color:       '#EF4444',
      unlocked:    myMemberships.length >= 2 && myRegistrations.length >= 2 && myVotes.length >= 1,
    },
  ];

  return allBadges;
}