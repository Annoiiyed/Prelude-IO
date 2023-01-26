import { Vector } from "prelude-ts";
import * as io from "../../../lib/io";
import { BusInputType, BusOutputType } from "../../../lib/io";

describe("io.Complex()", () => {
  const TestBus = io.Complex("TestBus", {
    str: io.string,
  });

  it("Deserializes complex objects", async () => {
    const input: BusInputType<typeof TestBus> = {
      str: "Foo",
    };

    const output: BusOutputType<typeof TestBus> = {
      str: "Foo",
    };

    expect(await TestBus.deserialize(input)).toEqual(io.IOAccept(output));
  });

  it("Works with freshly deserialized JSON", async () => {
    const json = JSON.parse('{"str": "Foo"}');

    expect(await TestBus.deserialize(json)).toEqual(
      io.IOAccept({
        str: "Foo",
      })
    );
  });

  it("Deserializes complex objects when nested", async () => {
    const NestedBus = io.Complex("NestedBus", {
      num: io.Vector(io.number),
      nest: TestBus,
    });

    const input = {
      num: [3, 5, 7],
      nest: { str: "Foo" },
    };

    expect(await NestedBus.deserialize(input)).toEqual(
      io.IOAccept<BusOutputType<typeof NestedBus>>({
        num: Vector.of(3, 5, 7),
        nest: {
          str: "Foo",
        },
      })
    );
  });
});
