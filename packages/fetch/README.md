# @Prelude-IO/Fetch

[![npm version](https://badge.fury.io/js/@prelude-io%2Fcore.svg)](https://badge.fury.io/js/@prelude-io%2Fcore)
[![documentation](https://img.shields.io/badge/Documentation-blue)](https://annoiiyed.github.io/Prelude-IO/modules/_prelude_io_fetch.html)

Prelude-IO aims to provide easy to use run- and compiletime type-safety combined with the benefits of immutability through [Prelude-ts]. This library adds a simple wrapper around `fetch`, to type-check your request and response bodies.

## Example

```typescript
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
```

### Documentation

You can read typedoc documentation [here](https://annoiiyed.github.io/Prelude-IO/modules/_prelude_io_fetch.html)

### Installation

```
npm install --save @prelude-io/core @prelude-io/fetch prelude-ts
```