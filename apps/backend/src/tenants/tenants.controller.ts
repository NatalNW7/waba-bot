import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantEntity } from './entities/tenant.entity';
import { FindTenantQueryDto } from './dto/find-tenant-query.dto';

@ApiTags('Tenants')
@ApiBearerAuth('JWT')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /** Create a new tenant */
  @Post()
  @ApiOperation({ summary: 'Create tenant' })
  @ApiCreatedResponse({
    type: TenantEntity,
    description: 'Tenant created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or SaaS plan does not exist',
  })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  /** Get all tenants */
  @Get()
  @ApiOperation({ summary: 'List all tenants' })
  @ApiOkResponse({ type: [TenantEntity], description: 'List of tenants' })
  findAll() {
    return this.tenantsService.findAll();
  }

  /** Get a tenant by ID */
  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiOkResponse({ type: TenantEntity, description: 'Tenant found' })
  @ApiNotFoundResponse({ description: 'Tenant not found' })
  findOne(@Param('id') id: string, @Query() query: FindTenantQueryDto) {
    return this.tenantsService.findOne(id, query.include);
  }

  /** Update a tenant */
  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant' })
  @ApiOkResponse({
    type: TenantEntity,
    description: 'Tenant updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Tenant not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  /** Create a SaaS subscription for a tenant */
  @Post(':id/subscribe')
  @ApiOperation({ summary: 'Create SaaS subscription for tenant' })
  @ApiOkResponse({ description: 'Subscription created' })
  @ApiNotFoundResponse({ description: 'Tenant not found' })
  subscribe(@Param('id') id: string) {
    return this.tenantsService.createSubscription(id);
  }

  /** Redirect to Mercado Pago OAuth */
  @Get(':id/auth/mercadopago')
  @ApiOperation({ summary: 'Get Mercado Pago OAuth URL' })
  @ApiOkResponse({ description: 'OAuth URL returned' })
  getMpAuth(@Param('id') id: string) {
    return { url: this.tenantsService.getMpAuthorizationUrl(id) };
  }

  /** Mercado Pago OAuth Callback */
  @Get('auth/mercadopago/callback')
  @ApiOperation({ summary: 'Mercado Pago OAuth Callback' })
  handleMpCallback(@Query('code') code: string, @Query('state') state: string) {
    return this.tenantsService.exchangeMpCode(code, state);
  }

  /** Delete a tenant */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete tenant' })
  @ApiOkResponse({
    type: TenantEntity,
    description: 'Tenant deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Tenant not found' })
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
