/**
 * Service entity interface
 */
export interface IService {
  id: string;
  name: string;
  price: string | number;
  duration: number;
  tenantId: string;
}

/**
 * Create service request interface
 */
export interface ICreateService {
  name: string;
  price: number;
  duration: number;
  tenantId: string;
}

/**
 * Update service request interface
 */
export interface IUpdateService extends Partial<Omit<ICreateService, 'tenantId'>> {}
