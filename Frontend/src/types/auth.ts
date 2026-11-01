export type UserRole = "resident" | "owner" | "admin";
export type AccountStatus = "pending" | "active" | "suspended";

export interface UserProfile {
  id: string;
  firebaseUid: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  onboardingDetails?: {
    organizationName?: string;
    propertyLicense?: string;
    emergencyContact?: string;
    notes?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: UserProfile | null;
  firebaseUser: any | null;
  loading: boolean;
  token: string | null;
}

