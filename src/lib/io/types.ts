import { Left, Right, Vector } from "prelude-ts";

/** An object containing metadata used to format errors */
export type IOError = {
  /** The condition (i.e, encoder or Predicate) that failed */
  condition: string;

  /** The value at time of failing. Should be the _specific_ type the condition was called with */
  value: unknown;

  /** Branches that caused the failure */
  branches?: IOErrors;
};

/** A vector of IOErrors */
export type IOErrors = Vector<IOError>;

/** Left-hand type for IOResult */
export type IOLeft = Left<IOErrors, unknown>;

/** Right-hand type for IOResult */
export type IORight<O> = Right<IOErrors, O>;

/** A shorthand return type for encoding functions */
export type IOResult<O> = IOLeft | IORight<O>;

/** A promisified return type for encoding functions */
export type IOPromise<O> = Promise<IOResult<O>>;

/** A (syncronous) decoding function, only used in initial declarations */
export type IODecode<I, O> = (input: I) => IOResult<O>;

/** A decoding function */
export type IOAsyncDecode<I, O> = (input: I) => IOPromise<O>;
