import * as io from "@prelude-io/core";
import { Predicate } from "prelude-ts";

const canDivideBy3 = Predicate.of<number>((input) => input % 3 === 0);
const canDivideBy5 = Predicate.of<number>((input) => input % 5 === 0);

// Creates canDivideBy5(canDivideBy3(number))
io.number.if("canDivideBy3", canDivideBy3).if("canDivideBy5", canDivideBy5);

// Creates canDivideBy15(number)
io.number.if("canDivideBy15", canDivideBy3.and(canDivideBy5));
