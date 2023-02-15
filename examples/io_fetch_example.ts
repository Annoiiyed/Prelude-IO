import * as io from "@prelude-io/core";
import { ioFetch } from "@prelude-io/fetch";

const CatFact = io.Complex("CatFact", {
  fact: io.string,
  length: io.positiveNumber,
});

const CatFactsResponse = io.Complex("CatFactsResponse", {
  factCount: io.positiveNumber,
  facts: io.Vector(CatFact),
});

const CatFactRequest = io.JSON.chain(
  io.Complex("CatFactRequest", {
    facts: io.number,
  })
);

const catFactFetch = ioFetch(CatFactsResponse, CatFactRequest);

const result = await catFactFetch("https://catfacts.example.com", {
  body: { facts: 4 },
});

console.log(result); // => IORight containing `{ factCount: 4, facts: [...] }`
