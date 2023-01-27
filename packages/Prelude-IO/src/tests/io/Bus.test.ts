import { Either, Vector, Predicate } from "prelude-ts";
import * as io from "../../lib/io";
import { IOAccept, IOReject } from "../../lib/io";

describe("io.Bus", () => {
  it("can be chained together", async () => {
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

  it("fails if a bus in a chain fails", async () => {
    const f = (i: number) =>
      IOReject({
        condition: "willFail",
        value: i,
      });

    const p = (i: number) => IOAccept(i);

    const willFail = io.Bus.create<number, number>("willFail", f, f);
    const willPass = io.Bus.create<number, number>("willPass", p, p);

    const middleWillFail = willPass.chain(willFail).chain(willPass);

    expect(await middleWillFail.deserialize(1)).toEqual(
      io.IOReject({
        condition: "(willPass -> willFail) -> willPass",
        value: 1,
        branches: io
          .IOReject({
            condition: "willFail",
            value: 1,
          })
          .getLeft(),
      })
    );
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

  it("Acts as an error boundary and always returns an Either", async () => {
    const throwBus = io.Bus.create<unknown, number>(
      "ThrowBus",
      () => {
        throw new Error();
      },
      () => {
        throw new Error();
      }
    );

    expect((await throwBus.deserialize(1)).isLeft()).toBe(true);
    expect((await throwBus.serialize(1)).isLeft()).toBe(true);
  });

  it("can be joined together", async () => {
    const oneToTwo = io.Bus.create<number, number>(
      "oneToTwo",
      (i) =>
        i === 1 ? IOAccept(2) : IOReject({ condition: "oneToTwo", value: i }),
      (i) =>
        i === 2 ? IOAccept(1) : IOReject({ condition: "oneToTwo", value: i })
    );

    const fourToFive = io.Bus.create<number, number>(
      "fourToFive",
      (i) =>
        i === 4 ? IOAccept(5) : IOReject({ condition: "fourToFive", value: i }),
      (i) =>
        i === 5 ? IOAccept(4) : IOReject({ condition: "fourToFive", value: i })
    );

    const joined = oneToTwo.else(fourToFive);

    expect(await joined.deserialize(1)).toEqual(IOAccept(2));
    expect(await joined.deserialize(4)).toEqual(IOAccept(5));
    expect(await joined.serialize(2)).toEqual(IOAccept(1));
    expect(await joined.serialize(5)).toEqual(IOAccept(4));
    expect(await joined.deserialize(3)).toEqual(
      IOReject({
        condition: "oneToTwo | fourToFive",
        value: 3,
        branches: Vector.of(
          {
            condition: "oneToTwo",
            value: 3,
          },
          {
            condition: "fourToFive",
            value: 3,
          }
        ),
      })
    );
    expect(await joined.serialize(3)).toEqual(
      IOReject({
        condition: "oneToTwo | fourToFive",
        value: 3,
        branches: Vector.of(
          {
            condition: "oneToTwo",
            value: 3,
          },
          {
            condition: "fourToFive",
            value: 3,
          }
        ),
      })
    );
  });
});
