import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/api/axios';

export type DashboardStats = {
  blogs: Record<string, number>;
  news: Record<string, number>;
  projects: Record<string, number>;
  insights: Record<string, number>;
  case_studies: Record<string, number>;
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<DashboardStats>('/stats/dashboard');
      return data;
    },
  });
};
