import { Vector } from "prelude-ts";
import * as io from "../../../lib/io";
import { BusOutputType } from "../../../lib/io";

describe("io.Complex()", () => {
  const TestBus = io.Complex("TestBus", {
    str: io.string,
  });

  it("Decodes complex objects", async () => {
    expect(await TestBus.decode({ str: "Foo" })).toEqual(
      io.IOAccept<BusOutputType<typeof TestBus>>({
        str: "Foo",
      })
    );
  });

  it("Works with freshly decoded JSON", async () => {
    const json = JSON.parse('{"str": "Foo"}');

    expect(await TestBus.decode(json)).toEqual(
      io.IOAccept({
        str: "Foo",
      })
    );
  });

  it("Decodes complex objects when nested", async () => {
    const NestedBus = io.Complex("NestedBus", {
      num: io.Vector(io.number),
      nest: TestBus,
    });

    const input = {
      num: [3, 5, 7],
      nest: { str: "Foo" },
    };

    expect(await NestedBus.decode(input)).toEqual(
      io.IOAccept<BusOutputType<typeof NestedBus>>({
        num: Vector.of(3, 5, 7),
        nest: {
          str: "Foo",
        },
      })
    );
  });
});
