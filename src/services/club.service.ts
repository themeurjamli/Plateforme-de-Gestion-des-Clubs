import api from './api';
import { Club, ClubStatus } from '../types/index';

export const getClubsAPI = async (params?: {
  category?: string;
  search?:   string;
  city?:     string;
}): Promise<Club[]> => {
  const res = await api.get('/clubs', { params });
  return res.data;
};

export const getAllClubsAPI = async (): Promise<Club[]> => {
  const res = await api.get('/clubs/all');
  return res.data;
};

export const getClubByIdAPI = async (id: string): Promise<Club> => {
  const res = await api.get(`/clubs/${id}`);
  return res.data;
};

export const addClubPhotoAPI = async (
  clubId: string,
  photo: { url: string; caption?: string }
): Promise<any> => {
  const res = await api.post(`/clubs/${clubId}/gallery`, photo);
  return res.data;
};

export const deleteClubPhotoAPI = async (clubId: string, photoId: string): Promise<void> => {
  await api.delete(`/clubs/${clubId}/gallery/${photoId}`);
};

export const getClubScoreAPI = async (id: string): Promise<any> => {
  const res = await api.get(`/clubs/${id}/score`);
  return res.data;
};

export const getClubRankingAPI = async (): Promise<any[]> => {
  const res = await api.get('/clubs/ranking');
  return res.data;
};

export const createClubAPI = async (data: {
  name:        string;
  description: string;
  category:    string;
  cities?:     string[];
}): Promise<Club> => {
  const res = await api.post('/clubs', data);
  return res.data;
};

export const updateClubAPI = async (
  id:   string,
  data: Partial<Club>
): Promise<Club> => {
  const res = await api.put(`/clubs/${id}`, data);
  return res.data;
};

export const updateClubStatusAPI = async (
  id:     string,
  status: ClubStatus
): Promise<Club> => {
  const res = await api.patch(`/clubs/${id}/status`, { status });
  return res.data;
};

export const deleteClubAPI = async (id: string): Promise<void> => {
  await api.delete(`/clubs/${id}`);
};

export const getClubMembersAPI = async (clubId: string) => {
  const res = await api.get(`/clubs/${clubId}/members`);
  return res.data;
};

export const getClubPendingAPI = async (clubId: string) => {
  const res = await api.get(`/clubs/${clubId}/pending`);
  return res.data;
};