import {
  NotFoundException,
  ConflictException,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/PrismaService';
import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Decimal } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';

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

    const updateUserDto: UpdateUserDTO = {
      name: 'Updated User',
      email: 'updated@example.com',
      password: 'NewPassword123',
    };

    it('should update the user', async () => {
      const updatedUser = {
        ...fakeUser,
        ...updateUserDto,
        password: 'NewHashedPassword123',
      };

      const bcryptHashMock = jest
        .fn()
        .mockResolvedValue('NewHashedPassword123');

      jest.spyOn(bcrypt, 'hash').mockImplementation(bcryptHashMock);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(fakeUser);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser);

      const response = await service.update(userId, updateUserDto, fakeUser);

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
      const userId = '123';

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      try {
        await service.update(
          userId,
          {
            ...fakeUser,
            name: 'Updated User',
          },
          { id: '1', admin: false },
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe("User doesn't exists");
      }

      expect(prisma.user.findUnique).toBeCalledWith({ where: { id: userId } });
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw a NotAcceptableException if user to be updated use an invalid password', async () => {
      const userId = '1';

      try {
        await service.update(userId, { ...fakeUser, password: 'invalid' }, {});
      } catch (error) {
        expect(error).toBeInstanceOf(NotAcceptableException);
        expect(error.message).toBe(
          'The password must have at least 8 characters, including one uppercase letter, one lowercase letter, and one number',
        );
      }

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw a NotAcceptableException if user to be updated use an invalid email', async () => {
      const userId = '1';

      try {
        await service.update(userId, { ...fakeUser, email: 'invalid' }, {});
      } catch (error) {
        expect(error).toBeInstanceOf(NotAcceptableException);
        expect(error.message).toBe('Use a valid Email');
      }

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete the user', async () => {
      const userId = '1';

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(fakeUser);

      const response = await service.delete(userId, fakeUser);

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
      const userId = '1';

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      try {
        await service.delete(userId, fakeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe("User doesn't exists");
      }

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw an UnauthorizedException if user to be deleted is not the user himself', async () => {
      const userId = '1';

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(fakeUser);

      try {
        await service.delete(userId, { ...fakeUser, id: '3' });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should delete a user if is the admin', async () => {
      const userId = '1';

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(fakeUser);

      const response = await service.delete(userId, {
        ...fakeUser,
        id: '3',
        admin: true,
      });

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
  });
});
