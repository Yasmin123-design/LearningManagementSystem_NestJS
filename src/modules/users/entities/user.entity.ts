import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Role } from '../../../common/decorators/roles.decorator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.STUDENT,
  })
  role: Role;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  verificationToken: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  resetPasswordExpires: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
