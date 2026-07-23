import api from './api';
import { User } from '../types/index';


export interface AuthResponse {
  _id:       string;
  firstName: string;
  lastName:  string;
  email:     string;
  role:      User['role'];
  status:    User['status'];
  clubId?:   string;
  token:     string;
}


export const loginAPI = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const registerAPI = async (
  firstName: string,
  lastName:  string,
  email:     string,
  password:  string
): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', { firstName, lastName, email, password });
  return res.data;
};

export const getMeAPI = async (): Promise<User> => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updateMeAPI = async (data: Partial<User>): Promise<User> => {
  const res = await api.put('/auth/me', data);
  return res.data;
};