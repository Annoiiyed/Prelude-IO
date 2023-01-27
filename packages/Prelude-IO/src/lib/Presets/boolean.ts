import { Predicate } from "prelude-ts";
import Bus from "../Bus";
import any from "./any";

/**
 * A bus that simply checks if the input is a boolean.
 *
 * @example
 * ```typescript
 * [[include:boolean_preset_example.ts]]
 * ```
 *
 * @group Presets
 */
export default any.if(
  "isBoolean",
  Predicate.of((n) => typeof n === "boolean")
) as Bus<unknown, boolean>;
