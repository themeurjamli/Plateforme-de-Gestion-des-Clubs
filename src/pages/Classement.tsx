import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { CategoryBadge } from '../components/ui/Badge';
import LevelBadge, { LevelProgress } from '../components/ui/LevelBadge';
import { rankClubs } from '../utils/scoring';
import { mockClubs, mockEvents, mockPolls, mockMemberships } from '../data/mockData';
import './Classement.css';

const PODIUM_MEDALS = ['🥇', '🥈', '🥉'];

export default function ClassementPage() {
    const ranked = rankClubs(mockClubs, mockEvents, mockPolls, mockMemberships);
    const podium = ranked.slice(0, 3);
    const rest = ranked.slice(3);

    return (
        <div className="classement-page">
            <Navbar />
            <div className="classement-container">

                <div className="classement-header">
                    <h1 className="classement-title">🏆 Classement des clubs</h1>
                    <p className="classement-subtitle">
                        Les clubs sont classés selon leur activité — membres, événements et sondages.
                    </p>
                </div>

                <div className="scoring-explain">
                    <span className="scoring-explain-title">Comment les points sont calculés :</span>
                    <div className="scoring-rules">
                        <span>👥 Membre actif = <strong>5 pts</strong></span>
                        <span>📅 Événement créé = <strong>10 pts</strong></span>
                        <span>✅ Événement complet = <strong>+15 pts bonus</strong></span>
                        <span>📊 Sondage actif = <strong>8 pts</strong></span>
                    </div>
                </div>

                {/* ── PODIUM TOP 3 — LevelProgress (grande barre) ── */}
                {podium.length > 0 && (
                    <div className="podium">
                        {podium.map((item, i) => (
                            <div key={item.club.id} className={`podium-card podium-${i + 1}`}>
                                <div className="podium-medal">{PODIUM_MEDALS[i]}</div>
                                <div className="podium-rank">#{item.rank}</div>
                                <div className="podium-logo">{item.club.name[0]}</div>
                                <h2 className="podium-name">{item.club.name}</h2>
                                <CategoryBadge category={item.club.category} />
                                <div className="podium-pts">{item.score.totalPoints} pts</div>
                                <LevelProgress
                                    levelInfo={item.score.levelInfo}
                                    points={item.score.totalPoints}
                                    progressPct={item.score.progressPct}
                                />
                                <div className="podium-stats">
                                    <span>👥 {item.score.breakdown.membres / 5} membres</span>
                                    <span>📅 {item.score.breakdown.evenements / 10} événements</span>
                                </div>
                                <Link to={`/clubs/${item.club.id}`}>
                                    <Button variant="secondary" size="sm" fullWidth>Voir le club</Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── TABLEAU TOP 4+ — LevelBadge compact ── */}
                {rest.length > 0 && (
                    <div className="classement-table-wrap card">
                        <table className="classement-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Club</th>
                                    <th>Niveau</th>
                                    <th>Points</th>
                                    <th>Membres</th>
                                    <th>Événements</th>
                                    <th>Progression</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rest.map((item) => (
                                    <tr key={item.club.id}>
                                        <td className="rank-cell">
                                            <span className="rank-num">#{item.rank}</span>
                                        </td>
                                        <td>
                                            <div className="club-cell">
                                                <div className="club-cell-logo">{item.club.name[0]}</div>
                                                <div>
                                                    <p className="club-cell-name">{item.club.name}</p>
                                                    <CategoryBadge category={item.club.category} />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <LevelBadge
                                                levelInfo={item.score.levelInfo}
                                                points={item.score.totalPoints}
                                                size="sm"
                                                showPoints
                                            />
                                        </td>
                                        <td className="pts-cell">{item.score.totalPoints}</td>
                                        <td>{item.score.breakdown.membres / 5}</td>
                                        <td>{item.score.breakdown.evenements / 10}</td>
                                        <td className="progress-cell">
                                            <div className="mini-bar-wrapper">
                                                <div className="mini-bar-track">
                                                    <div
                                                        className="mini-bar-fill"
                                                        style={{
                                                            width: `${item.score.progressPct}%`,
                                                            background: item.score.levelInfo.color || 'var(--primary)',
                                                        }}
                                                    />
                                                </div>
                                                <span className="mini-bar-pct">{Math.round(item.score.progressPct)}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <Link to={`/clubs/${item.club.id}`}>
                                                <Button variant="secondary" size="sm">Voir</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {ranked.length === 0 && (
                    <div className="classement-empty card">
                        <p>Aucun club actif pour le moment.</p>
                    </div>
                )}

            </div>
        </div>
    );
}