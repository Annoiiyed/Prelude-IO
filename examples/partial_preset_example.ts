import * as io from "@prelude-io/core";

const Pet = io.Complex("NestedBus", {
  species: io.string,
  name: io.string,
});

// PartialPet is a new ComplexBus with only the "name" field
const PartialPet = io.Partial(Pet, ["name"]);
