import { Tuple2, Vector } from "prelude-ts";
import { IODecode, IOAsyncDecode, IOLeft } from "./types";

const operatorRegex = /(\|\||->)/g;

/**
 * Wraps a name in parentheses if it contains an operator.
 * Might need improvements in the future regarding presedence and pre-wrapped names.
 *
 * @param {string} name The name to check for operators
 * @returns {string} The name wrapped in parentheses if it contains an operator
 */
const maybeWrap = (name: string): string =>
  operatorRegex.test(name) ? `(${name})` : name;

/**
 * Merges the names using -> or || depending on the mode.
 *
 * Wraps the names in parentheses if they contain an operator.
 *
 * @example mergeNames(["a", "b"], "->") === "a -> b"
 * @example mergeNames(["a", "b -> c"], "||") === "a || (b -> c)"
 *
 * @param {Tuple2<string, string>} names A tuple of names to merge
 * @param {"->" | "||"} mode The mode to use for merging (and/or)
 *
 * @returns {string} The merged names
 */
export const mergeNames = (names: Tuple2<string, string>, mode: "->" | "||") =>
  names.toArray().map(maybeWrap).join(` ${mode} `);

/**
 * Merges the errors of two results. Works for both left and right results.
 *
 * @param {IOLeft} us The first result
 * @param {IOLeft} them The second result
 *
 * @returns {IOLeft} A result containing the errors of both results (if any)
 */
export const mergeLeft = (us: IOLeft, them: IOLeft) =>
  us.mapLeft((usErrors) =>
    them.getLeftOrElse(Vector.empty()).appendAll(usErrors)
  ) as IOLeft;

/**
 * A bus is a wrapper around a validator that allows for chaining of validators.
 *
 * Busses are executed in parallel, so the order of the errors is not guaranteed (but should not matter).
 * When chaining busses, the decoded value of the first bus is returned, the others are ignored. This might change in the future.
 *
 * Validators do not need to be asyncronous on initiation for ease of use, but on Bus creation, they will
 * always be wrapped in a Promise.
 *
 * Promise validators should ALWAYS resolve to a Result, never throw an error or reject. This is a philosophical choice based on
 * functional programming paradigms. Result objects allow functions to explicitly return errors, and the caller can decide
 * what to do with them. Throwing errors is a side effect, and should be avoided.
 *
 * @typeparam I The input type of the bus
 * @typeparam O The output type of the bus
 *
 * @field name The name of the bus
 * @field decode The decode function.
 */
export default class Bus<I, O> {
  private constructor(
    public readonly name: string,
    public readonly decode: IOAsyncDecode<I, O>
  ) {
    Object.freeze(this);
  }

  /**
   * Creates a new bus with the given name and validator. Wraps the validator in an async function.
   *
   * @param {string} name Name of the bus
   * @param {InToOut<I, O>} decode decode function for this bus
   */
  static create<I, O>(
    name: string,
    decode: IODecode<I, O> | IOAsyncDecode<I, O>
  ): Bus<I, O> {
    return new Bus(name, async (input: I) => decode(input));
  }

  /**
   * Creates a new bus with the given name and bus, returning the
   * result of the first bus if it succeeds, otherwise the result of the second bus.
   *
   * On failure, returns the errors of both busses.
   *
   * @param {name} name The name of the new bus
   * @param {Bus<IB, OB>} other The other bus to combine with
   *
   * @returns {Bus<I | IB, O | OB>} A new bus "this || other"
   */
  public else<IB, OB>(
    other: Bus<IB, OB>,
    name: string = mergeNames(Tuple2.of(this.name, other.name), "||")
  ): Bus<I | IB, O | OB> {
    return new Bus<I | IB, O | OB>(name, async (input: I | IB) => {
      const us = await this.decode(input as I);

      if (us.isRight()) {
        return us;
      }

      const them = await other.decode(input as IB);

      if (them.isRight()) {
        return them;
      }

      return mergeLeft(us, them);
    });
  }

  /**
   *
   * @param {string} name The name of the new bus
   * @param {other} other The other bus to combine with
   *
   * @returns {Bus<I, O>} A new bus "this -> other"
   */
  public chain<OB>(
    other: Bus<O, OB>,
    name: string = mergeNames(Tuple2.of(this.name, other.name), "->")
  ): Bus<I, OB> {
    return new Bus(name, (input: I) =>
      this.decode(input).then((intermediate) =>
        intermediate.isLeft() ? intermediate : other.decode(intermediate.get())
      )
    );
  }
}
