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
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionEntity } from './entities/subscription.entity';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /** Create a customer subscription */
  @Post()
  @ApiOperation({ summary: 'Create subscription' })
  @ApiCreatedResponse({
    type: SubscriptionEntity,
    description: 'Subscription created successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  /** Get all subscriptions */
  @Get()
  @ApiOperation({ summary: 'List all subscriptions' })
  @ApiOkResponse({
    type: [SubscriptionEntity],
    description: 'List of subscriptions',
  })
  findAll() {
    return this.subscriptionsService.findAll();
  }

  /** Get a subscription by ID */
  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiOkResponse({ type: SubscriptionEntity, description: 'Subscription found' })
  @ApiNotFoundResponse({ description: 'Subscription not found' })
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(id);
  }

  /** Update a subscription */
  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription' })
  @ApiOkResponse({
    type: SubscriptionEntity,
    description: 'Subscription updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Subscription not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  /** Delete a subscription */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription' })
  @ApiOkResponse({
    type: SubscriptionEntity,
    description: 'Subscription deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Subscription not found' })
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}
