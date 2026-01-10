import { UserRole } from '../enums';

/**
 * Login request interface
 */
export interface ILoginRequest {
  email: string;
  password: string;
}

/**
 * Login response interface (legacy email/password)
 */
export interface ILoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

/**
 * User session info returned by /auth/me
 */
export interface IUserSession {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  tenantId?: string | null;
  onboardingStatus: 'COMPLETE' | 'PENDING';
}

/**
 * OAuth login response
 */
export interface IOAuthLoginResponse {
  accessToken: string;
  user: IUserSession;
}

