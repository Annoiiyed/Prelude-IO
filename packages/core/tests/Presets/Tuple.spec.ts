import assert from "assert";
import * as io from "../../lib";
import { Vector } from "prelude-ts";

describe("io.Tuple()", () => {
  it("deserializes a tuple of busses", () => {
    const bus = io.Tuple([
      io.number,
      io.string,
      io.boolean,
      io.Vector(io.number),
    ]);

    {
      const result = bus.deserialize([5, "six", false, [1, 2, 3]]);

      assert.ok(result.isRight());
      assert.deepEqual(result.get(), [5, "six", false, Vector.of(1, 2, 3)]);
    }

    // @ts-expect-error - Testing invalid input
    const result = bus.deserialize(["bla", "bla", 5]);

    assert.ok(result.isLeft());
  });
});
