import assert from "assert";
import * as io from "../../lib";

describe("io.number", () => {
  it("deserializes/serializes values, returning IOLeft on non-numbers", () => {
    assert.deepEqual(io.number.deserialize(123), io.IOAccept(123));

    assert.deepEqual(io.number.serialize(123), io.IOAccept(123));

    assert.deepEqual(
      io.number.deserialize("foo bar baz"),
      io.IOReject({
        condition: "isNumber(any)",
        value: "foo bar baz",
        branches: io
          .IOReject({
            condition: "isNumber",
            value: "foo bar baz",
          })
          .getLeft(),
      })
    );

    assert.deepEqual(
      // @ts-expect-error Testing invalid input
      io.number.serialize("foo bar baz"),
      io.IOReject({
        condition: "isNumber(any)",
        value: "foo bar baz",
        branches: io
          .IOReject({
            condition: "isNumber",
            value: "foo bar baz",
          })
          .getLeft(),
      })
    );

    assert.deepEqual(
      io.number.deserialize(null),
      io.IOReject({
        condition: "isNumber(any)",
        value: null,
        branches: io
          .IOReject({
            condition: "isNumber",
            value: null,
          })
          .getLeft(),
      })
    );
  });
});
