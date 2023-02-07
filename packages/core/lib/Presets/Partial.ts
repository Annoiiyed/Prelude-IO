import { ComplexBus, ComplexFields, PartialFields } from "../types";
import Complex from "./Complex";

/**
 * A ComplexBus with only a subset of its fields.
 *
 * @param full The Complex bus to base the partial of
 * @param fields The fields to include in the partial
 * @param name An alias for this bus. Defaults to `Partial(ComplexName[field, field, ...])`
 *
 * @example
 * ```typescript
 * [[include:partial_preset_example.ts]]
 * ```
 *
 * @returns The partial bus
 * @group Presets
 */
const Partial = <CF extends ComplexFields, F extends keyof CF>(
  full: ComplexBus<CF>,
  fields: F[],
  name = `Partial(${full.name}[${fields.join(", ")}])`
): ComplexBus<PartialFields<CF, F>> => {
  return Complex(
    name,
    Object.fromEntries(
      fields.map((f) => [f, (full.inner as CF)[f as string]])
    ) as PartialFields<CF, F>
  );
};

export default Partial;
