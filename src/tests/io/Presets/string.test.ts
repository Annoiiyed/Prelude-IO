import * as io from "../../../lib/io";

describe("io.string", () => {
  it("decodes/encodes values, returnging IOLeft on non-strings", async () => {
    expect(await io.string.decode("foo bar baz")).toEqual(
      io.IOAccept("foo bar baz")
    );

    expect(await io.string.encode("foo bar baz")).toEqual(
      io.IOAccept("foo bar baz")
    );

    expect(await io.string.decode(123)).toEqual(
      io.IOReject({
        condition: "string",
        value: 123,
      })
    );

    // @ts-expect-error Testing
    expect(await io.string.encode(123)).toEqual(
      io.IOReject({
        condition: "string",
        value: 123,
      })
    );

    expect(await io.string.decode(null)).toEqual(
      io.IOReject({
        condition: "string",
        value: null,
      })
    );
  });
});
