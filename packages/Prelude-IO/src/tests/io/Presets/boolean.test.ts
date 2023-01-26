import * as io from "../../../lib/io";

describe("io.number", () => {
  it("deserializes/serializes values, returning IOLeft on non-booleans", async () => {
    expect(await io.boolean.deserialize(true)).toEqual(io.IOAccept(true));
    expect(await io.boolean.serialize(true)).toEqual(io.IOAccept(true));
    expect(await io.boolean.deserialize("true")).toEqual(
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
    // @ts-expect-error Testing invalid input
    expect(await io.boolean.serialize("true")).toEqual(
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
