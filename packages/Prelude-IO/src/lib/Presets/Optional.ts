import { Option } from "prelude-ts";
import Bus from "../Bus";
import { IOResult } from "../types";
import { IOAccept, IOReject } from "../utils";

/**
 * A bus factory that allows a bus to be wrapped in an [Option](http://emmanueltouzery.github.io/prelude.ts/latest/apidoc/files/option.html).
 *
 * @example
 * ```typescript
 * [[include:optional_preset_example.ts]]
 * ```
 *
 * @param <I> Inner bus' input. This is widened to `I | null` in the newly created bus.
 * @param <O> Inner bus' output. This is transformed to `Option<O>` in the newly created bus.
 *
 * @group Presets
 */
export default <I, O>(innerBus: Bus<I, O>) => {
  const name = `Optional(${innerBus.name})`;
  return Bus.create<I | null, Option<O>>(
    name,
    async (input) => {
      if (input === null) {
        return IOAccept(Option.none());
      }

      return (await innerBus.deserialize(input)).bimap(
        (branches) =>
          IOReject({
            condition: name,
            value: input,
            branches: branches,
          }).getLeft(),
        (inner) => Option.of(inner as O)
      ) as IOResult<Option<O>>;
    },
    async (input) => {
      return input.isNone()
        ? IOAccept(null)
        : ((await innerBus.serialize(input.get())).mapLeft((branches) =>
            IOReject({
              condition: name,
              value: input,
              branches: branches,
            }).getLeft()
          ) as IOResult<I>);
    },
    innerBus
  );
};
