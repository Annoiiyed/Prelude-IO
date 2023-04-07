import assert from "assert";
import * as io from "../../lib";

describe("io.Partial", () => {
  it("(de)serializes an object/record into an array of pairs", () => {
    const testInput = {
      first: "foo",
      second: "bar",
      third: "baz",
    };

    const testOutput = [
      ["first", "foo"],
      ["second", "bar"],
      ["third", "baz"],
    ] as [string, string][];

    assert.deepEqual(
      io.objectEntries.deserialize(testInput).getOrThrow(),
      testOutput
    );

    assert.deepEqual(
      io.objectEntries.serialize(testOutput).getOrThrow(),
      testInput
    );
  });
});
