import { Vector } from "prelude-ts";
import Bus from "../Bus";
import { IOAccept, IOReject } from "../utils";

export default <I, O>(innerBus: Bus<I, O>) => {
  const name = `Vector(${innerBus.name})`;

  return Bus.create<I[], Vector<O>>(async (input) => {
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
  }, name);
};
