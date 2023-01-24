import * as io from "@prelude-io/core";

console.log(await io.number.decode(1)); // => IORight containing `1`
console.log(await io.number.decode(-1)); // => IOLeft containing `-1`
console.log(await io.number.decode(NaN)); // => IOLeft containing errors for isValid(number)
