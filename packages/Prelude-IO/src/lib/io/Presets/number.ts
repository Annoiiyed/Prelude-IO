import Bus from "../Bus";
import { IOAccept, IOReject } from "../utils";

const name = "number";

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
export default Bus.create<unknown, number>(name, (input) =>
  typeof input === "number"
    ? IOAccept(input)
    : IOReject({
        condition: name,
        value: input,
      })
);
