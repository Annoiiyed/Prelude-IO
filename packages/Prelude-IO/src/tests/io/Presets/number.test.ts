import * as io from "../../../lib/io";

describe("io.number", () => {
  it("deserializes/serializes values, returnging IOLeft on non-numbers", async () => {
    expect(await io.number.deserialize(123)).toEqual(io.IOAccept(123));

    expect(await io.number.serialize(123)).toEqual(io.IOAccept(123));

    expect(await io.number.deserialize("foo bar baz")).toEqual(
      io.IOReject({
        condition: "number",
        value: "foo bar baz",
      })
    );

    // @ts-expect-error Testing
    expect(await io.number.serialize("foo bar baz")).toEqual(
      io.IOReject({
        condition: "number",
        value: "foo bar baz",
      })
    );

    expect(await io.number.deserialize(null)).toEqual(
      io.IOReject({
        condition: "number",
        value: null,
      })
    );
  });
});
