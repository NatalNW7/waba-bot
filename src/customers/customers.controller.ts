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
  ApiQuery,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerEntity } from './entities/customer.entity';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /** Create a new customer */
  @Post()
  @ApiOperation({ summary: 'Create customer' })
  @ApiCreatedResponse({
    type: CustomerEntity,
    description: 'Customer created successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or customer already exists',
  })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    description: 'ID of the tenant',
  })
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.customersService.create(tenantId, createCustomerDto);
  }

  /** Get all customers */
  @Get()
  @ApiOperation({ summary: 'List all customers' })
  @ApiOkResponse({ type: [CustomerEntity], description: 'List of customers' })
  findAll() {
    return this.customersService.findAll();
  }

  /** Get a customer by ID */
  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiOkResponse({ type: CustomerEntity, description: 'Customer found' })
  @ApiNotFoundResponse({ description: 'Customer not found' })
  @ApiQuery({
    name: 'include',
    required: false,
    description: 'Comma-separated list of relations to include',
    example: 'tenants,appointments,payments',
  })
  findOne(@Param('id') id: string, @Query('include') include?: string) {
    return this.customersService.findOne(id, include);
  }

  /** Update a customer */
  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiOkResponse({
    type: CustomerEntity,
    description: 'Customer updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Customer not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  /** Delete a customer */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer' })
  @ApiOkResponse({
    type: CustomerEntity,
    description: 'Customer deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Customer not found' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
