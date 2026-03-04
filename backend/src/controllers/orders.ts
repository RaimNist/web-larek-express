import { Request, Response, NextFunction } from 'express';
import { MongooseError } from 'mongoose';
import { faker } from '@faker-js/faker';
import { BadRequestError, NotFoundError } from '../errors';
import Product from '../models/product';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    if (!payment || !email || !phone || !address || !total || !items) {
      return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
    }

    if (!Array.isArray(items) || items.length === 0) {
      return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
    }

    if (typeof total !== 'number' || total <= 0) {
      return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
    }

    const uniqueIds = [...new Set(items)];

    const products = await Product.find({ _id: { $in: uniqueIds } });

    if (products.length !== uniqueIds.length) {
      return next(new NotFoundError('Один или несколько товаров не найдены'));
    }

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    const { totalCalculated } = items.reduce(
      (acc, itemId) => {
        const product = productMap.get(itemId.toString());
        if (!product) {
          throw new NotFoundError(`Товар с ID ${itemId} не найден`);
        }

        acc.totalCalculated += product.price || 0;
        acc.orderItems.push({
          productId: product._id,
          title: product.title,
          price: product.price,
          image: product.image,
        });

        return acc;
      },
      { totalCalculated: 0, orderItems: [] },
    );

    if (totalCalculated !== total) {
      return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
    }

    if (payment !== 'card' && payment !== 'cash') {
      return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
    }

    if (typeof phone !== 'string') {
      return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
    }

    if (typeof address !== 'string' || address.trim() === '') {
      return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
    }

    const orderId = faker.string.uuid();
    return res.status(201).send({ id: orderId, total });
  } catch (err) {
    return next(err as MongooseError);
  }
};

export default createOrder;
