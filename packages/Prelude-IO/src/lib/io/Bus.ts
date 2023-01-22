import { Either, Option, Vector } from "prelude-ts";
import { IODecode, IOAsyncDecode, IOLeft } from "./types";
import { mergeNames } from "./utils";
import Condition from "./Condition";

/**
 * Merges the errors of two results. Works for both left and right results.
 *
 * @param {IOLeft} us The first result
 * @param {IOLeft} them The second result
 *
 * @returns {IOLeft} A result containing the errors of both results (if any)
 */
const mergeLeft = (us: IOLeft, them: IOLeft) =>
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
    public readonly condition: Option<Condition<O>>,
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
    decode: IODecode<I, O> | IOAsyncDecode<I, O>,
    name: string
  ): Bus<I, O> {
    return new Bus(name, Option.none(), async (input: I) => decode(input));
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
    name: string = mergeNames([this.name, other.name], "|")
  ): Bus<I | IB, O | OB> {
    return new Bus<I | IB, O | OB>(
      name,
      this.condition.map((c) =>
        other.condition.isNone() ? c : c.or(other.condition.get())
      ) as Option<Condition<O | OB>>,
      async (input: I | IB) => {
        const us = await this.decode(input as I);

        if (us.isRight()) {
          return us;
        }

        const them = await other.decode(input as IB);

        if (them.isRight()) {
          return them;
        }

        return mergeLeft(us, them);
      }
    );
  }

  /**
   *
   * Creates a new bus with the given name and bus, returning the
   * result of the first bus chained into the second bus.
   *
   * @param {string} name The name of the new bus
   * @param {other} other The other bus to combine with
   *
   * @returns {Bus<I, O>} A new bus "this -> other"
   */
  public chain<OB>(
    other: Bus<O, OB>,
    name: string = mergeNames([this.name, other.name], "->")
  ): Bus<I, OB> {
    return new Bus(name, other.condition, (input: I) =>
      this.decode(input).then((intermediate) =>
        intermediate.isLeft() ? intermediate : other.decode(intermediate.get())
      )
    );
  }

  /**
   * Creates a new bus with a condition attached to it. The condition is applied to the
   * decoded value of this bus.
   *
   * @param {Condition<O>} condition The condition to attach to this bus
   *
   * @returns
   */
  public if(
    condition: Condition<O>,
    name = `${condition.name}(${this.name})`
  ): Bus<I, O> {
    return new Bus(name, Option.of(condition), async (input: I) => {
      const decodingResult = await this.decode(input);

      if (decodingResult.isLeft()) {
        return decodingResult;
      }

      const conditionResult = await condition.check(decodingResult.get());

      if (conditionResult.isNone()) {
        return decodingResult;
      }

      return Either.left(
        Vector.of({
          condition: name,
          value: input,
          branches: conditionResult.get(),
        })
      ) as IOLeft;
    });
  }
}
