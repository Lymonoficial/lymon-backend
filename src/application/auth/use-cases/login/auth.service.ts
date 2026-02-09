import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { UserRepository } from '@/domain/users/repositories/user.repository';
import { User } from '@/domain/users/entities/user.entity';
import { LoginDto } from '@/presentation/dtos/auth/login.dto';
import { RegisterUserDto } from '@/presentation/dtos/users/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Crear usuario (MongoDB generará el ID automáticamente)
    const user = User.create({
      id: '', // Se generará automáticamente por MongoDB
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    const savedUser = await this.userRepository.create(user);

    // Generar token
    const token = this.generateToken(savedUser);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
      },
      access_token: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      access_token: token,
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
