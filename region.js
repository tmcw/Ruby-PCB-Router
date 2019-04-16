//   \|/       \|/
//    |        /\
//    |        | |
//   _|/      _| |/
//    |\       | |\
// when we route a net, we split regions along the path in left and right region.
// so new paths can not cross this path any more.
// problem: first and last terminal.
// Current solution: Use a hash to store forbidden paths for these terminals
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
  /*
  qbors(old) {
           if (old) {
			let ox = this.vertex.x
			let oy = this.vertex.y
			let ax = old.rx - ox
			let ay = old.ry - oy
                        for (let el of this.neighbors) {
				next if el == old
				bx = el.rx - ox
				by = el.ry - oy
				fail if old.vertex == el.vertex && self.idirs.empty?
				turn = RBR::xboolean_really_smart_cross_product_2d_with_offset(old, el, self)
				bx = el.rx - ox
				by = el.ry - oy
				inner = true 
				outer = self.incident
				unless self.odirs.empty?
					outer = true
					self.odirs.each{|zx, zy|
						if turn
							j = ax * zy >= ay * zx && bx * zy <= by * zx # do we need = here?
						else
							j = ax * zy <= ay * zx && bx * zy >= by * zx
						end
						break unless (outer &&= j)
					}
					inner = !outer
				end
				self.idirs.each{|zx, zy|
					if turn
						j = ax * zy >= ay * zx && bx * zy <= by * zx # do we need = here?
					else
						j = ax * zy <= ay * zx && bx * zy >= by * zx
					end
					if j
						inner = false
					else
						outer = false
					end
					next unless inner || outer
				}
				yield [el, inner, outer]
			}
                } else {
			neighbors.each{|el| yield [el, true, true]}
                }
  }
  */
  distance_to(other) {
    return Math.hypot(
      this.vertex.x - other.vertex.x,
      this.vertex.y - other.vertex.y
    );
  }
}
