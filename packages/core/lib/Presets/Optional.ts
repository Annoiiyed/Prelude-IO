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
 * @param <I> Inner bus' input. This is widened to `I | null | undefined` in the newly created bus.
 * @param <O> Inner bus' output. This is transformed to `Option<O>` in the newly created bus.
 *
 * @group Presets
 */
export default <I, O>(
  innerBus: Bus<I, O>,
  name = `Optional(${innerBus.name})`
) =>
  Bus.create<I | null | undefined, Option<O>>(
    name,
    (input) => {
      if (input === null || input === undefined) {
        return IOAccept(Option.none());
      }

      return innerBus.deserialize(input).bimap(
        (branches) =>
          IOReject({
            condition: name,
            value: input,
            branches: branches,
          }).getLeft(),
        (inner) => Option.of(inner as O)
      );
    },
    (input) => {
      return input.isNone()
        ? IOAccept(null)
        : (innerBus.serialize(input.get()).mapLeft((branches) =>
            IOReject({
              condition: name,
              value: input,
              branches: branches,
            }).getLeft()
          ) as IOResult<I>);
    },
    innerBus
  );
