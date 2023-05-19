import * as io from "../../lib";
import assert from "assert";

describe("io.Partial", () => {
  it("creates a partial bus from a Complex, and only validates the given fields", () => {
    const TestBus = io.Complex("TestBus", {
      str: io.string,
      num: io.number,
    });

    const PartialTestBus = io.Partial(TestBus, ["str"]);

    assert.equal(PartialTestBus.name, "Partial(TestBus[str])");
    assert.ok(PartialTestBus.deserialize({ str: "Foo" }).isRight());

    assert.deepEqual(
      // @ts-expect-error Testing invalid input
      PartialTestBus.deserialize({ str: "Foo", num: 1 }).getOrThrow(),
      { str: "Foo" }
    );
  });

  it("https://github.com/Annoiiyed/Prelude-IO/issues/5 - Partial bus returns the inner bus rather than the output's type", () => {
    const TestBus = io.Complex("TestBus", {
      str: io.string,
      num: io.number,
    });

    const PartialTestBus = io.Partial(TestBus, ["str"]);

    const deserialized = PartialTestBus.deserialize({ str: "Foo" });

    assert.ok(deserialized.isRight());

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const testTypeOutput: string = deserialized.get().str;

    assert.ok(typeof testTypeOutput === "string");
  });

  it("https://github.com/Annoiiyed/Prelude-IO/issues/6 - Works when fields are passed as an array externally", () => {
    const TestBus = io.Complex("TestBus", {
      str: io.string,
      num: io.number,
    });

    const fields = ["num"] as const;

    io.Partial(TestBus, fields);
  });
});
