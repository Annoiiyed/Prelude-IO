# Prelude-IO

[![npm version](https://badge.fury.io/js/@prelude-io%2Fcore.svg)](https://badge.fury.io/js/@prelude-io%2Fcore)
[![documentation](https://img.shields.io/badge/Documentation-blue)](https://annoiiyed.github.io/Prelude-IO/modules)

This library aims to provide easy to use run- and compiletime type-safety combined with the benefits of immutability through [Prelude-ts].

Interop with Prelude-ts is a key feature of this library, but not strictly required for operation. 

## Core library

Prelude-IO's base unit is the `Bus<I, O>` class, which provides basic functionality and abstractions around creating reversible data pipelines.
The core library also includes a few basic types to represent most data formats, found [here](https://annoiiyed.github.io/Prelude-IO/modules/_prelude_io_core.html#Presets) under Presets.

Examples can be found [here][examples]. Alternatively, here's an overview of some basic functionality: 

```typescript
import * as io from "prelude-io";
import { Predicate } from "prelude-ts";

// Conditional types
const rating = io.number.if(Predicate.of((n) => n > 0 && n <= 5));

// Complex types
const roomType = io.Complex("Room", {
  name: io.string.
  description: io.Optional(io.string),
  rating: rating,
});

// Nesting
const hotelType = io.Complex("Hotel", {
  address: io.string,
  website: io.string,
  rating: rating
  rooms: io.Vector(Room)
});

// Deserialising
fetch("http://example.com/hotels.json")
  .then(response => response.json())
  // (de)serialising
  .then(HotelType.deserialise)
  .then(hotel => {
    // Either-based error handling
    if(hotel.isLeft()) {
      // Built-in debugger
      console.error(io.humanizeErrors(hotel.getLeft()))
    } else {
      LocalStorage.setItem("hotel", hotel.get())
    }
  });
```

### Documentation

You can read typedoc documentation [here](https://annoiiyed.github.io/Prelude-IO/)

### Installation

```
npm install --save @prelude-io/core prelude-ts
```

### Principles
- Busses split parsing and conditional logic into seperate functions
- IO returns `Either` objects rather than throw exceptions
- Functions can be `chain`ed or turned into a `union`

## Additional libraries

- [**Prelude-IO/Fetch:**](https://github.com/Annoiiyed/Prelude-IO/tree/main/packages/fetch) A wrapper around `fetch` for runtime type-checking

## Roadmap
- Add extra commonly used types
- **`@prelude-io/test`**: A set of functions to run basic tests on your data types

## Inspirations
- [Prelude-ts]: Provides functional programming concepts in an accessible manner. Though a similar name, this project is not directly affiliated with prelude-ts or its authors.
- [io-ts](https://github.com/gcanti/io-ts): Runtime type checking, encoding and decoding, based on `fp-ts`.

[Prelude-ts]: https://github.com/emmanueltouzery/prelude-ts
[Examples]: https://github.com/Annoiiyed/Prelude-IO/tree/main/examples
