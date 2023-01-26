import * as io from "../../../lib/io";

describe("io.date", () => {
  it("deserializes/serializes values, returning IOLeft on invalid dates", async () => {
    expect(await io.date.deserialize("2023-01-01")).toEqual(
      io.IOAccept(new Date("2023-01-01"))
    );

    expect(await io.date.deserialize("Wobbly Bobbly")).toEqual(
      io.IOReject({
        condition: "date",
        value: "Wobbly Bobbly",
      })
    );

    expect(await io.date.serialize(new Date("2023-01-01"))).toEqual(
      io.IOAccept("2023-01-01T00:00:00.000Z")
    );

    expect((await io.date.serialize(new Date("Wobbly Bobble"))).isLeft()).toBe(
      true
    );
  });
});
