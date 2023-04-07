import assert from "assert";
import { HashMap } from "prelude-ts";
import * as io from "../../lib";

describe("io.HashMap", () => {
  it("deserialises an iterable of pairs into a hashmap", () => {
    const bus = io.HashMap(io.string, io.number);
    const testInput = [
      ["foo", 2],
      ["bar", 4],
      ["baz", 6],
    ] as [string, number][];

    const result = bus.deserialize(testInput);

    assert.ok(result.isRight());
    assert.equal(
      result.get().hashCode(),
      HashMap.ofIterable(testInput).hashCode()
    );
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
    const bus = io.objectEntries.chain(io.HashMap(io.string, io.number));

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
