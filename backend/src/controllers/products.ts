import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { BadRequestError, ConflictError } from '../errors';

import Product from '../models/product';

export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({});
    res.status(200).send({ products, total: products.length });
  } catch (err) {
    next(err as MongooseError);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;

    if (!title || !image || !category) {
      return next(new BadRequestError('Ошибка валидации данных при создании товара'));
    }

    if (!image.fileName || !image.originalName) {
      return next(new BadRequestError('Ошибка валидации данных при создании товара'));
    }

    const newProduct = new Product({
      title,
      image,
      category,
      description,
      price: price !== undefined ? price : null,
    });

    await newProduct.save();
    return res.status(201).send({ id: newProduct.id });
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      return next(new BadRequestError('Ошибка валидации данных при создании товара'));
    }

    if (err instanceof Error && err.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }
    return next(err as MongooseError);
  }
};
