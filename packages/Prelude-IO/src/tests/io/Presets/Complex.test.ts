import { Vector } from "prelude-ts";
import * as io from "../../../lib/io";
import { BusInputType, BusOutputType } from "../../../lib/io";

describe("io.Complex()", () => {
  const TestBus = io.Complex("TestBus", {
    str: io.string,
  });

  const NestedBus = io.Complex("NestedBus", {
    num: io.Vector(io.number),
    nest: TestBus,
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

  it("Deep rejects mismatching fields", async () => {
    expect((await TestBus.deserialize({ str: 4 })).isLeft()).toBe(true);

    // @ts-expect-error Testing invalid input
    expect((await TestBus.serialize({ str: 4 })).isLeft()).toBe(true);
  });

  it("Deserializes complex objects when nested", async () => {
    expect(
      await NestedBus.deserialize({
        num: [3, 5, 7],
        nest: { str: "Foo" },
      })
    ).toEqual(
      io.IOAccept<BusOutputType<typeof NestedBus>>({
        num: Vector.of(3, 5, 7),
        nest: {
          str: "Foo",
        },
      })
    );
  });

  it("Serializes complex objects", async () => {
    expect(
      await NestedBus.serialize({
        num: Vector.of(3, 5, 7),
        nest: {
          str: "Foo",
        },
      })
    ).toEqual(
      io.IOAccept<BusInputType<typeof NestedBus>>({
        num: [3, 5, 7],
        nest: { str: "Foo" },
      })
    );
  });
});
