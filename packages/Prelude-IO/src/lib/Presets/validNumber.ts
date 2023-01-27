import { Predicate } from "prelude-ts";
import number_ from "./number";

const isNaN = Predicate.of<number>(Number.isNaN);
const isFinite = Predicate.of(Number.isFinite);
const isValidNumber = isNaN.negate().and(isFinite);

/**
 * An extention of {@link number} that checks if a number is not NaN and is finite
 *
 * @example
 * ```typescript
 * [[include:validNumber_preset_example.ts]]
 * ```
 *
 * @group Presets
 */
export default number_.if("isValidNumber", isValidNumber);
