import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import Input, { Textarea, Select } from '../../components/ui/Input';
import { ClubStatusBadge, CategoryBadge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import {useToast} from '../../context/ToastContex';
import { getClubByIdAPI, updateClubAPI } from '../../services/club.service';
import { ClubCategory } from '../../types/index';
import './Dashboard.css';

const CATEGORIES: { value: ClubCategory; label: string }[] = [
  { value: 'Tech',    label: 'Tech'    },
  { value: 'Sport',   label: 'Sport'   },
  { value: 'Culture', label: 'Culture' },
  { value: 'Musique', label: 'Musique' },
  { value: 'Science', label: 'Science' },
  { value: 'Art',     label: 'Art'     },
  { value: 'Autre',   label: 'Autre'   },
];

export default function ClubSettingsPage() {
  const { user } = useAuth();
  const clubId = user?.clubId as string;

  const [club,         setClub]         = useState<any>(null);
  const [name,         setName]         = useState('');
  const [description,  setDescription]  = useState('');
  const [category,     setCategory]     = useState<ClubCategory>('Tech');
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [saved,        setSaved]        = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [showDelete,   setShowDelete]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (!clubId) return;
    const fetchClub = async () => {
      try {
        const data = await getClubByIdAPI(clubId);
        setClub(data);
        setName(data.name);
        setDescription(data.description);
        setCategory(data.category);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [clubId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())        e.name        = 'Le nom est requis';
    if (!description.trim()) e.description = 'La description est requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const updated = await updateClubAPI(clubId, { name, description, category });
      setClub(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur lors de la sauvegarde.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content"><p className="dash-empty">Chargement...</p></div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">

        <PageHeader
          title="Paramètres du club"
          subtitle="Modifiez les informations de votre club"
        />

        {saved && (
          <div className="settings-success">
            ✓ Modifications enregistrées avec succès !
          </div>
        )}

        {club && (
          <div className="card settings-preview">
            <div className="settings-preview-logo">{name[0] || '?'}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {name}
                </span>
                <ClubStatusBadge status={club.status} />
                <CategoryBadge category={category} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{description}</p>
            </div>
          </div>
        )}

        <div className="card settings-section">
          <h2 className="settings-section-title">Informations générales</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Nom du club"
              value={name}
              onChange={setName}
              error={errors.name}
              required
            />
            <Textarea
              label="Description"
              value={description}
              onChange={setDescription}
              rows={4}
            />
            <Select
              label="Catégorie"
              value={category}
              onChange={(v) => setCategory(v as ClubCategory)}
              options={CATEGORIES}
            />
          </div>
          <div className="dash-form-actions">
            <Button variant="secondary" onClick={() => {
              setName(club.name);
              setDescription(club.description);
              setCategory(club.category);
              setErrors({});
            }}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Sauvegarde...' : '💾 Enregistrer'}
            </Button>
          </div>
        </div>

        {club && (
          <div className="card settings-section">
            <h2 className="settings-section-title">Statistiques du club</h2>
            <div className="settings-stats">
              <div className="settings-stat">
                <span className="settings-stat-value">{club.membersCount ?? 0}</span>
                <span className="settings-stat-label">Membres</span>
              </div>
              <div className="settings-stat">
                <span className="settings-stat-value">{club.eventsCount ?? 0}</span>
                <span className="settings-stat-label">Événements</span>
              </div>
              <div className="settings-stat">
                <span className="settings-stat-value">
                  {new Date(club.createdAt).toLocaleDateString('fr-FR')}
                </span>
                <span className="settings-stat-label">Date de création</span>
              </div>
            </div>
          </div>
        )}

        <div className="card settings-section settings-danger-zone">
          <h2 className="settings-section-title settings-danger-title">⚠ Zone de danger</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            La suppression du club est irréversible. Tous les membres, événements et
            sondages seront supprimés définitivement.
          </p>
          {!showDelete ? (
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              Supprimer le club
            </Button>
          ) : (
            <div className="settings-delete-confirm">
              <p style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 10, fontWeight: 500 }}>
                Pour confirmer, écris le nom du club : <strong>{club?.name}</strong>
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={club?.name}
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  style={{
                    flex: 1, background: 'var(--bg-input)',
                    border: '1px solid var(--danger-border)',
                    color: 'var(--text-primary)', borderRadius: 'var(--radius-md)',
                    padding: '9px 12px', fontFamily: 'inherit', fontSize: 13, outline: 'none',
                  }}
                />
                <Button
                  variant="danger"
                  onClick={() => alert('Suppression du club ?')}
                  disabled={deleteConfirm !== club?.name}
                >
                  Confirmer
                </Button>
                <Button variant="secondary" onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}