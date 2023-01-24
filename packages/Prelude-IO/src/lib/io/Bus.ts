import { Option, Predicate } from "prelude-ts";
import { IODecode, IOAsyncDecode } from "./types";
import { IOReject, mergeNames } from "./utils";

/**
 * Chains decoding functions
 */
const chainDecoders =
  <T1, T2, T3>(
    a: IOAsyncDecode<T1, T2>,
    b: IOAsyncDecode<T2, T3>
  ): IOAsyncDecode<T1, T3> =>
  (input: T1) =>
    a(input).then((intermediate) =>
      intermediate.isLeft() ? intermediate : b(intermediate.get())
    );

const elseDecoders =
  <IA, OA, IB, OB>(
    name: string,
    a: IOAsyncDecode<IA, OA>,
    b: IOAsyncDecode<IB, OB>
  ) =>
  async (input: IA | IB) => {
    const us = await a(input as IA);

    if (us.isRight()) {
      return us;
    }

    const them = await b(input as IB);

    if (them.isRight()) {
      return them;
    }

    return IOReject({
      condition: name,
      value: input,
      branches: us.getLeft().appendAll(them.getLeft()),
    });
  };

/**
 * Merges the predicates of two buses. If both buses have predicates, the predicates are combined with an OR.
 *
 * This widens the input type, which means this might need a `try/catch` block to catch type errors.
 *
 * @param us - The first predicate
 * @param them - The second predicate
 *
 * @internal
 *
 * @returns An option that might contain a combined Predicate
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
 * A bus is a wrapper around a decoder, with some basic logic included such as chaining or unions.
 *
 * Busses are executed in parallel, so the order of the errors is not guaranteed (but should not matter).
 * When chaining busses, the decoded value of the first bus is returned, the others are ignored. This might change in the future.
 *
 * Decoders do not need to be asyncronous on initiation for ease of use, but on Bus creation, they will
 * always be wrapped in a Promise.
 *
 * Decoders should ALWAYS resolve to a Result, never throw an error or reject. This is a philosophical choice based on
 * functional programming paradigms. Result objects allow functions to explicitly return errors, and the caller can decide
 * what to do with them. Throwing errors is a side effect, and should be avoided.
 *
 * [Predicates](http://emmanueltouzery.github.io/prelude.ts/latest/apidoc/files/predicate.html) can be attached to ensure
 * validity of the external type, that isn't relevant for the decoding process.
 *
 * @example
 * Ensure something is a number:
 * ```typescript
 * [[include:bus_creation_example.ts]]
 * ```
 *
 * @example
 * Add a predicate to a bus:
 * ```typescript
 * [[include:predicate_attachment_example.ts]]
 * ```
 *
 * @param <I> - The input type of the bus
 * @param <O> - The output type of the bus
 */
export default class Bus<I = unknown, O = unknown> {
  /**
   * Constructor cannot be called directly. Instead, {@link Bus.create} should be used.
   *
   * @internal
   */
  private constructor(
    /** The name used to identify this bus in errors */
    public readonly name: string,
    /** An optional [Predicate](http://emmanueltouzery.github.io/prelude.ts/latest/apidoc/files/predicate.html) exectuted on the output of the bus */
    public readonly predicate: Option<Predicate<O>>,
    /** A async decoding function */
    public readonly decode: IOAsyncDecode<I, O>,
    /** A async encoding function */
    public readonly encode: IOAsyncDecode<O, I>
  ) {
    Object.freeze(this);
  }

  /**
   * Creates a new bus with the given name and decoder. Wraps the decoder in an async function.
   *
   * @param <I> - The input type for the new bus
   * @param <O> - The output type for the new bus
   * @param name - Name of the bus
   * @param decode - decode function for this bus. Will be turned into a Promise.
   */
  static create<I, O>(
    name: string,
    decode: IODecode<I, O> | IOAsyncDecode<I, O>,
    encode: IODecode<O, I> | IOAsyncDecode<O, I>
  ): Bus<I, O> {
    return new Bus(
      name,
      Option.none(),
      async (input: I) => decode(input),
      async (input: O) => encode(input)
    );
  }

  /**
   * Creates a new bus with the given name and bus, returning the
   * result of the first bus if it succeeds, otherwise the result of the second bus.
   *
   * [Predicates](http://emmanueltouzery.github.io/prelude.ts/latest/apidoc/files/predicate.html) are merged, which means the input type is widened.
   *
   * On failure, returns the errors of both busses.
   *
   * @param <IB> - The other bus' input
   * @param <OB> - The other bus' output
   * @param name - The name of the new bus
   * @param other - The other bus to combine with
   *
   * @returns A new bus `this | other`
   */
  public else<IB, OB>(
    other: Bus<IB, OB>,
    name: string = mergeNames([this.name, other.name], "|")
  ): Bus<I | IB, O | OB> {
    return new Bus<I | IB, O | OB>(
      name,
      mergePredicates(this.predicate, other.predicate),
      elseDecoders(name, this.decode, other.decode),
      elseDecoders(name, this.encode, other.encode)
    );
  }

  /**
   * Creates a new bus with the given name and bus, returning the
   * result of the first bus chained into the second bus.
   *
   * The predicates of the chained busses are preserved, but the newly created bus does not
   * have a predicate of its own.
   *
   * @param <OB> - The other bus' output
   * @param name - The name of the new bus
   * @param other - The other bus to combine with
   *
   * @returns A new bus "this -\> other"
   */
  public chain<OB>(
    other: Bus<O, OB>,
    name: string = mergeNames([this.name, other.name], "->")
  ): Bus<I, OB> {
    return new Bus(
      name,
      Option.none(),
      chainDecoders(this.decode, other.decode),
      chainDecoders(other.encode, this.encode)
    );
  }

  /**
   * Attaches a [Predicate](http://emmanueltouzery.github.io/prelude.ts/latest/apidoc/files/predicate.html) to a bus.
   * The predicate is applied on the decoded value before returning.
   * @example
   * Add a predicate to a bus:
   * ```typescript
   * [[include:predicate_attachment_example.ts]]
   * ```
   *
   * Because this nests the original bus, you can call this function multiple times:
   * ```typescript
   * [[include:multiple_predicates_example.ts]]
   * ```
   *
   * @param name - The name of the predicate. Formatted to be "predicateName(busName)"
   * @param predicate - The predicate to attach to this bus
   *
   * @returns A new bus with the given predicate attached to it.
   */
  public if(name: string, predicate: Predicate<O>): Bus<I, O> {
    const newBusName = `${name}(${this.name})`;

    const newEncode = async (input: O) => {
      if (!predicate(input)) {
        return IOReject({
          condition: newBusName,
          value: input,
          branches: IOReject({
            condition: name,
            value: input,
          }).getLeft(),
        });
      }

      return this.encode(input);
    };

    const newDecode = async (input: I) => {
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
    };

    return new Bus(newBusName, Option.of(predicate), newDecode, newEncode);
  }
}
