import addValidator from "../addValidator";
import IO from "../IO";
import { isNumber } from "../Validators";

export default function numberField(target: IO, propertyName: string) {
  addValidator(target, propertyName, isNumber);
}
