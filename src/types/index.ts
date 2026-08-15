
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
  clubId?: string; 
  city?: string;
  createdAt: string;
}

export interface ClubPhoto {
  _id?: string;
  id?: string;
  url: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

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
  gallery?: ClubPhoto[];
  cities?: string[];
  membersCount: number;
  eventsCount: number;
  createdAt: string;
}


export type MembershipStatus = 'pending' | 'member' | 'banned';

export interface Membership {
  id: string;
  userId: string;
  clubId: string;
  status: MembershipStatus;
  joinedAt: string;
}


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

export interface EventRating {
  id: string;
  eventId: string;
  userId: string;
  rating: number; 
  comment?: string;
  createdAt: string;
}