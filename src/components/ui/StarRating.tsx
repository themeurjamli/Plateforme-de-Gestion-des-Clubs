import React, { useState } from 'react';
import { EventRating } from '../../types/index';
import './StarRating.css';

const LABELS = ['', 'Mauvais', 'Passable', 'Bien', 'Très bien', 'Excellent'];

interface StarRatingProps {
  eventId: string;
  existingRatings: EventRating[];
  userId: string;
  onRate: (eventId: string, rating: number, comment: string) => void;
}

export default function StarRating({
  eventId,
  existingRatings,
  userId,
  onRate,
}: StarRatingProps) {
  const myRating = existingRatings.find(
    (r) => r.userId === userId && r.eventId === eventId
  );

  const [hovered, setHovered]   = useState(0);
  const [selected, setSelected] = useState(myRating?.rating ?? 0);
  const [comment, setComment]   = useState(myRating?.comment ?? '');
  const [submitted, setSubmitted] = useState(!!myRating);

  const avgRating =
    existingRatings.length > 0
      ? (existingRatings.reduce((s, r) => s + r.rating, 0) / existingRatings.length).toFixed(1)
      : null;

  const handleSubmit = () => {
    if (selected === 0) return;
    onRate(eventId, selected, comment);
    setSubmitted(true);
  };

  return (
    <div className="star-rating-wrap">
      <div className="star-rating-header">
        <span className="star-rating-label">Évaluer cet événement</span>
        {avgRating && (
          <span className="star-avg">
            ⭐ {avgRating}/5 · {existingRatings.length} avis
          </span>
        )}
      </div>

      {submitted ? (
        <div className="star-submitted">
          <span className="star-submitted-stars">{'⭐'.repeat(selected)}</span>
          <span className="star-submitted-text">Merci pour votre avis !</span>
        </div>
      ) : (
        <>
          <div className="star-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`star-btn ${star <= (hovered || selected) ? 'star-active' : ''}`}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setSelected(star)}
                aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
            {(hovered || selected) > 0 && (
              <span className="star-label-text">
                {LABELS[hovered || selected]}
              </span>
            )}
          </div>

          {selected > 0 && (
            <div className="star-comment-wrap">
              <textarea
                className="star-comment"
                placeholder="Laisser un commentaire (optionnel)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
              />
              <button className="star-submit-btn" onClick={handleSubmit}>
                Envoyer mon avis
              </button>
            </div>
          )}
        </>
      )}

      {existingRatings.length > 0 && (
        <div className="star-reviews">
          {existingRatings.map((r) => (
            <div key={r.id} className="star-review-row">
              <span className="star-review-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={s <= r.rating ? 'star-filled' : 'star-empty'}>★</span>
                ))}
              </span>
              {r.comment && (
                <span className="star-review-comment">"{r.comment}"</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}