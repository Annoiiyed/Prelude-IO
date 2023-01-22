import { Option, Vector } from "prelude-ts";
import { IOCondition, IOError, IOErrors } from "./types";
import { maybeWrapName, mergeNames } from "./utils";

const makeIOError = (condition: string, value: unknown): IOError => ({
  condition,
  value,
});

const mergeErrors = (
  us: Option<IOErrors>,
  them: Option<IOErrors>,
  combined: IOError
): Option<IOErrors> => {
  const merged = us
    .getOrElse(Vector.empty())
    .appendAll(them.getOrElse(Vector.empty()));

  return merged.isEmpty()
    ? Option.none()
    : Option.some(Vector.of({ ...combined, branches: merged }));
};

/**
 * Utility class for creating conditions that can be combined with other conditions,
 * and then attached to a Bus.
 *
 * @typedef {unknown} I Input
 */
export default class Condition<I> {
  private constructor(
    public readonly name: string,
    public readonly check: (input: I) => Promise<Option<IOErrors>>
  ) {
    Object.freeze(this);
  }

  /**
   * Transforms a boolean check into a Condition object
   *
   * @param name A name for this condition
   * @param check The check to complete
   * @returns {Condition<I>}
   */
  static create<I>(name: string, check: IOCondition<I>): Condition<I> {
    return new Condition<I>(name, async (input: I) =>
      check(input)
        ? Option.none()
        : Option.some(Vector.of(makeIOError(name, input)))
    );
  }

  /**
   * Creates a new condition from two conditions, returning the combined errors.
   *
   * @param {Condition<I>} other The other condition to combine with
   * @param {string | null} name The name of the combined condition
   *
   * @returns {Condition<I>}
   */
  public and(
    other: Condition<I>,
    name: string = mergeNames([this.name, other.name], "AND")
  ): Condition<I> {
    return new Condition<I>(name, (input: I) =>
      // eslint-disable-next-line prettier/prettier
        Promise
          .all([this.check(input), other.check(input)])
          .then(([us, them]) => mergeErrors(us, them, makeIOError(name, input)))
    );
  }

  /**
   * Creates a new condition from two conditions, only returning errors if both fail.
   *
   * @param {Condition<I>} other The other condition to combine with
   * @param {string | null} name The name of the combined condition
   *
   * @returns {Condition<I>}
   */
  public or<OI>(
    other: Condition<OI>,
    name: string = mergeNames([this.name, other.name], "OR")
  ): Condition<I> {
    return new Condition<I>(name, async (input: I | OI) =>
      Promise.all([this.check(input as I), other.check(input as OI)]).then(
        ([us, them]) =>
          us.isNone() || them.isNone()
            ? Option.none()
            : mergeErrors(us, them, makeIOError(name, input))
      )
    );
  }

  /**
   * Creates a new condition that is the inverse of this condition.
   */
  public not(name = `!${maybeWrapName(this.name)}`): Condition<I> {
    return new Condition<I>(name, async (input: I) =>
      (await this.check(input)).isNone()
        ? Option.some(Vector.of(makeIOError(name, input)))
        : Option.none()
    );
  }
}
