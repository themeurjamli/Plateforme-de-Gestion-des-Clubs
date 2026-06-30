import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Select } from '../../components/ui/Input';
import { mockEvents, mockClubs } from '../../data/mockData';
import { Event, EventStatus } from '../../types/index';
import '../Dashboard/Dashboard.css';

type StatusFilter = 'all' | EventStatus;

const statusTabs: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'upcoming', label: 'À venir' },
  { key: 'past', label: 'Passés' },
  { key: 'cancelled', label: 'Annulés' },
];

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([...mockEvents]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [clubFilter, setClubFilter] = useState<string>('all');

  const getClubName = (clubId: string) => {
    const club = mockClubs.find((c) => c.id === clubId);
    return club ? club.name : '—';
  };

  const clubOptions = [
    { value: 'all', label: 'Tous les clubs' },
    ...mockClubs.map((c) => ({ value: c.id, label: c.name })),
  ];

  const filteredEvents = events.filter((e) => {
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchClub = clubFilter === 'all' || e.clubId === clubFilter;
    return matchStatus && matchClub;
  });

  const handleAnnuler = (eventId: string) => {
    if (!window.confirm("Annuler cet événement ? Les inscrits en seront informés.")) return;
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: 'cancelled' } : e))
    );
  };

  const statusBadge = (status: EventStatus) => {
    const map: Record<EventStatus, { label: string; variant: 'primary' | 'gray' | 'danger' }> = {
      upcoming: { label: 'À venir', variant: 'primary' },
      past: { label: 'Passé', variant: 'gray' },
      cancelled: { label: 'Annulé', variant: 'danger' },
    };
    const item = map[status];
    return <Badge label={item.label} variant={item.variant} />;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <PageHeader
          title="Événements"
          subtitle="Superviser l'ensemble des événements organisés par les clubs"
        />

        <div className="dash-form-grid" style={{ marginBottom: 16, alignItems: 'end' }}>
          <Select
            label="Filtrer par club"
            value={clubFilter}
            onChange={setClubFilter}
            options={clubOptions}
          />
        </div>

        <div className="members-tabs">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              className={`members-tab ${statusFilter === tab.key ? 'members-tab-active' : ''}`}
              onClick={() => setStatusFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="card dash-section">
          {filteredEvents.length === 0 ? (
            <p className="dash-empty">Aucun événement ne correspond à ces filtres.</p>
          ) : (
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Événement</th>
                  <th>Club</th>
                  <th>Date</th>
                  <th>Lieu</th>
                  <th>Inscrits</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="dash-table-name">{event.title}</td>
                    <td>{getClubName(event.clubId)}</td>
                    <td>
                      {new Date(event.date).toLocaleDateString('fr-FR')} · {event.time}
                    </td>
                    <td>{event.location}</td>
                    <td>
                      {event.registeredCount}
                      {event.maxCapacity ? ` / ${event.maxCapacity}` : ''}
                    </td>
                    <td>{statusBadge(event.status)}</td>
                    <td>
                      <div className="dash-actions">
                        {event.status === 'upcoming' ? (
                          <Button size="sm" variant="danger" onClick={() => handleAnnuler(event.id)}>
                            Annuler
                          </Button>
                        ) : (
                          <span className="text-hint">—</span>
                        )}
                      </div>
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