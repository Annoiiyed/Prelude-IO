import Bus from "../Bus";
import { IOAccept } from "../utils";

const noop = <T>(input: T) => IOAccept(input);

/**
 * A bus that does nothing to the input. Useful for if you only
 * want to attach predicates to a bus.
 */
export default Bus.create("any", noop, noop);
