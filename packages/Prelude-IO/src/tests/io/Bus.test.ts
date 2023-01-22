import { Either, Vector } from "prelude-ts";
import * as io from "../..";
import { IOResult } from "../..";

describe("io.Bus", () => {
  it("executes all validations in a chain", async () => {
    const dummyValidator: io.IODecode<number, number> = jest
      .fn()
      .mockImplementation((n) => Either.right(n * 2));

    const double = io.Bus.create<number, number>("test", dummyValidator);

    const tripleChainedBus = double.chain(double).chain(double);

    expect((await tripleChainedBus.decode(1)).getOrThrow()).toEqual(8);

    expect(dummyValidator).toHaveBeenCalledTimes(3);
  });

  it("correctly merges names of combined busses", () => {
    const dummyValidator: io.IODecode<number, number> = (input) =>
      Either.right(input);

    const bus1 = io.Bus.create<number, number>("bus1", dummyValidator);
    const bus2 = io.Bus.create<number, number>("bus2", dummyValidator);

    const bus3 = bus1.else(bus2);

    expect(bus3.name).toBe("bus1 || bus2");

    const bus4 = bus3.chain(bus2);

    expect(bus4.name).toBe("(bus1 || bus2) -> bus2");

    const bus5 = bus2.chain(bus1, "testAlias");

    expect(bus5.name).toBe("testAlias");

    const bus6 = bus5.chain(bus3);

    expect(bus6.name).toBe("testAlias -> (bus1 || bus2)");
  });

  it("correctly merges errors of combined busses", async () => {
    const mustBeTwoValidator: io.IODecode<number, number> = (input) =>
      input === 2
        ? Either.right(input)
        : (Either.left(
            Vector.of({ message: "wasn't two" })
          ) as IOResult<number>);

    const mustBeThreeValidator: io.IODecode<number, number> = (input) =>
      input === 3
        ? Either.right(input)
        : (Either.left(
            Vector.of({ message: "wasn't three" })
          ) as IOResult<number>);

    const mustBeTwo = io.Bus.create<number, number>(
      "mustBeTwo",
      mustBeTwoValidator
    );

    const mustBeThree = io.Bus.create<number, number>(
      "mustBeThree",
      mustBeThreeValidator
    );

    expect(await mustBeTwo.decode(2)).toEqual(Either.right(2));

    expect(await mustBeThree.decode(3)).toEqual(Either.right(3));

    expect(await mustBeThree.decode(2)).toEqual(
      Either.left(Vector.of({ message: "wasn't three" }))
    );

    const mustBeTwoOrThree = mustBeTwo.else(mustBeThree);

    expect(await mustBeTwoOrThree.decode(9)).toEqual(
      Either.left(
        Vector.of({ message: "wasn't three" }, { message: "wasn't two" })
      )
    );
  });
});
