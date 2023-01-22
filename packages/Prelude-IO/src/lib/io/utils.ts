import { Either, Vector } from "prelude-ts";
import { IOError, IOErrors, IOLeft, IORight } from "./types";

const operators = ["AND", "OR", "->", "|"];

/**
 * Wraps a name in parentheses if it contains an operator.
 * Might need improvements in the future regarding presedence and pre-wrapped names.
 *
 * @param {string} name The name to check for operators
 * @returns {string} The name wrapped in parentheses if it contains an operator
 */
export const maybeWrapName = (name: string) =>
  operators.some((operator) => name.includes(operator)) &&
  (!name.startsWith("(") || !name.endsWith(")"))
    ? `(${name})`
    : name;

/**
 * Merges the names using -> or OR depending on the mode.
 *
 * Wraps the names in parentheses if they contain an operator.
 *
 * @example mergeNames(["a", "b"], "->") === "a -> b"
 * @example mergeNames(["a", "b -> c"], "OR") === "a OR (b -> c)"
 *
 * @param {[string, string]} names A tuple of names to merge
 * @param {string} operator The operator used for merging
 *
 * @returns {string} The merged names
 */
export const mergeNames = (names: [string, string], operator: string) =>
  names.map(maybeWrapName).join(` ${operator} `);

/**
 * Shorthand function for creating a right Either for IOResult.
 *
 * @param {O} output
 *
 * @returns {IORight<O>}
 */
export const IOAccept = <O>(output: O) => Either.right(output) as IORight<O>;

/**
 * Shorthand function for creating a left Either for IOResult.
 *
 *
 * @returns {IOLeft}
 */
export const IOReject = (error: IOErrors | IOError) =>
  Either.left(error instanceof Vector ? error : Vector.of(error)) as IOLeft;
