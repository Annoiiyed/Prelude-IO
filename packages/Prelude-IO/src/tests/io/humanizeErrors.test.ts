import * as io from "../../lib/io";

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
    const input = {
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

    expect(io.humanizeErrors(fullErrors)).toMatchSnapshot();
  });
});
