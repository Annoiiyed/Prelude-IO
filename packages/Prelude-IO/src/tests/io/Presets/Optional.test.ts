import { Option } from "prelude-ts";
import * as io from "../../../lib/io";

describe("io.Optional()", () => {
  it("Deserializes values", async () => {
    expect(await io.Optional(io.number).deserialize(1)).toEqual(
      io.IOAccept(Option.of(1))
    );
  });

  it("Deserializes null", async () => {
    expect(await io.Optional(io.number).deserialize(null)).toEqual(
      io.IOAccept(Option.none())
    );
  });

  it("Serializes values", async () => {
    expect(await io.Optional(io.number).serialize(Option.of(1))).toEqual(
      io.IOAccept(1)
    );
  });

  it("Serializes null", async () => {
    expect(await io.Optional(io.number).serialize(Option.none())).toEqual(
      io.IOAccept(null)
    );
  });

  it("Does not deserialize mismatching inners", async () => {
    expect(await io.Optional(io.number).deserialize("3")).toEqual(
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
    // @ts-expect-error Testing invalid input
    expect(await io.Optional(io.number).serialize(Option.of("3"))).toEqual(
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
