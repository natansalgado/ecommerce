import { PrismaService } from '../../database/PrismaService';
import { ProductService } from './product.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Decimal } from '@prisma/client/runtime/library';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateProductDTO } from './dto/update-product.dto';

const fakeProduct = {
  id: '1',
  title: 'Fake Product',
  description: 'Fake product description',
  price: new Decimal(10),
  quantity: 3,
  sold: 0,
  ratings: 0,
  stars: 0,
  image_url: 'http://image.png',
  store_id: '1',
  created_at: new Date(),
  updated_at: new Date(),
};

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

const fakeStore = {
  id: '1',
  owner_id: '1',
  balance: new Decimal(0),
  name: 'Store 1',
  created_at: new Date(),
  updated_at: new Date(),
};

const prismaMock = {
  product: {
    create: jest.fn().mockReturnValue(fakeProduct),
    findMany: jest.fn().mockResolvedValue([fakeProduct]),
    findUnique: jest.fn().mockResolvedValue(fakeProduct),
    update: jest.fn().mockResolvedValue(fakeProduct),
    delete: jest.fn().mockResolvedValue(fakeProduct),
  },
  store: {
    findUnique: jest.fn().mockResolvedValue(fakeStore),
  },
};

describe('productService', () => {
  let service: ProductService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all the products', async () => {
      const response = await service.findAll();

      expect(response).toEqual([fakeProduct]);
      expect(prisma.product.findMany).toBeCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return one product', async () => {
      const productId = '1';

      const response = await service.findOne(productId);

      expect(response).toBe(fakeProduct);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: { store: true },
      });
    });

    it('should throw a NotFoundException if the product does not exist', async () => {
      const productId = '1';

      jest.spyOn(prisma.product, 'findUnique').mockResolvedValue(null);

      try {
        await service.findOne(productId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe("Product doesn't exists");
      }

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: { store: true },
      });
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const response = await service.create(fakeProduct, fakeUser);

      expect(response).toEqual(fakeProduct);
      expect(prisma.store.findUnique).toHaveBeenCalledWith({
        where: { owner_id: fakeUser.id },
      });
      expect(prisma.product.create).toHaveBeenCalledWith({ data: fakeProduct });
    });

    it('should throw a NotFoundException if the store does not exist', async () => {
      jest.spyOn(prisma.store, 'findUnique').mockResolvedValue(null);

      try {
        await service.create(fakeProduct, fakeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe("Store doesn't exists");
      }

      expect(prisma.store.findUnique).toHaveBeenCalledWith({
        where: { owner_id: fakeUser.id },
      });
      expect(prisma.product.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const productId = '1';

    const updateProductDto: UpdateProductDTO = {
      title: 'Updated Product',
      image_url: 'http://updatedproduct.png',
      sold: 2,
    };

    it('should update the product as the store owner', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValue(fakeProduct);
      jest.spyOn(prisma.store, 'findUnique').mockResolvedValue(fakeStore);
      jest
        .spyOn(prisma.product, 'update')
        .mockResolvedValue({ ...fakeProduct, ...updateProductDto });

      const response = await service.update(
        productId,
        { ...fakeProduct, ...updateProductDto },
        fakeUser,
      );

      expect(response).toEqual({
        ...fakeProduct,
        ...updateProductDto,
      });
      expect(prisma.product.findUnique).toBeCalledWith({
        where: { id: productId },
      });
      expect(prisma.store.findUnique).toBeCalledWith({
        where: { owner_id: fakeUser.id },
      });
      expect(prisma.product.update).toBeCalledWith({
        data: { ...fakeProduct, ...updateProductDto },
        where: { id: productId },
      });
    });

    it('should update the product as administrator', async () => {
      jest
        .spyOn(prisma.product, 'findUnique')
        .mockResolvedValue({ ...fakeProduct, store_id: '123' });
      jest.spyOn(prisma.store, 'findUnique').mockResolvedValue(fakeStore);
      jest
        .spyOn(prisma.product, 'update')
        .mockResolvedValue({ ...fakeProduct, ...updateProductDto });

      const response = await service.update(
        productId,
        { ...fakeProduct, ...updateProductDto },
        { ...fakeUser, admin: true },
      );

      expect(response).toEqual({
        ...fakeProduct,
        ...updateProductDto,
      });
      expect(prisma.product.findUnique).toBeCalledWith({
        where: { id: productId },
      });
      expect(prisma.store.findUnique).toBeCalledWith({
        where: { owner_id: fakeUser.id },
      });
      expect(prisma.product.update).toBeCalledWith({
        data: { ...fakeProduct, ...updateProductDto },
        where: { id: productId },
      });
    });

    it('should throw a NotFoundException if the product does not exist', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValue(null);

      try {
        await service.update(productId, { title: 'Error' }, fakeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe("Product doesn't exists");
      }

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prisma.store.findUnique).not.toHaveBeenCalled();
      expect(prisma.product.update).not.toHaveBeenCalled();
    });

    it('should throw a NotFoundException if the store does not exist', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValue(fakeProduct);
      jest.spyOn(prisma.store, 'findUnique').mockResolvedValue(null);

      try {
        await service.update(productId, { title: 'Error' }, fakeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe("Store doesn't exists");
      }

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prisma.store.findUnique).toHaveBeenCalledWith({
        where: { owner_id: fakeUser.id },
      });
      expect(prisma.product.update).not.toHaveBeenCalled();
    });

    it('should throw a UnauthorizedException if is not the store owner nor a admin', async () => {
      jest
        .spyOn(prisma.product, 'findUnique')
        .mockResolvedValue({ ...fakeProduct, store_id: '123' });
      jest.spyOn(prisma.store, 'findUnique').mockResolvedValue(fakeStore);

      try {
        await service.update(productId, { title: 'Error' }, fakeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe(
          'Only the store owner or an admin can update the product',
        );
      }

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prisma.store.findUnique).toHaveBeenCalledWith({
        where: { owner_id: fakeUser.id },
      });
      expect(prisma.product.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const productId = '1';

    it('should delete the product as the store owner', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValue(fakeProduct);
      jest.spyOn(prisma.store, 'findUnique').mockResolvedValue(fakeStore);

      const response = await service.delete(productId, fakeUser);

      expect(response).toEqual({
        success: `Product '${fakeProduct.title}' deleted`,
      });
      expect(prisma.product.findUnique).toBeCalledWith({
        where: { id: productId },
      });
      expect(prisma.store.findUnique).toBeCalledWith({
        where: { owner_id: fakeUser.id },
      });
      expect(prisma.product.delete).toBeCalledWith({
        where: { id: productId },
      });
    });

    it('should delete the product as administrator', async () => {
      jest
        .spyOn(prisma.product, 'findUnique')
        .mockResolvedValue({ ...fakeProduct, store_id: '123' });
      jest.spyOn(prisma.store, 'findUnique').mockResolvedValue(fakeStore);

      const response = await service.delete(productId, {
        ...fakeUser,
        admin: true,
      });

      expect(response).toEqual({
        success: `Product '${fakeProduct.title}' deleted`,
      });
      expect(prisma.product.findUnique).toBeCalledWith({
        where: { id: productId },
      });
      expect(prisma.store.findUnique).toBeCalledWith({
        where: { owner_id: fakeUser.id },
      });
      expect(prisma.product.delete).toBeCalledWith({
        where: { id: productId },
      });
    });

    it('should throw a NotFoundException if the product does not exist', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValue(null);

      try {
        await service.delete(productId, fakeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe("Product doesn't exists");
      }

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prisma.store.findUnique).not.toHaveBeenCalled();
      expect(prisma.product.delete).not.toHaveBeenCalled();
    });

    it('should throw a NotFoundException if the store does not exist', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValue(fakeProduct);
      jest.spyOn(prisma.store, 'findUnique').mockResolvedValue(null);

      try {
        await service.delete(productId, fakeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe("Store doesn't exists");
      }

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prisma.store.findUnique).toHaveBeenCalledWith({
        where: { owner_id: fakeUser.id },
      });
      expect(prisma.product.delete).not.toHaveBeenCalled();
    });

    it('should throw a UnauthorizedException if is not the store owner nor a admin', async () => {
      jest
        .spyOn(prisma.product, 'findUnique')
        .mockResolvedValue({ ...fakeProduct, store_id: '123' });
      jest.spyOn(prisma.store, 'findUnique').mockResolvedValue(fakeStore);

      try {
        await service.delete(productId, fakeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe(
          'Only the store owner or an admin can delete the product',
        );
      }

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prisma.store.findUnique).toHaveBeenCalledWith({
        where: { owner_id: fakeUser.id },
      });
      expect(prisma.product.delete).not.toHaveBeenCalled();
    });
  });
});
