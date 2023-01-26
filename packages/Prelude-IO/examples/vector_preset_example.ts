import * as io from "@prelude-io/core";

const optionalNumber = io.Vector(io.number);

console.log(await optionalNumber.deserialize([1, 2, 3])); // => IORight containing `Vector(1, 2, 3)`
console.log(await optionalNumber.deserialize(["one", "two", "three"])); // => IOLeft containing errors
console.log(await optionalNumber.deserialize([])); // => IORight containing `Vector()`
