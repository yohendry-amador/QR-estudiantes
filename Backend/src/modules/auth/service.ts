import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/service';
import { Role } from '@prisma/client';

export interface TokenPayload { userId: string; email: string; role: Role }
export interface AuthTokens { accessToken: string; refreshToken: string }
export interface UserResponse { id: string; email: string; role: Role }

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas');

    if (!user.isActive) throw new UnauthorizedException('Usuario desactivado');

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{ tokens: AuthTokens; user: UserResponse }> {
    const user = await this.validateUser(email, password);
    const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    await this.auditService.log({ userId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id, ipAddress, userAgent });

    return { tokens: { accessToken, refreshToken }, user };
  }

  async register(email: string, password: string, role: Role = Role.STUDENT, ipAddress?: string, userAgent?: string): Promise<{ id: string }> {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ConflictException('El email ya está registrado');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({ data: { email, passwordHash, role } });

    await this.auditService.log({ userId: user.id, action: 'REGISTER', entityType: 'User', entityId: user.id, ipAddress, userAgent });

    return { id: user.id };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = await this.jwtService.verifyAsync<{ userId: string }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user || !user.isActive) throw new UnauthorizedException('Refresh token inválido');

      const newPayload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = await this.generateRefreshToken(user.id);

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    return this.jwtService.sign(
      { userId },
      { secret: this.configService.get<string>('JWT_REFRESH_SECRET'), expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d') },
    );
  }

  async getUserById(userId: string): Promise<UserResponse | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true } });
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Contraseña actual incorrecta');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    await this.auditService.log({ userId, action: 'CHANGE_PASSWORD', entityType: 'User', entityId: userId });
  }
}