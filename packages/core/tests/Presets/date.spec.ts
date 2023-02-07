import assert from "assert";
import * as io from "../../lib";

describe("io.date", () => {
  it("deserializes/serializes values, returning IOLeft on invalid dates", () => {
    assert.deepEqual(
      io.date.deserialize("2023-01-01"),
      io.IOAccept(new Date("2023-01-01"))
    );

    assert.deepEqual(
      io.date.deserialize("Wobbly Bobbly"),
      io.IOReject({
        condition: "date",
        value: "Wobbly Bobbly",
      })
    );

    assert.deepEqual(
      io.date.serialize(new Date("2023-01-01")),
      io.IOAccept("2023-01-01T00:00:00.000Z")
    );

    assert.ok(io.date.serialize(new Date("Wobbly Bobble")).isLeft());
  });
});
