import api from './config';

export interface Student {
  fullNameNS: string;
  studentCode: string;
  email: string;
  cardCode: string;
}

export interface Recipient {
  email: string;
  ten: string;
  mssv: string;
}

export interface SendEmailPayload {
  recipients: Recipient[];
  subject: string;
  body: string;
  emailTemplateId?: number | null;
}

export interface SendEmailResponse {
  // Define based on actual API response, assuming a simple message for now
  message: string;
}

export const emailService = {
  sendEmail: async (payload: SendEmailPayload): Promise<SendEmailResponse> => {
    const response = await api.post<SendEmailResponse>('/send-email', payload);
    return response.data;
  },

  getStudentData: async (barcode: string): Promise<Student> => {
    const response = await api.get<Student>(`/proxy/student?barcode=${encodeURIComponent(barcode)}`);
    return response.data;
  },

  saveStudentCard: async (studentData: {
    fullNameNS: string;
    studentCode: string;
    email: string;
    cardCode: string;
  }): Promise<void> => {
    await api.post('/student-cards', studentData);
  },
}; 