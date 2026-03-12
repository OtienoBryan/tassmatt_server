import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: ['admin', 'manager', 'staff'], default: 'staff' })
  role: 'admin' | 'manager' | 'staff';

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPasswordOnInsert() {
    // Only hash if password is provided and not already hashed
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Don't hash password on update unless it's being changed
  // We'll handle password updates explicitly in the service

  async comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }
}
