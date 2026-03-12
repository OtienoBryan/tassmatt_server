import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Policy, PolicyType } from '../entities/policy.entity';

@Injectable()
export class PoliciesService {
  constructor(
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
  ) {}

  async findActive(): Promise<Policy[]> {
    return this.policyRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByType(type: string): Promise<Policy | null> {
    return this.policyRepository.findOne({
      where: { type: type as PolicyType, isActive: true },
      order: { updatedAt: 'DESC' },
    });
  }

  async findActiveById(id: number): Promise<Policy | null> {
    return this.policyRepository.findOne({
      where: { id, isActive: true },
    });
  }
}
