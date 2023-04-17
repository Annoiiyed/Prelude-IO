import assert from "assert";
import * as io from "../../lib";

describe("io.boolean", () => {
  it("deserializes/serializes values, returning IOLeft on non-booleans", () => {
    assert.deepEqual(io.boolean.deserialize(true), io.IOAccept(true));

    assert.deepEqual(io.boolean.serialize(true), io.IOAccept(true));

    assert.deepEqual(
      // @ts-expect-error - Testing invalid input
      io.boolean.deserialize("true"),
      io.IOReject({
        condition: "isBoolean(any)",
        value: "true",
        branches: io
          .IOReject({
            condition: "isBoolean",
            value: "true",
          })
          .getLeft(),
      })
    );

    assert.deepEqual(
      // @ts-expect-error Testing invalid input
      io.boolean.serialize("true"),
      io.IOReject({
        condition: "isBoolean(any)",
        value: "true",
        branches: io
          .IOReject({
            condition: "isBoolean",
            value: "true",
          })
          .getLeft(),
      })
    );
  });
});
