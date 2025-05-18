import api from './config';

export interface Student {
  mssv: string;
  ten: string;
  email: string;
  lop: string;
  quanly: string;
}

export interface SendEmailRequest {
  recipients: {
    email: string;
    ten: string;
    mssv: string;
  }[];
  subject: string;
  body: string;
  emailTemplateId?: number;
}

export const emailService = {
  sendEmail: async (data: SendEmailRequest): Promise<void> => {
    await api.post('/send-email', data);
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