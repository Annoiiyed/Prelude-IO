import * as io from "@prelude-io/core";

// => IORight containing `[["foo", 2], ["bar", 6]]`
console.log(io.objectEntries.deserialize({ foo: 2, bar: 6 }));

// => IORight containing `{ foo: 2, bar: 6 }`
console.log(
  io.objectEntries.serialize([
    ["foo", 2],
    ["bar", 6],
  ])
);
