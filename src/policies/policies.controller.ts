import { Controller, Get, Param } from '@nestjs/common';
import { PoliciesService } from './policies.service';

@Controller('api/policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get()
  async findAll() {
    return this.policiesService.findActive();
  }

  @Get('type/:type')
  async findByType(@Param('type') type: string) {
    return this.policiesService.findActiveByType(type);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return null;
    }
    return this.policiesService.findActiveById(idNum);
  }
}
