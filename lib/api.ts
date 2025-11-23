import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRequest = error.config?.url?.includes('/auth/login') ||
                           error.config?.url?.includes('/auth/register');

      if (!isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export interface User {
  id: number;
  name: string;
  userIdentifier: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  key: string;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: number;
  projectId: number;
  name: string;
  position: number;
  createdAt: string;
}

export interface Tag {
  id: number;
  taskId: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface Task {
  id: number;
  projectId: number;
  columnId: number;
  columnName: string;
  title: string;
  description: string;
  assignee?: User;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  position: number;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  taskId: number;
  author: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: number;
  projectId: number;
  user: User;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  addedAt: string;
}

// Auth API
export const authAPI = {
  register: (data: { name: string; userIdentifier: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// User API
export const userAPI = {
  getCurrentUser: () => api.get<User>('/users/me'),
  getAllUsers: () => api.get<User[]>('/users'),
  getUserById: (id: number) => api.get<User>(`/users/${id}`),
  updateProfile: (data: { name?: string; email?: string; password?: string }) =>
    api.put<User>('/users/me', data),
};

// Project API
export const projectAPI = {
  create: (data: { name: string; description: string; key: string }) =>
    api.post<Project>('/projects', data),
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: number) => api.get<Project>(`/projects/${id}`),
  update: (id: number, data: { name: string; description: string; key: string }) =>
    api.put<Project>(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};

// Column API
export const columnAPI = {
  create: (projectId: number, data: { name: string; position: number }) =>
    api.post<Column>(`/projects/${projectId}/columns`, data),
  getByProject: (projectId: number) => api.get<Column[]>(`/projects/${projectId}/columns`),
  update: (projectId: number, columnId: number, data: { name: string; position: number }) =>
    api.put<Column>(`/projects/${projectId}/columns/${columnId}`, data),
  delete: (projectId: number, columnId: number) =>
    api.delete(`/projects/${projectId}/columns/${columnId}`),
};

// Task API
export const taskAPI = {
  create: (projectId: number, data: {
    title: string;
    description: string;
    columnId: number;
    assigneeId?: number;
    priority: string;
    position: number;
  }) => api.post<Task>(`/projects/${projectId}/tasks`, data),
  getByProject: (projectId: number) => api.get<Task[]>(`/projects/${projectId}/tasks`),
  getById: (projectId: number, taskId: number) =>
    api.get<Task>(`/projects/${projectId}/tasks/${taskId}`),
  update: (projectId: number, taskId: number, data: any) =>
    api.put<Task>(`/projects/${projectId}/tasks/${taskId}`, data),
  move: (projectId: number, taskId: number, data: { targetColumnId: number; position: number }) =>
    api.patch<Task>(`/projects/${projectId}/tasks/${taskId}/move`, data),
  delete: (projectId: number, taskId: number) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}`),
  getMyTasks: () => api.get<Task[]>('/my-tasks'),
};

// Comment API
export const commentAPI = {
  create: (taskId: number, data: { content: string }) =>
    api.post<Comment>(`/tasks/${taskId}/comments`, data),
  getByTask: (taskId: number) => api.get<Comment[]>(`/tasks/${taskId}/comments`),
  update: (taskId: number, commentId: number, data: { content: string }) =>
    api.put<Comment>(`/tasks/${taskId}/comments/${commentId}`, data),
  delete: (taskId: number, commentId: number) =>
    api.delete(`/tasks/${taskId}/comments/${commentId}`),
};

// Project Member API
export const projectMemberAPI = {
  add: (projectId: number, data: { userId: number; role?: string }) =>
    api.post<ProjectMember>(`/projects/${projectId}/members`, data),
  getByProject: (projectId: number) => api.get<ProjectMember[]>(`/projects/${projectId}/members`),
  update: (projectId: number, memberId: number, data: { userId: number; role: string }) =>
    api.put<ProjectMember>(`/projects/${projectId}/members/${memberId}`, data),
  remove: (projectId: number, memberId: number) =>
    api.delete(`/projects/${projectId}/members/${memberId}`),
};

// Tag API
export const tagAPI = {
  create: (taskId: number, data: { name: string; color: string }) =>
    api.post<Tag>(`/tasks/${taskId}/tags`, data),
  getByTask: (taskId: number) => api.get<Tag[]>(`/tasks/${taskId}/tags`),
  update: (taskId: number, tagId: number, data: { name: string; color: string }) =>
    api.put<Tag>(`/tasks/${taskId}/tags/${tagId}`, data),
  delete: (taskId: number, tagId: number) =>
    api.delete(`/tasks/${taskId}/tags/${tagId}`),
};

