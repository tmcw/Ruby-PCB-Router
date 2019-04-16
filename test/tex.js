import { Tex } from "../tex.js";
import test from "tape";

test("Tex", t => {
  const tex = new Tex(1, 2);
  t.ok(tex);
  t.equal(tex.x, 1);
  t.equal(tex.y, 2);
  t.end();
});
