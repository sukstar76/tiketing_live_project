export class Seat {
  id;
  itemId;
  status;

  constructor({ id, itemId, status }) {
    this.id = id;
    this.itemId = itemId;
    this.status = status;
  }

  static fromRaw(raw) {
    if (!raw) return null;

    return new Seat({ id: raw.id, itemId: raw.item_id, status: raw.status });
  }

  toJson() {
    return {
      id: this.id,
      itemId: this.itemId,
      status: this.status,
    };
  }
}
