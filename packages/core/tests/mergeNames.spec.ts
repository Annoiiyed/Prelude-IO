import { mergeNames } from "../lib";
import assert from "assert";

describe("mergeNames()", () => {
  it("merges names, only using brackets if needed", () => {
    assert.equal(mergeNames(["A", "B"], "->"), "A -> B");
    assert.equal(mergeNames(["A -> B", "C"], "->"), "A -> B -> C");
    assert.equal(mergeNames(["A -> B", "C"], "|"), "(A -> B) | C");
    assert.equal(mergeNames(["A", "B -> C"], "|"), "A | (B -> C)");
    assert.equal(mergeNames(["A | B", "C | D"], "|"), "A | B | C | D");
    assert.equal(mergeNames(["A | B", "C | D"], "->"), "(A | B) -> (C | D)");
  });
});
