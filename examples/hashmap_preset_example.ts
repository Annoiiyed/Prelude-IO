import * as io from "@prelude-io/core";
import { HashMap } from "prelude-ts";

const hashMapBus = io.HashMap(io.string, io.number);

// => IORight with HashMap containing foo => 2, bar => 4
console.log(
  hashMapBus.deserialize([
    ["foo", 2],
    ["bar", 4],
  ])
);

// => IORight with HashMap containing foo => 2, bar => 4
console.log(
  io.objectEntries.chain(hashMapBus).deserialize({
    foo: 2,
    bar: 4,
  })
);

// => IORight with [["foo", 2], ["bar", 4]]
{
  const input = HashMap.empty().put("foo", 2).put("bar", 4);
  console.log(hashMapBus.serialize(input));
}

// => IOLeft rejecting due to mismatched type in value
console.log(
  hashMapBus.deserialize([
    ["foo", false],
    ["bar", 4],
  ])
);
