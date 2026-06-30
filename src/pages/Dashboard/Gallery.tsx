import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { mockClubs } from '../../data/mockData';
import './Dashboard.css';


const demoPhotos = [
  { id: 'ph1', url: 'https://picsum.photos/seed/robot1/400/300', caption: 'Atelier robotique juin 2025' },
  { id: 'ph2', url: 'https://picsum.photos/seed/robot2/400/300', caption: 'Compétition inter-clubs'     },
  { id: 'ph3', url: 'https://picsum.photos/seed/robot3/400/300', caption: 'Présentation du projet'      },
  { id: 'ph4', url: 'https://picsum.photos/seed/tech4/400/300',  caption: ''                            },
  { id: 'ph5', url: 'https://picsum.photos/seed/tech5/400/300',  caption: 'Sortie team building'        },
  { id: 'ph6', url: 'https://picsum.photos/seed/tech6/400/300',  caption: ''                            },
];

interface Photo {
  id: string;
  url: string;
  caption: string;
}

export default function GalleryPage() {
  const { user } = useAuth();
  const club = mockClubs.find((c) => c.presidentId === user?.id);

  const [photos, setPhotos] = useState<Photo[]>(demoPhotos);
  const [preview, setPreview] = useState<Photo | null>(null);

  if (!club) return null;

  const handleAdd = () => {
    const newPhoto: Photo = {
      id:      `ph${Date.now()}`,
      url:     `https://picsum.photos/seed/${Date.now()}/400/300`,
      caption: '',
    };
    setPhotos([newPhoto, ...photos]);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Supprimer cette photo ?')) return;
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (preview?.id === id) setPreview(null);
  };

  const handleCaption = (id: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p))
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">

        <PageHeader
          title="Galerie photo"
          subtitle={`${photos.length} photo${photos.length !== 1 ? 's' : ''} dans la galerie de ${club.name}`}
          action={
            <Button variant="primary" onClick={handleAdd}>
              + Ajouter une photo
            </Button>
          }
        />

        <div className="gallery-info-banner">
          <span>ℹ</span>
          <span>
            Mode simulation — les photos sont générées automatiquement.
            En production, tu pourras uploader de vraies images.
          </span>
        </div>

        {photos.length === 0 ? (
          <div className="card dash-empty gallery-empty">
            <span style={{ fontSize: 36 }}>🖼</span>
            <p>Aucune photo dans la galerie.</p>
            <Button variant="primary" onClick={handleAdd}>
              Ajouter la première photo
            </Button>
          </div>
        ) : (
          <div className="gallery-grid">
            {photos.map((photo) => (
              <div key={photo.id} className="gallery-item">
                <div
                  className="gallery-img-wrap"
                  onClick={() => setPreview(photo)}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Photo du club'}
                    className="gallery-img"
                    loading="lazy"
                  />
                  <div className="gallery-overlay">
                    <span className="gallery-zoom">🔍 Voir</span>
                  </div>
                </div>

                <div className="gallery-caption-wrap">
                  <input
                    type="text"
                    className="gallery-caption-input"
                    placeholder="Ajouter une légende..."
                    value={photo.caption}
                    onChange={(e) => handleCaption(photo.id, e.target.value)}
                  />
                </div>

                <button
                  className="gallery-delete-btn"
                  onClick={() => handleDelete(photo.id)}
                  title="Supprimer"
                >
                  ✕
                </button>

              </div>
            ))}
          </div>
        )}

        {preview && (
          <div className="gallery-modal-overlay" onClick={() => setPreview(null)}>
            <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="gallery-modal-close"
                onClick={() => setPreview(null)}
              >
                ✕
              </button>
              <img
                src={preview.url}
                alt={preview.caption}
                className="gallery-modal-img"
              />
              {preview.caption && (
                <p className="gallery-modal-caption">{preview.caption}</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}