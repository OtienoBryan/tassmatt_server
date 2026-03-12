export declare class Staff {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    isActive: boolean;
    role: 'admin' | 'manager' | 'staff';
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
    hashPasswordOnInsert(): Promise<void>;
    comparePassword(plainPassword: string): Promise<boolean>;
}
