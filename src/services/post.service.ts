import api from './api';

export interface Post {
  _id:        string;
  clubId:     any;
  authorId:   any;
  title:      string;
  content:    string;
  coverImage: string;
  tags:       string[];
  createdAt:  string;
  updatedAt:  string;
}

export const getClubPostsAPI = async (clubId: string): Promise<Post[]> => {
  const res = await api.get(`/posts/club/${clubId}`);
  return res.data;
};

export const getAllPostsAPI = async (): Promise<Post[]> => {
  const res = await api.get('/posts');
  return res.data;
};

export const getPostByIdAPI = async (id: string): Promise<Post> => {
  const res = await api.get(`/posts/${id}`);
  return res.data;
};

export const createPostAPI = async (data: {
  clubId:      string;
  title:       string;
  content:     string;
  coverImage?: string;
  tags?:       string[];
}): Promise<Post> => {
  const res = await api.post('/posts', data);
  return res.data;
};

export const updatePostAPI = async (
  id:   string,
  data: Partial<{ title: string; content: string; coverImage: string; tags: string[] }>
): Promise<Post> => {
  const res = await api.put(`/posts/${id}`, data);
  return res.data;
};

export const deletePostAPI = async (id: string): Promise<void> => {
  await api.delete(`/posts/${id}`);
};