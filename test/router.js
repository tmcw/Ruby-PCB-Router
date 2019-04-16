import { Router } from "../router.js";
import test from "tape";

test("Router", t => {
  const router = new Router();
  t.ok(router);
  t.equal(router.next_name(), 1);
  t.end();
});
