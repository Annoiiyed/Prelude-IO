import assert from "assert";
import * as io from "../../lib";

describe("io.string", () => {
  it("deserializes/serializes values, returning IOLeft on non-strings", () => {
    assert.deepEqual(
      io.string.deserialize("foo bar baz"),
      io.IOAccept("foo bar baz")
    );

    assert.deepEqual(
      io.string.serialize("foo bar baz"),
      io.IOAccept("foo bar baz")
    );

    assert.deepEqual(
      io.string.deserialize(123),
      io.IOReject({
        condition: "isString(any)",
        value: 123,
        branches: io
          .IOReject({
            condition: "isString",
            value: 123,
          })
          .getLeft(),
      })
    );

    assert.deepEqual(
      // @ts-expect-error Testing invalid input
      io.string.serialize(123),
      io.IOReject({
        condition: "isString(any)",
        value: 123,
        branches: io
          .IOReject({
            condition: "isString",
            value: 123,
          })
          .getLeft(),
      })
    );

    assert.deepEqual(
      io.string.deserialize(null),
      io.IOReject({
        condition: "isString(any)",
        value: null,
        branches: io
          .IOReject({
            condition: "isString",
            value: null,
          })
          .getLeft(),
      })
    );
  });
});
