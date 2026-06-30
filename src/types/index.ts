// UTILISATEUR 

export type UserRole = 'visitor' | 'member' | 'president' | 'admin';

export type UserStatus = 'active' | 'banned';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  bio?: string;
  interests?: string[];
  avatarUrl?: string;
  clubId?: string; // rempli seulement si le user est président
  createdAt: string;
}

//  CLUB 

export type ClubCategory =
  | 'Tech'
  | 'Sport'
  | 'Culture'
  | 'Musique'
  | 'Science'
  | 'Art'
  | 'Autre';

export type ClubStatus = 'pending' | 'active' | 'inactive' | 'rejected';

export interface Club {
  id: string;
  name: string;
  description: string;
  category: ClubCategory;
  status: ClubStatus;
  presidentId: string;
  logoUrl?: string;
  membersCount: number;
  eventsCount: number;
  createdAt: string;
}

// ADHÉSION 

export type MembershipStatus = 'pending' | 'member' | 'banned';

export interface Membership {
  id: string;
  userId: string;
  clubId: string;
  status: MembershipStatus;
  joinedAt: string;
}

//  ÉVÉNEMENT 

export type EventVisibility = 'public' | 'members_only';

export type EventStatus = 'upcoming' | 'past' | 'cancelled';

export interface Event {
  id: string;
  clubId: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  maxCapacity?: number;
  registeredCount: number;
  visibility: EventVisibility;
  status: EventStatus;
  coverUrl?: string;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
}

// SONDAGE 

export type PollStatus = 'active' | 'closed';

export interface PollOption {
  id: string;
  label: string;
  votesCount: number;
}

export interface Poll {
  id: string;
  clubId: string;
  question: string;
  options: PollOption[];
  status: PollStatus;
  totalVotes: number;
  createdAt: string;
  closedAt?: string;
}

export interface PollVote {
  id: string;
  pollId: string;
  userId: string;
  optionId: string;
  votedAt: string;
}