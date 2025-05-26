import api from './config';

export interface Student {
  mssv: string;
  ten: string;
  email: string;
  lop: string;
  quanly: string;
}

export interface StudentCardPayload {
  fullNameNS: string;
  studentCode: string;
  email: string;
  cardCode: string;
}

export const studentService = {
  getStudentDataByBarcode: async (barcodeUrl: string): Promise<Student> => {
    const apiUrl = `/proxy/student?barcode=${encodeURIComponent(barcodeUrl)}`;
    const response = await api.get<Student>(apiUrl);
    return response.data;
  },

  saveStudentCard: async (payload: StudentCardPayload): Promise<void> => {
    await api.post('/student-cards', payload);
  },
}; 