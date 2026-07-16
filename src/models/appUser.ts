export type AppUserRole = 'admin' | 'branch_manager' | 'worker';

export type AppUser = {
  userId: string;
  name: string;
  email: string;
  branchId: string;
  branchName: string;
  role: AppUserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};
