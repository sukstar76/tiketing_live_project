import { ApiResult } from '../common/api-result.js';
import { logger } from '../winston.js';

export const errorMiddleware = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message;

  logger.error(`ERROR: ${err.message}`);
  res.status(status).send(ApiResult.error({ status, message }));

  next();
};
