import { ConflictException } from '../../common/exceptions/conflict-exception.js';
import { NotFoundException } from '../../common/exceptions/not-found-exception.js';
import {
  generateKafkaMessage,
  kafkaProducer,
  KAFKA_SEAT_TOPIC,
} from '../../lib/kafka.js';

export class SeatService {
  seatRepository;
  seatRedisRepository;
  itemRepository;

  constructor({ seatRepository, itemRepository, seatRedisRepository }) {
    this.seatRepository = seatRepository;
    this.itemRepository = itemRepository;
    this.seatRedisRepository = seatRedisRepository;
  }

  async reserveSeat({ seatId, itemId }) {
    const item = this.itemRepository.findById(itemId);
    if (!item) throw new NotFoundException();
    const seat = this.seatRepository.findById(seatId);
    if (!seat) throw new NotFoundException();

    if (seat.status === 'SOLDOUT') throw new ConflictException();

    const result = this.seatRepository.changeStatus({
      id: seatId,
      status: 'SOLDOUT',
    });

    await kafkaProducer.send({
      topic: KAFKA_SEAT_TOPIC,
      messages: [
        generateKafkaMessage({
          key: itemId,
          value: { seatId, msg: 'SOLDOUT' },
        }),
      ],
    });

    return result;
  }

  async cancelSeat({ seatId, itemId }) {
    const item = this.itemRepository.findById(itemId);
    if (!item) throw new NotFoundException();
    const seat = this.seatRepository.findById(seatId);
    if (!seat) throw new NotFoundException();
    if (seat.status === 'SALED') throw new ConflictException();

    const result = this.seatRepository.changeStatus({
      id: seatId,
      status: 'SALED',
    });

    await kafkaProducer.send({
      topic: KAFKA_SEAT_TOPIC,
      messages: [
        generateKafkaMessage({ key: itemId, value: { seatId, msg: 'SALED' } }),
      ],
    });

    return result;
  }

  async selectSeat({ seatId, itemId }) {
    // const item = this.itemRepository.findById(itemId);
    // if (!item) throw new NotFoundException();
    // const seat = this.seatRepository.findById(seatId);
    // if (!seat) throw new NotFoundException();
    // if (seat.status === 'SOLDOUT') throw new ConflictException();

    if (
      await this.seatRedisRepository.getByItemIdAndSeatId({
        itemId,
        seatId,
      })
    )
      throw new ConflictException();
    // not null 이면 이미 선택됨

    if (
      !(await this.seatRedisRepository.setByItemIdAndSeatIdWithLock({
        itemId,
        seatId,
      }))
    )
      throw new ConflictException();
    // optimistic locking 실패 시

    await kafkaProducer.send({
      topic: KAFKA_SEAT_TOPIC,
      messages: [
        generateKafkaMessage({
          key: itemId,
          value: { seatId, msg: 'SELECTION' },
        }),
      ],
    }); // 선택 성공하면 카프카로 던지기

    return true;
  }

  async deselectSeat({ seatId, itemId }) {
    // const item = this.itemRepository.findById(itemId);
    // if (!item) throw new NotFoundException();
    // const seat = this.seatRepository.findById(seatId);
    // if (!seat) throw new NotFoundException();

    const result = await this.seatRedisRepository.delByItemIdAndSeatId({
      itemId,
      seatId,
    });

    if (result === 0) throw new ConflictException();
    // 선택이 되지 않은 좌석 or 이미 선택이 풀렸을 때

    await kafkaProducer.send({
      topic: KAFKA_SEAT_TOPIC,
      messages: [
        generateKafkaMessage({
          key: itemId,
          value: { seatId, msg: 'DESELECTION' },
        }),
      ],
    });

    return true;
  }

  async subscribe(itemId) {
    //const item = this.itemRepository.findById(itemId);
    //if (!item) throw new NotFoundException();

    return await this.seatRedisRepository.getSeatsByItemId(itemId);
  }
}
