import { HashMap, Vector } from "prelude-ts";
import { VALIDATORS_KEY } from "../constants";
import { Validator } from "./Validators";

export default class IO {
  [VALIDATORS_KEY]: HashMap<string, Vector<Validator>> = HashMap.empty();

  protected constructor() {
    // Prevents direct instantiation
  }

  static of(input: object) {
    return new this();
  }
}
