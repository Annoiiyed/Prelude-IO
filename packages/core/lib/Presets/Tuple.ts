import { Either, Vector } from "prelude-ts";
import Bus from "../Bus";
import { IOAccept, IOReject } from "../utils";
import { IOLeft, IOResult, TupleBusInputs, TupleBusOutputs } from "../types";

function makeTransformer<I extends [], O>(
  for_: "deserialize" | "serialize",
  busses: readonly Bus[],
  name: string
) {
  return (inputs: I): IOResult<O> => {
    const deserialized = Vector.ofIterable(busses)
      .zip(inputs)
      .map(([bus, value]) => bus[for_](value));

    if (deserialized.allMatch(Either.isRight))
      return IOAccept(deserialized.map((v) => v.get()).toArray() as O);

    return IOReject({
      condition: name,
      value: inputs,
      branches: deserialized
        .zipWithIndex()
        .filter(([res]) => res.isLeft())
        .map(([res, index]) => ({
          condition: `[${index}]`,
          value: inputs[index],
          branches: (res as IOLeft).getLeft(),
        })),
    });
  };
}

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
): Bus<TupleBusInputs<Inners>, TupleBusOutputs<Inners>> {
  return Bus.create<TupleBusInputs<Inners>, TupleBusOutputs<Inners>>(
    name,
    makeTransformer<TupleBusInputs<Inners>, TupleBusOutputs<Inners>>(
      "deserialize",
      inners,
      name
    ),
    makeTransformer<TupleBusOutputs<Inners>, TupleBusInputs<Inners>>(
      "serialize",
      inners,
      name
    ),
    inners
  );
}

export default Tuple;
