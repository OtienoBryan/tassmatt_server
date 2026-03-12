import { Repository } from 'typeorm';
import { Policy } from '../entities/policy.entity';
export declare class PoliciesService {
    private policyRepository;
    constructor(policyRepository: Repository<Policy>);
    findActive(): Promise<Policy[]>;
    findActiveByType(type: string): Promise<Policy | null>;
    findActiveById(id: number): Promise<Policy | null>;
}
