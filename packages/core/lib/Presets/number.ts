import { Predicate } from "prelude-ts";
import Bus from "../Bus";
import any from "./any";

/**
 * A bus that simply checks if the input is a number. Allows `NaN` and `Infinity` to be passed.
 *
 * To check if your input is a real number, you'll likely want {@link validNumber}
 *
 * @example
 * ```typescript
 * [[include:number_preset_example.ts]]
 * ```
 *
 * @group Presets
 */
export default any.if(
  "isNumber",
  Predicate.of((n) => typeof n === "number")
) as Bus<number, number>;
