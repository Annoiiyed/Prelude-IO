import { HashMap, Vector, WithEquality } from "prelude-ts";
import Bus from "../Bus";
import { IOErrors, IOResult, IOTransformer } from "../types";
import { IOAccept, IOReject } from "../utils";

const handleData = <KI, VI, KO, VO>(
  iter: [KI, VI][],
  kSer: IOTransformer<KI, KO>,
  vSer: IOTransformer<VI, VO>
) =>
  Vector.ofIterable(iter)
    .zipWithIndex()
    .map(([[ki, vi], idx]) => {
      const [k, v] = [kSer(ki), vSer(vi)];

      if (k.isRight() && v.isRight())
        return IOAccept([k.get(), v.get()] as const);

      return IOReject({
        value: [ki, vi] as const,
        condition: `[${idx}]`,
        branches: Vector.ofIterable(
          [k, v].reduce(
            (acc, i) => (i.isLeft() ? acc.appendAll(i.getLeft()) : acc),
            Vector.empty() as IOErrors
          )
        ),
      });
    }) as Vector<IOResult<[KO, VO]>>;

const getErrors = <K, V>(vec: Vector<IOResult<[K, V]>>) =>
  vec.foldLeft(Vector.empty() as IOErrors, (acc, entry) =>
    entry.isLeft() ? acc.appendAll(entry.getLeft()) : acc
  );

const intoResult = <K extends WithEquality, V>(
  errors: IOErrors,
  name: string,
  entries: Vector<IOResult<[K, V]>>,
  input: unknown
) =>
  errors.isEmpty()
    ? IOAccept(
        entries.map(
          (entry) =>
            entry.getOrThrow(
              "Should not be able to be Left due to foldLeft above here"
            ) as [K, V]
        )
      )
    : IOReject({
        condition: name,
        value: input,
        branches: errors,
      });

const serialisationPipe = <KI, VI, KO extends WithEquality, VO>(
  input: [KI, VI][],
  name: string,
  kSer: IOTransformer<KI, KO>,
  vSer: IOTransformer<VI, VO>
) => {
  const entries = handleData(input, kSer, vSer);
  const errs = getErrors(entries);
  return intoResult(errs, name, entries, input);
};

/**
 * A bus factory that allows a key and a value bus to be wrapped in a [HashMap](http://emmanueltouzery.github.io/prelude.ts/latest/apidoc/classes/hashmap.html).
 *
 * @example
 * ```typescript
 * [[include:hashmap_preset_example.ts]]
 * ```
 *
 * @param <KI> Key bus input
 * @param <KO> Key bus output
 * @param <VI> Value bus output
 * @param <VO> Value bus output
 * @param keyInnerBus The bus to validate keys
 * @param valueInnerBus The bus to validate keys
 * @param name The name of the new Bus. Defaults to "HashMap(keyBusName, valueBusName)"
 *
 * @group Presets
 */
const hashMapBusCreator = <
  VI,
  KI extends WithEquality,
  VO,
  KO extends WithEquality
>(
  keyInnerBus: Bus<KI, KO>,
  valueInnerBus: Bus<VI, VO>,
  name = `HashMap(${keyInnerBus.name}, ${valueInnerBus.name})`
) =>
  Bus.create(
    name,
    (input: [KI, VI][]): IOResult<HashMap<KO, VO>> =>
      serialisationPipe(
        input,
        name,
        keyInnerBus.deserialize,
        valueInnerBus.deserialize
      ).map((v: Vector<[KO, VO]>) => HashMap.ofIterable(v)),
    (input: HashMap<KO, VO>): IOResult<[KI, VI][]> =>
      serialisationPipe(
        input.toArray(),
        name,
        keyInnerBus.serialize,
        valueInnerBus.serialize
      ).map((v: Vector<[KI, VI]>) => v.toArray())
  );

export default hashMapBusCreator;
