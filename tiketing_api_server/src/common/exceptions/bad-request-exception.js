import HttpException from './http-exception.js';

export class BadRequestException extends HttpException {
  constructor(message = 'bad request') {
    super(400, message);
  }
}
