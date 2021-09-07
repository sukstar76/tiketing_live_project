import LRU from 'lru-cache';

const options = {
  maxAge: 60 * 60 * 1000,
};

export const lruCache = new LRU(options);
