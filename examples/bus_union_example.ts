import * as io from "@prelude-io/core";

// Creates a bus `ADD | UPDATE | DELETE`
const ActionTypeBus = io
  .Literal("ADD")
  .else(io.Literal("UPDATE"))
  .else(io.Literal("DELETE"));

// Note that the following are functionally the same thing. Pay attention to the brackets:
const busA = io.boolean.else(io.string).else(io.number);
const busB = io.boolean.else(io.string.else(io.number));
