import { Function0, Function2, HashMap, Vector } from "prelude-ts";
import Bus from "../Bus";
import {
  ComplexBus,
  ComplexFields,
  ComplexInput,
  ComplexOutput,
  IOError,
} from "../types";
import { IOAccept, IOReject } from "../utils";

const decodeInput = Function2.of((v, bus: Bus) => bus.decode(v)).tupled();

/**
 * A bus factory that allows multiple busses to make up a complex type.
 *
 * @example
 * ```typescript
 * [[include:complex_preset_example.ts]]
 * ```
 *
 * @param <I> The fields and busses we'll input
 * @param <O> The object we'll receive in return
 *
 * @group Presets
 */
const Complex = <I extends ComplexFields>(
  name: string,
  inner: I
): ComplexBus<typeof inner> => {
  return Bus.create<ComplexInput<typeof inner>, ComplexOutput<typeof inner>>(
    name,
    async (input) => {
      const valueBusPairs: [string, Bus][] = Object.entries(input).map(
        ([key, value]) => [value, inner[key]]
      );

      const decodedInners = await Promise.all(
        valueBusPairs.map(decodeInput)
      ).then(Vector.ofIterable);

      const map = Function0.of(() => Object.keys(inner))
        .andThen(Vector.ofIterable)
        .andThen((keys) => keys.zip(decodedInners))
        .andThen(HashMap.ofIterable)();

      if (map.anyMatch((_, r) => r.isLeft())) {
        return IOReject({
          condition: name,
          value: input,
          branches: map
            .filterValues((v) => v.isLeft())
            .toVector()
            .map(
              ([key, result]) =>
                ({
                  value: input[key] as string,
                  condition: `${name}.${key}`,
                  branches: result.getLeftOrThrow(),
                } as IOError)
            ),
        });
      }

      return IOAccept(
        map
          .mapValues((r) => r.getOrThrow())
          .toObjectDictionary(String) as ComplexOutput<typeof inner>
      );
    }
  );
};

export default Complex;
