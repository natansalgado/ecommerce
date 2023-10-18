import {
  NotFoundException,
  ConflictException,
  NotAcceptableException,
} from '@nestjs/common';
import { PrismaService } from '../../database/PrismaService';
import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from '@prisma/client/runtime/library';

const fakeUser = {
  id: '1',
  name: 'John Test',
  email: 'john@email.com',
  password: 'Password123',
  address: 'Av. Street 123',
  balance: new Decimal(0),
  admin: false,
  created_at: new Date(),
  updated_at: new Date(),
};

const fakeCart = {
  user_id: fakeUser.id,
};

const prismaMock = {
  user: {
    create: jest.fn().mockReturnValue(fakeUser),
    findMany: jest.fn().mockResolvedValue([fakeUser]),
    findUnique: jest.fn().mockResolvedValue(fakeUser),
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
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const response = await service.create(fakeUser);

      expect(response).toEqual({
        ...fakeUser,
        cart: fakeCart,
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: fakeUser.email },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({ data: fakeUser });
      expect(prisma.cart.create).toHaveBeenCalledWith({
        data: { user_id: fakeUser.id },
      });
    });

    it('should throw a ConflictException if email is already in use', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(fakeUser);

      try {
        await service.create(fakeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('Email already in use');
      }

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: fakeUser.email },
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
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

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
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

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const response = await service.findAll();

      expect(response).toEqual([fakeUser]);
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

    const updateUserDto = {
      name: 'Updated User',
      email: 'updated@example.com',
      password: 'NewPassword123',
    };

    const updatedUser = {
      ...fakeUser,
      ...updateUserDto,
      password: 'HashedPassword123',
    };

    it('should update the user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(fakeUser);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser);

      const response = await service.update(userId, updateUserDto);

      expect(response).toEqual(updatedUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        data: updateUserDto,
        where: { id: userId },
      });
    });

    it('should throw a NotFoundException if user to be updated does not exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      try {
        await service.update(userId, fakeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe("User doesn't exists");
      }

      expect(prisma.user.findUnique).toBeCalledWith({ where: { id: userId } });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw a NotAcceptableException if user to be updated use an invalid password', async () => {
      try {
        await service.update(userId, { ...fakeUser, password: 'invalid' });
      } catch (error) {
        expect(error).toBeInstanceOf(NotAcceptableException);
        expect(error.message).toBe(
          'The password must have at least 8 characters, including one uppercase letter, one lowercase letter, and one number',
        );
      }

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw a NotAcceptableException if user to be updated use an invalid email', async () => {
      try {
        await service.update(userId, { ...fakeUser, email: 'invalid' });
      } catch (error) {
        expect(error).toBeInstanceOf(NotAcceptableException);
        expect(error.message).toBe('Use a valid Email');
      }

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const userId = '1';

    it('should delete the user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(fakeUser);

      const response = await service.delete(userId);

      expect(response).toEqual({
        success: `User '${fakeUser.name}' deleted`,
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw a NotFoundException if user to be deleted does not exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      try {
        await service.delete(userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe("User doesn't exists");
      }

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
