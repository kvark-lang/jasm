import { assertEquals } from "https://deno.land/std@0.154.0/testing/asserts.ts";
import { factory } from "./mod.ts";

Deno.test({
  name: "test jasm - mov",
  fn: (t) => {
    const { mov } = factory({
      arch: "x86",
      withFormat: "elf",
    });
    t.step({
      name: "mov eax, 2",
      fn: () => {
        assertEquals(mov("eax", 2));
      },
    });
  },
});
