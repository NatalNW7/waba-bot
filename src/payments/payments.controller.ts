import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentEntity } from './entities/payment.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Create a payment record */
  @Post()
  @ApiOperation({ summary: 'Create payment' })
  @ApiCreatedResponse({
    type: PaymentEntity,
    description: 'Payment record created successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  /** Get all payments */
  @Get()
  @ApiOperation({ summary: 'List all payments' })
  @ApiOkResponse({
    type: [PaymentEntity],
    description: 'List of payments',
  })
  findAll() {
    return this.paymentsService.findAll();
  }

  /** Get a payment record by ID */
  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiOkResponse({ type: PaymentEntity, description: 'Payment found' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  /** Update a payment record */
  @Patch(':id')
  @ApiOperation({ summary: 'Update payment' })
  @ApiOkResponse({
    type: PaymentEntity,
    description: 'Payment updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  /** Delete a payment record */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment' })
  @ApiOkResponse({
    type: PaymentEntity,
    description: 'Payment deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
