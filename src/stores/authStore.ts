import { create } from 'zustand';

import type { AppUser } from '../models/appUser';
import * as authRepository from '../repositories/authRepository';

type AuthState = {
  user: AppUser | null;
  signIn: (email: string, password: string) => Promise<AppUser>;
  continueAsGuest: () => void;
  updateCurrentUser: (user: AppUser) => void;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: authRepository.loadCurrentUser(),
  signIn: async (email, password) => {
    const user = await authRepository.signIn(email, password);
    set({ user });
    return user;
  },
  continueAsGuest: () => set({ user: authRepository.continueAsGuest() }),
  updateCurrentUser: (user) => {
    authRepository.updateCurrentUser(user);
    set({ user: authRepository.loadCurrentUser() });
  },
  signOut: async () => {
    await authRepository.signOut();
    set({ user: null });
  }
}));
