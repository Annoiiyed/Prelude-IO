import * as io from "@prelude-io/core";

const SimpleBus = io.Complex("SimpleBus", {
  str: io.string,
});

const NestedBus = io.Complex("NestedBus", {
  nums: io.Vector(io.number),
  nest: SimpleBus,
});

const input = JSON.parse('{ "num": [3, 5, 7], "nest": { "str": "Foo" } }');

console.log(await NestedBus.decode(input)); // IORight containing { num: Vector(3, 5, 7), nest: { str: "Foo" } }
