import React from 'react';
import { MemberBadge } from '../../utils/memberBadges';
import './MemberBadges.css';

interface MemberBadgesProps {
  badges: MemberBadge[];
}

export default function MemberBadges({ badges }: MemberBadgesProps) {
  const unlocked = badges.filter((b) => b.unlocked);
  const locked   = badges.filter((b) => !b.unlocked);

  return (
    <div className="member-badges">

      <div className="badges-header">
        <h3 className="badges-title">Succès</h3>
        <span className="badges-count">
          {unlocked.length}/{badges.length} débloqués
        </span>
      </div>

      
      {unlocked.length > 0 && (
        <div className="badges-grid">
          {unlocked.map((badge) => (
            <div key={badge.id} className="badge-item badge-unlocked" title={badge.description}>
              <div
                className="badge-icon"
                style={{ background: `${badge.color}20`, border: `1px solid ${badge.color}40` }}
              >
                {badge.icon}
              </div>
              <span className="badge-label">{badge.label}</span>
              <span className="badge-desc">{badge.description}</span>
            </div>
          ))}
        </div>
      )}

      
      {locked.length > 0 && (
        <>
          <p className="badges-locked-title">À débloquer</p>
          <div className="badges-grid">
            {locked.map((badge) => (
              <div key={badge.id} className="badge-item badge-locked" title={badge.description}>
                <div className="badge-icon badge-icon-locked">🔒</div>
                <span className="badge-label">{badge.label}</span>
                <span className="badge-desc">{badge.description}</span>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}