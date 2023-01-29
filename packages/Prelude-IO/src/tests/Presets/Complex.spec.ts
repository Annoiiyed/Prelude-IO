import assert from "assert";
import { Vector } from "prelude-ts";
import * as io from "../../lib";
import { BusInputType, BusOutputType } from "../../lib";

describe("io.Complex()", () => {
  const TestBus = io.Complex("TestBus", {
    str: io.string,
    // Testing a lot of invalid input, so we need to disable the type checker
  }) as io.Bus;

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

    assert.deepEqual(await TestBus.deserialize(input), io.IOAccept(output));
  });

  it("Works with freshly deserialized JSON", async () => {
    const json = JSON.parse('{"str": "Foo"}');

    assert.deepEqual(
      await TestBus.deserialize(json),
      io.IOAccept({
        str: "Foo",
      })
    );
  });

  it("Deep rejects mismatching fields", async () => {
    assert.ok((await TestBus.deserialize({ str: 4 })).isLeft());

    assert.ok((await TestBus.serialize({ str: 4 })).isLeft());

    assert.ok(
      (
        await NestedBus.deserialize({
          num: [3, 5, 7],
          nest: { str: 4 },
        })
      ).isLeft()
    );

    assert.ok(
      (
        await NestedBus.serialize({
          // @ts-expect-error Testing invalid input
          num: Vector.of(3, "5", 7),
          nest: { str: 4 },
        })
      ).isLeft()
    );

    assert.ok((await TestBus.deserialize(undefined)).isLeft());
    assert.ok((await TestBus.deserialize(false)).isLeft());
    assert.ok((await TestBus.deserialize(null)).isLeft());
    assert.ok((await TestBus.deserialize({})).isLeft());

    assert.ok((await TestBus.serialize(undefined)).isLeft());
    assert.ok((await TestBus.serialize(false)).isLeft());
    assert.ok((await TestBus.serialize(null)).isLeft());
    assert.ok((await TestBus.serialize({})).isLeft());
  });

  it("Deserializes complex objects when nested", async () => {
    assert.deepEqual(
      await NestedBus.deserialize({
        num: [3, 5, 7],
        nest: { str: "Foo" },
      }),
      io.IOAccept<BusOutputType<typeof NestedBus>>({
        num: Vector.of(3, 5, 7),
        nest: {
          str: "Foo",
        },
      })
    );
  });

  it("Serializes complex objects", async () => {
    assert.deepEqual(
      await NestedBus.serialize({
        num: Vector.of(3, 5, 7),
        nest: {
          str: "Foo",
        },
      }),
      io.IOAccept<BusInputType<typeof NestedBus>>({
        num: [3, 5, 7],
        nest: { str: "Foo" },
      })
    );
  });
});
