import { IOErrors } from "../types";

const isLineError = (line: string): boolean =>
  !["├", "│", "└"].includes(line.trim().charAt(0));

const makeLines = (errors: IOErrors): string[] =>
  errors
    .toArray()
    .map(({ value, condition, branches }) =>
      branches === undefined || branches.isEmpty()
        ? [`${condition} rejected the value \`${value}\``]
        : [
            condition,
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
export default (errors: IOErrors): string => makeLines(errors).join("\n");
