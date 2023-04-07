import { Function1 } from "prelude-ts";
import Bus from "../Bus";
import { IOAccept } from "../utils";

/**
 * A bus that passes an object or an iterable of key/value pairs through Object.entries
 * or Object.fromEntries respectively.
 *
 * @example
 * ```typescript
 * [[include:objectEntries_preset_example.ts]]
 * ```
 *
 * @group Presets
 */
export default Bus.create(
  "objectEntries",
  Function1.of(Object.entries).andThen(IOAccept),
  Function1.of(Object.fromEntries).andThen(IOAccept)
) as Bus<object, [unknown, unknown][]>;
