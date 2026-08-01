import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import {useToast} from '../../context/ToastContex';
import { getClubByIdAPI, addClubPhotoAPI, deleteClubPhotoAPI } from '../../services/club.service';
import './Dashboard.css';

interface Photo {
  _id?: string;
  id?: string;
  url: string;
  caption?: string;
  uploadedAt?: string;
}

export default function GalleryPage() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [preview, setPreview] = useState<Photo | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const loadGallery = async () => {
      if (!user?.clubId) {
        setLoading(false);
        return;
      }

      try {
        const club = await getClubByIdAPI(user.clubId);
        setPhotos(
          (club.gallery ?? []).map((photo: any) => {
            const normalizedId = String(photo._id || photo.id || '');
            return {
              ...photo,
              _id: normalizedId,
              id: normalizedId,
            };
          })
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, [user]);

  const getDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Impossible de lire le fichier.'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) {
      const url = await getDataUrl(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!user?.clubId || !selectedFile) return;
    setUploading(true);
    try {
      const url = await getDataUrl(selectedFile);
      const photo = await addClubPhotoAPI(user.clubId, {
        url,
        caption,
      });
      setPhotos((prev) => [
        {
          ...photo,
          id: photo._id || photo.id,
        },
        ...prev,
      ]);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');
    } catch (error) {
      console.error(error);
      showToast('Erreur lors de l’ajout de la photo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId?: string) => {
    if (!photoId || !user?.clubId) return;
    if (!window.confirm('Supprimer cette photo ?')) return;
    try {
      await deleteClubPhotoAPI(user.clubId, photoId);
      setPhotos((prev) => prev.filter((photo) => photo.id !== photoId && photo._id !== photoId));
      showToast('Photo supprimée.', 'success');
      if (preview?.id === photoId || preview?._id === photoId) {
        setPreview(null);
      }
    } catch (error: any) {
      console.error(error);
      showToast(`Impossible de supprimer la photo : ${error?.response?.data?.message ?? error.message ?? 'erreur inconnue'}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-content">
          <PageHeader title="Galerie photo" subtitle="Chargement..." />
          <div className="card dash-empty gallery-empty">
            <span style={{ fontSize: 36 }}>⏳</span>
            <p>Chargement de la galerie...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <PageHeader
          title="Galerie photo"
          subtitle={`${photos.length} photo${photos.length !== 1 ? 's' : ''} dans la galerie`}
        />
        <div className="gallery-info-banner">
          <span>ℹ</span>
          <span>Ajoutez vos propres photos, elles sont stockées en base et visibles dans la page du club.</span>
        </div>
        <div className="gallery-upload-form card">
          <input
            id="photoUpload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div className="gallery-upload-actions">
            <Button variant="primary" onClick={() => document.getElementById('photoUpload')?.click()}>
              + Ajouter une photo
            </Button>
          </div>
          <div className="gallery-upload-fields">
            <input
              type="text"
              value={caption}
              placeholder="Légende (optionnelle)"
              onChange={(e) => setCaption(e.target.value)}
            />
            <Button variant="primary" onClick={handleUpload} disabled={!selectedFile || uploading}>
              {uploading ? 'Envoi...' : 'Télécharger'}
            </Button>
          </div>
          {previewUrl && (
            <div className="gallery-preview-card">
              <img src={previewUrl} alt="Prévisualisation" className="gallery-img" />
            </div>
          )}
        </div>
        {photos.length === 0 ? (
          <div className="card dash-empty gallery-empty">
            <span style={{ fontSize: 36 }}>🖼</span>
            <p>Aucune photo dans la galerie.</p>
            <Button variant="primary" onClick={() => document.getElementById('photoUpload')?.click()}>Ajouter la première photo</Button>
          </div>
        ) : (
          <div className="gallery-grid">
            {photos.map((photo) => (
              <div key={photo._id ?? photo.id} className="gallery-item">
                <div className="gallery-img-wrap" onClick={() => setPreview(photo)}>
                  <img src={photo.url} alt={photo.caption || 'Photo'} className="gallery-img" loading="lazy" />
                  <div className="gallery-overlay"><span className="gallery-zoom">🔍 Voir</span></div>
                </div>
                <div className="gallery-caption-wrap">
                  <span className="gallery-caption-text">{photo.caption || 'Aucune légende'}</span>
                </div>
                <button className="gallery-delete-btn" onClick={() => handleDelete(photo._id ?? photo.id)} title="Supprimer">✕</button>
              </div>
            ))}
          </div>
        )}
        {preview && (
          <div className="gallery-modal-overlay" onClick={() => setPreview(null)}>
            <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
              <button className="gallery-modal-close" onClick={() => setPreview(null)}>✕</button>
              <img src={preview.url} alt={preview.caption} className="gallery-modal-img" />
              {preview.caption && <p className="gallery-modal-caption">{preview.caption}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}