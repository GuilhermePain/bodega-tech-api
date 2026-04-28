import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { Status } from '@/generated/prisma/enums';
import { PrismaService } from '@/shared/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

jest.mock('argon2');

const mockUser = {
  id: 'user-id-1',
  name: 'João Silva',
  email: 'joao@exemplo.com',
  passwordHash: 'hashed_password',
  status: Status.ATIVO,
  refreshToken: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const dto: CreateUserDto = {
      name: 'João Silva',
      email: 'joao@exemplo.com',
      password: 'Senha@123',
    };

    it('deve criar usuário e retornar ReturnUserDto', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.createUser(dto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(argon2.hash).toHaveBeenCalledWith(dto.password);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { name: dto.name, email: dto.email, passwordHash: 'hashed_password' },
      });
      expect(result).toMatchObject({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        status: mockUser.status,
        createdAt: mockUser.createdAt,
      });
    });

    it('deve lançar ConflictException quando o e-mail já estiver cadastrado', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException em caso de erro inesperado', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('falha no banco'));

      await expect(service.createUser(dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findUserById', () => {
    it('deve retornar ReturnUserDto quando o usuário existir', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findUserById('user-id-1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-id-1' } });
      expect(result).toMatchObject({ id: mockUser.id, email: mockUser.email });
    });

    it('deve lançar NotFoundException quando o usuário não existir', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findUserById('id-inexistente')).rejects.toThrow(NotFoundException);
    });

    it('deve lançar InternalServerErrorException em caso de erro inesperado', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('falha no banco'));

      await expect(service.findUserById('user-id-1')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateUser', () => {
    const dto: UpdateUserDto = { name: 'Novo Nome' };

    it('deve atualizar o usuário e retornar ReturnUserDto', async () => {
      const updatedUser = { ...mockUser, name: 'Novo Nome' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser('user-id-1', dto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-1', status: Status.ATIVO, deletedAt: null },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data: { name: 'Novo Nome', email: undefined },
      });
      expect(result).toMatchObject({ name: 'Novo Nome' });
    });

    it('deve lançar NotFoundException quando o usuário não for encontrado ou estiver inativo', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.updateUser('id-inexistente', dto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException em caso de erro inesperado', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('falha no banco'));

      await expect(service.updateUser('user-id-1', dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('desactiveUser', () => {
    it('deve desativar o usuário com sucesso', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, status: Status.INATIVO });

      await expect(service.desactiveUser('user-id-1')).resolves.toBeUndefined();

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-1', status: Status.ATIVO, deletedAt: null },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data: expect.objectContaining({ status: Status.INATIVO }),
      });
    });

    it('deve lançar NotFoundException quando o usuário não for encontrado ou já estiver inativo', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.desactiveUser('id-inexistente')).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException em caso de erro inesperado', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('falha no banco'));

      await expect(service.desactiveUser('user-id-1')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('activeUser', () => {
    const inactiveUser = { ...mockUser, status: Status.INATIVO, deletedAt: new Date() };

    it('deve ativar o usuário com sucesso', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, status: Status.ATIVO, deletedAt: null });

      await expect(service.activeUser('user-id-1')).resolves.toBeUndefined();

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-1', status: Status.INATIVO },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data: { status: Status.ATIVO, deletedAt: null },
      });
    });

    it('deve lançar NotFoundException quando o usuário não for encontrado ou já estiver ativo', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.activeUser('id-inexistente')).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException em caso de erro inesperado', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('falha no banco'));

      await expect(service.activeUser('user-id-1')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
