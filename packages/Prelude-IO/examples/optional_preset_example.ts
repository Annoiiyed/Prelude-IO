import * as io from "@prelude-io/core";

const optionalNumber = io.Optional(io.number);

console.log(await optionalNumber.deserialize(1)); // => IORight containing `Some(1)`
console.log(await optionalNumber.deserialize("one")); // => IOLeft containing errors
console.log(await optionalNumber.deserialize(null)); // => IORight containing `None`
