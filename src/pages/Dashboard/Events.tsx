import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import Input, { Textarea, Select } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { mockClubs, mockEvents } from '../../data/mockData';
import { Event } from '../../types/index';
import './Dashboard.css';

// Formulaire vide par défaut
const emptyForm = {
  title: '',
  description: '',
  location: '',
  date: '',
  time: '',
  maxCapacity: '',
  visibility: 'public' as 'public' | 'members_only',
};

export default function EventsPage() {
  const { user } = useAuth();
  const club = mockClubs.find((c) => c.presidentId === user?.id);

  const [events, setEvents]     = useState<Event[]>(
    mockEvents.filter((e) => e.clubId === club?.id)
  );
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [form, setForm]         = useState(emptyForm);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  if (!club) return null;

  
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())    e.title    = 'Le titre est requis';
    if (!form.date)            e.date     = 'La date est requise';
    if (!form.time)            e.time     = 'L\'heure est requise';
    if (!form.location.trim()) e.location = 'Le lieu est requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  
  const handleNew = () => {
    setForm(emptyForm);
    setEditId(null);
    setErrors({});
    setShowForm(true);
  };
  const handleEdit = (event: Event) => {
    setForm({
      title:       event.title,
      description: event.description,
      location:    event.location,
      date:        event.date,
      time:        event.time,
      maxCapacity: event.maxCapacity?.toString() ?? '',
      visibility:  event.visibility,
    });
    setEditId(event.id);
    setErrors({});
    setShowForm(true);
  };
  const handleSubmit = () => {
    if (!validate()) return;

    if (editId) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editId
            ? {
                ...e,
                title:       form.title,
                description: form.description,
                location:    form.location,
                date:        form.date,
                time:        form.time,
                maxCapacity: form.maxCapacity ? parseInt(form.maxCapacity) : undefined,
                visibility:  form.visibility,
              }
            : e
        )
      );
    } else {
      const newEvent: Event = {
        id:              `e${Date.now()}`,
        clubId:          club.id,
        title:           form.title,
        description:     form.description,
        location:        form.location,
        date:            form.date,
        time:            form.time,
        maxCapacity:     form.maxCapacity ? parseInt(form.maxCapacity) : undefined,
        visibility:      form.visibility,
        status:          'upcoming',
        registeredCount: 0,
        createdAt:       new Date().toISOString().split('T')[0],
      };
      setEvents((prev) => [newEvent, ...prev]);
    }

    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const handleDelete = (event: Event) => {
    if (!window.confirm(`Supprimer "${event.title}" ?`)) return;
    setEvents((prev) => prev.filter((e) => e.id !== event.id));
  };

  const upcomingEvents = events.filter((e) => e.status === 'upcoming');
  const pastEvents     = events.filter((e) => e.status === 'past');

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">

        <PageHeader
          title="Événements"
          subtitle="Créez et gérez les événements de votre club"
          action={
            !showForm && (
              <Button variant="primary" onClick={handleNew}>
                + Créer un événement
              </Button>
            )
          }
        />

        {showForm && (
          <div className="dash-form-panel">
            <h2 className="dash-form-title">
              {editId ? 'Modifier l\'événement' : 'Nouvel événement'}
            </h2>

            <div className="dash-form-grid">
              <div className="dash-form-full">
                <Input
                  label="Titre"
                  placeholder="Ex : Atelier robotique — niveau débutant"
                  value={form.title}
                  onChange={(v) => setForm({ ...form, title: v })}
                  error={errors.title}
                  required
                />
              </div>
              <div className="dash-form-full">
                <Textarea
                  label="Description"
                  placeholder="Décris l'événement, le programme..."
                  value={form.description}
                  onChange={(v) => setForm({ ...form, description: v })}
                  rows={3}
                />
              </div>
              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={(v) => setForm({ ...form, date: v })}
                error={errors.date}
                required
              />
              <Input
                label="Heure"
                type="time"
                value={form.time}
                onChange={(v) => setForm({ ...form, time: v })}
                error={errors.time}
                required
              />
              <Input
                label="Lieu"
                placeholder="Ex : Salle S08"
                value={form.location}
                onChange={(v) => setForm({ ...form, location: v })}
                error={errors.location}
                required
              />
              <Input
                label="Capacité max"
                type="number"
                placeholder="Laisser vide = pas de limite"
                value={form.maxCapacity}
                onChange={(v) => setForm({ ...form, maxCapacity: v })}
                hint="Optionnel"
              />
              <Select
                label="Visibilité"
                value={form.visibility}
                onChange={(v) => setForm({ ...form, visibility: v as 'public' | 'members_only' })}
                options={[
                  { value: 'public',       label: 'Public — visible par tous' },
                  { value: 'members_only', label: 'Membres seulement' },
                ]}
              />
            </div>

            <div className="dash-form-actions">
              <Button
                variant="secondary"
                onClick={() => { setShowForm(false); setEditId(null); }}
              >
                Annuler
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                {editId ? 'Enregistrer' : 'Créer l\'événement'}
              </Button>
            </div>
          </div>
        )}

        <h2 className="events-section-title">
          À venir ({upcomingEvents.length})
        </h2>

        {upcomingEvents.length === 0 ? (
          <div className="card dash-empty">Aucun événement à venir.</div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Date</th>
                  <th>Lieu</th>
                  <th>Inscrits</th>
                  <th>Visibilité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="dash-table-name">{event.title}</td>
                    <td>{event.date} à {event.time}</td>
                    <td>{event.location}</td>
                    <td>
                      {event.registeredCount}
                      {event.maxCapacity ? ` / ${event.maxCapacity}` : ''}
                    </td>
                    <td>
                      {event.visibility === 'public' ? '🌐 Public' : '🔒 Membres'}
                    </td>
                    <td>
                      <div className="dash-actions">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEdit(event)}
                        >
                          ✏ Modifier
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(event)}
                        >
                          🗑 Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pastEvents.length > 0 && (
          <>
            <h2 className="events-section-title">Passés ({pastEvents.length})</h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Date</th>
                    <th>Lieu</th>
                    <th>Participants</th>
                  </tr>
                </thead>
                <tbody>
                  {pastEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="dash-table-name" style={{ color: 'var(--text-secondary)' }}>
                        {event.title}
                      </td>
                      <td>{event.date}</td>
                      <td>{event.location}</td>
                      <td>{event.registeredCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </div>
  );
}