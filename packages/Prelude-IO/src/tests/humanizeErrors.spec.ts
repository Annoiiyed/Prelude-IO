import assert from "assert";
import * as io from "../lib";
import { BusInputType } from "../lib";

describe("io.humanizeErrors", () => {
  const Cat = io.Complex("Cat", {
    name: io.string,
    age: io.positiveNumber,
    isAdopted: io.boolean,
  });

  const Litter = io.Complex("Litter", {
    birthplace: io.string,
    mother: Cat,
    // Questions may be directed to the author's therapist.
    father: io.Optional(Cat),
    kittens: io.Vector(Cat),
  });

  it("returns a string of more readable errors", async () => {
    const input: BusInputType<typeof Litter> = {
      birthplace: false, // They're hiding that they were born on the Moon
      mother: {
        name: "Mittens",
        age: 5,
        isAdopted: true,
      },
      father: null,
      kittens: [
        {
          name: "Suku",
          age: 1,
          isAdopted: false,
        },
        {
          name: "Skadi",
          age: 1,
          isAdopted: false,
        },
        {
          name: "Sif",
          // This kitten is a work in progress
          age: -1,
          isAdopted: "bit too soon",
        },
      ],
    };

    const fullErrors = (await Litter.deserialize(input)).getLeftOrThrow();

    assert.equal(
      io.humanizeErrors(fullErrors),
      // eslint-disable-next-line prettier/prettier
`Litter
  ├─ birthplace
  │   └─ isString(any)
  │       └─ isString rejected the value \`false\`
  └─ kittens
      └─ Vector(Cat)
          └─ [2]
              └─ Cat
                  ├─ isAdopted
                  │   └─ isBoolean(any)
                  │       └─ isBoolean rejected the value \`bit too soon\`
                  └─ age
                      └─ isPositive(isValidNumber(isNumber(any)))
                          └─ isPositive rejected the value \`-1\``
    );
  });
});
