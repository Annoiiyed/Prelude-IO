const operators = ["->", "|"] as const;

const bracketContents = /\(.*\)/gm;

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
const mergeNames = (
  names: [string, string],
  operator: (typeof operators)[number]
) => {
  const otherOperators = operators.filter((x) => x !== operator);

  return names
    .map((name) => {
      const needsWrapping = otherOperators.some((x) =>
        name.replace(bracketContents, "").includes(x)
      );

      return needsWrapping ? `(${name})` : name;
    })
    .join(` ${operator} `);
};

export default mergeNames;
