import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import {useToast} from '../../context/ToastContex';
import {
  getClubPollsAPI,
  createPollAPI,
  voteAPI,
  closePollAPI,
  deletePollAPI,
} from '../../services/poll.service';
import './Dashboard.css';

export default function PollsPage() {
  const { user } = useAuth();
  const clubId = user?.clubId as string;

  const [polls,     setPolls]     = useState<any[]>([]);
  const [myVotes,   setMyVotes]   = useState<Record<string, string>>({});
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [question,  setQuestion]  = useState('');
  const [options,   setOptions]   = useState(['', '']);
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const { showToast } = useToast();

  useEffect(() => {
    if (!clubId) return;
    const fetchPolls = async () => {
      try {
        const data = await getClubPollsAPI(clubId);
        setPolls(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, [clubId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!question.trim()) e.question = 'La question est requise';
    if (options.filter((o) => o.trim()).length < 2)
      e.options = 'Au moins 2 options sont requises';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    try {
      const newPoll = await createPollAPI({
        clubId,
        question: question.trim(),
        options:  options.filter((o) => o.trim()),
      });
      setPolls([newPoll, ...polls]);
      showToast('Sondage créé.', 'success');
      setShowForm(false);
      setQuestion('');
      setOptions(['', '']);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur lors de la création.', 'error');
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      const updated = await voteAPI(pollId, optionId);
      setPolls((prev) => prev.map((p) => (p._id === pollId ? updated : p)));
      showToast('Vote enregistré.', 'success');
      setMyVotes((prev) => ({ ...prev, [pollId]: optionId }));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur lors du vote.', 'error');
    }
  };

  const handleClose = async (pollId: string) => {
    if (!window.confirm('Clôturer ce sondage ?')) return;
    try {
      const updated = await closePollAPI(pollId);
      setPolls((prev) => prev.map((p) => (p._id === pollId ? updated : p)));
      showToast('Sondage clôturé.', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handleDelete = async (pollId: string, question: string) => {
    if (!window.confirm(`Supprimer le sondage "${question}" ?`)) return;
    try {
      await deletePollAPI(pollId);
      setPolls((prev) => prev.filter((p) => p._id !== pollId));
      showToast('Sondage supprimé.', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

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
                placeholder="Ex : Quel jour préférez-vous ?"
                value={question}
                onChange={setQuestion}
                error={errors.question}
                required
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label className="input-label">
                Options <span style={{ color: 'var(--danger)' }}>*</span>
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
                      onChange={(v) => {
                        const updated = [...options];
                        updated[i] = v;
                        setOptions(updated);
                      }}
                    />
                  </div>
                  {options.length > 2 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setOptions([...options, ''])}
              >
                + Ajouter une option
              </Button>
            )}

            <div className="dash-form-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setQuestion('');
                  setOptions(['', '']);
                  setErrors({});
                }}
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

        {loading ? (
          <div className="card dash-empty">Chargement...</div>
        ) : activePolls.length === 0 ? (
          <div className="card dash-empty" style={{ marginBottom: 20 }}>
            Aucun sondage actif.
          </div>
        ) : (
          <div className="polls-grid">
            {activePolls.map((poll: any) => (
              <PollCard
                key={poll._id}
                poll={poll}
                voted={!!myVotes[poll._id]}
                selectedOption={myVotes[poll._id]}
                onVote={(optId) => handleVote(poll._id, optId)}
                onClose={() => handleClose(poll._id)}
                onDelete={() => handleDelete(poll._id, poll.question)}
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
              {closedPolls.map((poll: any) => (
                <PollCard
                  key={poll._id}
                  poll={poll}
                  voted={true}
                  onVote={() => {}}
                  onDelete={() => handleDelete(poll._id, poll.question)}
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
  poll, voted, selectedOption, onVote, onClose, onDelete,
}: {
  poll:            any;
  voted:           boolean;
  selectedOption?: string;
  onVote:          (optionId: string) => void;
  onClose?:        () => void;
  onDelete:        () => void;
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

      <p className="poll-total-dash">
        {poll.options?.reduce((s: number, o: any) => s + o.votesCount, 0) ?? 0} votes
      </p>

      <div className="poll-options-dash">
        {poll.options?.map((opt: any) => {
          const total = poll.options.reduce((s: number, o: any) => s + o.votesCount, 0);
          const pct   = total > 0 ? Math.round((opt.votesCount / total) * 100) : 0;
          return (
            <div key={opt._id} className="poll-option-dash">
              {poll.status === 'active' && !voted && (
                <input
                  type="radio"
                  name={`poll-${poll._id}`}
                  value={opt._id}
                  checked={selected === opt._id}
                  onChange={() => setSelected(opt._id)}
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
          <Button variant="primary" size="sm" onClick={handleVote}>Voter</Button>
        )}
        {voted && poll.status === 'active' && (
          <span style={{ fontSize: 12, color: 'var(--success)' }}>✓ Voté</span>
        )}
        {poll.status === 'active' && onClose && (
          <Button variant="secondary" size="sm" onClick={onClose}>Clôturer</Button>
        )}
        <Button variant="danger" size="sm" onClick={onDelete}>Supprimer</Button>
      </div>
    </div>
  );
}