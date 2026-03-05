import { type Request, type Response, type NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers['x-request-id'] as string) ?? uuidv4();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}
