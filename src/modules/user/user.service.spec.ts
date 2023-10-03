import {
  NotFoundException,
  ConflictException,
  NotAcceptableException,
} from '@nestjs/common';
import { PrismaService } from '../../database/PrismaService';
import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Decimal } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';

const fakeUser = {
  id: '1',
  name: 'John Carvalho',
  email: 'john@email.com',
  password: 'Senha123',
  address: 'Av. Cachoeira 324',
};

const fakeCart = {
  user_id: fakeUser.id,
};

const prismaMock = {
  user: {
    create: jest.fn().mockReturnValue(fakeUser),
    findMany: jest.fn().mockResolvedValue(fakeUser),
    findUnique: jest.fn().mockResolvedValue(fakeUser),
    findFirst: jest.fn().mockResolvedValue(fakeUser),
    update: jest.fn().mockResolvedValue(fakeUser),
    delete: jest.fn().mockResolvedValue(fakeUser),
  },
  cart: {
    create: jest.fn().mockResolvedValue(fakeCart),
  },
};

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      const response = await service.create(fakeUser);

      expect(response).toEqual({
        ...fakeUser,
        cart: { user_id: fakeUser.id },
      });
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: fakeUser.email },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({ data: fakeUser });
      expect(prisma.cart.create).toHaveBeenCalledWith({
        data: { user_id: fakeUser.id },
      });
    });

    it('should throw a ConflictException if email is already in use', async () => {
      try {
        await service.create(fakeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('Email already in use');
      }

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: fakeUser.email },
      });
    });

    it('should throw a NotAcceptableException for an invalid password', async () => {
      const createUserDto = {
        ...fakeUser,
        password: 'invalid',
      };

      try {
        await service.create(createUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotAcceptableException);
        expect(error.message).toBe(
          'The password must have at least 8 characters, including one uppercase letter, one lowercase letter, and one number',
        );
      }
    });

    it('should throw a NotAcceptableException for an invalid email', async () => {
      const createUserDto = {
        ...fakeUser,
        email: 'invalid_email',
      };

      try {
        await service.create(createUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotAcceptableException);
        expect(error.message).toBe('Use a valid Email');
      }
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const response = await service.findAll();

      expect(response).toEqual(fakeUser);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const response = await service.findOne('1');

      expect(response).toEqual(fakeUser);
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return NotFoundException when user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      try {
        await service.findOne('99');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '99' },
      });
    });
  });

  describe('update', () => {
    const userId = '1';

    const updateUserDto: UpdateUserDTO = {
      name: 'Updated User',
      email: 'updated@example.com',
      password: 'NewPassword123',
    };

    const existingUser = {
      id: '1',
      name: 'Old User',
      email: 'old@example.com',
      password: 'OldHashedPassword123',
      address: '123 Main St',
      balance: new Decimal(0),
      admin: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should update the user', async () => {
      const updatedUser = {
        ...existingUser,
        ...updateUserDto,
        password: 'NewHashedPassword123',
      };

      const bcryptHashMock = jest
        .fn()
        .mockResolvedValue('NewHashedPassword123');

      jest.spyOn(bcrypt, 'hash').mockImplementation(bcryptHashMock);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(existingUser);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto, existingUser);

      expect(result).toEqual(updatedUser);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        data: updateUserDto,
        where: { id: userId },
      });
    });
  });
});
