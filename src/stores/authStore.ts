import { create } from 'zustand';

import type { AppUser } from '../models/appUser';
import * as authRepository from '../repositories/authRepository';

type AuthState = {
  user: AppUser | null;
  signIn: (email: string, password: string) => void;
  continueAsGuest: () => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: authRepository.loadCurrentUser(),
  signIn: (email) => set({ user: authRepository.signIn(email) }),
  continueAsGuest: () => set({ user: authRepository.continueAsGuest() }),
  signOut: () => {
    authRepository.signOut();
    set({ user: null });
  }
}));
