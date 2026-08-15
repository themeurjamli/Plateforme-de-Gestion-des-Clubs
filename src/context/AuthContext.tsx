import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index';
import { loginAPI, registerAPI, getMeAPI, updateMeAPI } from '../services/auth.service';


interface AuthContextType {
  user:         User | null;
  loading:      boolean;         
  login:        (email: string, password: string) => Promise<void>;
  register:     (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout:       () => void;
  updateUser:   (data: Partial<User>) => Promise<void>;
}
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const checkToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await getMeAPI();
      setUser({
        id:        (me as any)._id,
        firstName: me.firstName,
        lastName:  me.lastName,
        email:     me.email,
        role:      me.role,
        status:    me.status,
        clubId:    (me as any).clubId,
        bio:       me.bio,
        interests: me.interests,
        city: (me as any).city,
        createdAt: (me as any).createdAt,
      });
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  checkToken();
}, []);

  const login = async (email: string, password: string) => {
    const data = await loginAPI(email, password);
    localStorage.setItem('token', data.token);
    setUser({
      id:        data._id,
      firstName: data.firstName,
      lastName:  data.lastName,
      email:     data.email,
      role:      data.role,
      status:    data.status,
      clubId:    data.clubId,
      createdAt: '',
    });
  };

  const register = async (
    firstName: string,
    lastName:  string,
    email:     string,
    password:  string
  ) => {
    const data = await registerAPI(firstName, lastName, email, password);
    localStorage.setItem('token', data.token);
    setUser({
      id:        data._id,
      firstName: data.firstName,
      lastName:  data.lastName,
      email:     data.email,
      role:      data.role,
      status:    data.status,
      createdAt: '',
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    const updated = await updateMeAPI(data);
    setUser((prev) =>
      prev ? { ...prev, ...updated, id: (updated as any)._id || prev.id } : null
    );
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
}