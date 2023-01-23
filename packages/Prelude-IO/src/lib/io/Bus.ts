import { Option, Predicate } from "prelude-ts";
import { IODecode, IOAsyncDecode } from "./types";
import { IOReject, mergeNames } from "./utils";

/**
 * Merges the predicates of two buses. If both buses have predicates, the predicates are combined with an OR.
 *
 * This widens the input type, which means this might need a `try/catch` block to catch type errors.
 *
 * @param {Option<Predicate<OA>>} us The first predicate
 * @param {Option<Predicate<OB>>} them The second predicate
 *
 * @returns {Option<Predicate<OA | OB>>} An option that might contain a combined Predicate
 */
const mergePredicates = <OA, OB>(
  us: Option<Predicate<OA>>,
  them: Option<Predicate<OB>>
): Option<Predicate<OA | OB>> => {
  if (us.isNone() && them.isNone()) return Option.none();
  if (us.isNone()) return them as Option<Predicate<OA | OB>>;
  if (them.isNone()) return us as Option<Predicate<OA | OB>>;

  return Option.some(
    (us.get() as Predicate<OA | OB>).or(them.get() as Predicate<OA | OB>)
  );
};

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
 * @property {string} name The name of the bus
 * @property {Option<Predicate<O>>} predicate The predicate of the bus, executed after the decode function
 * @property {IOAsyncDecode<I, O>} decode The decode function. Always asyncronous
 */
export default class Bus<I, O> {
  private constructor(
    public readonly name: string,
    public readonly predicate: Option<Predicate<O>>,
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
      mergePredicates(this.predicate, other.predicate),
      async (input: I | IB) => {
        const us = await this.decode(input as I);

        if (us.isRight()) {
          return us;
        }

        const them = await other.decode(input as IB);

        if (them.isRight()) {
          return them;
        }

        return IOReject({
          condition: name,
          value: input,
          branches: us.getLeft().appendAll(them.getLeft()),
        });
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
    return new Bus(name, other.predicate, (input: I) =>
      this.decode(input).then((intermediate) =>
        intermediate.isLeft() ? intermediate : other.decode(intermediate.get())
      )
    );
  }

  /**
   * Creates a new bus with a predicate attached to it. The predicate is applied to the
   * decoded value of this bus.
   *
    @param {string} name The name of the predicate. Formatted to be "predicateName(busName)"
   * @param {Predicate<O>} predicate The predicate to attach to this bus
   *
   * @returns
   */
  public if(name: string, predicate: Predicate<O>): Bus<I, O> {
    const newBusName = `${name}(${this.name})`;
    return new Bus(newBusName, Option.of(predicate), async (input: I) => {
      const decodingResult = await this.decode(input);

      if (decodingResult.isLeft()) {
        return decodingResult;
      }

      if (predicate(decodingResult.get())) {
        return decodingResult;
      }

      return IOReject({
        condition: newBusName,
        value: input,
        branches: IOReject({
          condition: name,
          value: decodingResult.get(),
        }).getLeft(),
      });
    });
  }
}
