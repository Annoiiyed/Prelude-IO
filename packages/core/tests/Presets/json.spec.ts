import assert from "assert";
import * as io from "../../lib";

describe("io.JSON", () => {
  it("deserializes/serializes values, returning IOLeft on invalid JSON", () => {
    assert.deepEqual(io.JSON.deserialize("true"), io.IOAccept(true));

    assert.deepEqual(
      io.JSON.deserialize('{"test":true}'),
      io.IOAccept({ test: true })
    );

    assert.deepEqual(io.JSON.serialize(true), io.IOAccept("true"));
    assert.deepEqual(
      io.JSON.serialize({ test: true }),
      io.IOAccept('{"test":true}')
    );

    assert.ok(io.JSON.deserialize("{invalid: true]").isLeft());

    const selfRef = {};
    // @ts-expect-error - Testing invalid input
    selfRef.self = selfRef;

    assert.ok(io.JSON.serialize(selfRef).isLeft());
  });
});
