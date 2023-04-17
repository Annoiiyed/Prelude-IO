import assert from "assert";
import * as io from "../../lib";
import { IOReject } from "../../lib";

describe("io.validNumber", () => {
  it("deserializes/serializes values, returning IOLeft on invalid numbers", () => {
    assert.deepEqual(io.validNumber.deserialize(0), io.IOAccept(0));

    assert.deepEqual(
      // @ts-expect-error Testing invalid input
      io.validNumber.deserialize("foo bar"),
      io.IOReject({
        condition: "isNumber(any)",
        value: "foo bar",
        branches: IOReject({
          condition: "isNumber",
          value: "foo bar",
        }).getLeft(),
      })
    );

    assert.deepEqual(
      io.validNumber.deserialize(NaN),
      io.IOReject({
        condition: "isValidNumber(isNumber(any))",
        value: NaN,
        branches: IOReject({
          condition: "isValidNumber",
          value: NaN,
        }).getLeft(),
      })
    );

    assert.deepEqual(
      io.validNumber.deserialize(Infinity),
      io.IOReject({
        condition: "isValidNumber(isNumber(any))",
        value: Infinity,
        branches: IOReject({
          condition: "isValidNumber",
          value: Infinity,
        }).getLeft(),
      })
    );
  });
});
