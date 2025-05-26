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

export interface PaginatedTransactionsResponse {
  data: Transaction[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export const transactionService = {
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('/transactions');
    return response.data;
  },

  getTransactionsPaginated: async (page: number = 1, limit: number = 10, search: string = ''): Promise<PaginatedTransactionsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }
    
    const response = await api.get<PaginatedTransactionsResponse>(`/transactions/paginated?${params.toString()}`);
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