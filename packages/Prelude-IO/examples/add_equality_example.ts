import * as io from "@prelude-io/core";
import { BusOutputType } from "@prelude-io/core";
import { stringHashCode } from "prelude-ts";

const Pet = io.Complex("NestedBus", {
  species: io.string,
  name: io.string,
});

const suku = (
  await Pet.deserialize({ name: "Suku", species: "Cat" })
).getOrThrow() as BusOutputType<typeof Pet>;

const skadi = (
  await Pet.deserialize({ name: "Skadi", species: "Cat" })
).getOrThrow() as BusOutputType<typeof Pet>;

const sukuWithEquality = io.addEquality(
  suku,
  (a, b) => a.name === b.name && a.species === b.species,
  (a) => stringHashCode(a.name + a.species)
);

console.log(sukuWithEquality.equals(suku)); // true
console.log(sukuWithEquality.equals(skadi)); // false
