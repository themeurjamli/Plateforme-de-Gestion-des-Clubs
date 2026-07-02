import React from 'react';
import { Challenge } from '../../utils/challenges';
import './ChallengesPanel.css';

interface ChallengesPanelProps {
  challenges: Challenge[];
}

export default function ChallengesPanel({ challenges }: ChallengesPanelProps) {
  const completedCount = challenges.filter((c) => c.completed).length;

  return (
    <div className="challenges-panel card">
      <div className="challenges-header">
        <h2 className="challenges-title">🎯 Défis actifs</h2>
        <span className="challenges-count">
          {completedCount}/{challenges.length} complétés
        </span>
      </div>

      <div className="challenges-grid">
        {challenges.map((c) => {
          const pct = Math.min(100, Math.round((c.current / c.target) * 100));
          return (
            <div key={c.id} className={`challenge-card ${c.completed ? 'challenge-done' : ''}`}>
              <div className="challenge-top">
                <span className="challenge-icon">{c.icon}</span>
                <div className="challenge-info">
                  <span className="challenge-title-text">{c.title}</span>
                  <span className="challenge-desc">{c.description}</span>
                </div>
                {c.completed && <span className="challenge-check">✓</span>}
              </div>

              <div className="challenge-progress">
                <div className="challenge-bar-track">
                  <div
                    className={`challenge-bar-fill ${c.completed ? 'challenge-bar-done' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="challenge-progress-label">
                  {c.current}/{c.target}
                </span>
              </div>

              <div className="challenge-footer">
                <span className="challenge-bonus">+{c.bonusPoints} pts bonus</span>
                <span className={`challenge-type-badge challenge-type-${c.type}`}>
                  {c.type === 'monthly' ? 'Mensuel' : 'Objectif'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}