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
export function split_neighbor_list(a, b, n) {
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
export function new_bor_list(a, b, n) {
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

export function full_split_neighbor_list(a, b, n) {
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

let P_IN = 1;
let P_ON = 0;
let P_OUT = -1;
let COLLINEAR = -2;
// see http://en.wikipedia.org/wiki/Barycentric_coordinates_%28mathematics%29
export function point_in_triangle(x1, y1, x2, y2, x3, y3, x, y) {
  let d = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
  if (d == 0) {
    return COLLINEAR; // maybe check if x,y is ... -- currently we do not care
  }
  let l1 = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / d;
  let l2 = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / d;
  let l3 = 1 - l1 - l2;
  let min = Math.min(l1, l2, l3);
  let max = Math.max(l1, l2, l3);
  if (0 <= min && max <= 1) {
    return 0 < min && max < 1 ? P_IN : P_ON;
  } else {
    return P_OUT;
  }
}

// Intersection point of two lines in 2 dimensions
// http://paulbourke.net/geometry/pointlineplane/
export function line_line_intersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  let x2x1 = x2 - x1;
  let y2y1 = y2 - y1;
  if ((d = (y4 - y3) * x2x1 - (x4 - x3) * y2y1) == 0) {
    return nil; // parallel?
  }
  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / d;
  let ub = (x2x1 * (y1 - y3) - y2y1 * (x1 - x3)) / d;
  return [x1 + ua * x2x1, y1 + ua * y2y1, ua, ub];
}

//      (c)
//     /
//    /     (p)
//   /
// (b)
// see http://www.geometrictools.com/
// see also http://paulbourke.net/geometry/pointlineplane/
export function unused_distance_line_segment_point_squared(
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
  if (t0 <= 0) {
  } else if (t0 < 1) {
    hx -= t0 * mx;
    hy -= t0 * my;
  } else {
    hx -= mx;
    hy -= my;
  }
  return hx ** 2 + hy ** 2;
}

export function vertices_in_polygon(p_vertices, test_vertices) {
  let res = [];
  let nm1 = p_vertices.length - 1;
  for (let tp of test_vertices) {
    let ty = tp.y;
    let i = 0;
    let j = nm1;
    let c = false;
    while (i <= nm1) {
      if (
        ((p_vertices[i].y <= ty && ty < p_vertices[j].y) ||
          (p_vertices[j].y <= ty && ty < p_vertices[i].y)) &&
        tp.x <
          ((p_vertices[j].x - p_vertices[i].x) * (ty - p_vertices[i].y)) /
            (p_vertices[j].y - p_vertices[i].y) +
            p_vertices[i].x
      ) {
        c = !c;
      }
      j = i;
      i += 1;
    }
    if (c) {
      res.push(tp);
    }
  }
  return res;
}
