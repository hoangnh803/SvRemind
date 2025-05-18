import api from './config';

export interface EmailTemplate {
  id: number;
  name: string;
  title: string;
  body: string;
}

export const emailTemplateService = {
  getTemplates: async (): Promise<EmailTemplate[]> => {
    const response = await api.get<EmailTemplate[]>('/email-templates');
    return response.data;
  },

  createTemplate: async (template: Omit<EmailTemplate, 'id'>): Promise<{ id: string }> => {
    const response = await api.post<{ id: string }>('/email-templates', template);
    return response.data;
  },

  updateTemplate: async (id: number, template: Omit<EmailTemplate, 'id'>): Promise<void> => {
    await api.put(`/email-templates/${id}`, template);
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await api.delete(`/email-templates/${id}`);
  },
}; 