import React from 'react';
import { Link } from 'react-router-dom';

export default function AccessDenied({ message }: { message?: string }) {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Accès refusé</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{message ?? "Vous n'êtes pas autorisé·e à accéder à cette page."}</p>
        <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Retour à l'accueil</Link>
      </div>
    </div>
  );
}
