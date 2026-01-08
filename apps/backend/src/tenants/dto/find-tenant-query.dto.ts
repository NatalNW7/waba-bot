import { IsOptional, IsString } from 'class-validator';

/**
 * Query parameters for finding a tenant
 */
export class FindTenantQueryDto {
  /**
   * Comma-separated list of relations to include
   * @example "services,saasPlan,appointments,payments,operatingHours,plans,calendar,services,customers"
   */
  @IsString()
  @IsOptional()
  include?: string;
}
