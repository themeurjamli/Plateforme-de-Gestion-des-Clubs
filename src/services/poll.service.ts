import api from './api';
import { Poll } from '../types/index';

export const getClubPollsAPI = async (clubId: string): Promise<Poll[]> => {
  const res = await api.get(`/polls/club/${clubId}`);
  return res.data;
};

export const createPollAPI = async (data: {
  clubId:   string;
  question: string;
  options:  string[];
}): Promise<Poll> => {
  const res = await api.post('/polls', data);
  return res.data;
};

export const voteAPI = async (pollId: string, optionId: string): Promise<Poll> => {
  const res = await api.post(`/polls/${pollId}/vote`, { optionId });
  return res.data;
};

export const closePollAPI = async (pollId: string): Promise<Poll> => {
  const res = await api.patch(`/polls/${pollId}/close`);
  return res.data;
};

export const deletePollAPI = async (pollId: string): Promise<void> => {
  await api.delete(`/polls/${pollId}`);
};