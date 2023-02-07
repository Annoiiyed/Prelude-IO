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

  it("Deserializes complex objects", () => {
    const input: BusInputType<typeof TestBus> = {
      str: "Foo",
    };

    const output: BusOutputType<typeof TestBus> = {
      str: "Foo",
    };

    assert.deepEqual(TestBus.deserialize(input), io.IOAccept(output));
  });

  it("Works with freshly deserialized JSON", () => {
    const json = JSON.parse('{"str": "Foo"}');

    assert.deepEqual(
      TestBus.deserialize(json),
      io.IOAccept({
        str: "Foo",
      })
    );
  });

  it("Deep rejects mismatching fields", () => {
    assert.ok(TestBus.deserialize({ str: 4 }).isLeft());

    assert.ok(TestBus.serialize({ str: 4 }).isLeft());

    assert.ok(
      NestedBus.deserialize({
        num: [3, 5, 7],
        nest: { str: 4 },
      }).isLeft()
    );

    assert.ok(
      NestedBus.serialize({
        // @ts-expect-error Testing invalid input
        num: Vector.of(3, "5", 7),
        nest: { str: 4 },
      }).isLeft()
    );

    assert.ok(TestBus.deserialize(undefined).isLeft());
    assert.ok(TestBus.deserialize(false).isLeft());
    assert.ok(TestBus.deserialize(null).isLeft());
    assert.ok(TestBus.deserialize({}).isLeft());

    assert.ok(TestBus.serialize(undefined).isLeft());
    assert.ok(TestBus.serialize(false).isLeft());
    assert.ok(TestBus.serialize(null).isLeft());
    assert.ok(TestBus.serialize({}).isLeft());
  });

  it("Deserializes complex objects when nested", () => {
    assert.deepEqual(
      NestedBus.deserialize({
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

  it("Serializes complex objects", () => {
    assert.deepEqual(
      NestedBus.serialize({
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
