import React from 'react';
import { LevelInfo } from '../../utils/scoring';
import './LevelBadge.css';

interface LevelBadgeProps {
  levelInfo: LevelInfo;
  points:    number;
  size?:     'sm' | 'md' | 'lg';
  showPoints?: boolean;
}

export default function LevelBadge({
  levelInfo,
  points,
  size = 'md',
  showPoints = false,
}: LevelBadgeProps) {
  return (
    <div className={`level-badge level-badge-${size} level-${levelInfo.level.toLowerCase()}`}>
      <span className="level-icon">{levelInfo.icon}</span>
      <span className="level-name">{levelInfo.level}</span>
      {showPoints && (
        <span className="level-points">{points} pts</span>
      )}
    </div>
  );
}


interface LevelProgressProps {
  levelInfo:   LevelInfo;
  points:      number;
  progressPct: number;
}

export function LevelProgress({ levelInfo, points, progressPct }: LevelProgressProps) {
  return (
    <div className="level-progress-wrap">
      <div className="level-progress-header">
        <div className="level-progress-current">
          <span className="level-icon-sm">{levelInfo.icon}</span>
          <span className="level-progress-name">{levelInfo.level}</span>
          <span className="level-progress-pts">{points} pts</span>
        </div>
        {levelInfo.nextLevel && levelInfo.maxPoints && (
          <span className="level-progress-next">
            Prochain : {levelInfo.nextLevel} ({levelInfo.maxPoints + 1} pts)
          </span>
        )}
        {!levelInfo.nextLevel && (
          <span className="level-progress-max">Niveau maximum atteint 🎉</span>
        )}
      </div>
      <div className="level-bar-track">
        <div
          className="level-bar-fill"
          style={{ width: `${progressPct}%`, background: levelInfo.color }}
        />
      </div>
      <div className="level-progress-pct">{progressPct}%</div>
    </div>
  );
}