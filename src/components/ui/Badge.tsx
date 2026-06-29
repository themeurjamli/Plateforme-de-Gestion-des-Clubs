import React from 'react';
import './Badge.css';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'gray';
}

export default function Badge({ label, variant = 'gray' }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {label}
    </span>
  );
}


export function ClubStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    active:   { label: 'Actif',     variant: 'success' },
    pending:  { label: 'En attente', variant: 'warning' },
    inactive: { label: 'Inactif',   variant: 'gray'    },
  };
  const item = map[status] ?? { label: status, variant: 'gray' };
  return <Badge label={item.label} variant={item.variant} />;
}

export function MembershipStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    member:  { label: 'Membre',      variant: 'success' },
    pending: { label: 'En attente',  variant: 'warning' },
    banned:  { label: 'Banni',       variant: 'danger'  },
  };
  const item = map[status] ?? { label: status, variant: 'gray' };
  return <Badge label={item.label} variant={item.variant} />;
}

export function UserRoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    admin:     { label: 'Super Admin', variant: 'danger'  },
    president: { label: 'Président',   variant: 'primary' },
    member:    { label: 'Membre',      variant: 'success' },
    visitor:   { label: 'Visiteur',    variant: 'gray'    },
  };
  const item = map[role] ?? { label: role, variant: 'gray' };
  return <Badge label={item.label} variant={item.variant} />;
}

export function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, BadgeProps['variant']> = {
    Tech:     'primary',
    Sport:    'success',
    Culture:  'warning',
    Musique:  'danger',
    Science:  'primary',
    Art:      'warning',
    Autre:    'gray',
  };
  return <Badge label={category} variant={map[category] ?? 'gray'} />;
}