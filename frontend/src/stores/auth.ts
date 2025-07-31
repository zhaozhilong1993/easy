import { create } from 'zustand';
import { authAPI } from '@/services/api';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (username: string, password: string) => {
    try {
      set({ isLoading: true });
      const response = await authAPI.login(username, password);
      
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  getProfile: async () => {
    try {
      set({ isLoading: true });
      const response = await authAPI.getProfile();
      
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error;
    }
  },

  hasRole: (role: string) => {
    const { user } = get();
    return user?.roles?.includes(role) || false;
  },

  hasPermission: (permission: string) => {
    const { user } = get();
    // 这里可以根据具体的权限系统来实现
    // 目前简单返回true，实际应该检查用户的具体权限
    return user?.roles?.includes('admin') || false;
  },
})); 