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

    assert.deepEqual(
      io.JSON.deserialize("{invalid: true]"),
      io.IOReject({
        condition: "JSON",
        message: "Expected property name or '}' in JSON at position 1",
        value: "{invalid: true]",
      })
    );

    const selfRef = {};
    // @ts-expect-error - Testing invalid input
    selfRef.self = selfRef;

    assert.deepEqual(
      io.JSON.serialize(selfRef).getLeftOrThrow().head().getOrNull()?.message,
      "Converting circular structure to JSON\n    --> starting at object with constructor 'Object'\n    --- property 'self' closes the circle"
    );
  });
});
