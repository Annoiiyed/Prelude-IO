import { IOErrors } from "../types";

const ERROR_MARKER = "%%%ERROR_MARKER%%%";

const isLineError = (line: string): boolean =>
  !["├", "│", "└"].includes(line.trim().charAt(0)) &&
  line.includes(ERROR_MARKER);

const makeLines = (errors: IOErrors): string[] =>
  errors
    .toArray()
    .map(({ value, condition, branches, message }) =>
      branches === undefined || branches.isEmpty()
        ? [
            ERROR_MARKER + `${condition} rejected \`${value}\``,
            ...(!message
              ? []
              : message.split("\n").map((msgLine, msgLineIndex, msgLines) => {
                  const isLast = msgLines.length - 1 === msgLineIndex;

                  return isLast ? `  └─ ${msgLine}` : `  │  ${msgLine}`;
                })),
          ]
        : [
            ERROR_MARKER + condition,
            ...makeLines(branches).map((line, lineIndex, lines) => {
              const isError = isLineError(line);
              const hasNext = lines.some(
                (futureLine, futureLineIndex) =>
                  isLineError(futureLine) && futureLineIndex > lineIndex
              );

              if (isError && hasNext) return `  ├─ ${line}`;
              if (isError && !hasNext) return `  └─ ${line}`;
              if (hasNext) return `  │ ${line}`;
              return `    ${line}`;
            }),
          ]
    )
    .flatMap((lines) => lines);

/**
 * Converts a list of IOErrors into a human-readable string.
 */
export default (errors: IOErrors): string =>
  makeLines(errors).join("\n").replaceAll(ERROR_MARKER, "");
