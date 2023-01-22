import { Either, Vector } from "prelude-ts";
import * as io from "../..";

describe("io.Bus", () => {
  it("executes all validations in a chain", async () => {
    const dummyValidator: io.IODecode<number, number> = jest
      .fn()
      .mockImplementation((n) => Either.right(n * 2));

    const double = io.Bus.create<number, number>(dummyValidator, "test");

    const tripleChainedBus = double.chain(double).chain(double);

    expect((await tripleChainedBus.decode(1)).getOrThrow()).toEqual(8);

    expect(dummyValidator).toHaveBeenCalledTimes(3);
  });

  it("correctly merges errors of combined busses", async () => {
    const mustBeTwoValidator: io.IODecode<number, number> = (input) =>
      input === 2
        ? Either.right(input)
        : (Either.left(
            Vector.of({ message: "wasn't two" })
          ) as io.IOResult<number>);

    const mustBeThreeValidator: io.IODecode<number, number> = (input) =>
      input === 3
        ? Either.right(input)
        : (Either.left(
            Vector.of({ message: "wasn't three" })
          ) as io.IOResult<number>);

    const mustBeTwo = io.Bus.create<number, number>(
      mustBeTwoValidator,
      "mustBeTwo"
    );

    const mustBeThree = io.Bus.create<number, number>(
      mustBeThreeValidator,
      "mustBeThree"
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

  it("can be executed conditionally", async () => {
    const stringToNumber = io.Bus.create<string, number>(
      (input) => Either.right(Number(input)),
      "stringToNumber"
    );
    const isNaN = io.Condition.create("isNaN", Number.isNaN);
    const isFinite = io.Condition.create("isFinite", Number.isFinite);
    const stringToValidNumber = stringToNumber.if(
      isFinite.and(isNaN.not(), "isValidNumber")
    );

    expect(await stringToValidNumber.decode("1")).toEqual(Either.right(1));
    expect(await stringToValidNumber.decode("one")).toEqual(
      Either.left(
        Vector.of({
          condition: "isValidNumber(stringToNumber)",
          value: "one",
          branches: Vector.of({
            condition: "isValidNumber",
            value: NaN,
            branches: Vector.of(
              { condition: "isFinite", value: NaN },
              { condition: "!isNaN", value: NaN }
            ),
          }),
        })
      ) as io.IOLeft
    );
    expect(await stringToValidNumber.decode("Infinity")).toEqual(
      Either.left(
        Vector.of({
          condition: "isValidNumber(stringToNumber)",
          value: "Infinity",
          branches: Vector.of({
            condition: "isValidNumber",
            value: Infinity,
            branches: Vector.of({ condition: "isFinite", value: Infinity }),
          }),
        })
      ) as io.IOLeft
    );
  });
});
