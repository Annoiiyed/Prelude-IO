import Bus from "../Bus";
import { IOAccept, IOReject } from "../utils";

const name = "number";

export default Bus.create<unknown, number>(
  (input) =>
    typeof input === "number"
      ? IOAccept(input)
      : IOReject({
          condition: name,
          value: input,
        }),
  name
);
