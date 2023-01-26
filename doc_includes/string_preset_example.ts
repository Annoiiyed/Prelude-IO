import * as io from "@prelude-io/core";

console.log(await io.string.deserialize("1")); // => IORight containing `"1"`
console.log(await io.string.deserialize(1)); // => IOLeft containing errors
