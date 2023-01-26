# Prelude-IO

This library aims to provide easy to use run- and compiletime type-safety combined with the benefits of immutability through [Prelude-ts].

Interop with Prelude-ts is a key feature of this library, but not strictly required for operation. 

## Core library

Prelude-IO's base unit is the `Bus<I, O>` class, which provides basic functionality and abstractions around creating reversible data pipelines, as well as a few basic types to represent most data formats.

Examples can be found [here][examples]. Alternatively, here's an overview of some basic functionality: 

```typescript
import * as io from "@prelude-io/core";
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
  // Asynchronous (de)serialising
  .then(HotelType.deserialise)
  .then(hotel => {
    // Either-based error handling
    if(hotel.isLeft()) {
      // Built-in debugger
      console.error(io.humanizeErrors(hotel.getLeft()))
    } else {
      // Serialising
      LocalStorage.setItem("hotel", hotel.get())
    }
  });
```

### Principles
- Busses split parsing and conditional logic into seperate functions
- IO returns `Either` objects rather than throw exceptions
- Functions can be `chain`ed or turned into a `union`

## Roadmap

- Add extra commonly used types
- **`@prelude-io/fetch`**: A library providing automatic parsing of HTTP requests and responses
- **`@prelude-io/test`**: A set of functions to run basic tests on your data types

## Inspirations

- [Prelude-ts]\: Provides functional programming concepts in an accessible manner
- [io-ts](https://github.com/gcanti/io-ts): Runtime type checking, encoding and decoding, based on `fp-ts`

[Prelude-ts]: https://github.com/emmanueltouzery/prelude-ts
[Examples]: https://github.com/Annoiiyed/Prelude-IO/tree/main/examples