/**
 * Customer entity interface
 */
export interface ICustomer {
  id: string;
  phone: string;
  name?: string | null;
  email?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Create customer request interface
 */
export interface ICreateCustomer {
  phone: string;
  name?: string;
  email?: string;
}

/**
 * Update customer request interface
 */
export interface IUpdateCustomer extends Partial<ICreateCustomer> {}
