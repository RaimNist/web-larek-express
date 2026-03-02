import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import { errors } from 'celebrate';
import errorHandler from './middlewares/error-handler';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import { NotFoundError } from './errors';
import { requestLogger, errorLogger } from './middlewares/logger';

dotenv.config();

const { PORT, DB_ADDRESS, ORIGIN_ALLOW } = process.env;

const app = express();

app.use(cors({ origin: ORIGIN_ALLOW }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(DB_ADDRESS!);

app.use(express.json());

app.use(requestLogger);

app.use('/product', productRoutes);
app.use('/order', orderRoutes);

app.use('*', (_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('Страница не найдена'));
});

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {});
