import * as io from "../../../lib/io";

describe("io.string", () => {
  it("deserializes/serializes values, returning IOLeft on non-strings", async () => {
    expect(await io.string.deserialize("foo bar baz")).toEqual(
      io.IOAccept("foo bar baz")
    );

    expect(await io.string.serialize("foo bar baz")).toEqual(
      io.IOAccept("foo bar baz")
    );

    expect(await io.string.deserialize(123)).toEqual(
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

    // @ts-expect-error Testing invalid input
    expect(await io.string.serialize(123)).toEqual(
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

    expect(await io.string.deserialize(null)).toEqual(
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
