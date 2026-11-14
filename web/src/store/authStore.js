import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: () => {
    try {
      const token = localStorage.getItem('pt_token');
      const userStr = localStorage.getItem('pt_user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isAuthenticated: true, isLoading: false });
        return;
      }
    } catch {
      /* ignore corrupt storage */
    }
    set({ isLoading: false });
  },

  login: async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      localStorage.setItem('pt_token', res.data.token);
      localStorage.setItem('pt_user', JSON.stringify(res.data.user));
      set({ token: res.data.token, user: res.data.user, isAuthenticated: true });
    }
    return res;
  },

  register: async (name, email, password) => {
    const res = await authService.register(name, email, password);
    if (res.success) {
      localStorage.setItem('pt_token', res.data.token);
      localStorage.setItem('pt_user', JSON.stringify(res.data.user));
      set({ token: res.data.token, user: res.data.user, isAuthenticated: true });
    }
    return res;
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: async (data) => {
    const res = await authService.updateProfile(data);
    if (res.success) {
      localStorage.setItem('pt_user', JSON.stringify(res.data));
      set({ user: res.data });
    }
    return res;
  },

  refreshUser: async () => {
    try {
      const res = await authService.getMe();
      if (res.success) {
        localStorage.setItem('pt_user', JSON.stringify(res.data));
        set({ user: res.data });
      }
    } catch {
      /* keep the cached user */
    }
  },
}));
