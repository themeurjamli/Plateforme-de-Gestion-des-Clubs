import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import Input, { Textarea, Select } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import {
  getClubEventsAPI,
  createEventAPI,
  updateEventAPI,
  deleteEventAPI,
} from '../../services/event.service';
import { Event } from '../../types/index';
import './Dashboard.css';

const emptyForm = {
  title:       '',
  description: '',
  location:    '',
  date:        '',
  time:        '',
  maxCapacity: '',
  visibility:  'public' as 'public' | 'members_only',
};

export default function EventsPage() {
  const { user } = useAuth();
  const clubId = user?.clubId as string;

  const [events,    setEvents]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [form,      setForm]      = useState(emptyForm);
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    if (!clubId) return;
    const fetchEvents = async () => {
      try {
        const data = await getClubEventsAPI(clubId);
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [clubId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())    e.title    = 'Le titre est requis';
    if (!form.date)            e.date     = 'La date est requise';
    if (!form.time)            e.time     = "L'heure est requise";
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

  const handleEdit = (event: any) => {
    setForm({
      title:       event.title,
      description: event.description,
      location:    event.location,
      date:        event.date?.split('T')[0] ?? event.date,
      time:        event.time,
      maxCapacity: event.maxCapacity?.toString() ?? '',
      visibility:  event.visibility,
    });
    setEditId(event._id);
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        clubId,
        title:       form.title,
        description: form.description,
        location:    form.location,
        date:        form.date,
        time:        form.time,
        maxCapacity: form.maxCapacity ? parseInt(form.maxCapacity) : undefined,
        visibility:  form.visibility,
      };

      if (editId) {
        const updated = await updateEventAPI(editId, payload);
        setEvents((prev) =>
          prev.map((e) => (e._id === editId ? updated : e))
        );
      } else {
        const created = await createEventAPI(payload);
        setEvents((prev) => [created, ...prev]);
      }

      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event: any) => {
    if (!window.confirm(`Supprimer "${event.title}" ?`)) return;
    try {
      await deleteEventAPI(event._id);
      setEvents((prev) => prev.filter((e) => e._id !== event._id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
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
              {editId ? "Modifier l'événement" : 'Nouvel événement'}
            </h2>

            <div className="dash-form-grid">
              <div className="dash-form-full">
                <Input
                  label="Titre"
                  placeholder="Ex : Atelier robotique"
                  value={form.title}
                  onChange={(v) => setForm({ ...form, title: v })}
                  error={errors.title}
                  required
                />
              </div>
              <div className="dash-form-full">
                <Textarea
                  label="Description"
                  placeholder="Décris l'événement..."
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
                placeholder="Ex : Salle B14"
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
                onChange={(v) =>
                  setForm({ ...form, visibility: v as 'public' | 'members_only' })
                }
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
              <Button variant="primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Sauvegarde...' : editId ? 'Enregistrer' : "Créer l'événement"}
              </Button>
            </div>
          </div>
        )}

        <h2 className="events-section-title">
          À venir ({upcomingEvents.length})
        </h2>

        {loading ? (
          <div className="card dash-empty">Chargement...</div>
        ) : upcomingEvents.length === 0 ? (
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
                {upcomingEvents.map((event: any) => (
                  <tr key={event._id}>
                    <td className="dash-table-name">{event.title}</td>
                    <td>
                      {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
                    </td>
                    <td>{event.location}</td>
                    <td>
                      {event.registeredCount ?? 0}
                      {event.maxCapacity ? ` / ${event.maxCapacity}` : ''}
                    </td>
                    <td>
                      {event.visibility === 'public' ? '🌐 Public' : '🔒 Membres'}
                    </td>
                    <td>
                      <div className="dash-actions">
                        <Button variant="secondary" size="sm" onClick={() => handleEdit(event)}>
                          ✏ Modifier
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(event)}>
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
                  {pastEvents.map((event: any) => (
                    <tr key={event._id}>
                      <td className="dash-table-name" style={{ color: 'var(--text-secondary)' }}>
                        {event.title}
                      </td>
                      <td>{new Date(event.date).toLocaleDateString('fr-FR')}</td>
                      <td>{event.location}</td>
                      <td>{event.registeredCount ?? 0}</td>
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