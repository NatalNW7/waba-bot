import { UserRole } from '../enums';

/**
 * User entity interface
 */
export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  // OAuth fields
  googleId?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  // Linked entities
  tenantId?: string | null;
  customerId?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

