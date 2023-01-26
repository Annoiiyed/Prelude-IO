import * as io from "@prelude-io/core";

const acceptIfNumber = (input: unknown) =>
  typeof input === "number"
    ? io.IOAccept(input)
    : io.IOReject({
        condition: "number",
        value: input,
      });

const number = io.Bus.create<unknown, number>(
  "number",
  acceptIfNumber,
  acceptIfNumber
);

console.log(await number.deserialize(1)); // => IORight containing `1`
console.log(await number.deserialize("one")); // => IOLeft containing errors
console.log(await number.serialize(1)); // => IORight containing `1`
