import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Input, { Textarea } from '../components/ui/Input';
import { UserRoleBadge } from '../components/ui/Badge';
import MemberBadges from '../components/ui/MemberBadges';
import { useAuth } from '../context/AuthContext';
import { getMemberBadges } from '../utils/memberBadges';
import { mockMemberships, mockRegistrations, mockVotes } from '../data/mockData';
import './Profile.css';

const ALL_INTERESTS = [
  'Tech', 'Sport', 'Culture', 'Musique', 'Science', 'Art', 'Autre',
];

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName,  setLastName]  = useState(user?.lastName  ?? '');
  const [bio,       setBio]       = useState(user?.bio       ?? '');
  const [interests, setInterests] = useState<string[]>(user?.interests ?? []);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');

  const [savedProfile, setSavedProfile] = useState(false);
  const [savedPwd,     setSavedPwd]     = useState(false);
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  if (!user) return null;

  const badges = getMemberBadges(user, mockMemberships, mockRegistrations, mockVotes);

  // ── Toggle intérêt
  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // ── Sauvegarder le profil
  const handleSaveProfile = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'Le prénom est requis';
    if (!lastName.trim())  e.lastName  = 'Le nom est requis';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    updateUser({ firstName, lastName, bio, interests });
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 3000);
  };

  // ── Changer le mot de passe (simulation)
  const handleSavePassword = () => {
    const e: Record<string, string> = {};
    if (!oldPassword) e.oldPassword = 'Requis';
    if (newPassword.length < 8) e.newPassword = 'Minimum 8 caractères';
    if (newPassword !== confirmPwd) e.confirmPwd = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSavedPwd(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPwd('');
    setTimeout(() => setSavedPwd(false), 3000);
  };

  // ── Déconnexion
  const handleLogout = () => {
    if (!window.confirm('Se déconnecter ?')) return;
    logout();
    navigate('/login');
  };

  // Initiales pour l'avatar
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">
        <h1 className="profile-title">Mon profil</h1>

        <div className="profile-grid">

          {/* ── COLONNE GAUCHE — Avatar + Infos rapides ── */}
          <div className="profile-sidebar">

            <div className="card profile-avatar-card">
              <div className="profile-avatar">{initials}</div>
              <p className="profile-name">{user.firstName} {user.lastName}</p>
              <p className="profile-email">{user.email}</p>
              <div style={{ marginTop: 8 }}>
                <UserRoleBadge role={user.role} />
              </div>
              <p className="profile-since">Membre depuis {user.createdAt}</p>
            </div>

            <div className="card profile-interests-card">
              <h3 className="profile-card-title">Centres d'intérêt</h3>
              <div className="interests-grid">
                {ALL_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    className={`interest-btn ${interests.includes(interest) ? 'interest-btn-active' : ''}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <p className="interests-hint">
                Clique pour ajouter ou retirer un intérêt
              </p>
            </div>

            <div className="card" style={{ padding: "18px" }}>
              <MemberBadges badges={badges} />
            </div>

            <button className="profile-logout-btn" onClick={handleLogout}>
              ⬅ Se déconnecter
            </button>

          </div>

          {/* ── COLONNE DROITE — Formulaires ─────────── */}
          <div className="profile-content">

            {/* Succès profil */}
            {savedProfile && (
              <div className="profile-success">
                ✓ Profil mis à jour avec succès !
              </div>
            )}

            {/* ── INFOS PERSONNELLES ─────────────────── */}
            <div className="card profile-section">
              <h2 className="profile-section-title">Informations personnelles</h2>

              <div className="profile-form-row">
                <Input
                  label="Prénom"
                  value={firstName}
                  onChange={setFirstName}
                  error={errors.firstName}
                  required
                />
                <Input
                  label="Nom"
                  value={lastName}
                  onChange={setLastName}
                  error={errors.lastName}
                  required
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <Input
                  label="Email"
                  value={user.email}
                  onChange={() => {}}
                  disabled
                  hint="L'email ne peut pas être modifié"
                />
              </div>

              <Textarea
                label="Bio"
                placeholder="Parle de toi, tes passions, tes projets..."
                value={bio}
                onChange={setBio}
                rows={3}
              />

              <div className="profile-form-actions">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFirstName(user.firstName);
                    setLastName(user.lastName);
                    setBio(user.bio ?? '');
                    setInterests(user.interests ?? []);
                    setErrors({});
                  }}
                >
                  Annuler
                </Button>
                <Button variant="primary" onClick={handleSaveProfile}>
                  💾 Enregistrer
                </Button>
              </div>
            </div>

            {/* Succès mot de passe */}
            {savedPwd && (
              <div className="profile-success">
                ✓ Mot de passe mis à jour avec succès !
              </div>
            )}

            {/* ── MOT DE PASSE ───────────────────────── */}
            <div className="card profile-section">
              <h2 className="profile-section-title">Changer le mot de passe</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Input
                  label="Mot de passe actuel"
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={setOldPassword}
                  error={errors.oldPassword}
                />

                <div className="profile-form-row">
                  <Input
                    label="Nouveau mot de passe"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={setNewPassword}
                    error={errors.newPassword}
                    hint="Minimum 8 caractères"
                  />
                  <Input
                    label="Confirmer"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPwd}
                    onChange={setConfirmPwd}
                    error={errors.confirmPwd}
                  />
                </div>
              </div>

              <div className="profile-form-actions">
                <Button variant="primary" onClick={handleSavePassword}>
                  Mettre à jour le mot de passe
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}