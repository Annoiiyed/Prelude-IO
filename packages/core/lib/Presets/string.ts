import { Predicate } from "prelude-ts";
import Bus from "../Bus";
import any from "./any";

/**
 * A bus that simply checks if the input is a string. Allows empty strings.
 *
 * @example
 * ```typescript
 * [[include:string_preset_example.ts]]
 * ```
 *
 * @group Presets
 */
export default any.if(
  "isString",
  Predicate.of((n) => typeof n === "string")
) as Bus<string, string>;
