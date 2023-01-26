import * as io from "../../../lib/io";

describe("io.string", () => {
  it("deserializes/serializes values, returnging IOLeft on non-strings", async () => {
    expect(await io.string.deserialize("foo bar baz")).toEqual(
      io.IOAccept("foo bar baz")
    );

    expect(await io.string.serialize("foo bar baz")).toEqual(
      io.IOAccept("foo bar baz")
    );

    expect(await io.string.deserialize(123)).toEqual(
      io.IOReject({
        condition: "string",
        value: 123,
      })
    );

    // @ts-expect-error Testing
    expect(await io.string.serialize(123)).toEqual(
      io.IOReject({
        condition: "string",
        value: 123,
      })
    );

    expect(await io.string.deserialize(null)).toEqual(
      io.IOReject({
        condition: "string",
        value: null,
      })
    );
  });
});
