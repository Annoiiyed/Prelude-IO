import { Either, Vector, Predicate } from "prelude-ts";
import * as io from "../../lib/io";

describe("io.Bus", () => {
  it("executes all validations in a chain", async () => {
    const numberToTwiceThat: io.IODecode<number, number> = jest
      .fn()
      .mockImplementation((n) => Either.right(n * 2));

    const double = io.Bus.create<number, number>(
      "numberToTwiceThat",
      numberToTwiceThat
    );

    const tripleChainedBus = double.chain(double).chain(double);

    expect((await tripleChainedBus.decode(1)).getOrThrow()).toEqual(8);

    expect(numberToTwiceThat).toHaveBeenCalledTimes(3);
  });

  it("correctly merges errors of combined busses", async () => {
    const mustBeTwoValidator: io.IODecode<number, number> = (input) =>
      input === 2
        ? io.IOAccept(input)
        : io.IOReject({
            condition: "mustBeTwo",
            value: input,
          });

    const mustBeThreeValidator: io.IODecode<number, number> = (input) =>
      input === 3
        ? io.IOAccept(input)
        : io.IOReject({
            condition: "mustBeThree",
            value: input,
          });

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
      io.IOReject({ condition: "mustBeThree", value: 2 })
    );

    const mustBeTwoOrThree = mustBeTwo.else(mustBeThree);

    expect(await mustBeTwoOrThree.decode(9)).toEqual(
      io.IOReject({
        condition: "mustBeTwo | mustBeThree",
        value: 9,
        branches: Vector.of(
          { condition: "mustBeTwo", value: 9 },
          { condition: "mustBeThree", value: 9 }
        ),
      })
    );
  });

  it("can be executed conditionally", async () => {
    const stringToNumber = io.Bus.create<string, number>(
      "stringToNumber",
      (input) => io.IOAccept(Number(input))
    );
    const isNaN = Predicate.of<number>(Number.isNaN);
    const isFinite = Predicate.of(Number.isFinite);
    const isValid = isNaN.negate().and(isFinite);
    const stringToValidNumber = stringToNumber.if("isValid", isValid);

    expect(await stringToValidNumber.decode("1")).toEqual(Either.right(1));
    expect(await stringToValidNumber.decode("one")).toEqual(
      io.IOReject({
        condition: "isValid(stringToNumber)",
        value: "one",
        branches: Vector.of({
          condition: "isValid",
          value: NaN,
        }),
      })
    );

    const isEven = Predicate.of<number>((n) => n % 2 === 0);
    const stringToEvenNumber = stringToValidNumber.if("isEven", isEven);

    expect(await stringToEvenNumber.decode("2")).toEqual(Either.right(2));
    expect(await stringToEvenNumber.decode("3")).toEqual(
      io.IOReject({
        condition: "isEven(isValid(stringToNumber))",
        value: "3",
        branches: Vector.of({
          condition: "isEven",
          value: 3,
        }),
      })
    );
  });
});
