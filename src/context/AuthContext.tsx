import React, { createContext, useContext, useState } from 'react';
import { User } from '../types/index';
import { mockUsers } from '../data/mockData';

// ─── TYPES DU CONTEXT ────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

// ─── CRÉATION DU CONTEXT ─────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── PROVIDER ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Faux login : on cherche l'email dans mockUsers
  // Le mot de passe n'est pas vérifié (pas de backend)
  const login = (email: string, password: string): boolean => {
    const found = mockUsers.find(
      (u) => u.email === email && u.status === 'active'
    );
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  // Permet de modifier le profil depuis ProfilePage
  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── HOOK ────────────────────────────────────────────────────
// Utilise ce hook dans chaque composant qui a besoin du user
// Exemple : const { user, logout } = useAuth();

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
}