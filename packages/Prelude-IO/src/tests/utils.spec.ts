import { mergeNames } from "../lib/utils";
import assert from "assert";

describe("mergeNames()", () => {
  it("merges two names", () => {
    assert.equal(mergeNames(["a", "b"], "->"), "a -> b");

    assert.equal(mergeNames(["a", "b -> c"], "||"), "a || (b -> c)");

    assert.equal(mergeNames(["a", "(d)b -> c"], "||"), "a || ((d)b -> c)");
  });
});
