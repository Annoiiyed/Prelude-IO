import assert from "assert";
import * as io from "../../lib";
import { IOReject } from "../../lib";

describe("io.positiveNumber", () => {
  it("deserializes/serializes values, returning IOLeft on invalid numbers", async () => {
    assert.deepEqual(await io.positiveNumber.deserialize(1), io.IOAccept(1));

    assert.deepEqual(
      await io.positiveNumber.deserialize(NaN),
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
      await io.positiveNumber.deserialize(0),
      io.IOReject({
        condition: "isPositive(isValidNumber(isNumber(any)))",
        value: 0,
        branches: IOReject({
          condition: "isPositive",
          value: 0,
        }).getLeft(),
      })
    );
  });
});
