import { Predicate } from "prelude-ts";
import number_ from "./number";

const isNaN = Predicate.of<number>(Number.isNaN);
const isFinite = Predicate.of(Number.isFinite);
const isValidNumber = isNaN.negate().and(isFinite);

export default number_.if("isValidNumber", isValidNumber);
