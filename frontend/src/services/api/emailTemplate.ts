import api from './config';

export interface EmailTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
}

export interface PaginatedResponse {
  data: EmailTemplate[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export const emailTemplateService = {
  getTemplates: async (page: number = 1, limit: number = 10, search: string = ''): Promise<PaginatedResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    const response = await api.get<PaginatedResponse>(`/email-templates?${params.toString()}`);
    return response.data;
  },

  getAllTemplates: async (): Promise<EmailTemplate[]> => {
    const response = await api.get<EmailTemplate[]>('/email-templates/all');
    return response.data;
  },

  createTemplate: async (template: Omit<EmailTemplate, 'id'>): Promise<{ id: string }> => {
    const response = await api.post<{ id: string }>('/email-templates', template);
    return response.data;
  },

  updateTemplate: async (id: string, template: Omit<EmailTemplate, 'id'>): Promise<void> => {
    await api.put(`/email-templates/${id}`, template);
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/email-templates/${id}`);
  },
}; 