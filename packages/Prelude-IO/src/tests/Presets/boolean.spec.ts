import assert from "assert";
import * as io from "../../lib";

describe("io.number", () => {
  it("deserializes/serializes values, returning IOLeft on non-booleans", async () => {
    assert.deepEqual(await io.boolean.deserialize(true), io.IOAccept(true));

    assert.deepEqual(await io.boolean.serialize(true), io.IOAccept(true));

    assert.deepEqual(
      await io.boolean.deserialize("true"),
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
      await io.boolean.serialize("true"),
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
