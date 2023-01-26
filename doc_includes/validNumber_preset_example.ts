import * as io from "@prelude-io/core";

console.log(await io.number.deserialize(1)); // => IORight containing `1`
console.log(await io.number.deserialize(-1)); // => IOLeft containing `-1`
console.log(await io.number.deserialize(NaN)); // => IOLeft containing errors for isValid(number)
