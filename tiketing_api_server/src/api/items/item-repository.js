import { db } from '../../lib/database.js';
import { Item } from './item.js';

export class ItemRepository {
  findById(id) {
    const raw = db.prepare(`SELECT * FROM items WHERE id = ?`).get(id);

    return Item.fromRaw(raw);
  }
}
