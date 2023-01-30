import * as io from "../lib";
import assert from "assert";
import { hasEquals, stringHashCode } from "prelude-ts";

describe("io.mergeNames()", () => {
  it("merges two names", () => {
    assert.equal(io.mergeNames(["a", "b"], "->"), "a -> b");

    assert.equal(io.mergeNames(["a", "b -> c"], "||"), "a || (b -> c)");

    assert.equal(io.mergeNames(["a", "(d)b -> c"], "||"), "a || ((d)b -> c)");
  });
});

describe("io.addEquality()", () => {
  const TestBus = io.Complex("TestBus", {
    str: io.string,
  });

  it("adds equality to a data structure", () => {
    const data = TestBus.deserialize({
      str: "Foo",
    }).getOrThrow() as io.BusOutputType<typeof TestBus>;

    assert.ok(
      io
        .addEquality(
          data,
          (a, b) => a.str === b.str,
          (a) => stringHashCode(a.str)
        )
        .equals({ str: "Foo" })
    );
  });

  it("adds lazily executes the hashcode function, which is memoized", () => {
    let counterRef = 0;

    const data = TestBus.deserialize({
      str: "Foo",
    }).getOrThrow() as io.BusOutputType<typeof TestBus>;

    const dataWithEq = io.addEquality(
      data,
      (a, b) => a.str === b.str,
      (a) => {
        counterRef++;
        return stringHashCode(a.str);
      }
    );

    assert.ok(dataWithEq.equals({ str: "Foo" }));
    assert.equal(counterRef, 0);
    assert.equal(dataWithEq.hashCode(), dataWithEq.hashCode());
    assert.equal(counterRef, 1);
  });

  it("catches type errors in equality function hidden by our type overloading", () => {
    const data = TestBus.deserialize({
      str: "Foo",
    }).getOrThrow() as io.BusOutputType<typeof TestBus>;

    const dataWithEq = io.addEquality(
      data,
      () => {
        throw new Error();
      },
      (a) => stringHashCode(a.str)
    );

    assert.doesNotThrow(() => dataWithEq.equals({ str: "Foo" }));
    assert.ok(!dataWithEq.equals({ str: "Foo" }));
  });

  it("validates through Prelude's hasEquals() after attaching", () => {
    const data = TestBus.deserialize({
      str: "Foo",
    }).getOrThrow() as io.BusOutputType<typeof TestBus>;

    const dataWithEq = io.addEquality(
      data,
      (a, b) => a.str === b.str,
      (a) => stringHashCode(a.str)
    );

    assert.ok(hasEquals(dataWithEq));
  });
});
