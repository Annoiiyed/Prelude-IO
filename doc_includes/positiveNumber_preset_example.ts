import * as io from "@prelude-io/core";

console.log(await io.number.deserialize(1)); // => IORight containing `1`
console.log(await io.number.deserialize("1")); // => IOLeft containing errors for isValid(number)
console.log(await io.number.deserialize(-1)); // => IOLeft containing errorsfor isPositive(isValid(number))
