import { Option } from "prelude-ts";
import Bus from "../Bus";
import { IOAccept } from "../utils";

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
