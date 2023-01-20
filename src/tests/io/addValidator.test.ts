import * as io from "../..";
import { VALIDATORS_KEY } from "../../lib/constants";
import addValidator from "../../lib/io/addValidator";

const testValidator: io.Validators.Validator = () => true;

const testField = (target: io.IO, propertyName: string): void => {
  addValidator(target, propertyName, testValidator);
};

describe("addValidator", () => {
  it("adds a validator to an IO class", () => {
    class SimpleTestClass extends io.IO {
      @testField
      test!: null;
    }

    const instance = SimpleTestClass.of({ numberField: 1 });

    expect(
      Reflect.getMetadata(VALIDATORS_KEY, instance, "test").toArray()
    ).toContain(testValidator);
  });
});
