import { WithEquality, hasEquals, Predicate } from "prelude-ts";
import Bus from "../Bus";
import any_ from "./any";

/**
 * Creates a bus that, through Prelude-TS' equality, only accepts a single type.
 *
 * @param value The value to match against
 *
 * @returns A bus that only accepts the given value
 */
const Literal = <T extends WithEquality>(value: T) => {
  const predicate = Predicate.of(
    (x: T) => x === value || (hasEquals(x) && x.equals(value))
  );

  return any_.if(`Literal(${value})`, predicate) as Bus<T, T>;
};

export default Literal;
