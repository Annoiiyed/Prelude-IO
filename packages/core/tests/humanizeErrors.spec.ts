import assert from "assert";
import * as io from "../lib";
import { BusInputType, humanizeErrors } from "../lib";

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

  it("returns a string of more readable errors", () => {
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

    const errors = io.humanizeErrors(
      Litter.deserialize(input).getLeftOrThrow()
    );

    assert.equal(
      errors,
      // eslint-disable-next-line prettier/prettier
`Litter
  ├─ birthplace
  │   └─ isString(any)
  │       └─ isString rejected \`false\`
  └─ kittens
      └─ Vector(Cat)
          └─ [2]
              └─ Cat
                  ├─ isAdopted
                  │   └─ isBoolean(any)
                  │       └─ isBoolean rejected \`bit too soon\`
                  └─ age
                      └─ isPositive(isValidNumber(isNumber(any)))
                          └─ isPositive rejected \`-1\``
    );
  });

  it("humanizes errors with messages spanning multiple lines", () => {
    const RejectingBus = io.Bus.create<string, string>(
      "RejectingBus",
      (input: string) =>
        io.IOReject({
          condition: "RejectingBus",
          value: input,
          message:
            "This is an error\nthat spans multiple lines\nand should still look pretty",
        }),
      (input: string) =>
        io.IOReject({
          condition: "RejectingBus",
          value: input,
          message:
            "This is an error\nthat spans multiple lines\nand should still look pretty",
        })
    );

    const NestedBus = io.Complex("NestedBus", {
      rejecting: RejectingBus,
    });

    const errors = NestedBus.deserialize({
      rejecting: "test",
    }).getLeftOrThrow();

    assert.equal(
      humanizeErrors(errors),
      // eslint-disable-next-line prettier/prettier
`NestedBus
  └─ rejecting
      └─ RejectingBus rejected \`test\`
          │  This is an error
          │  that spans multiple lines
          └─ and should still look pretty`
    );
  });
});
