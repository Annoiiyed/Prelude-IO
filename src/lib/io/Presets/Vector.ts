import { Vector } from "prelude-ts";
import Bus from "../Bus";
import { IOAccept, IOReject } from "../utils";

/**
 * A bus factory that allows a bus to be wrapped in a [Vector](http://emmanueltouzery.github.io/prelude.ts/latest/apidoc/classes/vector.html).
 *
 * @example
 * ```typescript
 * [[include:vector_preset_example.ts]]
 * ```
 *
 * @param <I> Inner bus' input.
 * @param <O> Inner bus' output. This is transformed to `Vector<O>` in the newly created bus.
 *
 * @group Presets
 */
export default <I, O>(innerBus: Bus<I, O>) => {
  const name = `Vector(${innerBus.name})`;

  return Bus.create<I[], Vector<O>>(name, async (input) => {
    if (input.length === 0) {
      return IOAccept(Vector.empty());
    }

    const decodedInners = Vector.ofIterable(
      await Promise.all(input.map(innerBus.decode))
    );

    const hasLeft = decodedInners.anyMatch((decodedInner) =>
      decodedInner.isLeft()
    );

    if (!hasLeft) {
      return IOAccept(
        decodedInners.map((decodedInner) => decodedInner.getOrThrow() as O)
      );
    }

    return IOReject({
      condition: `Vector(${innerBus.name})`,
      value: input,
      branches: decodedInners
        .zipWithIndex()
        .filter(([decodedInner]) => decodedInner.isLeft())
        .map(([decodedInner, index]) => ({
          condition: `${innerBus.name}[${index}]`,
          value: input[index],
          branches: decodedInner.getLeftOrThrow(),
        })),
    });
  });
};
