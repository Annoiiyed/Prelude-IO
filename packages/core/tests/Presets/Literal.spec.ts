import assert from "assert";
import { HashSet } from "prelude-ts";
import * as io from "../../lib";

describe("io.Literal", () => {
  it("Literally matches primitive values", () => {
    const Banana = io.Literal("banana");

    assert.ok(Banana.deserialize("banana").isRight());
    // @ts-expect-error - Testing invalid input
    assert.ok(Banana.deserialize("apple").isLeft());
    assert.ok(Banana.serialize("banana").isRight());
    // @ts-expect-error - Testing invalid input
    assert.ok(Banana.serialize("apple").isLeft());
  });

  it("Literally matches through Prelude equality", () => {
    const PrettyFlags = io.Literal(HashSet.of("🏳️‍🌈", "🏳️‍⚧️"));

    assert.ok(PrettyFlags.deserialize(HashSet.of("🏳️‍🌈", "🏳️‍⚧️")).isRight());
    assert.ok(PrettyFlags.deserialize(HashSet.of("🏳️‍🌈")).isLeft());
    assert.ok(PrettyFlags.serialize(HashSet.of("🏳️‍🌈", "🏳️‍⚧️")).isRight());
    assert.ok(PrettyFlags.serialize(HashSet.of("🏳️‍⚧️")).isLeft());
  });
});
