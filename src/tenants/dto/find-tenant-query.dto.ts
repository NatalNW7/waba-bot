import { IsOptional, IsString } from 'class-validator';

/**
 * Query parameters for finding a tenant
 */
export class FindTenantQueryDto {
  /**
   * Comma-separated list of relations to include
   * @example "services,saasPlan,appointments"
   */
  @IsString()
  @IsOptional()
  include?: string;
}
