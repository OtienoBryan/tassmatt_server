import { PoliciesService } from './policies.service';
export declare class PoliciesController {
    private readonly policiesService;
    constructor(policiesService: PoliciesService);
    findAll(): Promise<import("../entities/policy.entity").Policy[]>;
    findByType(type: string): Promise<import("../entities/policy.entity").Policy | null>;
    findOne(id: string): Promise<import("../entities/policy.entity").Policy | null>;
}
