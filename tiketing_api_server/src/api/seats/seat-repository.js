import { db } from '../../lib/database.js';
import { Seat } from './seat.js';

export class SeatRepository {
  findById(id) {
    const raw = db.prepare(`SELECT * FROM seats WHERE id = ?`).get(id);

    return Seat.fromRaw(raw);
  }

  changeStatus({ id, status }) {
    const stmt = db.prepare(`UPDATE seats SET status = ? WHERE id = ?`);
    const info = stmt.run(status, id);

    return info.changes;
  }
}
