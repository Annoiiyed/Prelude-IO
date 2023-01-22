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
