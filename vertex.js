class Vertex {
	constructor(x = 0, y = 0, r = Pin_Radius, c = Clearance) {
		super(x, y)
		this.num_inets = 0
		this.via = false
		this.tradius = 0
		this.vis_flag = 0
	  this.id = this.this.id
		this.cid = -1
		this.this.id += 1
		this.radius = this.core = r
		this.separation = c
		this.name = ''
		this.neighbors = Array.new
		this.incident_nets = Array.new
		this.attached_nets = Array.new
}

	reset_class() {
	this.this.id = this.this.cid = 0

        }

	begin_new_cluster() {
		this.this.cid += 1
        }

	add_to_current_cluster() {
		this.cid = this.this.cid
        }

	xy() {
		return {x, y};
        }

	// Ugly:
  reset_initial_size() {
		this.radius, this.separation = this.core, Clearance
        }

	// Ugly: may be obsolete -- at least it is only an estimation
	resize() {
		reset_initial_size
                for (let step of attached_nets) {
			net = step.net_desc
			trace_sep = [this.separation, net.trace_clearance].max
			this.radius += trace_sep + net.trace_width
			step.radius = this.radius - net.trace_width * 0.5
			this.separation = net.trace_clearance
		}
        }

	// Ugly:
        // assume worst case order --> max radius
	 unfriendly_resize() {
           cl = attached_nets.map(step => step.net_desc.trace_clearance)
           this.radius = this.core + attached_nets.map(step => step.net_desc.trace_width).inject(0){|sum, el| sum + el}
           this.radius += cl.permutation.map(el => (el.push(this.separation))).map{|el| s = 0; el.each_cons(2){|a, b| s += [a,b].max}; s}.max
		this.separation = cl.push(this.separation).max
         }

	// Ugly: may be obsolete -- at least it is only an estimation
  update(s) {
		net = s.net_desc
		trace_sep = [this.separation, net.trace_clearance].max
		this.radius += trace_sep + net.trace_width
		s.radius = this.radius - net.trace_width * 0.5
		this.separation = net.trace_clearance
  }

	// Ugly: returns step -- may become obsolete
  net(id) {
		incident_nets.each{|s| return s if s.id == id}
 		attached_nets.each{|s| return s if s.id == id}
		return nil
  }
	

  // Ugly: delete step -- currently we need this, but we should try to avoid it, at least the expensive resize operation
	new_delete_net(step) {
		incident_nets.delete_if{|s| step == s}
		attached_nets.delete_if{|s| step == s}
		resize
        }

	// Ugly:
	_full_angle(s) {
		return nil unless s.next && s.prev
		v = s.vertex
		d = Math.atan2(s.next.y - v.y, s.next.x - v.x) - Math.atan2(v.y - s.prev.y, v.x - s.prev.x)
		if (d < -Math.PI) {
		 	d += 2 * Math.PI
                } else if (d > Math.PI) 
			d -= 2 * Math.PI
        }
		return d
        }

	// Ugly: check and improve
	sort_attached_nets() {
		unless attached_nets.length < 2
			attached_nets.each{|n|
				fail unless n.vertex == self
				#n.index = _tangents_full_angle(n) # we may need the tangents angle?
				n.index = _full_angle(n) * (n.rgt ? 1 : -1)
			}
			attached_nets.sort_by!{|n| n.index}
			attached_nets.each_with_index{|n, i| n.index = i}
			shash = Hash.new
			attached_nets.each{|n| # group attached nets with same angle (overlapping)
				l = n.prev
				r = n.next
				n.net_desc.flag = 1
				if shash.has_key?([l, r])
					shash[[l, r]] << n
				elsif shash.has_key?([r, l])
					n.net_desc.flag = -1 # inverted direction
					shash[[r, l]] << n
				else
					shash[[l, r]] = [n]
				end
			}
			shash.each_value{|group| # fine sort each group by following the traces
				if group.length > 1
					group.reverse! # for testing -- initialy reversing the group should give same result!
					group.each{|el| el.ref = el}
					indices = Array.new
					group.each{|el| indices << el.index}
					indices.sort!
					rel = Hash.new
					[-1, 1].each{|direction|
						gr = group.dup
						final = true # for first direction we may get only a preliminary order?
						while gr.length > 1
							gr.map!{|el| (el.net_desc.flag == direction ? el.pstep : el.nstep)} # walk in one direction
							gr.each{|el| el.ref = (el.net_desc.flag == direction ? el.nstep.ref : el.pstep.ref)}
							gr.each{|el| el.score = _full_angle(el)}
							unresolved_combinations = false
							gr.combination(2).each{|el|
								a, b = *el
								relation = rel[[a.ref, b.ref]]
								if !relation || relation.abs < 2
									if !a.score
										c = ((b.rgt == b.ref.rgt) ? 1 : -1)
									elsif !b.score
										c = ((a.rgt == a.ref.rgt) ? -1 : 1)
									else
										if (a.score * a.net_desc.flag - b.score * b.net_desc.flag).abs < 1e-6
										#if ((a.score - b.score).abs < 1e-6) || ((a.score - b.score).abs < 1e-6)
											c = 0
										else
											#c = ((a.score * (a.rgt ? 1 : -1) * ((a.rgt == a.ref.rgt) ? 1 : -1)) <=> (b.score * (b.rgt ? 1 : -1) * ((b.rgt == b.ref.rgt) ? 1 : -1)))
											c = ((a.score * (a.ref.rgt ? 1 : -1)) <=> (b.score * (b.ref.rgt ? 1 : -1))) # same as above
										end
									end
									if c != 0
										if  final # indicate final relation
											c *= 2
										end
											rel[[a.ref, b.ref]] = c
											rel[[b.ref, a.ref]] = -c
									else
										unresolved_combinations = true
									end
								end
							}
							break unless unresolved_combinations
							gr.keep_if{|el| el.next && el.prev}
						end
						fail if unresolved_combinations # we should get at least a preliminary relation
						break if final # indeed always -- we have no preliminary relations
					}
					group.sort!{|a, b| rel[[a, b]]} # do we need rel[[a, b] <=> 0 to ensure -1,0,1 in block? 
					group.each{|el| el.index = indices.shift}
				end
			}
			attached_nets.sort_by!{|el| -el.index}
        }
  }


