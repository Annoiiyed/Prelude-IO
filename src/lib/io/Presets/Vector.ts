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

  const decode = async (input: I[]) => {
    if (input.length === 0) IOAccept(Vector.empty());

    const decodedInners = Vector.ofIterable(
      await Promise.all(input.map(innerBus.decode))
    );

    const hasLeft = decodedInners.anyMatch((decodedInner) =>
      decodedInner.isLeft()
    );

    if (!hasLeft) {
      return IOAccept(
        Vector.ofIterable(
          decodedInners.map((decodedInner) => decodedInner.getOrThrow() as O)
        )
      );
    }

    return IOReject({
      condition: name,
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
  };

  const encode = async (input: Vector<O>) => {
    if (input.isEmpty()) return IOAccept([]);

    const decodedInners = Vector.ofIterable(
      await Promise.all(input.map(innerBus.encode))
    );

    const hasLeft = decodedInners.anyMatch((decodedInner) =>
      decodedInner.isLeft()
    );

    if (!hasLeft) {
      return IOAccept(
        decodedInners
          .map((decodedInner) => decodedInner.getOrThrow() as I)
          .toArray()
      );
    }

    return IOReject({
      condition: name,
      value: input,
      branches: decodedInners
        .zipWithIndex()
        .filter(([decodedInner]) => decodedInner.isLeft())
        .map(([decodedInner, index]) => ({
          condition: `${innerBus.name}[${index}]`,
          value: input.get(index).getOrThrow(),
          branches: decodedInner.getLeftOrThrow(),
        })),
    });
  };

  return Bus.create<I[], Vector<O>>(name, decode, encode);
};
