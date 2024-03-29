import assert from "assert";
import { Vector } from "prelude-ts";
import * as io from "../../lib";

describe("io.Vector()", () => {
  it("Deserializes arrays", () => {
    assert.deepEqual(
      io.Vector(io.number).deserialize([1, 2, 3]),
      io.IOAccept(Vector.of(1, 2, 3))
    );
  });

  it("Serializes arrays", () => {
    assert.deepEqual(
      io.Vector(io.number).serialize(Vector.of(1, 2, 3)),
      io.IOAccept([1, 2, 3])
    );
  });

  it("Deserializes empty arrays", () => {
    assert.ok(
      // @ts-expect-error Testing unknown input
      io.Vector(io.number).deserialize([]).getOrThrow().isEmpty()
    );
  });

  it("Serializes empty arrays", () => {
    assert.deepEqual(
      io.Vector(io.number).serialize(Vector.empty()),
      io.IOAccept([])
    );
  });

  it("Does not deserialize mismatching inners", () => {
    assert.deepEqual(
      // @ts-expect-error Testing invalid input
      io.Vector(io.number).deserialize([1, 2, "3"]),
      io.IOReject({
        condition: "Vector(isNumber(any))",
        value: [1, 2, "3"],
        branches: io
          .IOReject({
            condition: "[2]",
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
          .getLeft(),
      })
    );
  });

  it("Does not serialize mismatching inners", () => {
    assert.deepEqual(
      // @ts-expect-error Testing invalid input
      io.Vector(io.number).serialize(Vector.of(1, 2, "3")),
      io.IOReject({
        condition: "Vector(isNumber(any))",
        // @ts-expect-error Testing invalid input
        value: Vector.of(1, 2, "3"),
        branches: io
          .IOReject({
            condition: "[2]",
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
          .getLeft(),
      })
    );
  });

  it("https://github.com/Annoiiyed/Prelude-IO/issues/3 - Fetch utility returns Right in inaproperiate situations", async () => {
    // @ts-expect-error - Testing invalid input
    assert.ok(io.Vector(io.string).deserialize({}).isLeft());

    // @ts-expect-error - Testing invalid input
    assert.ok(io.Vector(io.string).serialize({}).isLeft());
  });

  it("https://github.com/Annoiiyed/Prelude-IO/issues/4 - Vector throws an error when passed undefined", () => {
    const bus = io.Vector(io.string);

    const deRes = bus.deserialize(undefined);
    const serRes = bus.serialize(undefined);

    assert.deepEqual(
      deRes,
      io.IOReject({
        condition: "Vector(isString(any))",
        value: undefined,
      })
    );
    assert.deepEqual(
      serRes,
      io.IOReject({
        condition: "Vector(isString(any))",
        value: undefined,
      })
    );
  });
});
