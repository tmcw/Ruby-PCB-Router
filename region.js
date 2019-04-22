export class Region {
  constructor(v) {
    this.g = 1;
    this.ox = this.oy = 0;
    this.vertex = v;
    this.rx = v.x;
    this.ry = v.y;
    this.neighbors = [];
    this.incident = true;
    this.outer = false;
    this.idirs = [];
    this.odirs = [];
  }
  qbors(old) {
    if (old) {
      let ox = this.vertex.x;
      let oy = this.vertex.y;
      let ax = old.rx - ox;
      let ay = old.ry - oy;
      for (let el of this.neighbors) {
        if (el == old) continue;
        bx = el.rx - ox;
        by = el.ry - oy;
        // fail if old.vertex == el.vertex && self.idirs.empty?
        // turn = RBR::xboolean_really_smart_cross_product_2d_with_offset(old, el, self)
        bx = el.rx - ox;
        by = el.ry - oy;
        inner = true;
        outer = self.incident;
        if (self.odirs.length) {
          outer = true;
          for (let [zx, zy] of self.odirs) {
            if (turn) {
              j = ax * zy >= ay * zx && bx * zy <= by * zx; // do we need = here?
            } else {
              j = ax * zy <= ay * zx && bx * zy >= by * zx;
            }
            // break unless (outer &&= j)
          }
          inner = !outer;
        }
        for (let [zx, xy] of self.idirs) {
          if (turn) {
            j = ax * zy >= ay * zx && bx * zy <= by * zx; // do we need = here?
          } else {
            j = ax * zy <= ay * zx && bx * zy >= by * zx;
          }
          if (j) {
            inner = false;
          } else {
            outer = false;
          }
          if (!(inner || outer)) continue;
        }
        // return [el, inner, outer]
      }
    } else {
      for (let el of neighbors) {
        // return [el, true, true];
      }
    }
  }
  distance_to(other) {
    return Math.hypot(
      this.vertex.x - other.vertex.x,
      this.vertex.y - other.vertex.y
    );
  }
}
