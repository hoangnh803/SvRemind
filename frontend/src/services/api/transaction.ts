import api from './config';

export interface Transaction {
  id: number;
  sender: string;
  receivers: string;
  emailTemplateId: number | null;
  title: string;
  body: string;
  plantDate: string | null;
  sendDate: string | null;
  createdBy: string;
  emailTemplate?: {
    id: number;
    name: string;
    title: string;
    body: string;
  };
}

export const transactionService = {
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('/transactions');
    return response.data;
  },

  getTransaction: async (id: number): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  deleteTransaction: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },
}; 