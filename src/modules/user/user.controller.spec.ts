import { ConflictException, NotAcceptableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../database/PrismaService';

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

describe('UserController', () => {
  let prisma: PrismaService;
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(fakeUser);

      const result = await controller.create(fakeUser);

      expect(result).toEqual({ ...fakeUser, cart: fakeCart });
      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw a ConflictException if email is already in use', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(fakeUser);

      try {
        await controller.create(fakeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('Email already in use');
      }

      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw a NotAcceptableException for an invalid password', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      try {
        await controller.create({ ...fakeUser, password: 'invalid' });
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
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      try {
        await controller.create({ ...fakeUser, email: 'invalid' });
      } catch (error) {
        expect(error).toBeInstanceOf(NotAcceptableException);
        expect(error.message).toBe('Use a valid Email');
      }

      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return a array of users', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([fakeUser]);
    });
  });
});
