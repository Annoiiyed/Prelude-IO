import assert from "assert";
import { Option } from "prelude-ts";
import * as io from "../../lib";

describe("io.Optional()", () => {
  it("Deserializes values", async () => {
    assert.deepEqual(
      await io.Optional(io.number).deserialize(1),
      io.IOAccept(Option.of(1))
    );
  });

  it("Deserializes null", async () => {
    assert.deepEqual(
      await io.Optional(io.number).deserialize(null),
      io.IOAccept(Option.none())
    );
  });

  it("Serializes values", async () => {
    assert.deepEqual(
      await io.Optional(io.number).serialize(Option.of(1)),
      io.IOAccept(1)
    );
  });

  it("Serializes null", async () => {
    assert.deepEqual(
      await io.Optional(io.number).serialize(Option.none()),
      io.IOAccept(null)
    );
  });

  it("Does not deserialize mismatching inners", async () => {
    assert.deepEqual(
      await io.Optional(io.number).deserialize("3"),
      io.IOReject({
        condition: "Optional(isNumber(any))",
        value: "3",
        branches: io
          .IOReject({
            condition: "isNumber(any)",
            value: "3",
            branches: io
              .IOReject({
                condition: "isNumber",
                value: "3",
              })
              .getLeft(),
          })
          .getLeft(),
      })
    );
  });

  it("Does not serialize mismatching inners", async () => {
    assert.deepEqual(
      // @ts-expect-error Testing invalid input
      await io.Optional(io.number).serialize(Option.of("3")),
      io.IOReject({
        condition: "Optional(isNumber(any))",
        value: Option.of("3"),
        branches: io
          .IOReject({
            condition: "isNumber(any)",
            value: "3",
            branches: io
              .IOReject({
                condition: "isNumber",
                value: "3",
              })
              .getLeft(),
          })
          .getLeft(),
      })
    );
  });
});
