import { Predicate } from "prelude-ts";
import validNumber from "./validNumber";

const isPositive = Predicate.of((n: number) => n > 0);

/**
 * An extention of {@link validNumber} that checks if a number is greater than 0
 *
 * @example
 * ```typescript
 * [[include:positiveNumber_preset_example.ts]]
 * ```
 *
 * @group Presets
 */
export default validNumber.if("isPositive", isPositive);
