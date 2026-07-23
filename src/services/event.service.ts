import api from './api';
import { Event } from '../types/index';

export const getPublicEventsAPI = async (clubId?: string): Promise<Event[]> => {
  const res = await api.get('/events', { params: clubId ? { clubId } : {} });
  return res.data;
};

export const getClubEventsAPI = async (clubId: string): Promise<Event[]> => {
  const res = await api.get(`/events/club/${clubId}`);
  return res.data;
};

export const getEventByIdAPI = async (id: string): Promise<Event> => {
  const res = await api.get(`/events/${id}`);
  return res.data;
};

export const createEventAPI = async (data: Partial<Event>): Promise<Event> => {
  const res = await api.post('/events', data);
  return res.data;
};

export const updateEventAPI = async (
  id:   string,
  data: Partial<Event>
): Promise<Event> => {
  const res = await api.put(`/events/${id}`, data);
  return res.data;
};

export const deleteEventAPI = async (id: string): Promise<void> => {
  await api.delete(`/events/${id}`);
};

export const registerToEventAPI = async (eventId: string) => {
  const res = await api.post(`/events/${eventId}/register`);
  return res.data;
};

export const unregisterFromEventAPI = async (eventId: string): Promise<void> => {
  await api.delete(`/events/${eventId}/register`);
};

export const getEventRegistrationsAPI = async (eventId: string) => {
  const res = await api.get(`/events/${eventId}/registrations`);
  return res.data;
};