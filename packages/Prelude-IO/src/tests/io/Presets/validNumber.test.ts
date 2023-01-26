import * as io from "../../../lib/io";
import { IOReject } from "../../../lib/io";

describe("io.validNumber", () => {
  it("deserializes/serializes values, returnging IOLeft on invalid numbers", async () => {
    expect(await io.validNumber.deserialize(0)).toEqual(io.IOAccept(0));
    expect(await io.validNumber.deserialize(NaN)).toEqual(
      io.IOReject({
        condition: "isValidNumber(number)",
        value: NaN,
        branches: IOReject({
          condition: "isValidNumber",
          value: NaN,
        }).getLeft(),
      })
    );
    expect(await io.validNumber.deserialize(Infinity)).toEqual(
      io.IOReject({
        condition: "isValidNumber(number)",
        value: Infinity,
        branches: IOReject({
          condition: "isValidNumber",
          value: Infinity,
        }).getLeft(),
      })
    );
  });
});
