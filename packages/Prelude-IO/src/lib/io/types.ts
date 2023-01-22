import { Left, Right, Vector } from "prelude-ts";

export type IOError = {
  condition: string;
  value: unknown;
  branches?: Vector<IOError>;
  message?: string;
};
export type IOErrors = Vector<IOError>;
export type IOLeft = Left<IOErrors, unknown>;
export type IORight<O> = Right<IOErrors, O>;
export type IOResult<O> = IOLeft | IORight<O>;
export type IOPromise<O> = Promise<IOResult<O>>;
export type IODecode<I, O> = (input: I) => IOResult<O>;
export type IOAsyncDecode<I, O> = (input: I) => IOPromise<O>;
export type IOConditionReturn = boolean;
export type IOCondition<I> = (
  input: I
) => Promise<IOConditionReturn> | IOConditionReturn;
