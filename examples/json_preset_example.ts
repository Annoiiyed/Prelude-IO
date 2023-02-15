import * as io from "@prelude-io/core";

const CatFactCount = io.JSON.chain(
  io.Complex("CatFactRequest", {
    facts: io.number,
  })
);

console.log(await CatFactCount.deserialize('{ "facts": 4 }')); // => IORight containing `{ facts: 4 }`
console.log(await CatFactCount.serialize({ facts: 4 })); // => IORight containing `'{ "facts": 4 }'`
