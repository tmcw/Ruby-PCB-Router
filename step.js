// Incident or attached net of a terminal
export class Step {
  constructor(prev, next, id) {
    this.prev = prev;
    this.next = next;
    this.id = id;
    this.radius = 0;
    this.outer = false;
  }
}
