import * as io from "@prelude-io/core";

const number = io.Bus.create<unknown, number>("number", (input) =>
  typeof input === "number"
    ? io.IOAccept(input)
    : io.IOReject({
        condition: "number",
        value: input,
      })
);

console.log(await number.decode(1)); // => IORight containing `1`
console.log(await number.decode("one")); // => IOLeft containing errors
