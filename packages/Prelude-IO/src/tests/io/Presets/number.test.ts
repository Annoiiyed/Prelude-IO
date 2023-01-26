import * as io from "../../../lib/io";

describe("io.number", () => {
  it("deserializes/serializes values, returning IOLeft on non-numbers", async () => {
    expect(await io.number.deserialize(123)).toEqual(io.IOAccept(123));

    expect(await io.number.serialize(123)).toEqual(io.IOAccept(123));

    expect(await io.number.deserialize("foo bar baz")).toEqual(
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

    // @ts-expect-error Testing invalid input
    expect(await io.number.serialize("foo bar baz")).toEqual(
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

    expect(await io.number.deserialize(null)).toEqual(
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
