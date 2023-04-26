import { Option, Predicate } from "prelude-ts";
import { IOTransformer, ComplexFields } from "./types";
import { IOReject, mergeNames } from "./utils";

const chainTransformers =
  <T1, T2, T3>(
    name: string,
    a: IOTransformer<T1, T2>,
    b: IOTransformer<T2, T3>
  ): IOTransformer<T1, T3> =>
  (input: T1) => {
    const intermediate = a(input);

    return intermediate.isLeft()
      ? IOReject({
          condition: name,
          value: input,
          branches: intermediate.getLeft(),
        })
      : b(intermediate.get());
  };

const elseTransformers =
  <IA, OA, IB, OB>(
    name: string,
    a: IOTransformer<IA, OA>,
    b: IOTransformer<IB, OB>
  ) =>
  (input: IA | IB) => {
    const us = a(input as IA);

    if (us.isRight()) {
      return us;
    }

    const them = b(input as IB);

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
 * A bus is a wrapper around two transformers (serialize and deserialize), with some basic logic included such as chaining or unions.
 *
 * Busses are executed in parallel, so the order of the errors is not guaranteed (but should not matter).
 * When chaining busses, the deserialized value of the first bus is returned, the others are ignored. This might change in the future.
 *
 * Transformers should ALWAYS return an IOResult, never throw an error. This is a philosophical choice based on
 * functional programming paradigms. Result objects allow functions to explicitly return errors, and the caller can decide
 * what to do with them. Throwing errors is a side effect, and should be avoided.
 *
 * [Predicates](http://emmanueltouzery.github.io/prelude.ts/latest/apidoc/files/predicate.html) can be attached to ensure
 * validity of the external type, that isn't relevant for the transforming process.
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
    /** A deserialization function */
    public readonly deserialize: IOTransformer<I, O>,
    /** A serialization function */
    public readonly serialize: IOTransformer<O, I>,
    /** Contains the inner bus if this bus is a wrapper around other busses */
    public readonly inner: Bus | ComplexFields | readonly Bus[] = null
  ) {
    Object.freeze(this);
  }

  /**
   * Creates a new bus with the given name and deserializer.
   *
   * @param <I> - The input type for the new bus
   * @param <O> - The output type for the new bus
   * @param name - Name of the bus
   * @param deserialize - deserialize function for this bus
   */
  static create<I, O>(
    name: string,
    deserialize: IOTransformer<I, O>,
    serialize: IOTransformer<O, I>,
    inner: Bus["inner"] = null
  ): Bus<I, O> {
    const fallbackRejection = (input: unknown, e: Error) =>
      IOReject({
        condition: name,
        value: input,
        message: `Unexpected error: ${e}\n---\n Busses should never throw errors, but instead return an IOResult!\n---\n${e.stack}`,
      });

    return new Bus(
      name,
      Option.none(),
      (input: I) => {
        try {
          return deserialize(input);
        } catch (e) {
          return fallbackRejection(input, e);
        }
      },
      (input: O) => {
        try {
          return serialize(input);
        } catch (e) {
          return fallbackRejection(input, e);
        }
      },
      inner
    );
  }

  /**
   * Creates a new bus with the given name and bus, returning the
   * result of the first bus if it succeeds, otherwise the result of the second bus.
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
      Option.none(),
      elseTransformers(name, this.deserialize, other.deserialize),
      elseTransformers(name, this.serialize, other.serialize),
      [this, other]
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
      chainTransformers(name, this.deserialize, other.deserialize),
      chainTransformers(name, other.serialize, this.serialize),
      [this, other]
    );
  }

  /**
   * Attaches a [Predicate](http://emmanueltouzery.github.io/prelude.ts/latest/apidoc/files/predicate.html) to a bus.
   * The predicate is applied on the deserialized value before returning.
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

    const newserialize = (input: O) => {
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

      return this.serialize(input);
    };

    const newDeserialize = (input: I) => {
      const deserialized = this.deserialize(input);

      if (deserialized.isLeft()) {
        return deserialized;
      }

      if (predicate(deserialized.get())) {
        return deserialized;
      }

      return IOReject({
        condition: newBusName,
        value: input,
        branches: IOReject({
          condition: name,
          value: deserialized.get(),
        }).getLeft(),
      });
    };

    return new Bus(
      newBusName,
      Option.of(predicate),
      newDeserialize,
      newserialize,
      this
    );
  }
}
