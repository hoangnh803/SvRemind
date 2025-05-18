import api from './config';

export interface ChartDataPoint {
  date: string;
  count: number | string;
}

export interface DashboardData {
  system?: {
    users: ChartDataPoint[];
    emails: ChartDataPoint[];
    studentCards: ChartDataPoint[];
  };
  personal?: {
    myEmails: ChartDataPoint[];
    myStudentCards: ChartDataPoint[];
  };
}

export const dashboardService = {
  getAdminDashboardData: async (timeRange: string): Promise<DashboardData> => {
    const [usersResponse, emailsResponse, studentCardsResponse, myEmailsResponse, myStudentCardsResponse] =
      await Promise.all([
        api.get<ChartDataPoint[]>('/dashboard/users', { params: { timeRange } }),
        api.get<ChartDataPoint[]>('/dashboard/emails', { params: { timeRange } }),
        api.get<ChartDataPoint[]>('/dashboard/student-cards', { params: { timeRange } }),
        api.get<ChartDataPoint[]>('/dashboard/user/emails', { params: { timeRange } }),
        api.get<ChartDataPoint[]>('/dashboard/user/student-cards', { params: { timeRange } }),
      ]);

    return {
      system: {
        users: usersResponse.data,
        emails: emailsResponse.data,
        studentCards: studentCardsResponse.data,
      },
      personal: {
        myEmails: myEmailsResponse.data,
        myStudentCards: myStudentCardsResponse.data,
      },
    };
  },

  getUserDashboardData: async (timeRange: string): Promise<DashboardData> => {
    const [emailsResponse, studentCardsResponse] = await Promise.all([
      api.get<ChartDataPoint[]>('/dashboard/user/emails', { params: { timeRange } }),
      api.get<ChartDataPoint[]>('/dashboard/user/student-cards', { params: { timeRange } }),
    ]);

    return {
      personal: {
        myEmails: emailsResponse.data,
        myStudentCards: studentCardsResponse.data,
      },
    };
  },
}; 