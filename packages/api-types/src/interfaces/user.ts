import { UserRole } from '../enums';

/**
 * User entity interface
 */
export interface IUser {
  id: string;
  email: string;
  role: UserRole;
  tenantId?: string | null;
  customerId?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
