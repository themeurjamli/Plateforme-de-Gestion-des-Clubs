import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { mockClubs, mockPolls, mockVotes } from '../../data/mockData';
import { Poll, PollVote } from '../../types/index';
import './Dashboard.css';

export default function PollsPage() {
  const { user } = useAuth();
  const club = mockClubs.find((c) => c.presidentId === user?.id);

  const [polls, setPolls]   = useState<Poll[]>(
    mockPolls.filter((p) => p.clubId === club?.id)
  );
  const [votes, setVotes]   = useState<PollVote[]>([...mockVotes]);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options,  setOptions]  = useState(['', '']);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  if (!club) return null;

  const addOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!question.trim()) e.question = 'La question est requise';
    const filledOptions = options.filter((o) => o.trim());
    if (filledOptions.length < 2) e.options = 'Au moins 2 options sont requises';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    const filledOptions = options.filter((o) => o.trim());
    const newPoll: Poll = {
      id:         `p${Date.now()}`,
      clubId:     club.id,
      question:   question.trim(),
      options:    filledOptions.map((label, i) => ({
        id:         `o${Date.now()}_${i}`,
        label,
        votesCount: 0,
      })),
      status:     'active',
      totalVotes: 0,
      createdAt:  new Date().toISOString().split('T')[0],
    };
    setPolls([newPoll, ...polls]);
    setShowForm(false);
    setQuestion('');
    setOptions(['', '']);
    setErrors({});
  };

  const handleClose = (pollId: string) => {
    if (!window.confirm('Clôturer ce sondage ? Les membres ne pourront plus voter.')) return;
    setPolls((prev) =>
      prev.map((p) =>
        p.id === pollId
          ? { ...p, status: 'closed', closedAt: new Date().toISOString().split('T')[0] }
          : p
      )
    );
  };

  const handleDelete = (pollId: string, question: string) => {
    if (!window.confirm(`Supprimer le sondage "${question}" ?`)) return;
    setPolls((prev) => prev.filter((p) => p.id !== pollId));
  };

  const handleVote = (pollId: string, optionId: string) => {
    const alreadyVoted = votes.some(
      (v) => v.pollId === pollId && v.userId === user!.id
    );
    if (alreadyVoted) {
      alert('Vous avez déjà voté pour ce sondage.');
      return;
    }
    setVotes([
      ...votes,
      { id: `v${Date.now()}`, pollId, userId: user!.id, optionId, votedAt: new Date().toISOString().split('T')[0] },
    ]);
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p;
        return {
          ...p,
          totalVotes: p.totalVotes + 1,
          options: p.options.map((o) =>
            o.id === optionId ? { ...o, votesCount: o.votesCount + 1 } : o
          ),
        };
      })
    );
  };

  const hasVoted = (pollId: string) =>
    votes.some((v) => v.pollId === pollId && v.userId === user?.id);

  const activePolls = polls.filter((p) => p.status === 'active');
  const closedPolls = polls.filter((p) => p.status === 'closed');

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">

        <PageHeader
          title="Sondages"
          subtitle="Créez des sondages et consultez les résultats"
          action={
            !showForm && (
              <Button variant="primary" onClick={() => setShowForm(true)}>
                + Nouveau sondage
              </Button>
            )
          }
        />

        {showForm && (
          <div className="dash-form-panel">
            <h2 className="dash-form-title">Nouveau sondage</h2>

            <div style={{ marginBottom: 16 }}>
              <Input
                label="Question"
                placeholder="Ex : Quel jour préférez-vous pour l'atelier ?"
                value={question}
                onChange={setQuestion}
                error={errors.question}
                required
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label className="input-label">
                Options de réponse <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              {errors.options && (
                <p style={{ fontSize: 11, color: 'var(--danger)', marginBottom: 6 }}>
                  {errors.options}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {options.map((opt, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <Input
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(v) => updateOption(i, v)}
                    />
                  </div>
                  {options.length > 2 && (
                    <Button variant="danger" size="sm" onClick={() => removeOption(i)}>
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <Button variant="secondary" size="sm" onClick={addOption}>
                + Ajouter une option
              </Button>
            )}

            <div className="dash-form-actions">
              <Button
                variant="secondary"
                onClick={() => { setShowForm(false); setQuestion(''); setOptions(['', '']); setErrors({}); }}
              >
                Annuler
              </Button>
              <Button variant="primary" onClick={handleCreate}>
                Créer le sondage
              </Button>
            </div>
          </div>
        )}

        <h2 className="events-section-title">Actifs ({activePolls.length})</h2>

        {activePolls.length === 0 ? (
          <div className="card dash-empty" style={{ marginBottom: 20 }}>
            Aucun sondage actif.
          </div>
        ) : (
          <div className="polls-grid">
            {activePolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                voted={hasVoted(poll.id)}
                onVote={(optId) => handleVote(poll.id, optId)}
                onClose={() => handleClose(poll.id)}
                onDelete={() => handleDelete(poll.id, poll.question)}
              />
            ))}
          </div>
        )}

        {closedPolls.length > 0 && (
          <>
            <h2 className="events-section-title" style={{ marginTop: 24 }}>
              Clôturés ({closedPolls.length})
            </h2>
            <div className="polls-grid">
              {closedPolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  voted={hasVoted(poll.id)}
                  onVote={() => {}}
                  onDelete={() => handleDelete(poll.id, poll.question)}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}


function PollCard({
  poll,
  voted,
  onVote,
  onClose,
  onDelete,
}: {
  poll: Poll;
  voted: boolean;
  onVote: (optionId: string) => void;
  onClose?: () => void;
  onDelete: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleVote = () => {
    if (!selected) { alert('Sélectionnez une option.'); return; }
    onVote(selected);
  };

  return (
    <div className="card poll-card-dash">

      <div className="poll-card-header-dash">
        <h3 className="poll-question-dash">{poll.question}</h3>
        <span className={`poll-status-badge ${poll.status === 'active' ? 'poll-status-active' : 'poll-status-closed'}`}>
          {poll.status === 'active' ? 'Actif' : 'Clôturé'}
        </span>
      </div>

      <p className="poll-total-dash">{poll.totalVotes} votes · Créé le {poll.createdAt}</p>
      <div className="poll-options-dash">
        {poll.options.map((opt) => {
          const pct = poll.totalVotes > 0
            ? Math.round((opt.votesCount / poll.totalVotes) * 100)
            : 0;
          return (
            <div key={opt.id} className="poll-option-dash">
              {poll.status === 'active' && !voted && (
                <input
                  type="radio"
                  name={`poll-${poll.id}`}
                  value={opt.id}
                  checked={selected === opt.id}
                  onChange={() => setSelected(opt.id)}
                  className="poll-radio"
                />
              )}
              <div style={{ flex: 1 }}>
                <div className="poll-opt-top-dash">
                  <span className="poll-opt-label-dash">{opt.label}</span>
                  <span className="poll-opt-pct-dash">{pct}%</span>
                </div>
                <div className="poll-bar-track-dash">
                  <div className="poll-bar-fill-dash" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="poll-actions-dash">
        {poll.status === 'active' && !voted && (
          <Button variant="primary" size="sm" onClick={handleVote}>
            Voter
          </Button>
        )}
        {voted && poll.status === 'active' && (
          <span style={{ fontSize: 12, color: 'var(--success)' }}>✓ Voté</span>
        )}
        {poll.status === 'active' && onClose && (
          <Button variant="secondary" size="sm" onClick={onClose}>
            Clôturer
          </Button>
        )}
        <Button variant="danger" size="sm" onClick={onDelete}>
          Supprimer
        </Button>
      </div>

    </div>
  );
}