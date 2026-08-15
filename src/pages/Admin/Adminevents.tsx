import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import { useToast } from '../../context/ToastContex';
import '../Dashboard/Dashboard.css';

export default function AdminEvents() {
  const [events,    setEvents]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleCancel = async (eventId: string, title: string) => {
    if (!window.confirm(`Annuler l'événement "${title}" ?`)) return;
    try {
      await api.patch(`/events/${eventId}`, { status: 'cancelled' });
      setEvents((prev) =>
        prev.map((e) => (e._id === eventId ? { ...e, status: 'cancelled' } : e))
      );
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur', 'error');
    }
  };

  const filtered =
    activeTab === 'all'
      ? events
      : events.filter((e) => e.status === activeTab);

  const counts = {
    all:      events.length,
    upcoming: events.filter((e) => e.status === 'upcoming').length,
    past:     events.filter((e) => e.status === 'past').length,
  };

  const getStatusVariant = (status: string) => {
    if (status === 'upcoming')  return 'primary';
    if (status === 'past')      return 'gray';
    if (status === 'cancelled') return 'danger';
    return 'gray';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'upcoming')  return 'À venir';
    if (status === 'past')      return 'Passé';
    if (status === 'cancelled') return 'Annulé';
    return status;
  };
  const { showToast } = useToast();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">

        <PageHeader
          title="Événements"
          subtitle="Vue globale de tous les événements de la plateforme"
        />

        <div className="members-tabs">
          {[
            { key: 'all',      label: 'Tous',      count: counts.all      },
            { key: 'upcoming', label: 'À venir',   count: counts.upcoming },
            { key: 'past',     label: 'Passés',    count: counts.past     },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`members-tab ${activeTab === tab.key ? 'members-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.key as any)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="card dash-section">
          {loading ? (
            <p className="dash-empty">Chargement...</p>
          ) : filtered.length === 0 ? (
            <p className="dash-empty">Aucun événement dans cette catégorie.</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Club</th>
                  <th>Date</th>
                  <th>Lieu</th>
                  <th>Inscrits</th>
                  <th>Visibilité</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event: any) => (
                  <tr key={event._id}>
                    <td className="dash-table-name">{event.title}</td>
                    <td>{event.clubId?.name || '—'}</td>
                    <td>{new Date(event.date).toLocaleDateString('fr-FR')} {event.time}</td>
                    <td>{event.location}</td>
                    <td>
                      {event.registeredCount ?? 0}
                      {event.maxCapacity ? ` / ${event.maxCapacity}` : ''}
                    </td>
                    <td>
                      {event.visibility === 'public' ? '🌐 Public' : '🔒 Membres'}
                    </td>
                    <td>
                      <Badge
                        label={getStatusLabel(event.status)}
                        variant={getStatusVariant(event.status) as any}
                      />
                    </td>
                    <td>
                      {event.status === 'upcoming' && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleCancel(event._id, event.title)}
                        >
                          Annuler
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}