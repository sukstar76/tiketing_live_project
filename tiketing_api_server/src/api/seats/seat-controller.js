import { Router } from 'express';
import { BadRequestException } from '../../common/exceptions/bad-request-exception.js';
import { ItemRepository } from '../items/item-repository.js';
import { SeatRepository } from './seat-repository.js';
import { SeatService } from './seat-service.js';
import { wrap } from '../../lib/wrap.js';
import { SeatRedisRepository } from './seat-redis-repository.js';
import { ApiResult } from '../../common/api-result.js';

export class SeatController {
  router;
  path;
  seatService;

  constructor() {
    this.path = '/seats';
    this.seatService = new SeatService({
      seatRepository: new SeatRepository(),
      itemRepository: new ItemRepository(),
      seatRedisRepository: new SeatRedisRepository(),
    });
    this.router = Router();
    const subRouter = Router();
    subRouter
      .post('/reserve', wrap(this.reserveSeat))
      .post('/cancel', wrap(this.cancelSeat))
      .post('/select', wrap(this.selectSeat))
      .post('/deselect', wrap(this.deselectSeat))
      .get('/subscribe/:itemId', wrap(this.subscribeSeat));

    this.router.use(this.path, subRouter);
  }

  reserveSeat = async (req, res) => {
    const { seatId, itemId } = req.body;
    if (!seatId) throw new BadRequestException();
    if (!itemId) throw new BadRequestException();

    const result = await this.seatService.reserveSeat({ itemId, seatId });

    return ApiResult.success({
      data: result,
      message: '예매성공',
      status: 201,
    });
  };

  cancelSeat = async (req, res) => {
    const { seatId, itemId } = req.body;
    if (!seatId) throw new BadRequestException();
    if (!itemId) throw new BadRequestException();

    const result = await this.seatService.cancelSeat({ itemId, seatId });

    return ApiResult.success({
      data: result,
      message: '예매취소',
      status: 201,
    });
  };

  selectSeat = async (req, res) => {
    const { seatId, itemId } = req.body;
    if (!seatId) throw new BadRequestException();
    if (!itemId) throw new BadRequestException();

    const result = await this.seatService.selectSeat({ itemId, seatId });

    return ApiResult.success({
      data: result,
      message: '선택성공',
      status: 201,
    });
  };

  deselectSeat = async (req, res) => {
    const { seatId, itemId } = req.body;
    if (!seatId) throw new BadRequestException();
    if (!itemId) throw new BadRequestException();

    const result = await this.seatService.deselectSeat({ itemId, seatId });

    return ApiResult.success({
      data: result,
      message: '선택취소',
      status: 201,
    });
  };

  subscribeSeat = async (req, res) => {
    const itemId = req.params.itemId;
    if (!itemId) throw new BadRequestException();

    const result = await this.seatService.subscribe(itemId);

    return ApiResult.success({
      data: result,
      message: '전체좌석상황',
      status: 200,
    });
  };
}
