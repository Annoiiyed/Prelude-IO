import * as io from "../../../lib/io";
import { IOReject } from "../../../lib/io";

describe("io.positiveNumber", () => {
  it("deserializes/serializes values, returning IOLeft on invalid numbers", async () => {
    expect(await io.positiveNumber.deserialize(1)).toEqual(io.IOAccept(1));
    expect(await io.positiveNumber.deserialize(NaN)).toEqual(
      io.IOReject({
        condition: "isValidNumber(isNumber(any))",
        value: NaN,
        branches: IOReject({
          condition: "isValidNumber",
          value: NaN,
        }).getLeft(),
      })
    );
    expect(await io.positiveNumber.deserialize(0)).toEqual(
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
