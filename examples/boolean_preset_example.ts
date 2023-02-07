import * as io from "@prelude-io/core";

console.log(await io.number.deserialize(true)); // => IORight containing `1`
console.log(await io.number.deserialize("1")); // => IOLeft containing errors
