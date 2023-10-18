import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../database/PrismaService';
import { Request } from 'express';

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
  id: '1',
  user_id: fakeUser.id,
  total_price: new Decimal(0),
  created_at: new Date(),
  updated_at: new Date(),
};

const himselfReq = {
  user: { ...fakeUser },
} as unknown as Request;

const adminReq = {
  user: { ...fakeUser, id: '2', admin: true },
} as unknown as Request;

const otherReq = {
  user: { ...fakeUser, id: '2' },
} as unknown as Request;

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

describe('UsersController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      jest
        .spyOn(service, 'create')
        .mockResolvedValue({ ...fakeUser, cart: fakeCart });

      const response = await controller.create(fakeUser);

      expect(response).toEqual({ ...fakeUser, cart: fakeCart });
      expect(service.create).toHaveBeenCalledWith(fakeUser);
    });
  });

  describe('findAll', () => {
    it('should return all the users as administrator', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([fakeUser]);

      const response = await controller.findAll(adminReq);

      expect(response).toEqual([fakeUser]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should throw an UnauthorizedException if user is not an admin', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([fakeUser]);

      try {
        await controller.findAll(himselfReq);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('you are not allowed to do this');
      }

      expect(service.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const id = '1';

    it('should return one user as administrator', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(fakeUser);

      const response = await controller.findOne(id, adminReq);

      expect(response).toEqual(fakeUser);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw an UnauthorizedException if user is not an admin', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(fakeUser);

      try {
        await controller.findOne(id, himselfReq);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('you are not allowed to do this');
      }

      expect(service.findOne).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const id = '1';

    const data = {
      name: 'Updated Name',
      password: 'NewPassword123',
    };

    const updatedUser = {
      ...data,
      ...fakeUser,
    };

    it('should update the user as himself', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);

      const response = await controller.update(id, data, himselfReq);

      expect(response).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(id, data);
    });

    it('should update the user as administrator', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);

      const response = await controller.update(id, data, adminReq);

      expect(response).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(id, data);
    });

    it('should throw an UnauthorizedException if user is not himself nor a administrator', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(fakeUser);

      try {
        await controller.update(id, data, otherReq);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('you are not allowed to do this');
      }

      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const id = '1';

    it('should delete the user as himself', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue({
        success: `User '${fakeUser.name}' deleted`,
      });

      const result = await controller.delete(himselfReq, id);

      expect(result).toEqual({
        success: `User '${fakeUser.name}' deleted`,
      });
      expect(service.delete).toHaveBeenCalledWith(id);
    });

    it('should delete the user as administrator', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue({
        success: `User '${fakeUser.name}' deleted`,
      });

      const result = await controller.delete(adminReq, id);

      expect(result).toEqual({
        success: `User '${fakeUser.name}' deleted`,
      });
      expect(service.delete).toHaveBeenCalledWith(id);
    });

    it('should throw an UnauthorizedException if user to be deleted is not the user himself', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue({
        success: `User '${fakeUser.name}' deleted`,
      });

      try {
        await controller.delete(otherReq, id);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('you are not allowed to do this');
      }

      expect(service.delete).not.toHaveBeenCalled();
    });
  });
});
