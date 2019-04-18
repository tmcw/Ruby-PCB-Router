// TODO
const Clearance = 800;
const MBD = 2 ** 30 - 2 ** 24; // something like our own Infinity

// note: the flow depends on the order of the traces -- trace with less clearance adjanced to trace with much clearance?
export class Cut {
  constructor(v1, v2) {
    this.cap = Math.hypot(v1.x - v2.x, v1.y - v2.y);
    this.free_cap = this.cap - v1.core - v2.core;
    this.cv1 = Clearance; // UGLY:
    this.cv2 = Clearance;
    this.cl = [];
  }

  // return Maximum_Board_Diagonal (MBD) when there is no space available, or
  // a measure for squeeze -- multiple of Average_Via_Size going to zero if there is much space available
  squeeze_strength(trace_width, trace_clearance) {
    let s;
    if (this.cl.length === 0) {
      s =
        this.cv1 < this.cv2 && this.cv1 < trace_clearance
          ? this.cv2 + trace_clearance
          : this.cv2 < trace_clearance
          ? this.cv1 + trace_clearance
          : this.cv1 + this.cv2;
    } else {
      this.cl.push(trace_clearance);
      let ll = this.cl.length / 2;
      let hhh = this.cl.sort((a, b) => a - b).reverse();
      // TODO: this has a * 2 in the original. is that really the intent?
      hhh.push(...hhh);
      if (this.cl.length % 2 == 0) {
        hhh.pop();
      }
      hhh.push(this.cv1);
      hhh.push(this.cv2);
      hhh.sort((a, b) => a - b);
      hhh.shift(2);
      s = hhh.reduce((sum, v) => sum + v, 0);
      // fail unless s == ss
      this.cl.pop();
    }
    s = this.free_cap - trace_width - s;
    return s < 0 ? MBD : (10 * AVD * ATW) / (ATW + s * 2);
  }

  // we actually route that trace through this cut
  use(trace_width, trace_clearance) {
    this.free_cap -= trace_width;
    this.cl.push(trace_clearance);
  }
}
