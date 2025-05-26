import api from './config';

export interface LoginResponse {
  access_token: string;
  user: {
    role: string;
    email: string;
  };
}

export interface User {
  id: number;
  email: string;
  role: { name: string };
  createdDate: string;
  latestData: string | null;
}

export interface PaginatedUsersResponse {
  data: User[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/auth/users');
    return response.data;
  },

  getUsersPaginated: async (page: number = 1, limit: number = 10, search: string = ''): Promise<PaginatedUsersResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    const response = await api.get<PaginatedUsersResponse>(`/users/paginated?${params.toString()}`);
    return response.data;
  },

  getRoles: async (): Promise<Role[]> => {
    const response = await api.get<Role[]>('/auth/roles');
    return response.data;
  },

  updateUserRole: async (email: string, newRole: string): Promise<void> => {
    await api.put(`/auth/users/${email}/role`, { role: newRole });
  },
}; 