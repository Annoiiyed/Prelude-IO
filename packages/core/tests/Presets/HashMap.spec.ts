import assert from "assert";
import { HashMap } from "prelude-ts";
import * as io from "../../lib";

describe("io.HashMap", () => {
  // Just to make the output differ from the input
  const valueBus = io.Bus.create(
    "double",
    (n: number) => io.IOAccept(n * 2),
    (n: number) => io.IOAccept(n / 2)
  );

  const bus = io.HashMap(io.string, valueBus);

  it("deserialises an iterable of pairs into a hashmap", () => {
    const testInput = [
      ["foo", 1],
      ["bar", 2],
      ["baz", 3],
    ] as [string, number][];

    const result = bus.deserialize(testInput);

    assert.ok(result.isRight());
    assert.deepEqual(result.get().toObjectDictionary(String), {
      foo: 2,
      bar: 4,
      baz: 6,
    });
  });

  it("serialises a hashmap into an array of pairs", () => {
    const testInput = HashMap.of(["foo", 2], ["bar", 4], ["baz", 6]);

    const result = bus.serialize(testInput);

    assert.ok(result.isRight());
    assert.deepEqual(result.get(), [
      ["foo", 1],
      ["bar", 2],
      ["baz", 3],
    ]);
  });

  it("deserialises union types", () => {
    const bus = io.HashMap(io.string.else(io.number), io.boolean);
    const testInput = [
      ["foo", true],
      [3, false],
    ] as [string | number, boolean][];

    const result = bus.deserialize(testInput);

    assert.ok(result.isRight());
    assert.equal(result.get().length(), testInput.length);
  });

  it("handles incorrect types", () => {
    const bus = io.HashMap(io.string, io.number);
    const testInput = [
      [0, 1],
      [1, "5"],
    ] as [number, number][];

    // @ts-expect-error - Testing invalid input
    const result = bus.deserialize(testInput);

    assert.ok(result.isLeft());

    assert.equal(
      io.humanizeErrors(result.getLeft()),
      // eslint-disable-next-line prettier/prettier
`HashMap(isString(any), isNumber(any))
  ├─ [0]
  │   └─ isString(any)
  │       └─ isString rejected \`0\`
  └─ [1]
      ├─ isString(any)
      │   └─ isString rejected \`1\`
      └─ isNumber(any)
          └─ isNumber rejected \`5\``
    );
  });

  it("is chainable with io.objectEntries", () => {
    const bus = (io.objectEntries as io.ObjectEntriesBus<number>).chain(
      io.HashMap(io.string, io.number)
    );

    const testInputObj = {
      foo: 3,
      bar: 6,
    };

    {
      const res = bus.deserialize(testInputObj);

      assert.ok(res.isRight());
      assert.equal(
        res.get().hashCode(),
        HashMap.ofObjectDictionary(testInputObj).hashCode()
      );
    }

    const testInputHM = HashMap.of(["foo", 3], ["bar", 6]);

    const res = bus.serialize(testInputHM);

    assert.ok(res.isRight());
    assert.deepEqual(res.get(), testInputObj);
  });
});
