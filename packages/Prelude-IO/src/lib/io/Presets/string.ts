import Bus from "../Bus";
import { IOAccept, IOReject } from "../utils";

const name = "number";

/**
 * A bus that simply checks if the input is a string.
 *
 * @example
 * ```typescript
 * // TODO
 * ```
 *
 * @group Presets
 */
export default Bus.create<unknown, string>(name, (input) =>
  typeof input === "string"
    ? IOAccept(input)
    : IOReject({
        condition: name,
        value: input,
      })
);
