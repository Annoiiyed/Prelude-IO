import { Left, Right, Vector } from "prelude-ts";

export type IOError = {
  message: string;
};
export type IOErrors = Vector<IOError>;
export type IOLeft = Left<IOErrors, unknown>;
export type IORight<O> = Right<IOErrors, O>;
export type IOResult<O> = IOLeft | IORight<O>;
export type IOPromise<O> = Promise<IOResult<O>>;
export type IODecode<I, O> = (input: I) => IOResult<O>;
export type IOAsyncDecode<I, O> = (input: I) => IOPromise<O>;
