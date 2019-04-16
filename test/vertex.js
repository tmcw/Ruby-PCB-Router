import { Vertex } from "../vertex.js";
import test from "tape";

test("Vertex", t => {
  const vertex = new Vertex();
  t.ok(vertex);
  t.end();
});
