// note: the flow depends on the order of the traces -- trace with less clearance adjanced to trace with much clearance?
export class Cut {
  constructor(v1, v2) {
    this.cap = Math.hypot(v1.x - v2.x, v1.y - v2.y);
    this.free_cap = this.cap - v1.core - v2.core;
    this.cv1 = Clearance; // UGLY:
    this.cv2 = Clearance;
    this.cl = [];
  }

  /*
        // return Maximum_Board_Diagonal (MBD) when there is no space available, or
	       // a measure for squeeze -- multiple of Average_Via_Size going to zero if there is much space available
	squeeze_strength(trace_width, trace_clearance) {
		if (cl.empty) {
			s = ((@cv1 < @cv2 && @cv1 < trace_clearance) ? @cv2 + trace_clearance : (@cv2 < trace_clearance ? @cv1 + trace_clearance : @cv1 + @cv2))
                } else {
			this.cl.push(trace_clearance)
			ll = this.cl.length / 2
			hhh = this.cl.sort.reverse[0..ll] * 2
			hhh.pop if this.cl.length.even?
			hhh.push(this.cv1)
			hhh.push(this.cv2)
			hhh.sort!
			hhh.shift(2)
			s = hhh.inject(0){|sum, v| sum + v}
                        // fail unless s == ss
			this.cl.pop()
                }
		s = this.free_cap - trace_width - s
		s < 0 ? MBD : 10 * AVD * ATW / (ATW + s * 2)
        }

                */
  // we actually route that trace through this cut
  use(trace_width, trace_clearance) {
    this.free_cap -= trace_width;
    this.cl.push(trace_clearance);
  }
}
