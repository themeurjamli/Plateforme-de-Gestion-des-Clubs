import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { getPostByIdAPI, Post } from '../services/post.service';
import { getClubPostsAPI } from '../services/post.service';
import './PostDetail.css';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const data = await getPostByIdAPI(id);
        setPost(data);

        if (data.clubId?._id || data.clubId) {
          const clubId = data.clubId?._id || data.clubId;
          const related = await getClubPostsAPI(clubId);
          setRelatedPosts(related.filter((p) => p._id !== id).slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="post-page">
        <Navbar />
        <div className="post-container">
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '60px 0' }}>
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-page">
        <Navbar />
        <div className="post-container">
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              Article introuvable.
            </p>
            <Link to="/clubs">
              <Button variant="primary">Retour aux clubs</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const clubId = post.clubId?._id || post.clubId;
  const clubName = post.clubId?.name || 'Club';

  return (
    <div className="post-page">
      <Navbar />
      <div className="post-container">

        <div className="post-breadcrumb">
          <Link to="/clubs">Clubs</Link>
          <span>›</span>
          <Link to={`/clubs/${clubId}`}>{clubName}</Link>
          <span>›</span>
          <span>Blog</span>
        </div>

        <div className="post-layout">
          <article className="post-main">
            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.title}
                className="post-cover"
              />
            )}
            <div className="post-header">
              <h1 className="post-title">{post.title}</h1>

              <div className="post-meta">
                <div className="post-author">
                  <div className="post-author-avatar">
                    {post.authorId?.firstName?.[0]}{post.authorId?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="post-author-name">
                      {post.authorId?.firstName} {post.authorId?.lastName}
                    </p>
                    <p className="post-date">
                      {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <Link to={`/clubs/${clubId}`}>
                  <Button variant="secondary" size="sm">
                    🏛 {clubName}
                  </Button>
                </Link>
              </div>
              {post.tags?.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((tag) => (
                    <span key={tag} className="post-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="post-content">
              {post.content.split('\n').map((paragraph, i) => {
                if (!paragraph.trim()) return <br key={i} />;
                if (paragraph.trim().startsWith('-')) {
                  return (
                    <p key={i} className="post-list-item">
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>→</span>
                      {paragraph.trim().slice(1).trim()}
                    </p>
                  );
                }
                return <p key={i}>{paragraph}</p>;
              })}
            </div>
            <div className="post-footer">
              <Link to={`/clubs/${clubId}`}>
                <Button variant="secondary">
                  ← Retour au club {clubName}
                </Button>
              </Link>
            </div>

          </article>

          {relatedPosts.length > 0 && (
            <aside className="post-sidebar">
              <h3 className="post-sidebar-title">Autres articles du club</h3>
              <div className="post-related">
                {relatedPosts.map((related) => (
                  <Link
                    key={related._id}
                    to={`/posts/${related._id}`}
                    className="post-related-card"
                  >
                    {related.coverImage && (
                      <img
                        src={related.coverImage}
                        alt={related.title}
                        className="post-related-img"
                      />
                    )}
                    <div className="post-related-body">
                      <p className="post-related-title">{related.title}</p>
                      <p className="post-related-date">
                        {new Date(related.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  );
}