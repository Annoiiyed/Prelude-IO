import * as io from "@prelude-io/core";

const optionalNumber = io.Optional(io.number);

console.log(await optionalNumber.decode(1)); // => IORight containing `Some(1)`
console.log(await optionalNumber.decode("one")); // => IOLeft containing errors
console.log(await optionalNumber.decode(null)); // => IORight containing `None`
