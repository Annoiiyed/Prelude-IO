import assert from "assert";
import { Either, Vector, Predicate } from "prelude-ts";
import * as io from "../lib";
import { IOAccept, IOReject } from "../lib";

describe("io.Bus", () => {
  it("can be chained together", () => {
    const double = io.Bus.create<number, number>(
      "numberToTwiceThat",
      (n) => Either.right(n * 2),
      (n) => Either.right(n / 2)
    );

    const tripleChainedBus = double.chain(double).chain(double);

    assert.deepEqual(tripleChainedBus.deserialize(1).getOrThrow(), 8);

    assert.deepEqual(tripleChainedBus.serialize(8).getOrThrow(), 1);
  });

  it("fails if a bus in a chain fails", () => {
    const f = (i: number) =>
      IOReject({
        condition: "willFail",
        value: i,
      });

    const p = (i: number) => IOAccept(i);

    const willFail = io.Bus.create<number, number>("willFail", f, f);
    const willPass = io.Bus.create<number, number>("willPass", p, p);

    const middleWillFail = willPass.chain(willFail).chain(willPass);

    assert.deepEqual(
      middleWillFail.deserialize(1),
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

  it("can be executed conditionally", () => {
    const stringToNumber = io.Bus.create<string, number>(
      "stringToNumber",
      (input) => io.IOAccept(Number(input)),
      (input) => io.IOAccept(String(input))
    );

    const isNaN = Predicate.of<number>(Number.isNaN);
    const isFinite = Predicate.of(Number.isFinite);
    const isValid = isNaN.negate().and(isFinite);
    const stringToValidNumber = stringToNumber.if("isValid", isValid);

    assert.deepEqual(stringToValidNumber.deserialize("1"), Either.right(1));
    assert.deepEqual(
      stringToValidNumber.deserialize("one"),
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

    assert.deepEqual(stringToEvenNumber.deserialize("2"), Either.right(2));
    assert.deepEqual(
      stringToEvenNumber.deserialize("3"),
      io.IOReject({
        condition: "isEven(isValid(stringToNumber))",
        value: "3",
        branches: Vector.of({
          condition: "isEven",
          value: 3,
        }),
      })
    );

    assert.deepEqual(stringToEvenNumber.serialize(2), Either.right("2"));
    assert.deepEqual(
      stringToEvenNumber.serialize(3),
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

  it("Acts as an error boundary and always returns an Either", () => {
    const throwBus = io.Bus.create<unknown, number>(
      "ThrowBus",
      () => {
        throw new Error();
      },
      () => {
        throw new Error();
      }
    );

    assert.ok(throwBus.deserialize(1).isLeft());
    assert.ok(throwBus.serialize(1).isLeft());
  });

  it("can be joined together", () => {
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

    assert.deepEqual(joined.deserialize(1), IOAccept(2));
    assert.deepEqual(joined.deserialize(4), IOAccept(5));
    assert.deepEqual(joined.serialize(2), IOAccept(1));
    assert.deepEqual(joined.serialize(5), IOAccept(4));
    assert.deepEqual(
      joined.deserialize(3),
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
    assert.deepEqual(
      joined.serialize(3),
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
