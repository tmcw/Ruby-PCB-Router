import { Region } from "../region";
import { Vertex } from "../vertex";
import test from "tape";

test("Region", t => {
  const region = new Region(new Vertex(0, 0));
  t.ok(region);
  const region2 = new Region(new Vertex(0, 1));
  t.equal(region.distance_to(region2), 1);
  t.end();
});
