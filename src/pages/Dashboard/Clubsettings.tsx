import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import Input, { Textarea, Select } from '../../components/ui/Input';
import { ClubStatusBadge, CategoryBadge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { mockClubs } from '../../data/mockData';
import { Club, ClubCategory } from '../../types/index';
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
  const originalClub = mockClubs.find((c) => c.presidentId === user?.id);

  const [club, setClub]       = useState<Club | undefined>(originalClub);
  const [saved, setSaved]     = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  if (!club) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!club.name.trim())        e.name        = 'Le nom est requis';
    if (!club.description.trim()) e.description = 'La description est requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDelete = () => {
    if (deleteConfirm !== club.name) {
      alert('Le nom saisi ne correspond pas au nom du club.');
      return;
    }
    alert('Club supprimé (simulation). En production tu serais redirigé.');
  };

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
        <div className="card settings-preview">
          <div className="settings-preview-logo">{club.name[0]}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {club.name}
              </span>
              <ClubStatusBadge status={club.status} />
              <CategoryBadge category={club.category} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {club.description}
            </p>
          </div>
        </div>
        <div className="card settings-section">
          <h2 className="settings-section-title">Informations générales</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Nom du club"
              placeholder="Ex : Club de Robotique"
              value={club.name}
              onChange={(v) => setClub({ ...club, name: v })}
              error={errors.name}
              required
            />

            <Textarea
              label="Description"
              placeholder="Décris ton club, ses objectifs, ses activités..."
              value={club.description}
              onChange={(v) => setClub({ ...club, description: v })}
              rows={4}
            />

            <Select
              label="Catégorie"
              value={club.category}
              onChange={(v) => setClub({ ...club, category: v as ClubCategory })}
              options={CATEGORIES}
            />
          </div>

          <div className="dash-form-actions">
            <Button
              variant="secondary"
              onClick={() => setClub(originalClub)}
            >
              Annuler les modifications
            </Button>
            <Button variant="primary" onClick={handleSave}>
              💾 Enregistrer
            </Button>
          </div>
        </div>

        <div className="card settings-section">
          <h2 className="settings-section-title">Statistiques du club</h2>
          <div className="settings-stats">
            <div className="settings-stat">
              <span className="settings-stat-value">{club.membersCount}</span>
              <span className="settings-stat-label">Membres</span>
            </div>
            <div className="settings-stat">
              <span className="settings-stat-value">{club.eventsCount}</span>
              <span className="settings-stat-label">Événements</span>
            </div>
            <div className="settings-stat">
              <span className="settings-stat-value">{club.createdAt}</span>
              <span className="settings-stat-label">Date de création</span>
            </div>
          </div>
        </div>

        <div className="card settings-section settings-danger-zone">
          <h2 className="settings-section-title settings-danger-title">
            ⚠ Zone de danger
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            La suppression du club est irréversible. Tous les membres,
            événements et sondages seront supprimés définitivement.
          </p>

          {!showDelete ? (
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              Supprimer le club
            </Button>
          ) : (
            <div className="settings-delete-confirm">
              <p style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 10, fontWeight: 500 }}>
                Pour confirmer, écris le nom du club : <strong>{club.name}</strong>
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={club.name}
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--danger-border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', padding: '9px 12px', fontFamily: 'inherit', fontSize: 13, outline: 'none' }}
                />
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={deleteConfirm !== club.name}
                >
                  Confirmer la suppression
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