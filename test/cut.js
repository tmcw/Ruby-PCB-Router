import { Cut } from "../cut.js";
import { Vertex } from "../vertex.js";
import test from "tape";

test("Cut", t => {
  const cut = new Cut(new Vertex(0, 0), new Vertex(1, 0));
  t.ok(cut);
  t.equal(cut.cap, 1);

  t.equal(cut.squeeze_strength(1, 2), 1056964608);
  cut.use(1, 2);
  t.equal(cut.squeeze_strength(1, 2), 1056964608);
  t.end();
});
