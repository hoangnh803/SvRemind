// src/auth/interfaces/hust-response.interface.ts
export interface HustAuthResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    fullName: string;
    role: string;
  };
}
