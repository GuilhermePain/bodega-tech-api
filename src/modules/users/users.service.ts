import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Status } from '@/generated/prisma/enums';
import { PrismaService } from '@/shared/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ReturnUserDto } from './dto/return-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) { }

  async createUser(createUserDto: CreateUserDto): Promise<ReturnUserDto> {
    try {
      const { name, email, password } = createUserDto;

      const existingUser = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('E-mail já cadastrado.');
      }

      const passwordHash = await argon2.hash(password);

      const user = await this.prismaService.user.create({
        data: { name, email, passwordHash },
      });

      return new ReturnUserDto(user);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Houve um erro interno ao criar usuário.');
    }
  }

  async findUserById(userId: string): Promise<ReturnUserDto> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      return new ReturnUserDto(user);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Houve um erro interno ao buscar usuário.');
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<ReturnUserDto> {
    try {
      const { name, email } = updateUserDto;

      const existingUser = await this.prismaService.user.findUnique({
        where: { id: userId, status: Status.ATIVO, deletedAt: null },
      });

      if (!existingUser) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      const updatedUser = await this.prismaService.user.update({
        where: { id: userId },
        data: { name, email },
      });

      return new ReturnUserDto(updatedUser);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Houve um erro interno ao atualizar usuário.');
    }
  }

  async desactiveUser(userId: string): Promise<void> {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: { id: userId, status: Status.ATIVO, deletedAt: null },
      });

      if (!existingUser) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      await this.prismaService.user.update({
        where: { id: userId },
        data: { status: Status.INATIVO, deletedAt: new Date() },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Houve um erro interno ao desativar usuário.');
    }
  }

  async activeUser(userId: string): Promise<void> {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: { id: userId, status: Status.INATIVO },
      });

      if (!existingUser) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      await this.prismaService.user.update({
        where: { id: userId },
        data: { status: Status.ATIVO, deletedAt: null },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Houve um erro interno ao ativar usuário.');
    }
  }
}
