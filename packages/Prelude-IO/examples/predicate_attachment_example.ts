import * as io from "@prelude-io/core";
import { Predicate } from "prelude-ts";

const isPositive = Predicate.of((n: number) => n > 0);
const positiveNumber = io.number.if("isPositive", isPositive);

console.log(await positiveNumber.deserialize(1)); // => IORight containing `1`
console.log(await positiveNumber.deserialize("one")); // => IOLeft containing errors
console.log(await positiveNumber.deserialize(-1)); // => IOLeft containing errors for condition "isPositive(number)"
