import React from 'react';
import './Pageheader.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode; // bouton ou élément à droite
}

export default function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-text">
        <h1 className="page-header-title">{title}</h1>
        {subtitle && (
          <p className="page-header-subtitle">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="page-header-action">{action}</div>
      )}
    </div>
  );
}