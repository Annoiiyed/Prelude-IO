import assert from "assert";
import { Option } from "prelude-ts";
import * as io from "../../lib";

describe("io.Optional()", () => {
  it("Deserializes values", () => {
    assert.deepEqual(
      io.Optional(io.number).deserialize(1),
      io.IOAccept(Option.of(1))
    );
  });

  it("Deserializes null", () => {
    assert.deepEqual(
      io.Optional(io.number).deserialize(null),
      io.IOAccept(Option.none())
    );
  });

  it("Deserializes undefined", () => {
    assert.deepEqual(
      io.Optional(io.number).deserialize(undefined),
      io.IOAccept(Option.none())
    );
  });

  it("Serializes values", () => {
    assert.deepEqual(
      io.Optional(io.number).serialize(Option.of(1)),
      io.IOAccept(1)
    );
  });

  it("Serializes null", () => {
    assert.deepEqual(
      io.Optional(io.number).serialize(Option.none()),
      io.IOAccept(null)
    );
  });

  it("Does not deserialize mismatching inners", () => {
    assert.deepEqual(
      // @ts-expect-error - Testing invalid input
      io.Optional(io.number).deserialize("3"),
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

  it("Does not serialize mismatching inners", () => {
    assert.deepEqual(
      // Not all versions of TS call this an error, so ignore instead of expect
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Testing invalid input
      io.Optional(io.number).serialize(Option.of("3")),
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
