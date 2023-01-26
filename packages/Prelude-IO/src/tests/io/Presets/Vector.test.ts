import { Vector } from "prelude-ts";
import * as io from "../../../lib/io";

describe("io.Vector()", () => {
  it("Deserializes arrays", async () => {
    expect(await io.Vector(io.number).deserialize([1, 2, 3])).toEqual(
      io.IOAccept(Vector.of(1, 2, 3))
    );
  });

  it("Serializes arrays", async () => {
    expect(await io.Vector(io.number).serialize(Vector.of(1, 2, 3))).toEqual(
      io.IOAccept([1, 2, 3])
    );
  });

  it("Deserializes empty arrays", async () => {
    expect(
      // @ts-expect-error Testing unknown input
      (await io.Vector(io.number).deserialize([])).getOrThrow().isEmpty()
    ).toBe(true);
  });

  it("Serializes empty arrays", async () => {
    expect(await io.Vector(io.number).serialize(Vector.empty())).toEqual(
      io.IOAccept([])
    );
  });

  it("Does not deserialize mismatching inners", async () => {
    expect(await io.Vector(io.number).deserialize([1, 2, "3"])).toEqual(
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

  it("Does not serialize mismatching inners", async () => {
    // @ts-expect-error Testing invalid input
    expect(await io.Vector(io.number).serialize(Vector.of(1, 2, "3"))).toEqual(
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
});
