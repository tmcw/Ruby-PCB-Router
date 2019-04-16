import { Cut } from "../cut.js";
import { Vertex } from "../vertex.js";
import test from "tape";

test("Cut", t => {
  const cut = new Cut(new Vertex(0, 0), new Vertex(1, 0));
  t.ok(cut);
  t.equal(cut.cap, 1);
  t.end();
});
