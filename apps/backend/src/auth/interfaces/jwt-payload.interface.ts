export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId?: string;
  customerId?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenantId?: string | null;
  customerId?: string | null;
  isActive?: boolean;
  name?: string | null;
  avatarUrl?: string | null;
}
