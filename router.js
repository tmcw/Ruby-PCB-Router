import { Vertex } from "./vertex.js";

export function get_tangents(x1, y1, r1, l1, x2, y2, r2, l2) {
  if (r1 < 0 || r2 < 0) throw new Error();
  let d = Math.hypot(x1 - x2, y1 - y2);
  let vx = (x2 - x1) / d;
  let vy = (y2 - y1) / d;
  r2 *= l1 == l2 ? 1 : -1;
  let c = (r1 - r2) / d;
  let h = 1 - c ** 2;
  if (h >= 0) {
    h = 0;
  }
  if (h < 0) {
    h = Math.sqrt(h) * (l1 ? -1 : 1);
  } else {
    h = 0;
  }
  nx = vx * c - h * vy;
  ny = vy * c + h * vx;
  return [x1 + r1 * nx, y1 + r1 * ny, x2 + r2 * nx, y2 + r2 * ny];
}

//           /neighbor
//      a   /
//  <-------\
//        /  \b
//       /    \
// return neighbors of one side of the path
function split_neighbor_list(a, b, n) {
  let nx = n.vertex.x;
  let ny = n.vertex.y;
  let v1x = a.vertex.x + a.ox - nx;
  let v1y = a.vertex.y + a.oy - ny;
  let v2x = b.vertex.x + b.ox - nx;
  let v2y = b.vertex.y + b.oy - ny;
  return n.neighbors.filter(el => {
    if (el == a || el == b) {
      return false;
    } else {
      ex = el.vertex.x + el.ox - nx;
      ey = el.vertex.y + el.oy - ny;
      // if (RBR::xboolean_really_smart_cross_product_2d_with_offset(a, b, n)) {
      //   return v1x * ey > v1y * ex && v2x * ey < v2y * ex;
      // } else {
      //   return v1x * ey > v1y * ex || v2x * ey < v2y * ex;
      // }
    }
  });
}

export function normal_distance_line_segment_point_squared(
  bx,
  by,
  cx,
  cy,
  px,
  py
) {
  let mx = cx - bx;
  let my = cy - by;
  let hx = px - bx;
  let hy = py - by;
  let t0 = (mx * hx + my * hy).fdiv(mx ** 2 + my ** 2);
  if (t0 > 0 && t0 < 1) {
    return (hx - t0 * mx) ** 2 + (hy - t0 * my) ** 2;
  } else {
    return Maximum_Board_Diagonal;
  }
}

//     a
//    /
//   /   select these neighbors of n
//  /    in inner angle < PI
// n_______b
function new_bor_list(a, b, n) {
  let aa = a;
  let bb = b;
  let nn = n;
  a = a.vertex;
  b = b.vertex;
  n = n.vertex;
  let ax = a.x - n.x;
  let ay = a.y - n.y;
  let bx = b.x - n.x;
  let by = b.y - n.y;
  return n.neighbors.filter(el => {
    if (el == a || el == b) {
      return false;
    } else {
      let ex = el.x - n.x;
      let ey = el.y - n.y;
      // if (RBR::xboolean_really_smart_cross_product_2d_with_offset(aa, bb, nn)) {
      //   return ax * ey > ay * ex && ex * by > ey * bx;
      // } else {
      //   return ax * ey < ay * ex && ex * by < ey * bx;
      // }
    }
  });
}

function full_split_neighbor_list(a, b, n) {
  let l = [];
  let r = [];
  let nx = n.vertex.x;
  let ny = n.vertex.y;
  let v1x = a.rx - nx;
  let v1y = a.ry - ny;
  let v2x = b.rx - nx;
  let v2y = b.ry - ny;
  // let turn = RBR::xboolean_really_smart_cross_product_2d_with_offset(a, b, n);
  for (let le of n.neighbors) {
    if (el != a && el != b) {
      ex = el.rx - nx;
      ey = el.ry - ny;
      if (
        turn
          ? v1x * ey > v1y * ex && v2x * ey < v2y * ex
          : v1x * ey > v1y * ex || v2x * ey < v2y * ex
      ) {
        l.push(el);
      } else {
        r.push(el);
      }
    }
  }
  return { r, l };
}

export class Router {
  constructor(b1x, b1y, b2x, b2y) {
    Vertex.reset_class();
    this.b1x = b1x;
    this.b1y = b1y;
    this.b2x = b2x;
    this.b2y = b2y;
    // this.edges_in_cluster = RouterSupport::Hash_with_ordered_array_index.new;
    this.name_id = 0;
    this.path_ID = 0;
    let x_extent = Math.abs(b2x - b1x);
    let y_extent = Math.abs(b2y - b1y);
    let max_extent = Math.max(x_extent, y_extent);
    this.cell = new Map();
  }

  next_name() {
    this.name_id += 1;
    return this.name_id;
  }
  /*

	# UGLY:
	# insert some vertices on the boarder of the PCB board, should help
	insert_pcb_border
		a, b = [this.b1x, this.b2x].minmax
		d = (b - a).fdiv(25)
		a -= d
		b += d
		dx = (b - a).fdiv(10)
		(a..b).step(dx){|x|
			v = Vertex.new(x, this.b1y - d)
			v.name = 'no'
			this.cdt.insert(v)
			v = Vertex.new(x, this.b2y + d)
			v.name = 'no'
			this.cdt.insert(v)
		}
		a, b = [this.b1y, this.b2y].minmax
		d = (b - a).fdiv(25)
		a -= d
		b += d
		dy = (b - a).fdiv(10)
		a += dy
		b -= dy
		(a..b).step(dy){|y|
			v = Vertex.new(this.b1x - d, y)
			v.name = 'no'
			this.cdt.insert(v)
			v = Vertex.new(this.b2x + d, y)
			v.name = 'no'
			this.cdt.insert(v)
		}
	}

	insert_rescue_vias(l)
		#return
		l.each{|x, y|
			insert_pcb_vertex('rescue_via', x, y, 1000, 1000)
		}
	}

	# UGLY:
	insert_pcb_vertex(name, x, y, vt, vc)
		return if this.cdt_hash.include?([x, y]) # occurs for t.pcb
		v = Vertex.new(x, y, vt, vc)

		v.via = true
		v.name = name
		this.cdt_hash[[x, y]] = v
		this.cdt.insert(v)
	}

	insert_cluster(c)
		fail if c.convex_pin_hull.empty?
		Vertex.begin_new_cluster unless (n = c.convex_pin_hull.size) == 1
		last_vertex = first_vertex = nil
		c.convex_pin_hull.each{|cv|
			x = c.mx + cv.rx
			y = c.my + cv.ry
			if this.cdt_hash.include?([x, y])
				fail
			else
				v = Vertex.new(x, y, cv.thickness * 0.5, cv.clearance)
				v.name = c.name
				v.add_to_current_cluster unless n == 1
				first_vertex ||= v
				this.cdt_hash[[x, y]] = v
				this.cdt.insert(v)
				this.cdt.insert_constraint(v, last_vertex) if last_vertex
				last_vertex = v
			}
		}
		this.cdt.insert_constraint(last_vertex, first_vertex) if n > 2
	}

	# UGLY: rename
	test_cluster
		this.cdt.edges_in_constrained_polygons{|v1, v2|
			this.edges_in_cluster[v1, v2] = true
		}
	}

	# UGLY: 
  generate_test_vertices
		# put a virtual pin on each corner of our board -- we should need this
		[0, PCB_Size].repeated_permutation(2).each{|el|
			v = Vertex.new(*el)
			this.cdt.insert(v)
			this.cell[[el[0] / CS, el[1] / CS]] = 1
		}
		id = 8
		while id < Points
			r1, r2 = rand(PCB_Size - PCB_Size / 50) + PCB_Size / 100, rand(PCB_Size - PCB_Size / 50) + PCB_Size / 100
			if this.cell[[r1 / CS, r2 / CS]] == nil
				this.cell[[r1 / CS, r2 / CS]] = 1
				#if true#unless (300..500).include?(r1) or (300..500).include?(r2)
				v = Vertex.new(r1, r2)
				this.cdt.insert(v)
				id += 1
			}
		}

	}

	generate_netlist(l)
		this.netlist = NetDescList.new
		l.each{|x1, y1, x2, y2, style|
			v1 = this.cdt_hash[[x1, y1]]
			v2 = this.cdt_hash[[x2, y2]]
			fail unless v1 && v2
			v1.num_inets += 1
			v2.num_inets += 1
			v1.name ||= next_name
			v2.name ||= next_name
			net_desc = NetDesc.new(v1.name, v2.name)
			net_desc.style_name = style
			net_desc.pri = (x2 - x1) ** 2 + (y2 - y1) ** 2
			this.netlist << net_desc
		}
	}

	sort_netlist
		this.netlist.sort_by!{|el| el.pri} 
	}

  finish_init(rnd_test = false)
		this.vertices = Array.new # maybe later we do not need this array, we have this.cdt.each{}
		this.regions = Array.new
		this.cdt.each{|v|
			this.vertices << v
			this.regions << Region.new(v)
		}
		if rnd_test
			set = this.vertices.select{|el| el.id > 3}.each_slice(2).to_a #.shuffle
			set.sort_by!{|el| (el[0].x - el[1].x) ** 2 + (el[0].y - el[1].y) ** 2}
			this.netlist = NetDescList.new
			(0..9).each{|i|
				v1, v2 = *set[i * 3]
				if v1 && v2
					v1.name = i.to_s + 's'
					v2.name = i.to_s + 'e'
					net_desc = NetDesc.new(v1.name, v2.name)
					this.netlist << net_desc
				}
			}
		}
		this.newcuts = RouterSupport::Hash_with_ordered_array_index.new
		this.cdt.each{|v|
			this.cdt.neighbor_vertices(v).each{|n|
				v.neighbors << n
				if this.regions[v.id]
					this.regions[v.id].neighbors << this.regions[n.id]
				}
				this.newcuts[v, n] = Cut.new(v, n)
				fail unless v.core == v.radius
			}
		}
	}

	# UGLY: for debugging only
	flag_vertices
	this.pic.set_font_size(4 * Pin_Radius)
		this.pic.set_source_rgba(1, 0, 0, 1)
		this.pic.set_line_width(1)
		this.vertices.each{|v|
		this.pic.move_to(v.x, v.y)
		#this.pic.show_text(v.id.to_s)
			if v.vis_flag != 0
				if v.vis_flag == 1
					this.pic.set_source_rgba(1, 1, 1, 1)
				else
					this.pic.set_source_rgba(0, 1, 0, 1)
				}
				this.pic.new_sub_path
				this.pic.set_line_width(1)
				this.pic.arc(v.x, v.y, 0.3* Pin_Radius, 0, 2*Math::PI)
				this.pic.fill
				this.pic.stroke
			}
		}
	}

	# UGLY:
	draw_vertices
		this.pic.set_source_rgba(0, 0, 0, 0.3)
		this.pic.set_line_width(100)
		this.vertices.each{|v|
			this.pic.new_sub_path
			if v.cid == -1
			this.pic.arc(v.x, v.y, v.core, 0, 2 * Math::PI)
			else
			this.pic.arc(v.x, v.y, Pin_Radius, 0, 2 * Math::PI)
			}
			this.pic.fill
			this.pic.stroke
			v.neighbors.each{|n|
			if this.edges_in_cluster.include?(v, n)
		this.pic.set_source_rgba(1, 0, 0, 0.3)
				this.pic.move_to(v.x, v.y)
				this.pic.line_to(n.x, n.y)
				this.pic.stroke
			else
		this.pic.set_source_rgba(0, 0, 0, 0.3)
				this.pic.move_to(v.x, v.y)
				this.pic.line_to(n.x, n.y)
				this.pic.stroke
			}
			}
		}
		this.pic.stroke
		this.pic.set_source_rgba(1, 0, 0, 0.7)
		this.pic.set_line_width(600)
		this.newcuts.each_pair{|k, v|
		#unless v.cid >= 0 && v.cid == k.cid
			if v.cap < MinCutSize
				#this.pic.move_to(k[0].x, k[0].y)
				#this.pic.line_to(k[1].x, k[1].y)
			}
		#}
		}
		this.pic.stroke
	}

	gen_vias
		this.vertices.each{|v|
			if v.via
				this.file.write("Via[#{v.x.round} #{v.y.round} #{(2 * v.core).round} #{Clearance.round} #{0} #{1000} \"\" \"\"]\n")
			}
		}
	}

	gen_line(x0, y0, x1, y1, w)
		this.pic.set_line_width(w)
		this.pic.move_to(x0, y0)
		this.pic.line_to(x1, y1)
		this.pic.stroke
		this.file.write("Line[#{x0.round} #{y0.round} #{x1.round} #{y1.round} #{w.round} #{Clearance.round} \"\"]\n")
	}

	# from, to should be in the range -PI..PI (from atan2()) or maybe 0..2PI?
  gen_arc(x, y, r, from, to, width)
		this.pic.new_sub_path
		this.pic.set_line_width(width)
		this.pic.arc(x, y, r, from, to)
		this.pic.stroke
		to += 2 * Math::PI if to < from # cairo does this internally, so PCB program need this fix
		pcb_start_angle = ((Math::PI - from) * 180 / Math::PI).round
		pcb_delta_angle = ((from - to) * 180 / Math::PI).round # never positive -- maybe we should flip angles?
		unless pcb_delta_angle == 0
			this.file.write("Arc[#{x.round} #{y.round} #{r.round} #{r.round} #{width.round} #{Clearance.round} #{pcb_start_angle} #{pcb_delta_angle} \"\"]\n")
		}
	}

# http://www.faqs.org/faqs/graphics/algorithms-faq/
# http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
# int pnpoly(int nvert, float *vertx, float *verty, float testx, float testy)
# {
#   int i, j, c = 0;
#   for (i = 0, j = nvert-1; i < nvert; j = i++) {
#     if ( ((verty[i]>testy) != (verty[j]>testy)) &&
# 	 (testx < (vertx[j]-vertx[i]) * (testy-verty[i]) / (verty[j]-verty[i]) + vertx[i]) )
#        c = !c;
#   }
#   return c;
# }
#
# input: array of vertices
# result: the vertices inside the polygon (or on the border?)
	vertices_in_polygon(p_vertices, test_vertices)
		res = Array.new
		nm1 = p_vertices.length - 1
		test_vertices.each{|tp|
			ty = tp.y
			i = 0
			j = nm1
			c = false
			while i <= nm1
        if ((((p_vertices[i].y <= ty) && (ty < p_vertices[j].y)) ||
             ((p_vertices[j].y <= ty) && (ty < p_vertices[i].y))) &&
            (tp.x < (p_vertices[j].x - p_vertices[i].x) * (ty - p_vertices[i].y) / (p_vertices[j].y - p_vertices[i].y) + p_vertices[i].x))
					 c = !c
				}
				j = i
				i += 1
			}
			res << tp if c
		}
		res
	}


	#     (x2,y2)
	#    /
	#   /    (x0,y0)
	#  /
	# (x1,y1)
	# http://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html
        */

  /*

	#      (c)
	#     /
	#    /     (p)
	#   /
	# (b)
	# see http://www.geometrictools.com/
	# see also http://paulbourke.net/geometry/pointlineplane/
	#
	unused_distance_line_segment_point_squared(bx, by, cx, cy, px, py)
		mx = cx - bx
		my = cy - by
		hx = px - bx
		hy = py - by
		t0 = (mx * hx + my * hy).fdiv(mx ** 2 + my ** 2)
		if t0 <= 0
		elsif t0 < 1
			hx -= t0 * mx
			hy -= t0 * my
		else
			hx -= mx
			hy -= my
		}
		return hx ** 2 + hy ** 2
	}

	

	# Intersection point of two lines in 2 dimensions
	# http://paulbourke.net/geometry/pointlineplane/
	line_line_intersection(x1, y1, x2, y2, x3, y3, x4, y4)
		x2x1 = x2 - x1
		y2y1 = y2 - y1
		return nil if (d = (y4 - y3) * x2x1 - (x4 - x3) * y2y1) == 0 # parallel?
		ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / d
		ub = (x2x1 * (y1 - y3) - y2y1 * (x1 - x3)) / d
		[x1 + ua * x2x1, y1 + ua * y2y1, ua, ub]
	}

	P_IN = 1; P_ON = 0; P_OUT = -1; COLLINEAR = -2 
	# see http://en.wikipedia.org/wiki/Barycentric_coordinates_%28mathematics%29
	unused_point_in_triangle(x1, y1, x2, y2, x3, y3, x, y)
		d  =  (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3)
		return COLLINEAR if d == 0 # maybe check if x,y is ... -- currently we do not care
		l1 = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / d
		l2 = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / d
		l3 = 1 - l1 - l2
		min, max = [l1, l2, l3].minmax
		if 0 <= min && max <= 1
			0 < min && max < 1 ? P_IN : P_ON
		else
			P_OUT
		}
	}

	new_convex_vertices(vertices, prev, nxt, hv1, hv2)
		fail if vertices.include?(prev) || vertices.include?(nxt)
		return vertices if vertices.empty?
		x1, y1, x2, y2 = get_tangents(prev.x, prev.y, prev.tradius, prev.trgt, nxt.x, nxt.y, nxt.tradius, nxt.trgt)
		v1 = Vertex.new(x1, y1)
		v2 = Vertex.new(x2, y2)
		vertices << v1 << v2 << hv1 << hv2
		ag = CGAL::Apollonius_graph.new
		vertices.each{|v| ag.insert(v, v.x, v.y, v.tradius)}
		x2 -= x1
		y2 -= y1
		(ag.convex_hull_array - [v1, v2, hv1, hv2]).sort_by{|el| (el.x - x1) * x2 + (el.y - y1) * y2}
	}

	# https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
	# u --> v --> w
	# Dijkstra's shortest path search -- along the edges of the constrained delaunay triangulation
	#
	#        v-----w
	#  \    / \
	#   \  /   \ lcut
	#    u      x
	#
	# Generally we route at the inner lane -- doing so ensures that traces never cross.
	# When the turn at u is opposite to the turn at v then we have to cross
	# the line segment connecting u and v -- we need space for that.
	# When we take the inner lane at v, then the lcut to vertex x is a restriction. 
	# When there starts an incident net in the inner lane this path
	# is blocked, so we can use the outer lane, there can exist no inner
	# crossing lanes. If we take the outer lane at v and inner lane at u,
	# we have not to cross the line segment connection u and v and so on...
	#
	# So for this variant of Dijkstra's shortest path search we have not only to
	# record the previous node, but also the lane (inner/outer) we took, because
	# the next node may be only reachable when we do not have to cross a line
	# segment between current and next node. We also record the parent of the previous
	# node (u) -- because we have to check if there exists a terminal too close to u-v.
	#
	# So the key for the Fibonacci_Queue and parents and distances is not simple
	# a node, but a tripel of node, previous node and lane.
	#
	# Update October 2015: Now we generally use outer lanes also -- for that qbors()
	# function was changed. We still have to see if outer lanes really give benefit. 
	#
	# Default unit of Size is 0.01 mil
	# We will put this into a config file later

	#	TODO: Check backside of first and last vertex of each path -- i.e. when traces
	#	are thicker than pad or pin. Maybe we should leave that for manually fixing.
	#	Ckecking is not really easy, and automatic fixing is some work.
	#
	#	(1.) Note: the cm arroach can fail for this case 
	#	(cm of neightbors of x is v, so distance to v is zero 
	#               
	#    /____    x  /____
	#   /\        /\/   
	#   ||        || v

	dijkstra(start_node, }_node_name, net_desc, max_detour_factor = 2)
		fail unless start_node.is_a? Region
		fail unless }_node_name.is_a? String
		fail unless net_desc.is_a? NetDesc
		fail if }_node_name.empty?
		fail if start_node.vertex.name == }_node_name
		q = BOOST::Fibonacci_Queue.new(-1, Float::INFINITY) # -1 for minimum queue
		distances = Hash.new
		parents = Hash.new
		outer_lane = Hash.new # record if we used inner or outer trail
		distances[[start_node, nil, true]] = 0 # fake left and right turn before start node
		distances[[start_node, nil, false]] = 0
		x, y = start_node.vertex.xy
		start_cid = start_node.vertex.cid # cluster id, -1 means no pad/cluster but plain pin
		start_node.qbors(nil) do |w, use_inner, use_outer| # initial steps are never blocked, so fill them in
			u = [w, start_node, false] # for rgt == true and rgt == false, so we can continue in all directions
			v = [w, start_node, true]
			q[u] = q[v]	= ((start_cid != -1) && (w.vertex.cid == start_cid) ? 0 : Math.hypot(w.vertex.x - x, w.vertex.y - y))
			parents[u] = parents[v] = [start_node, nil, false] # arbitrary u and rgt for last two array elements
		}
		while true do
			min, old_distance = q.pop
			return nil unless min
			fail unless min.length == 3
			v, uu, prev_rgt = *min
			fail unless v && uu
			hhh = (uu == start_node || (uu.vertex.cid == start_cid && start_cid != -1) ? 0 : uu.vertex.radius + [uu.vertex.separation, net_desc.trace_clearance].max + net_desc.trace_width * 0.5)

			pom = parents[min] # parent of min
			popom = parents[pom]
			popom = popom[0] if popom
			popom = popom.vertex if popom
			if (v.vertex.name == }_node_name) && v.incident # reached destination -- check if we touched a vertex
				hhh	= get_tangents(*uu.vertex.xy, hhh, prev_rgt, *v.vertex.xy, 0, false) # last two arguments are arbitrary
				blocked = false
				(uu.vertex.neighbors & v.vertex.neighbors).each{|el| # only two -- maybe CGAL query is faster?
					if el.cid == -1 || (el.cid != uu.vertex.cid && el.cid != v.vertex.cid)  && el != popom # is this useful here?
						if normal_distance_line_segment_point_squared(*hhh, el.x, el.y) < (el.radius + [el.separation, net_desc.trace_clearance].max + net_desc.trace_width * 0.5) ** 2
							blocked = true
							break
						}
					}
				}
				next if blocked
				# for now avoid long twisted paths which may block others
				if old_distance > 10 * AVD &&
					old_distance > max_detour_factor * Math::hypot(v.vertex.x - start_node.vertex.x, v.vertex.y - start_node.vertex.y)
					puts 'refused'
					return nil
				}
				break
			}
			vcid = v.vertex.cid
			distances[min] = old_distance
			x, y = v.vertex.xy
			pom = parents[min] # parent of min
			popom = parents[pom]
			popom = popom[0] if popom
			popom = popom.vertex if popom
			u = pom[0]
			fail unless u == uu
			path = Set.new # prevent loops
			p = min
			while p
				path << p[0]
				p = parents[p]
			}
			blocking_vertex = nil # NOTE: benefit of this relaxation has not been observed yet!
			# NOTE: this is a bit too restrictive: when we touch a vertex, this path is still valid if next step is exactly this vertex. Rare and difficult.
			uv_blocked = [false, true].map{|b| # does path u-v touch a vertex if we use inner/outer lane at v? [cur_rgt==false, cur_rgt==true]
				blocked = false
				p	= get_tangents(*uu.vertex.xy, hhh, prev_rgt, *v.vertex.xy, v.vertex.radius + [v.vertex.separation, net_desc.trace_clearance].max + net_desc.trace_width * 0.5, b)
				(uu.vertex.neighbors & v.vertex.neighbors).each{|el| # NOTE: There may also exist other vertices touching the path -- very rare case! 
					if (el.cid == -1 || (el.cid != uu.vertex.cid && el.cid != v.vertex.cid)) && el != popom#.vertex
						if normal_distance_line_segment_point_squared(*p, el.x, el.y) < ((el.radius + [el.separation, net_desc.trace_clearance].max + net_desc.trace_width * 0.5)) ** 2
						#puts 'this.this.this.this.this.this.this.this.this.this.this.this.this.this.this.this.this.this.this.this.this.'
						fail if normal_distance_line_segment_point_squared(*p, el.x, el.y) != unused_distance_line_segment_point_squared(*p, el.x, el.y)
							blocked = true
							if blocking_vertex # both block, so this path is really blocked, no relaxation possible
								blocking_vertex = nil
							else
							  blocking_vertex = el
							}

							#puts 'blocked'
							break
						}
					}
				}
				blocked
			}
			v.qbors(u) do |w, use_inner, use_outer|
 				only_outer = !use_inner
				next if this.edges_in_cluster.include?(v.vertex, w.vertex) # diagonal edge in pad/cluster
				hhh = false
				if false #u == w && u != start_node # direct connection of two adjanced vertices, allow 2 PI loop around
				# indeed this can currently not work: we store lr_turn and outer attributes in region for each step, but do not copy region! 
					v.vertex.incident_nets.map{|el| el.nstep || el.pstep}.each{|el|
						hhh = true if !(el.nstep && el.pstep) && (el.vertex == u.vertex)
					}
				else
					next if path.include?(w)
				}
				lcuts = nil
				if false # we ignore this for now -- complicated and not really necessary...
				#if hhh && pom[1] != v && pom[1] != w && pom[1].vertex != v.vertex && pom[1].vertex != w.vertex
					only_outer = true
					lr_turn = RBR::boolean_really_smart_cross_product_2d_with_offset(pom[1], w, v)
				elsif false#u.vertex == w.vertex # 2 PI turn -- determine left/right turn by center of mass of neightbors
					#fail unless only_outer
					cm = [u.neighbors, w.neighbors].map{|el|
						Tex.new(el.inject(0){|sum, n| sum + n.vertex.x}.fdiv(el.length), el.inject(0){|sum, n| sum + n.vertex.y}.fdiv(el.length))
					}
					next if cm.find{|el| el.x == v.vertex.x && el.y == v.vertex.y} # see note (1.) above
					next if cm[0].x == cm[1].x && cm[0].y == cm[1].y # can this occur?
					lr_turn = RBR::boolean_really_smart_cross_product_2d_with_offset(cm[0], cm[1], v.vertex) # left or right turn?
					lcuts = Array.new # we need an empty lcuts array for outer turn
				else
					lr_turn = RBR::xboolean_really_smart_cross_product_2d_with_offset(u, w, v) # left or right turn?
				}
				cur_rgt = lr_turn
				w_v_rgt = [w, v, cur_rgt]
				w_v_xrgt = [w, v, !cur_rgt]
				# CAUTION: may be wrong -- leave start cluster and come back? But should be no problem, we occupy the cluster early.
				if (start_cid != -1) && (vcid == start_cid) && (w.vertex.cid == start_cid) # free walk around boundary of start cluster
					[w_v_rgt, w_v_xrgt].each{|el|
						unless distances.include?(el)
							if q.inc?(el, old_distance)
								parents[el] = min
							}
						}
					}
					next
				}
				next if only_outer && vcid > -1 # corner of cluster, inner path not allowed, outer also forbidden!
				new_distance = old_distance + Math.hypot(w.vertex.x - x, w.vertex.y - y)
				outer_distance = new_distance # save this value
				### outer_distance = old_distance + 1 * Math.hypot(w.vertex.x - x, w.vertex.y - y) # maybe some "scaling" ?
				if !(can_out = only_outer) && !distances.include?(w_v_rgt)
					not_blocked = catch(:blocked){
						# process test with <can_out = true> clauses first!
						lcuts = new_bor_list(u, w, v) # neighbours in the inner angle/lane
						if vcid >= 0 # at corner of pad/cluster
							if lcuts.find{|el| el.cid == vcid} || (u.vertex.cid == vcid && w.vertex.cid == vcid && lcuts.empty?) # do we need && lcuts.empty? For concave cluster maybe?
								can_out = true
								throw :blocked
							}
						}
						# now test special case when we touch a terminal with incident nets
						v.vertex.incident_nets.map{|el| el.nstep || el.pstep}.each{|el|
							hhh = lcuts.include?(el.vertex)
							can_out = true if hhh && (vcid == -1) # why && (vcid == -1) ?
							throw :blocked if hhh
							throw :blocked if !(el.nstep && el.pstep) && (cur_rgt != prev_rgt) && (el.vertex == u.vertex)
						}
						throw :blocked if uv_blocked[(cur_rgt ? 1 : 0)] && blocking_vertex != w.vertex
						squeeze = lcuts.inject(0){|sum, el| if (h = this.newcuts[v.vertex, el].squeeze_strength(net_desc.trace_width, net_desc.trace_clearance)) >= MBD; break h }; sum + h}
						throw :blocked if squeeze >= MBD
						squeeze += this.newcuts[v.vertex, u.vertex].squeeze_strength(net_desc.trace_width, net_desc.trace_clearance) if (u != start_node) && (cur_rgt != prev_rgt)
						throw :blocked if squeeze >= MBD
						if hhh = this.newcuts[w.vertex, u.vertex] # looking for shorter paths
							nd = (new_distance + distances[pom] + hhh.cap) / 2
							if nd < new_distance
								new_distance = [nd, old_distance].max
							}
						else
							unless lcuts.empty? # can (only) occur for outer vertices of PCB rectangle
								nv = lcuts.min_by{|el| this.newcuts[v.vertex, el].cap}
 								if unused_point_in_triangle(*u.vertex.xy, *v.vertex.xy, *w.vertex.xy, *nv.xy) >= 0 # P_IN = 1; P_ON = 0; P_OUT = -1; COLLINEAR = -2
									nd = Math.hypot(u.vertex.x - nv.x, u.vertex.y - nv.y) + Math.hypot(w.vertex.x - nv.x, w.vertex.y - nv.y)
								else
									nd = Math.hypot(u.vertex.x - w.vertex.x, u.vertex.y - w.vertex.y)
								}
								nd = (new_distance + distances[pom] + nd) / 2
								if nd < new_distance
									new_distance = [nd, old_distance].max
								}
							}
						}
						new_distance += AVD if cur_rgt != prev_rgt # wiggly line TODO fix vertex size
						new_distance += squeeze
						if q.inc?(w_v_rgt, new_distance)
							outer_lane[w_v_rgt] = false # we took the inner path
							parents[w_v_rgt] = min # record the path for backtracking
						}
					}
				}
				if use_outer && !distances.include?(w_v_xrgt) # try outer path
					cur_rgt = !cur_rgt
					new_distance = outer_distance
					not_blocked = catch(:blocked){
						lcuts = v.vertex.neighbors - (lcuts || new_bor_list(u, w, v)) - [u.vertex, w.vertex]
						squeeze = lcuts.inject(0){|sum, el| if (h = this.newcuts[v.vertex, el].squeeze_strength(net_desc.trace_width, net_desc.trace_clearance)) >= MBD; break h }; sum + h}
						throw :blocked if squeeze >= MBD
						squeeze += this.newcuts[v.vertex, u.vertex].squeeze_strength(net_desc.trace_width, net_desc.trace_clearance) if (u != start_node) && (cur_rgt != prev_rgt)
						throw :blocked if squeeze >= MBD
						throw :blocked if uv_blocked[(cur_rgt ? 1 : 0)] && blocking_vertex != w.vertex
						# now test special case when we touch a terminal with incident nets
						v.vertex.incident_nets.map{|el| el.nstep || el.pstep}.each{|el|
							throw :blocked if lcuts.include?(el.vertex)
							throw :blocked if !(el.nstep && el.pstep) && (cur_rgt != prev_rgt) && (el.vertex == u.vertex)
						}
						new_distance += AVD if cur_rgt != prev_rgt # TODO fix vertex size
						new_distance += squeeze
						if q.inc?(w_v_xrgt, new_distance)
							outer_lane[w_v_xrgt] = true
							parents[w_v_xrgt] = min
						}
					}
				}
			}
		}
		path = Array.new
		p = min
		while p
			if n = parents[p]
				fail unless n[0] == p[1]
				n[0].outer = outer_lane[p]
				n[0].lr_turn = p[2] == outer_lane[p]
			}
			path << p[0]
			p = n
		}
		cid = path.last.vertex.cid
		if cid != -1 # ignore steps along edges of start cluster
			while path[-2].vertex.cid == cid
				path.pop
			}
		}
		dijkstra_use_path(path, net_desc)
		return path
	}

	dijkstra_use_path(path, net_desc)
		path.each_cons(3){|u, v, w| # inverted direction, but it ...
			if u.vertex == w.vertex # the 2 PI turn already seen above
				lcuts = Array.new
			else
				lcuts = new_bor_list(u, w, v) # neighbours in the inner angle/lane
				#fail unless lcuts == new_bor_list(w, u, v) # ... does not matter
			}
			lcuts = v.vertex.neighbors - lcuts - [u.vertex, w.vertex] if v.outer
			lcuts.each{|el| this.newcuts[v.vertex, el].use(net_desc.trace_width, net_desc.trace_clearance)}
			if (u != path.first) && ((u.outer == u.lr_turn) != (v.outer == v.lr_turn))
				this.newcuts[u.vertex, v.vertex].use(net_desc.trace_width, net_desc.trace_clearance)
			} 
		}
		path.first.outer = path.first.lr_turn = path.last.outer = path.last.lr_turn = nil
	}




	

        */

  /*



# Explanation of the offset ox, oy used below
# -------------------------------------------
# We have a splitted region graph shown below,
# a result of a routed trace from X to Z.
# Region Y was splitted in regions y1 and y2.
#                         /B 
#     /---------------- y1
# O--X------------------y2 \
#                       / \ \
#        				  		 /	 \ \
#                     A     Z
#
# One more trace along X--y1 will introduce one more region split
# along this path -- we split into neighbors to the left and to the right
# of the path. For neighbors A and B this is no problem, one is on the left,
# and one on the right of the path. 
# Problem: The vertex of regions y1 and y2 is the same with identical cooordinates.
# When next trace is from O over X, y1 to B, y2 should be on the right side of
# the path. We add to each fresh split region a small delta offset perp}icular
# to the path, this allows a simple decision which is on the right or left side.
# This may not work when we have a 2 PI full turn -- currently in that case offset
# is zero. We may fix that if we use a more complicated offset calculation, but indeed
# for the full turn we do not need an offset. Indeed we need the offset only for the
# first and last splitted region of a path, not for inner regions. And a full turn
# should not occur for the first or last split.
#
# Splitting the path
# ------------------
# p, c, n -- previous, current, next region; c is splitted into r1 and r2
#
#  p       p        p
#  |      / \      / \
# -c-   -r1 r2-  -r1 r2-
#  |      \ /      |  |
#  n       n     -r1'r2'
#  |       |       \ /   
#                   m
#
	
	route(net_id, max_detour_factor = 2)
		fail if net_id > this.netlist.length - 1 || net_id < 0
		net_desc = this.netlist[net_id]
		from, to = net_desc.t1_name, net_desc.t2_name
		#to, from = net_desc.t1_name, net_desc.t2_name
		fail unless from && to # class is string or maybe integer?
		fail if from == to
		fail unless start_node = this.regions.find{|r| r.incident && r.vertex.name == from}
		if this.rstyles
			net_desc.trace_clearance = this.rstyles[net_desc.style_name].trace_clearance
			net_desc.trace_width = this.rstyles[net_desc.style_name].trace_width
		else
			net_desc.trace_width = Trace_Width 
			net_desc.trace_clearance = Clearance 
		}
=begin
very basic test for using rescue vias
		unless path = dijkstra(start_node, to, net_desc)
			net_desc = net_desc.dup
			net_desc.t2_name = 'rescue_via'
			path = dijkstra(start_node, 'rescue_via', net_desc)
			if path 
				path[0].vertex.name = 'used_rescue_via'
			}
		}
		unless path #= dijkstra(start_node, to, net_desc)
=}
		if max_detour_factor == 0
return dijkstra(start_node, to, net_desc, 1.5) != nil
		}


		unless path = dijkstra(start_node, to, net_desc, max_detour_factor)
			if max_detour_factor != 2
			puts 'dijkstra failed!'
			x, y = this.regions.find{|r| r.incident && r.vertex.name == to}.vertex.xy
			this.pic.set_source_rgba(1, 1, 1, 1)
			this.pic.set_line_width(ATW)
			this.pic.move_to(x, y)
			this.pic.line_to(*start_node.vertex.xy)
			this.pic.stroke
			}
			return false
		}
		first = path[-1]
		last = path[0]
		fail if first == last
		if path.length > 2 # ignore direct connections without a single split region!
			first.idirs << [path[-2].rx - first.vertex.x, path[-2].ry - first.vertex.y] # same as above
			last.idirs << [path[1].rx - last.vertex.x, path[1].ry - last.vertex.y]
			###first.idirs << [cur.rx - first.rx, cur.ry - first.ry] # this may work when we fix qbors() too
		}
		r1 = r2 = nil
		this.pic.arc(first.vertex.x, first.vertex.y, 2 * ATW, 0, 6)
		this.pic.stroke
		this.pic.move_to(first.vertex.x, first.vertex.y)
		path.reverse.each_cons(3){|prv, cur, nxt|
			fail unless prv && cur && nxt 
			ne, ne_comp = full_split_neighbor_list(prv, nxt, cur)
			fail if ne_comp.include?(prv) || ne_comp.include?(nxt)
			fail if ne.include?(prv) || ne.include?(nxt)
			ne << nxt
			ne_comp << nxt
			if r1
				ne.delete(r2)
				ne_comp.delete(r1)
			else
				ne << prv
				ne_comp << prv
			}
			this.regions.delete(cur)
			r1 = Region.new(cur.vertex)
			r2 = Region.new(cur.vertex)
			r1.idirs = cur.idirs.dup
			r2.idirs = cur.idirs.dup
			r1.odirs = cur.odirs.dup
			r2.odirs = cur.odirs.dup
			r1.incident =	r2.incident = cur.incident
			# give r1 and r2 an offset vector perp}icular to the path to allow a distinction
			if false#nxt.vertex == prv.vertex
				puts '+++', nxt.vertex.xy
				this.pic.arc(nxt.vertex.x, nxt.vertex.y, 12 * ATW, 0, 4)
		this.pic.stroke

			}

			dx1 = dy1 = dx2 = dy2 = 0
			if prv == first
				#puts "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
				dx2 = cur.rx - prv.rx
				dy2 = cur.ry - prv.ry
				h = Math::hypot(dx2, dy2)
				dx2 /= h
				dy2 /= h
			}
			if nxt == last
				#puts "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
				dx1 = nxt.rx - cur.rx
				dy1 = nxt.ry - cur.ry
				h = Math::hypot(dx1, dy1)
				dx1 /= h
				dy1 /= h
			}
			if prv == first || nxt == last
				r1.g = r2.g = cur.g * 0.5
				dy = (dx1 + dx2)
				dx =  -(dy1 + dy2)
				h = Math::hypot(dx, dy) / cur.g # zero for full 2 PI turn
				dx /= h 
				dy /= h
				#fail if dx == 0 || dy == 0
				r1.ox = cur.ox + dx
				r1.oy = cur.oy + dy
				r2.ox = cur.ox - dx
				r2.oy = cur.oy - dy
				r1.rx = r1.vertex.x + r1.ox
				r1.ry = r1.vertex.y + r1.oy
				r2.rx = r2.vertex.x + r2.ox
				r2.ry = r2.vertex.y + r2.oy
			else

				r1.ox = cur.ox
				r1.oy = cur.oy
				r2.ox = cur.ox
				r2.oy = cur.oy
				r1.rx = cur.rx
				r1.ry = cur.ry
				r2.rx = cur.rx
				r2.ry = cur.ry
			}



			if true#nxt.vertex != prv.vertex # h == 0
				#r1.g = r2.g = cur.g * 0.5 # magnitude of additional offset decreases for each split by factor 0.5 
				#dx1 = nxt.vertex.x - cur.vertex.x
				#dy1 = nxt.vertex.y - cur.vertex.y
				dx1 = nxt.rx - cur.rx
				dy1 = nxt.ry - cur.ry
				h = Math::hypot(dx1, dy1)
				dx1 /= h
				dy1 /= h
				#dx2 = cur.vertex.x - prv.vertex.x
				#dy2 = cur.vertex.y - prv.vertex.y
				dx2 = cur.rx - prv.rx
				dy2 = cur.ry - prv.ry
				h = Math::hypot(dx2, dy2)
				dx2 /= h
				dy2 /= h
				dy = (dx1 + dx2)
				dx =  -(dy1 + dy2)
				h = Math::hypot(dx, dy) #/ cur.g # zero for full 2 PI turn
				dx /= h 
				dy /= h
				#r1.ox = cur.ox + dx
				#r1.oy = cur.oy + dy
				#r2.ox = cur.ox - dx
				#r2.oy = cur.oy - dy
				#r1.rx = r1.vertex.x + r1.ox
				#r1.ry = r1.vertex.y + r1.oy
				#r2.rx = r2.vertex.x + r2.ox
				#r2.ry = r2.vertex.y + r2.oy
			}
			this.regions << r1 << r2
			cur.neighbors.each{|el| el.neighbors.delete(cur)}
			ne.each{|el|
				el.neighbors << r1
				r1.neighbors << el
			}
			ne_comp.each{|el|
				el.neighbors << r2
				r2.neighbors << el
			}
			if cur.lr_turn != cur.outer
				r1.incident = false
			else
				r2.incident = false
			}
			if cur.outer && dx
				if cur.lr_turn
					r2.odirs << [dx, dy]
				else
					r1.odirs << [-dx, -dy]
				}
			}
			this.pic.line_to(cur.vertex.x, cur.vertex.y)
		}

		this.pic.line_to(last.vertex.x, last.vertex.y)
		this.pic.stroke

		pstep = nil
		path.each_with_index{|cur, i|  
			nxt = (i == path.length - 1 ? nil : path[i + 1])
			prv = (i == 0 ? nil : path[i - 1])
			nv = (nxt ? nxt.vertex : nil)
			pv = (prv ? prv.vertex : nil)
			cv = cur.vertex
			step = Step.new(pv, nv, this.path_ID)
			step.outer = cur.outer
			step.lr_turn = !cur.lr_turn
			step.net_desc = net_desc
			step.vertex = cv
			step.pstep = pstep
			pstep = step
			if prv and nxt
				cv.update(step) # TODO: if one vertex includes his neighbor vertex, then skip that one!
				cv.unfri}ly_resize
				step.rgt = step.outer != cur.lr_turn
				step.xt = !step.outer
				cv.attached_nets << step
			else
				step.rgt = false
				cv.incident_nets << step
			}
		}
		this.path_ID += 1
		while p = pstep.pstep
			p.nstep = pstep
			pstep = p
		}
		return true
	}

	# http://en.wikipedia.org/wiki/Tangent_lines_to_circles
	# http://www.ambrsoft.com/TrigoCalc/Circles2/Circles2Tangent_.htm
	# https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Tangents_between_two_circles
	# UGLY: what when tangent does not exist?
        */

  /*

	smart_replace(step, list)
		if step.prev == step.next # can occur due to nubly()
			#fail # can this really occur?
			fail unless list.empty? # should be empty?
			step.pstep.nstep = step.nstep.nstep
			step.pstep.next = step.nstep.next
			step.nstep.nstep.pstep = step.pstep
			step.nstep.nstep.prev = step.prev
			step.next.new_delete_net(step.nstep)
		elsif list.empty?
			ps = step.pstep
			ns = step.nstep
 			ps.next = step.next
 			ns.prev = step.prev
			ps.nstep = ns
			ns.pstep = ps
		else
		  pstep = step.pstep
			pv = step.prev
			list.each{|v|
				n = Step.new(pv, nil, step.id)
				n.net_desc = step.net_desc
				n.vertex = v
				n.pstep = pstep
				pstep.nstep = n
				pstep.next = v 
				pstep = n
				pv = v
				n.rgt = !step.rgt
				n.xt = true # TODO: check
				n.outer = true
				v.update(n)
				v.attached_nets << n
			}
			pstep.next = step.next
			pstep.nstep = step.nstep
			pstep.nstep.prev = pv
			pstep.nstep.pstep = pstep
		}
		step.vertex.new_delete_net(step)
	}

	#\   |   /
	# \  |  /
	#  \ | /  3 attached concave nets not overlapping
	#    O ------------
	#     \ -----
	#      \
	#       \
	#        \
	# sort attached nets and calculate its radii.
	# this should work for concave (before attachment operator is applied) and convex final nets
	# regard groups by angle: overlapping angles needs different radii for arcs,
	# non overlapping attached arcs may have the same radius.
	# generally one terminal should have at least two final convex groups -- but a terminal with
	# a very big radius may have more than 2 attached groups.
	# Indeed nets never cross, so overlapping is full including
	# currently we collect all attached nets of a terminal in one single array called
	# attached_nets -- we may consider using a separate array for each group...
	# maybe we should regard minimal gap as overlapping? Introduce an eps?


	# sort attached nets and calculate its radii
	prepare_steps
		this.vertices.each{|vert|
			next if vert.attached_nets.empty?
			vert.reset_initial_size
			[true, false].each{|b|
				vert.attached_nets.each{|step|
					next if step.xt == b
					net = step.net_desc
					trace_sep = [vert.separation, net.trace_clearance].max
					vert.radius += trace_sep + net.trace_width
					step.radius = vert.radius - net.trace_width * 0.5
					vert.separation = net.trace_clearance
				}
			}
		}
	}

	sort_attached_nets
		this.vertices.each{|vert| vert.sort_attached_nets}
	}

	convex_kkk(prev_step, step, nxt_step)
		pv, cv, nv = step.prev, step.vertex, step.next
		x1, y1, x2, y2	= get_tangents(pv.x, pv.y, prev_step.radius, prev_step.rgt, cv.x, cv.y, step.radius, step.rgt)
		x3, y3, x4, y4	= get_tangents(cv.x, cv.y, step.radius, step.rgt, nv.x, nv.y, nxt_step.radius, nxt_step.rgt)
		x2, y2, x3, y3 = line_line_intersection(x1, y1, x2, y2, x3, y3, x4, y4) # get crossing point and ua, ub
				if (x2 != nil) && ((x3 > 0 && x3 < 1) || (y3 > 0 && y3 < 1))
			return x2, y2
		else
			return nil
		}
	}

  nubly(collapse = false)
		#return
	  replaced = true
		rep_c = 0
		while replaced do
			replaced = false
			rep_c += 1
			this.vertices.each{|cv|
				cv.attached_nets.reverse_each{|step|
					prev_step, nxt_step = step.pstep, step.nstep

					pv, nv = step.prev, step.next
					d = Math::hypot(cv.x - pv.x, cv.y - pv.y) - (prev_step.radius - step.radius).abs * 1.02
					if d < 0
						if step.radius < prev_step.radius
							step.radius -= d
							replaced = true
						}
						next
					}
					d = Math::hypot(cv.x - nv.x, cv.y - nv.y) - (nxt_step.radius - step.radius).abs * 1.02
					if d < 0
						if step.radius < nxt_step.radius
							step.radius -= d
							replaced = true
						}
						next
					}

					hx, hy = convex_kkk(prev_step, step, nxt_step)
					step.xt = hx != nil
					if collapse && step.xt
						pv, nv = step.prev, step.next
						hv0 = Vertex.new(hx, hy)

						#fail if pv == nv
						replaced = true
						pvx = pv.x
						pvy = pv.y
						nvx = nv.x
						nvy = nv.y
						if pp = prev_step.pstep
							hx, hy = convex_kkk(pp, prev_step, step)
						}
						if pp && hx
							ppv = Vertex.new(hx, hy)
						else
							ppv = pv
						}
						if nn = nxt_step.nstep
							hx, hy = convex_kkk(step, nxt_step, nn)
						}
						if nn && hx
							nnv = Vertex.new(hx, hy)
						else
							nnv = nv
						}
						hx = nvx - pvx
						hy = nvy - pvy
						if step.rgt
							vec_x, vec_y = hy, -hx
						else
							vec_x, vec_y = -hy, hx
						}
						hv3 = Vertex.new(pvx + hx * 0.5 + vec_x, pvy + hy * 0.5 + vec_y)
						hx *= 2
						hy *= 2
						vec_x *= 2
						vec_y *= 2
						hv4 = Vertex.new(pvx - hx + vec_x, pvy - hy + vec_y)
						hv5 = Vertex.new(nvx + hx + vec_x, nvy + hy + vec_y)
						rep = vertices_in_polygon([ppv, hv0, nnv, hv3], this.vertices) - [pv, nv, ppv, cv, nnv, hv3]
						unless rep.empty?
							net = step.net_desc
							rep.each{|v|
								v.trgt = !step.rgt
								v.tradius = v.radius + [net.trace_clearance, v.separation].max + net.trace_width * 0.5
							}
							pv.trgt = step.pstep.rgt
							pv.tradius = step.pstep.radius
							nv.trgt = step.nstep.rgt
							nv.tradius = step.nstep.radius
							rep = new_convex_vertices(rep, pv, nv, hv4, hv5)
						}
						smart_replace(step, rep)
					}
				}
			}
		}
	}

	draw_routes(layer = 0)
		this.file = File.open("layer_#{2 - layer}.pcb", "w")	
 	this.file.write("FileVersion[20070407]\n")
 	this.file.write("PCB[\"\" 350000 330000]\n")
 	this.file.write("Grid[3900.0 1800 100 1]\n")
	if layer == 0
	gen_vias
	
 	this.file.write("Layer(1 \"\")\n(\n")
else
 	this.file.write("Layer(4 \"\")\n(\n")
}
		set_color(0, 0, 0, 1)
		this.vertices.each{|vert|
			vert.incident_nets.each{|n|
				if n.next
					this.pic.new_sub_path
					this.pic.arc(vert.x, vert.y, 100, 0, 2 * Math::PI)
					this.pic.stroke
				}
				thi = n.net_desc.trace_width
				sep = n.net_desc.trace_clearance
				last = vert
				lastx = lasty = nil
				lr = 0
				to = n.next
				to_net = n.nstep
				while to do
					last_net = to_net.pstep
					last = last_net.vertex
					radius = to_net.radius
					if last.x == to.x && last.y == to.y
					last.vis_flag = 1
					else
					t = get_tangents(last.x, last.y, lr, last_net.rgt, to.x, to.y, radius, to_net.rgt)
					gen_line(*t, thi)
					if lr > 0
					  start_angle = Math.atan2(lasty - last.y, lastx - last.x)
						}_angle = Math.atan2(t[1] - last.y, t[0] - last.x)
						start_angle, }_angle = }_angle, start_angle unless last_net.rgt
						gen_arc(last.x, last.y, lr, start_angle, }_angle, thi)
						this.pic.set_source_rgba(0, 0, 0, 1) 
					}
					}
					lr = radius
					last = to
					to_net = to_net.nstep
					if to_net
					to = to_net.vertex
					else
						to = nil
					}
					lastx = t[2]
					lasty = t[3]
				}
			}
		}
		this.file.write(")\n")
		file.close unless file == nil
	}

	set_line_width(w)
		this.pic.set_line_width(w)
	}
	set_color(r, g, b, a)
		this.pic.set_source_rgba(r, g, b, a)
	}
	save_picture
		this.image.write_to_png(this.filename)
	}
        */
}
