import { Test, TestingModule } from '@nestjs/testing';
import { Status } from '@/generated/prisma/enums';
import { CreateUserDto } from './dto/create-user.dto';
import { ReturnUserDto } from './dto/return-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockReturnUser: ReturnUserDto = {
  id: 'user-id-1',
  name: 'João Silva',
  email: 'joao@exemplo.com',
  status: Status.ATIVO,
  createdAt: new Date('2026-01-01'),
};

const mockUsersService = {
  createUser: jest.fn(),
  findUserById: jest.fn(),
  updateUser: jest.fn(),
  desactiveUser: jest.fn(),
  activeUser: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('deve chamar UsersService.createUser e retornar o resultado', async () => {
      const dto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'Senha@123',
      };
      mockUsersService.createUser.mockResolvedValue(mockReturnUser);

      const result = await controller.createUser(dto);

      expect(mockUsersService.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockReturnUser);
    });
  });

  describe('findUserById', () => {
    it('deve chamar UsersService.findUserById e retornar o resultado', async () => {
      mockUsersService.findUserById.mockResolvedValue(mockReturnUser);

      const result = await controller.findUserById('user-id-1');

      expect(mockUsersService.findUserById).toHaveBeenCalledWith('user-id-1');
      expect(result).toEqual(mockReturnUser);
    });
  });

  describe('updateUser', () => {
    it('deve chamar UsersService.updateUser e retornar o resultado', async () => {
      const dto: UpdateUserDto = { name: 'Novo Nome' };
      const updated = { ...mockReturnUser, name: 'Novo Nome' };
      mockUsersService.updateUser.mockResolvedValue(updated);

      const result = await controller.updateUser('user-id-1', dto);

      expect(mockUsersService.updateUser).toHaveBeenCalledWith('user-id-1', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('activeUser', () => {
    it('deve chamar UsersService.activeUser', async () => {
      mockUsersService.activeUser.mockResolvedValue(undefined);

      const result = await controller.activeUser('user-id-1');

      expect(mockUsersService.activeUser).toHaveBeenCalledWith('user-id-1');
      expect(result).toBeUndefined();
    });
  });

  describe('desactiveUser', () => {
    it('deve chamar UsersService.desactiveUser', async () => {
      mockUsersService.desactiveUser.mockResolvedValue(undefined);

      const result = await controller.desactiveUser('user-id-1');

      expect(mockUsersService.desactiveUser).toHaveBeenCalledWith('user-id-1');
      expect(result).toBeUndefined();
    });
  });
});
