import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  email: string;
  @ApiProperty({ enum: Role })
  role: Role;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
  @ApiProperty()
  user: UserResponseDto;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, example: Role.STUDENT })
  @IsEnum(Role)
  role: Role;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
}