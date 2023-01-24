import * as io from "@prelude-io/core";

console.log(await io.number.decode(1)); // => IORight containing `1`
console.log(await io.number.decode(NaN)); // => IORight containing `NaN`
console.log(await io.number.decode(-Infinity)); // => IORight containing `-Infinity`
console.log(await io.number.decode("1")); // => IOLeft containing errors
