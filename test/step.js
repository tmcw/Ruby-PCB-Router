import { Step } from "../step.js";
import test from "tape";

test("Step", t => {
  const step = new Step(1, 2, 3);
  t.ok(step);
  t.end();
});
