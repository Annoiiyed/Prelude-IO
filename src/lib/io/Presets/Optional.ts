import { Option } from "prelude-ts";
import Bus from "../Bus";
import { IOAccept } from "../utils";

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
export default <I, O>(innerBus: Bus<I, O>) =>
  Bus.create<I | null, Option<O>>(
    `Optional(${innerBus.name})`,
    async (input) => {
      if (input === null) {
        return IOAccept(Option.none());
      }

      const decodedInner = await innerBus.decode(input);

      return decodedInner.isLeft()
        ? decodedInner
        : decodedInner.map((inner) => Option.of(inner));
    }
  );
