import { Predicate } from "prelude-ts";
import validNumber from "./validNumber";

const isPositive = Predicate.of((n: number) => n > 0);

export default validNumber.if("positiveNumber", isPositive);
