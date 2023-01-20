import { Vector } from "prelude-ts";
import { VALIDATORS_KEY } from "../constants";
import IO from "./IO";
import { Validator } from "./Validators";

export default function addValidator(
  target: IO,
  field: string,
  validator: Validator
) {
  const validators =
    Reflect.getOwnMetadata(VALIDATORS_KEY, target, field) || Vector.empty();

  Reflect.defineMetadata(
    VALIDATORS_KEY,
    validators.append(validator),
    target,
    field
  );
}
