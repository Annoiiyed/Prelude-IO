import * as io from "@prelude-io/core";

const fruitSubSpecies = io.Tuple([io.string, io.Vector(io.string)]);

// IORight containing ["apples", Vector.of("Granny Smith", "Golden Delicious")]
appleKinds.deserialize(["apples", ["Granny Smith", "Golden Delicious"]]);
