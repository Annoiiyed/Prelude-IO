import { mergeNames } from "../../lib/io/utils";

describe("mergeNames()", () => {
  it("merges two names", () => {
    expect(mergeNames(["a", "b"], "AND")).toBe("a AND b");

    expect(mergeNames(["a", "b AND c"], "OR")).toBe("a OR (b AND c)");
  });
});
