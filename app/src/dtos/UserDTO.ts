import { IsString, IsEmail, IsBoolean, IsOptional } from 'class-validator';

export class UserDTO {
    name!: string;
    email!: string;
    role!: string;
    isOnboarded!: boolean;
    createdAt!: Date;
    deletedAt?: Date;
    updatedAt!: Date;
  }
  