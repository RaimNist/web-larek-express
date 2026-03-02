import { Request, Response, NextFunction } from 'express';
import { MongooseError } from 'mongoose';

interface CustomError extends MongooseError {
  statusCode?: number;
}

const errorHandler = (err: CustomError, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Ошибка на сервере' : err.message;

  res.status(statusCode).send({ message });
};

export default errorHandler;
