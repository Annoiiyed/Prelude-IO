import * as io from "../../lib";
import assert from "assert";

describe("io.Partial", () => {
  it("creates a partial bus from a Complex, and only validates the given fields", async () => {
    const TestBus = io.Complex("TestBus", {
      str: io.string,
      num: io.number,
    });

    const PartialTestBus = io.Partial(TestBus, ["str"]);

    assert.equal(PartialTestBus.name, "Partial(TestBus[str])");
    assert.ok((await PartialTestBus.deserialize({ str: "Foo" })).isRight());

    assert.deepEqual(
      // @ts-expect-error Testing invalid input
      (await PartialTestBus.deserialize({ str: "Foo", num: 1 })).getOrThrow(),
      { str: "Foo" }
    );
  });
});
