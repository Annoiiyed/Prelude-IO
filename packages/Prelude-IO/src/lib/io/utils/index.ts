/**
 * @module Utilities
 */
import { Either, Vector } from "prelude-ts";
import { IOError, IOLeft, IORight } from "../types";
export { default as humanizeErrors } from "./humanizeErrors";

const operators = ["->", "||"];

/**
 * Wraps a name in parentheses if it contains an operator.
 * Might need improvements in the future regarding presedence and pre-wrapped names.
 *
 * @param name - The name to check for operators
 *
 * @returns The name wrapped in parentheses if it contains an operator
 */
export const maybeWrapName = (name: string) =>
  operators.some((operator) => name.includes(operator)) &&
  (!name.startsWith("(") || !name.endsWith(")"))
    ? `(${name})`
    : name;

/**
 * Merges the names using -\> or OR depending on the mode.
 *
 * Wraps the names in parentheses if they contain an operator.
 *
 * @example mergeNames(["a", "b"], "-\>") === "a -\> b"
 * @example mergeNames(["a", "b -\> c"], "||") === "a || (b -\> c)"
 *
 * @param names - A tuple of names to merge
 * @param operator - The operator used for merging
 *
 * @returns The merged names
 */
export const mergeNames = (names: [string, string], operator: string) =>
  names.map(maybeWrapName).join(` ${operator} `);

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
