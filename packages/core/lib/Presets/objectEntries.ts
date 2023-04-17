import { Function1 } from "prelude-ts";
import Bus from "../Bus";
import { ObjectEntriesBus } from "../types";
import { IOAccept } from "../utils";

/**
 * A bus that passes an object or an iterable of key/value pairs through {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries | Object.entries}
 * or {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries | Object.fromEntries} respectively.
 *
 * @example
 * ```typescript
 * [[include:objectEntries_preset_example.ts]]
 * ```
 *
 * When chaining this with {@link HashMap | io.HashMap}, you will likely need to provide a type hint for the object's value type:
 *
 * ```typescript
 * [[include:objectEntries-chain-with-hm_example.ts]]
 * ```
 *
 * @group Presets
 */
export default Bus.create(
  "objectEntries",
  Function1.of(Object.entries).andThen(IOAccept),
  Function1.of(Object.fromEntries).andThen(IOAccept)
) as ObjectEntriesBus;
