export class Item {
  id;
  name;

  constructor({ id, name }) {
    this.id = id;
    this.name = name;
  }

  static fromRaw(raw) {
    if (!raw) return null;

    return new Item({ id: raw.id, name: raw.name });
  }

  toJson() {
    return {
      id: this.id,
      name: this.name,
    };
  }
}
