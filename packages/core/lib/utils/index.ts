/**
 * @module Utilities
 */
import { Either, Vector } from "prelude-ts";
import { IOError, IOLeft, IORight } from "../types";
export { default as humanizeErrors } from "./humanizeErrors";
export { default as addEquality } from "./addEquality";
export { default as mergeNames } from "./mergeNames";

/**
 * Shorthand function for creating a right Either for IOResult.
 *
 * @param output - The output to be wrapped
 *
 * @returns IORight with wrapped output
 */
export const IOAccept = <O>(output: O) => Either.right(output) as IORight<O>;

/**
 * Shorthand function for creating a left Either for IOResult.
 *
 * @param errors - Errors to add to the Either
 *
 * @returns An `IOLeft` containing all `IOError`s passed as argument, in a Vector.
 */
export const IOReject = (...errors: IOError[]) =>
  Either.left(Vector.ofIterable(errors)) as IOLeft;
