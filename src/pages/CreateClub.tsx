import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Input, { Textarea, Select } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { mockClubs } from '../data/mockData';
import { Club, ClubCategory } from '../types/index';
import './CreateClub.css';

const CATEGORIES: { value: ClubCategory; label: string }[] = [
  { value: 'Tech',    label: '💻 Tech'    },
  { value: 'Sport',   label: '⚽ Sport'   },
  { value: 'Culture', label: '🎭 Culture' },
  { value: 'Musique', label: '🎵 Musique' },
  { value: 'Science', label: '🔬 Science' },
  { value: 'Art',     label: '🎨 Art'     },
  { value: 'Autre',   label: '📌 Autre'   },
];

export default function CreateClubPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState<ClubCategory>('Tech');
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [submitted,   setSubmitted]   = useState(false);
  const [createdClub, setCreatedClub] = useState<Club | null>(null);

  const alreadyPresident = user?.role === 'president';

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())        e.name        = 'Le nom du club est requis';
    if (name.trim().length < 3) e.name     = 'Le nom doit faire au moins 3 caractères';
    if (!description.trim()) e.description = 'La description est requise';
    if (description.trim().length < 20) {
      e.description = 'La description doit faire au moins 20 caractères';
    }
    const exists = mockClubs.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (exists) e.name = 'Un club avec ce nom existe déjà';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const newClub: Club = {
      id:          `c${Date.now()}`,
      name:        name.trim(),
      description: description.trim(),
      category,
      status:      'pending',
      presidentId: user!.id,
      membersCount: 0,
      eventsCount:  0,
      createdAt:   new Date().toISOString().split('T')[0],
    };

    mockClubs.push(newClub);
    updateUser({ role: 'president', clubId: newClub.id });

    setCreatedClub(newClub);
    setSubmitted(true);
  };

  if (alreadyPresident) {
    return (
      <div className="create-page">
        <Navbar />
        <div className="create-container">
          <div className="create-already card">
            <span className="create-already-icon">🏛</span>
            <h2 className="create-already-title">Vous gérez déjà un club</h2>
            <p className="create-already-desc">
              Un président ne peut gérer qu'un seul club à la fois.
              Rendez-vous dans votre dashboard pour le gérer.
            </p>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Aller au dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted && createdClub) {
    return (
      <div className="create-page">
        <Navbar />
        <div className="create-container">
          <div className="create-success card">
            <div className="create-success-icon">🎉</div>
            <h2 className="create-success-title">Club créé avec succès !</h2>
            <p className="create-success-desc">
              Votre club <strong>{createdClub.name}</strong> a été soumis et attend
              la validation d'un administrateur. Vous serez notifié dès qu'il sera activé.
            </p>

            <div className="create-success-info">
              <div className="create-success-row">
                <span className="create-success-label">Nom</span>
                <span className="create-success-value">{createdClub.name}</span>
              </div>
              <div className="create-success-row">
                <span className="create-success-label">Catégorie</span>
                <span className="create-success-value">{createdClub.category}</span>
              </div>
              <div className="create-success-row">
                <span className="create-success-label">Statut</span>
                <span className="create-success-status">⏳ En attente de validation</span>
              </div>
            </div>

            <div className="create-success-actions">
              <Button variant="secondary" onClick={() => navigate('/clubs')}>
                Voir tous les clubs
              </Button>
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Aller au dashboard →
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-page">
      <Navbar />

      <div className="create-container">

        <div className="create-header">
          <h1 className="create-title">Créer un club</h1>
          <p className="create-subtitle">
            Remplis ce formulaire pour proposer ton club à la plateforme.
            Un administrateur le validera avant qu'il soit visible publiquement.
          </p>
        </div>

        <div className="create-grid">

          <div className="card create-form">

            <div className="create-section-title">Informations générales</div>

            <div className="create-fields">
              <Input
                label="Nom du club"
                placeholder="Ex : Club de Robotique"
                value={name}
                onChange={setName}
                error={errors.name}
                required
                hint="Minimum 3 caractères, doit être unique"
              />

              <Select
                label="Catégorie"
                value={category}
                onChange={(v) => setCategory(v as ClubCategory)}
                options={CATEGORIES}
              />

              <Textarea
                label="Description"
                placeholder="Décris les objectifs, les activités, l'ambiance de ton club... (minimum 20 caractères)"
                value={description}
                onChange={setDescription}
                rows={5}
                hint={`${description.length} caractères`}
              />
              {errors.description && (
                <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: -8 }}>
                  {errors.description}
                </p>
              )}
            </div>

            <div className="create-form-actions">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Annuler
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                Soumettre le club →
              </Button>
            </div>
          </div>

          <div className="create-info-panel">

            <div className="card create-info-card">
              <h3 className="create-info-title">📋 Comment ça marche ?</h3>
              <ol className="create-info-steps">
                <li>Tu remplis le formulaire et soumet ta demande</li>
                <li>Un administrateur examine ton club</li>
                <li>Si validé, ton club devient visible publiquement</li>
                <li>Tu deviens automatiquement président du club</li>
                <li>Tu accèdes au dashboard pour gérer ton club</li>
              </ol>
            </div>

            <div className="card create-info-card">
              <h3 className="create-info-title">✅ Responsabilités du président</h3>
              <ul className="create-info-list">
                <li>Gérer les demandes d'adhésion des membres</li>
                <li>Organiser des événements régulièrement</li>
                <li>Animer la communauté via des sondages</li>
                <li>Maintenir les informations du club à jour</li>
              </ul>
            </div>

            <div className="card create-info-card create-info-warning">
              <h3 className="create-info-title">⚠ À savoir</h3>
              <p className="create-info-text">
                Chaque utilisateur ne peut gérer qu'un seul club à la fois.
                Une fois président, tu ne pourras pas créer un autre club.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}