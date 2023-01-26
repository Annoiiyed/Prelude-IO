import { Either, Vector, Predicate } from "prelude-ts";
import * as io from "../../lib/io";

describe("io.Bus", () => {
  it("executes all serializers in a chain", async () => {
    const numberToTwiceThat: io.IOTransformer<number, number> = jest
      .fn()
      .mockImplementation((n) => Either.right(n * 2));

    const numberToHalfThat: io.IOTransformer<number, number> = jest
      .fn()
      .mockImplementation((n) => Either.right(n / 2));

    const double = io.Bus.create<number, number>(
      "numberToTwiceThat",
      numberToTwiceThat,
      numberToHalfThat
    );

    const tripleChainedBus = double.chain(double).chain(double);

    expect((await tripleChainedBus.deserialize(1)).getOrThrow()).toEqual(8);

    expect(numberToTwiceThat).toHaveBeenCalledTimes(3);
    expect(numberToHalfThat).toHaveBeenCalledTimes(0);

    expect((await tripleChainedBus.serialize(8)).getOrThrow()).toEqual(1);

    expect(numberToHalfThat).toHaveBeenCalledTimes(3);
  });

  it("can be executed conditionally", async () => {
    const stringToNumber = io.Bus.create<string, number>(
      "stringToNumber",
      (input) => io.IOAccept(Number(input)),
      (input) => io.IOAccept(String(input))
    );

    const isNaN = Predicate.of<number>(Number.isNaN);
    const isFinite = Predicate.of(Number.isFinite);
    const isValid = isNaN.negate().and(isFinite);
    const stringToValidNumber = stringToNumber.if("isValid", isValid);

    expect(await stringToValidNumber.deserialize("1")).toEqual(Either.right(1));
    expect(await stringToValidNumber.deserialize("one")).toEqual(
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

    expect(await stringToEvenNumber.deserialize("2")).toEqual(Either.right(2));
    expect(await stringToEvenNumber.deserialize("3")).toEqual(
      io.IOReject({
        condition: "isEven(isValid(stringToNumber))",
        value: "3",
        branches: Vector.of({
          condition: "isEven",
          value: 3,
        }),
      })
    );

    expect(await stringToEvenNumber.serialize(2)).toEqual(Either.right("2"));
    expect(await stringToEvenNumber.serialize(3)).toEqual(
      io.IOReject({
        condition: "isEven(isValid(stringToNumber))",
        value: 3,
        branches: Vector.of({
          condition: "isEven",
          value: 3,
        }),
      })
    );
  });
});
