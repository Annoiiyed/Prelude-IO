import Bus from "../Bus";
import { IOAccept, IOReject } from "../utils";

/**
 * A bus that parses a date in any way JS natively can.
 *
 * Checks for Invalid Date objects and rejects them.
 *
 * @example
 * ```typescript
 * [[include:date_preset_example.ts]]
 * ```
 * @group Presets
 */
export default Bus.create(
  "date",
  (input) => {
    // @ts-expect-error Its fine if this fails, we check for it
    const date = new Date(input);

    return isNaN(date.getTime())
      ? IOReject({
          condition: "date",
          value: input,
        })
      : IOAccept(date);
  },
  (input) =>
    isNaN(input.getTime())
      ? IOReject({
          condition: "date",
          value: input,
        })
      : IOAccept(input.toISOString())
);
