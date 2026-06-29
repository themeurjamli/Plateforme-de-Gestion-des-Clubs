import React from 'react';
import './Statcard.css';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color?: 'blue' | 'green' | 'warning' | 'danger';
}

export default function StatCard({
  label,
  value,
  icon,
  color = 'blue',
}: StatCardProps) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-body">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-label">{label}</span>
      </div>
    </div>
  );
}