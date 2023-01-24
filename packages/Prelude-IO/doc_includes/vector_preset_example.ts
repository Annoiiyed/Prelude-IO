import * as io from "@prelude-io/core";

const optionalNumber = io.Vector(io.number);

console.log(await optionalNumber.decode([1, 2, 3])); // => IORight containing `Vector(1, 2, 3)`
console.log(await optionalNumber.decode(["one", "two", "three"])); // => IOLeft containing errors
console.log(await optionalNumber.decode([])); // => IORight containing `Vector()`
