import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import PageHeader from '../../components/ui/Pageheader';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContex';
import {
  getClubPostsAPI,
  createPostAPI,
  updatePostAPI,
  deletePostAPI,
  Post,
} from '../../services/post.service';
import './Dashboard.css';
import './Blog.css';

const emptyForm = {
  title:      '',
  content:    '',
  coverImage: '',
  tags:       '',
};

export default function BlogPage() {
  const { user }      = useAuth();
  const { showToast } = useToast();
  const clubId        = user?.clubId as string;

  const [posts,    setPosts]    = useState<Post[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [form,     setForm]     = useState(emptyForm);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [saving,   setSaving]   = useState(false);
  const [preview,  setPreview]  = useState<Post | null>(null);

  useEffect(() => {
    if (!clubId) return;
    const fetchPosts = async () => {
      try {
        const data = await getClubPostsAPI(clubId);
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [clubId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())   e.title   = 'Le titre est requis';
    if (!form.content.trim()) e.content = 'Le contenu est requis';
    if (form.content.trim().length < 20) e.content = 'Le contenu doit faire au moins 20 caractères';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNew = () => {
    setForm(emptyForm);
    setEditId(null);
    setErrors({});
    setShowForm(true);
    setPreview(null);
  };

  const handleEdit = (post: Post) => {
    setForm({
      title:      post.title,
      content:    post.content,
      coverImage: post.coverImage || '',
      tags:       post.tags?.join(', ') || '',
    });
    setEditId(post._id);
    setErrors({});
    setShowForm(true);
    setPreview(null);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        clubId,
        title:      form.title.trim(),
        content:    form.content.trim(),
        coverImage: form.coverImage.trim(),
        tags:       form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (editId) {
        const updated = await updatePostAPI(editId, payload);
        setPosts((prev) => prev.map((p) => (p._id === editId ? updated : p)));
        showToast('Article modifié avec succès !', 'success');
      } else {
        const created = await createPostAPI(payload);
        setPosts([created, ...posts]);
        showToast('Article publié avec succès !', 'success');
      }

      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`Supprimer l'article "${post.title}" ?`)) return;
    try {
      await deletePostAPI(post._id);
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      showToast('Article supprimé.', 'success');
      if (preview?._id === post._id) setPreview(null);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur lors de la suppression', 'error');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">

        <PageHeader
          title="Blog du club"
          subtitle="Publiez des articles sur les activités de votre club"
          action={
            !showForm && !preview && (
              <Button variant="primary" onClick={handleNew}>
                + Nouvel article
              </Button>
            )
          }
        />

        {showForm && (
          <div className="dash-form-panel">
            <h2 className="dash-form-title">
              {editId ? "Modifier l'article" : 'Nouvel article'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input
                label="Titre"
                placeholder="Ex : Retour sur notre atelier robotique de juin"
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                error={errors.title}
                required
              />

              <Input
                label="Image de couverture"
                placeholder="https://... (optionnel)"
                value={form.coverImage}
                onChange={(v) => setForm({ ...form, coverImage: v })}
                hint="URL d'une image pour illustrer l'article"
              />

              <div>
                <label className="input-label">
                  Contenu <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                  className="blog-content-editor"
                  placeholder="Rédigez votre article ici... Parlez des activités, des résultats, des prochains événements..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={12}
                />
                {errors.content && (
                  <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>
                    {errors.content}
                  </p>
                )}
                <p style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 4 }}>
                  {form.content.length} caractères
                </p>
              </div>

              <Input
                label="Tags"
                placeholder="robotique, atelier, programmation"
                value={form.tags}
                onChange={(v) => setForm({ ...form, tags: v })}
                hint="Séparez les tags par des virgules"
              />
            </div>

            <div className="dash-form-actions">
              <Button
                variant="secondary"
                onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}
              >
                Annuler
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Publication...' : editId ? 'Enregistrer' : 'Publier'}
              </Button>
            </div>
          </div>
        )}

        {preview && !showForm && (
          <div className="blog-preview card">
            <div className="blog-preview-header">
              <Button variant="secondary" size="sm" onClick={() => setPreview(null)}>
                ← Retour à la liste
              </Button>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" size="sm" onClick={() => handleEdit(preview)}>
                  ✏ Modifier
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(preview)}>
                  🗑 Supprimer
                </Button>
              </div>
            </div>

            {preview.coverImage && (
              <img
                src={preview.coverImage}
                alt={preview.title}
                className="blog-preview-cover"
              />
            )}

            <h1 className="blog-preview-title">{preview.title}</h1>

            <div className="blog-preview-meta">
              <span>
                ✍ {preview.authorId?.firstName} {preview.authorId?.lastName}
              </span>
              <span>📅 {new Date(preview.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>

            {preview.tags?.length > 0 && (
              <div className="blog-preview-tags">
                {preview.tags.map((tag) => (
                  <span key={tag} className="blog-tag">{tag}</span>
                ))}
              </div>
            )}

            <div className="blog-preview-content">
              {preview.content.split('\n').map((paragraph, i) =>
                paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
              )}
            </div>
          </div>
        )}

        {!showForm && !preview && (
          <>
            {loading ? (
              <div className="card dash-empty">Chargement...</div>
            ) : posts.length === 0 ? (
              <div className="card dash-empty">
                <span style={{ fontSize: 36 }}>📝</span>
                <p>Aucun article publié pour le moment.</p>
                <Button variant="primary" onClick={handleNew}>
                  Publier le premier article
                </Button>
              </div>
            ) : (
              <div className="blog-list">
                {posts.map((post) => (
                  <div key={post._id} className="card blog-card">

                    {post.coverImage && (
                      <div className="blog-card-cover">
                        <img src={post.coverImage} alt={post.title} />
                      </div>
                    )}

                    <div className="blog-card-body">
                      <h3 className="blog-card-title">{post.title}</h3>
                      <p className="blog-card-excerpt">
                        {post.content.slice(0, 150)}
                        {post.content.length > 150 ? '...' : ''}
                      </p>

                      {post.tags?.length > 0 && (
                        <div className="blog-card-tags">
                          {post.tags.map((tag) => (
                            <span key={tag} className="blog-tag">{tag}</span>
                          ))}
                        </div>
                      )}

                      <div className="blog-card-meta">
                        <span>📅 {new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
                        <span>✍ {post.authorId?.firstName} {post.authorId?.lastName}</span>
                      </div>
                    </div>

                    <div className="blog-card-actions">
                      <Button variant="secondary" size="sm" onClick={() => setPreview(post)}>
                        👁 Voir
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(post)}>
                        ✏ Modifier
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(post)}>
                        🗑 Supprimer
                      </Button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}