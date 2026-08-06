import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LoginDto, LoginResponseDto, RegisterDto, RefreshTokenDto, RefreshTokenResponseDto, UserResponseDto, ChangePasswordDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto, @Req() request: Request): Promise<LoginResponseDto> {
    const userAgent = request.headers['user-agent'] || undefined;
    const result = await this.authService.login(loginDto.email, loginDto.password, undefined, userAgent);
    return {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: { id: result.user.id, email: result.user.email, role: result.user.role },
    };
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  async register(@Body() registerDto: RegisterDto): Promise<{ id: string }> {
    return this.authService.register(registerDto.email, registerDto.password, registerDto.role);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiResponse({ status: 200, description: 'Tokens refrescados', type: RefreshTokenResponseDto })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    const tokens = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Usuario actual', type: UserResponseDto })
  async getCurrentUser(@CurrentUser() user: CurrentUserPayload): Promise<UserResponseDto> {
    const userData = await this.authService.getUserById(user.userId);
    return { id: userData!.id, email: userData!.email, role: userData!.role };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  async changePassword(@CurrentUser() user: CurrentUserPayload, @Body() dto: ChangePasswordDto): Promise<{ message: string }> {
    await this.authService.changePassword(user.userId, dto.currentPassword, dto.newPassword);
    return { message: 'Contraseña actualizada correctamente' };
  }
}