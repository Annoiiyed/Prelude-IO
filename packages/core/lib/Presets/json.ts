import Bus from "../Bus";
import { IOAccept, IOReject } from "../utils";

/**
 * A Bus that parses JSON. This is a convenience wrapper around the JSON.parse and JSON.stringify functions,
 * if you need more advanced functionality, you should use the Bus.create function.
 *
 *  * @example
 * ```typescript
 * [[include:json_preset_example.ts]]
 * ```
 *
 * @group Presets
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default Bus.create<string, any>(
  "JSON",
  (input) => {
    try {
      return IOAccept(JSON.parse(input));
    } catch (e) {
      return IOReject({
        condition: "JSON",
        message: e.message,
        value: input,
      });
    }
  },
  (input) => {
    try {
      return IOAccept(JSON.stringify(input));
    } catch (e) {
      return IOReject({
        condition: "JSON",
        message: e.message,
        value: input,
      });
    }
  }
);
