import { Function1 } from "prelude-ts";
import * as io from "../../lib/io";
import { BusInputType, BusOutputType, IOAccept } from "../../lib/io";

describe("Type declarations", () => {
  it("can infer the input for simple busses", async () => {
    const stringifyNumber = io.Bus.create<number, string>(
      "stringifyNumber",
      Function1.of(String).andThen(IOAccept)
    );

    type Input = BusInputType<typeof stringifyNumber>;
    type Output = BusOutputType<typeof stringifyNumber>;

    // @ts-expect-error Test
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const input: Input = {};

    // @ts-expect-error Test
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const output: Output = false;
  });
});
