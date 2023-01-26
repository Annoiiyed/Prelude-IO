import * as io from "@prelude-io/core";

console.log(await io.number.deserialize(1)); // => IORight containing `1`
console.log(await io.number.deserialize(NaN)); // => IORight containing `NaN`
console.log(await io.number.deserialize(-Infinity)); // => IORight containing `-Infinity`
console.log(await io.number.deserialize("1")); // => IOLeft containing errors
