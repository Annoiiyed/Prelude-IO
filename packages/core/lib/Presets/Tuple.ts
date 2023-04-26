import { Either, Vector } from "prelude-ts";
import Bus from "../Bus";
import { IOAccept, IOReject } from "../utils";
import { IOLeft, TupleBus } from "../types";

const makeTransformer =
  (for_: "deserialize" | "serialize", busses: readonly Bus[], name: string) =>
  (inputs: unknown[]) => {
    const deserialized = Vector.ofIterable(busses)
      .zip(inputs)
      .map(([bus, value]) => bus[for_](value));

    if (deserialized.allMatch(Either.isRight))
      return IOAccept(deserialized.map((v) => v.get()).toArray());

    return IOReject({
      condition: name,
      value: inputs,
      branches: deserialized
        .zipWithIndex()
        .filter(([res]) => res.isLeft())
        .map(([res, index]: [IOLeft, number]) => ({
          condition: `[${index}]`,
          value: inputs[index],
          branches: res.getLeft(),
        })),
    });
  };

/**
 * A bus factory that (de-)serializes a tuple of busses.
 *
 * @example
 * ```typescript
 * [[include:tuple_preset_example.ts]]
 * ```
 *
 * @param <Inners> The inner busses' types
 * @param inners The inner busses, passed as a plain array/tuple
 * @param name The new bus' name
 *
 * @group Presets
 */
function Tuple<const Inners extends readonly Bus[]>(
  inners: Inners,
  name = `Tuple(${inners.map((b) => b.name).join(", ")})`
): TupleBus<Inners> {
  return Bus.create(
    name,
    makeTransformer("deserialize", inners, name),
    makeTransformer("serialize", inners, name),
    inners
  ) as TupleBus<Inners>;
}

export default Tuple;
