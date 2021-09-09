import { redisClient } from '../../lib/redis.js';
//import { lruCache } from '../../lib/cache.js';

export class SeatRedisRepository {
  genKey({ itemId, seatId, name }) {
    switch (name) {
      case 'keys':
        return `${itemId}:*`;
      case 'seat':
        return `${itemId}:${seatId}`;
      case 'last-access':
        return `${itemId}:last-access`;
      default:
        return '';
    }
  }

  async getSeatsByItemId(itemId) {
    // const lastAccess = await redisClient.get(
    //   this.genKey({ itemId, name: 'last-access' })
    // );
    // if (
    //   lruCache.get(itemId) === undefined ||
    //   lruCache.get(itemId).lastAccess !== lastAccess
    // ) {
    //   const data = await redisClient.keys(
    //     this.genKey({ itemId, name: 'keys' })
    //   );
    //   lruCache.set(itemId, {
    //     data,
    //     lastAccess,
    //   });
    // }
    // return lruCache.get(itemId).data;

    return await redisClient.keys(this.genKey({ itemId, name: 'keys' }));
  }

  async delByItemIdAndSeatId({ itemId, seatId }) {
    return await redisClient.del(this.genKey({ itemId, seatId, name: 'seat' }));
  }

  async getByItemIdAndSeatId({ itemId, seatId }) {
    return await redisClient.get(this.genKey({ itemId, seatId, name: 'seat' }));
  }

  async setByItemIdAndSeatIdWithLock({ itemId, seatId }) {
    const key = this.genKey({ itemId, seatId, name: 'seat' });
    //const lastAccessKey = this.genKey({ itemId, name: 'last-access' });

    redisClient.watch(key); // redis watch 를 통해 optimistic locking
    return await redisClient
      .multi()
      .set(key, 'SELECTED')
      //.incr(lastAccessKey)
      .exec();
  }
}
