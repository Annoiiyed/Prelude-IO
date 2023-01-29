import { HasEquals, Lazy } from "prelude-ts";

/**
 *
 * Adds equality functions to a data object. This freezes an object.
 * HashCode is lazily evaluated and memoized.
 *
 * @param <D> The type of the data object
 * @param data The data object to add equality to
 * @param equals The equality function
 * @param hashCode The hash code function
 *
 * @param equals.__type A comparison function
 * @param hashCode.__type A hashcode generating function
 *
 * @returns The data object with equality added
 */
export default function <D extends Record<string, unknown>>(
  data: D,
  equals: (a: D, b: D) => boolean,
  hashCode: (data: D) => number
): D & HasEquals {
  const lazyHashCode = Lazy.of(() => hashCode(data));

  return {
    ...data,
    equals: (other) => {
      try {
        return equals(data, other as D);
      } catch (e) {
        return false;
      }
    },
    hashCode: () => lazyHashCode.get(),
  };
}
