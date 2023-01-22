import { Option, Vector } from "prelude-ts";
import { Condition } from "../../lib/io/Condition";
import { IOErrors } from "../../lib/io/types";

describe("io.Condition", () => {
  it("executes .and() conditions", async () => {
    const canDivideByThree = Condition.create(
      "canDivideByThree",
      (n: number) => n % 3 === 0
    );

    const canDivideByFive = Condition.create(
      "canDivideByFive",
      (n: number) => n % 5 === 0
    );

    const multipleOfFifteen = canDivideByThree.and(
      canDivideByFive,
      "multipleOfFifteen"
    );

    expect(await canDivideByThree.check(15)).toEqual(Option.none());

    expect(await multipleOfFifteen.check(3)).toEqual<Option<IOErrors>>(
      Option.of(
        Vector.of({
          condition: "multipleOfFifteen",
          value: 3,
          branches: Vector.of({ condition: "canDivideByFive", value: 3 }),
        })
      )
    );

    expect(await multipleOfFifteen.check(4)).toEqual<Option<IOErrors>>(
      Option.of(
        Vector.of({
          condition: "multipleOfFifteen",
          value: 4,
          branches: Vector.of(
            { condition: "canDivideByThree", value: 4 },
            { condition: "canDivideByFive", value: 4 }
          ),
        })
      )
    );

    expect(await multipleOfFifteen.check(15)).toEqual(Option.none());
    expect(await multipleOfFifteen.check(30)).toEqual(Option.none());
  });

  it("executes .or() conditions", async () => {
    const canDivideByThree = Condition.create(
      "canDivideByThree",
      (n: number) => n % 3 === 0
    );

    const canDivideByFive = Condition.create(
      "canDivideByFive",
      (n: number) => n % 5 === 0
    );

    const multipleOfThreeOrFive = canDivideByThree.or(
      canDivideByFive,
      "multipleOfThreeOrFive"
    );

    expect(await multipleOfThreeOrFive.check(3)).toEqual(Option.none());

    expect(await multipleOfThreeOrFive.check(5)).toEqual(Option.none());

    expect(await multipleOfThreeOrFive.check(15)).toEqual(Option.none());

    expect(await multipleOfThreeOrFive.check(4)).toEqual(
      Option.of(
        Vector.of({
          condition: "multipleOfThreeOrFive",
          value: 4,
          branches: Vector.of(
            {
              condition: "canDivideByThree",
              value: 4,
            },
            {
              condition: "canDivideByFive",
              value: 4,
            }
          ),
        })
      )
    );
  });

  it("can be inverted", async () => {
    const isEven = Condition.create("isEven", (n: number) => n % 2 === 0);
    const isOdd = isEven.not();

    expect(await isEven.check(2)).toEqual(Option.none());
    expect(await isOdd.check(3)).toEqual(Option.none());
  });
});
