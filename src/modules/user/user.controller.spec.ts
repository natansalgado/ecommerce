import {
  ConflictException,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../database/PrismaService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

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

    it('should throw a NotAcceptableException if email is invalid', async () => {
      const invalidUserData = { ...fakeUser, email: 'invalid' };

      jest.spyOn(service, 'create').mockImplementation(() => {
        throw new NotAcceptableException('Use a valid Email');
      });

      try {
        await controller.create(invalidUserData);
      } catch (error) {
        expect(error).toBeInstanceOf(NotAcceptableException);
        expect(error.message).toBe('Use a valid Email');
      }

      expect(service.create).toHaveBeenCalledWith(invalidUserData);
    });

    it('should throw a NotAcceptableException if password is invalid', async () => {
      const invalidUserData = { ...fakeUser, password: 'invalid' };

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(
          new NotAcceptableException(
            'The password must have at least 8 characters, including one uppercase letter, one lowercase letter, and one number',
          ),
        );

      try {
        await controller.create(invalidUserData);
      } catch (error) {
        expect(error).toBeInstanceOf(NotAcceptableException);
        expect(error.message).toBe(
          'The password must have at least 8 characters, including one uppercase letter, one lowercase letter, and one number',
        );
      }

      expect(service.create).toHaveBeenCalledWith(invalidUserData);
    });

    it('should throw a ConflictException if email is already in use', async () => {
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new ConflictException('Email already in use'));

      try {
        await controller.create(fakeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('Email already in use');
      }

      expect(service.create).toHaveBeenCalledWith(fakeUser);
    });
  });

  describe('findAll', () => {
    it('should return all the users', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([fakeUser]);

      const response = await controller.findAll();

      expect(response).toEqual([fakeUser]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const id = '1';

    it('should return one user', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(fakeUser);

      const response = await controller.findOne(id);

      expect(response).toEqual(fakeUser);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw a NotFoundException if user does not exist', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException("User doesn't exists"));

      try {
        await controller.findOne(id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe("User doesn't exists");
      }

      expect(service.findOne).toHaveBeenCalledWith(id);
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
      expect(service.update).toHaveBeenCalledWith(id, data, himselfReq.user);
    });

    it('should update the user as administrator', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);

      const response = await controller.update(id, data, adminReq);

      expect(response).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith(id, data, adminReq.user);
    });

    it('should throw a  UnauthorizedException if user is not himself nor a administrator', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(
          new UnauthorizedException(
            'Only the user himself or an admin can update his account',
          ),
        );

      try {
        await controller.update(id, data, otherReq);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe(
          'Only the user himself or an admin can update his account',
        );
      }

      expect(service.update).toHaveBeenCalledWith(id, data, otherReq.user);
    });

    it('should throw a NotFoundException if user does not exist', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new NotFoundException("User doesn't exists"));

      try {
        await controller.update(id, data, himselfReq);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe("User doesn't exists");
      }

      expect(service.update).toHaveBeenCalledWith(id, data, himselfReq.user);
    });

    it('should throw a NotAcceptableException if email is invalid', async () => {
      jest.spyOn(service, 'update').mockImplementation(() => {
        throw new NotAcceptableException('Use a valid Email');
      });

      try {
        await controller.update(id, { ...data, email: 'invalid' }, himselfReq);
      } catch (error) {
        expect(error).toBeInstanceOf(NotAcceptableException);
        expect(error.message).toBe('Use a valid Email');
      }

      expect(service.update).toHaveBeenCalledWith(
        id,
        {
          ...data,
          email: 'invalid',
        },
        himselfReq.user,
      );
    });

    it('should throw a NotAcceptableException if password is invalid', async () => {
      jest.spyOn(service, 'update').mockImplementation(() => {
        throw new NotAcceptableException(
          'The password must have at least 8 characters, including one uppercase letter, one lowercase letter, and one number',
        );
      });

      try {
        await controller.update(
          id,
          { ...data, password: 'invalid' },
          himselfReq,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotAcceptableException);
        expect(error.message).toBe(
          'The password must have at least 8 characters, including one uppercase letter, one lowercase letter, and one number',
        );
      }

      expect(service.update).toHaveBeenCalledWith(
        id,
        {
          ...data,
          password: 'invalid',
        },
        himselfReq.user,
      );
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
      expect(service.delete).toHaveBeenCalledWith(id, himselfReq.user);
    });

    it('should delete the user as administrator', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue({
        success: `User '${fakeUser.name}' deleted`,
      });

      const result = await controller.delete(adminReq, id);

      expect(result).toEqual({
        success: `User '${fakeUser.name}' deleted`,
      });
      expect(service.delete).toHaveBeenCalledWith(id, adminReq.user);
    });

    it('should throw a NotFoundException if user to be deleted does not exist', async () => {
      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new NotFoundException("User doesn't exists"));

      try {
        await controller.delete(himselfReq, id);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe("User doesn't exists");
      }

      expect(service.delete).toHaveBeenCalledWith(id, himselfReq.user);
    });

    it('should throw an UnauthorizedException if user to be deleted is not the user himself', async () => {
      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(
          new UnauthorizedException(
            'Only the user himself or an admin can update his account',
          ),
        );

      try {
        await controller.delete(otherReq, id);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe(
          'Only the user himself or an admin can update his account',
        );
      }

      expect(service.delete).toHaveBeenCalledWith(id, otherReq.user);
    });
  });
});
