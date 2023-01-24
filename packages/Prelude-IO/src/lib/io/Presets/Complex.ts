import { Function0, Function2, HashMap, Vector } from "prelude-ts";
import Bus from "../Bus";
import {
  ComplexBus,
  ComplexFields,
  ComplexInput,
  ComplexOutput,
  IOResult,
} from "../types";
import { IOAccept, IOReject } from "../utils";

const decodeInput = Function2.of((v, bus: Bus) => bus.decode(v)).tupled();
const encodeInput = Function2.of((v, bus: Bus) => bus.encode(v)).tupled();

const toValueBusPairs = <I extends Record<string, unknown>>(
  inner: ComplexFields,
  input: I
): [unknown, Bus][] =>
  Object.entries(input).map(([key, value]) => [value, inner[key]]);

const reformMap = (inner: ComplexFields, decoded: Vector<IOResult<unknown>>) =>
  Function0.of(() => Object.keys(inner))
    .andThen(Vector.ofIterable)
    .andThen((keys) => keys.zip(decoded))
    .andThen(HashMap.ofIterable)();

const rejectMap = <I extends Record<string, unknown>>(
  map: HashMap<string, IOResult<unknown>>,
  input: I,
  name: string
) =>
  IOReject({
    condition: name,
    value: input,
    branches: map
      .filterValues((v) => v.isLeft())
      .toVector()
      .map(([key, result]) => ({
        value: input[key],
        condition: `${name}.${key}`,
        branches: result.getLeftOrThrow(),
      })),
  });

const acceptMap = <D extends ComplexInput<ComplexFields>>(
  map: HashMap<string, IOResult<unknown>>
) =>
  IOAccept(
    map.mapValues((r) => r.getOrThrow()).toObjectDictionary(String) as D
  );

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
  type Input = ComplexInput<typeof inner>;
  type Output = ComplexOutput<typeof inner>;

  const decode = async (input: Input) => {
    const valueBusPairs = toValueBusPairs(inner, input);

    const processedInners = await Promise.all(
      valueBusPairs.map(decodeInput)
    ).then(Vector.ofIterable);

    const map = reformMap(inner, processedInners);

    return (
      map.anyMatch((_, r) => r.isLeft())
        ? rejectMap(map, input, name)
        : acceptMap(map)
    ) as IOResult<Output>;
  };

  const encode = async (input: Output) => {
    const valueBusPairs = toValueBusPairs(inner, input);

    const processedInners = await Promise.all(
      valueBusPairs.map(encodeInput)
    ).then(Vector.ofIterable);

    const map = reformMap(inner, processedInners);

    return (
      map.anyMatch((_, r) => r.isLeft())
        ? rejectMap(map, input, name)
        : acceptMap(map)
    ) as IOResult<Input>;
  };

  return Bus.create<Input, Output>(name, decode, encode);
};

export default Complex;
