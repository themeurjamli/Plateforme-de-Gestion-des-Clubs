import api from './api';

export const joinClubAPI = async (clubId: string) => {
  const res = await api.post('/memberships', { clubId });
  return res.data;
};

export const getMyMembershipsAPI = async () => {
  const res = await api.get('/memberships/me');
  return res.data;
};

export const updateMembershipAPI = async (
  id:     string,
  status: 'member' | 'banned'
) => {
  const res = await api.patch(`/memberships/${id}`, { status });
  return res.data;
};

export const removeMemberAPI = async (id: string): Promise<void> => {
  await api.delete(`/memberships/${id}`);
};