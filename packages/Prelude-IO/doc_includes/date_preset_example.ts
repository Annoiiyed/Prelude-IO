import * as io from "@prelude-io/core";

console.log(await io.date.deserialize("2023-01-01")); // => IORight containing `Date` object
console.log(await io.number.deserialize("Wobbly Bobble")); // => IOLeft containing errors
