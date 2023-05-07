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

  const deserialize = (input: I[]) => {
    if (
      typeof input === "undefined" ||
      input === null ||
      typeof input[Symbol.iterator] !== "function"
    ) {
      return IOReject({
        condition: name,
        value: input,
      });
    }

    if (input.length === 0) return IOAccept(Vector.empty<O>());

    const deserializedInners = Vector.ofIterable(input).map(
      innerBus.deserialize
    );

    const hasLeft = deserializedInners.anyMatch((deserializedInner) =>
      deserializedInner.isLeft()
    );

    if (!hasLeft) {
      return IOAccept(
        Vector.ofIterable(
          deserializedInners.map(
            (deserializedInner) => deserializedInner.getOrThrow() as O
          )
        )
      );
    }

    return IOReject({
      condition: name,
      value: input,
      branches: deserializedInners
        .zipWithIndex()
        .filter(([deserializedInner]) => deserializedInner.isLeft())
        .map(([deserializedInner, index]) => ({
          condition: `[${index}]`,
          value: input[index],
          branches: deserializedInner.getLeftOrThrow(),
        })),
    });
  };

  const serialize = (input: Vector<O>) => {
    if (input.isEmpty()) return IOAccept([]);

    const deserializedInners = Vector.ofIterable(input.map(innerBus.serialize));

    const hasLeft = deserializedInners.anyMatch((deserializedInner) =>
      deserializedInner.isLeft()
    );

    if (!hasLeft) {
      return IOAccept(
        deserializedInners
          .map((deserializedInner) => deserializedInner.getOrThrow() as I)
          .toArray()
      );
    }

    return IOReject({
      condition: name,
      value: input,
      branches: deserializedInners
        .zipWithIndex()
        .filter(([deserializedInner]) => deserializedInner.isLeft())
        .map(([deserializedInner, index]) => ({
          condition: `[${index}]`,
          value: input.get(index).getOrThrow(),
          branches: deserializedInner.getLeftOrThrow(),
        })),
    });
  };

  return Bus.create<I[], Vector<O>>(name, deserialize, serialize, innerBus);
};
