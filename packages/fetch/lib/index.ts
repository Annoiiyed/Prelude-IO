/**
 * A utility library for working with the Fetch API through the Prelude-IO's type-checking mechanisms.
 *
 * @module @Prelude-IO/Fetch
 */

import "isomorphic-fetch";
import * as io from "@prelude-io/core";
import { Either } from "prelude-ts";

/** A function that parses the raw response to something your Bus can handle (i.e, gets the body and parses it to JSON) */
export type ResponseHandler = (resp: Response) => Promise<io.IOResult>;

/**
 * A wrapped fetch function with the Options.body type replaced
 *
 * @param options.body The type of the request body
 */
export type WrappedFetch<ResultBody, RequestBody> = (
  input: RequestInfo | URL,
  options?: Omit<RequestInit, "body"> & { body?: RequestBody }
) => Promise<io.IOResult<ResultBody>>;

/**
 *
 * The default response handler for ioFetch. This parses the response body as JSON.
 *
 * @param resp The Response object from the Fetch API
 *
 * @returns An IOResult containing the parsed JSON, or a rejection
 */
export const jsonResponseHandler: ResponseHandler = (resp) =>
  resp
    .json()
    .then(io.IOAccept)
    .catch((err) =>
      io.IOReject({
        condition: "ioFetch",
        value: err,
        message: "ioFetch could not parse given JSON",
      })
    );

/**
 * An alternate response handler for ioFetch. This parses the response body as a string.
 *
 * @param resp The Response object from the Fetch API
 *
 * @returns An IOResult containing the response body as a string, or a rejection
 */
export const textResponseHandler: ResponseHandler = (resp) =>
  resp.text().then(io.IOAccept);

/**
 * A wrapper around the fetch API that uses Prelude-IO's type-checking mechanisms to ensure that the response and request bodies are valid.
 * Should mostly be compatible with the Fetch API, except Options.body's type is overwritten with the output type of
 * the bodyBus, and the return type is an IOResult.
 *
 * @example
 * ```typescript
 * [[include:io_fetch_example.ts]]
 * ```
 *
 * @param responseBus The Bus that will be used to parse the response
 * @param bodyBus The Bus that will be used to parse the request body. Optional.
 * @param responseHandler A function that parses the raw response to something your Bus can handle (i.e, gets the body and parses it to JSON). Optional, defaults to {@link jsonResponseHandler}.
 * @param <O> The output type of the responseBus
 * @param <I> The output type of the bodyBus
 * @param <B> The input type of the bodyBus, that will be used as the body of the request
 */
export function ioFetch<O, I, B extends BodyInit>(
  /* eslint-disable @typescript-eslint/no-explicit-any */
  responseBus: io.Bus<any, O>,
  bodyBus: io.Bus<B, I> | null = null,
  /* eslint-enable */
  responseHandler: ResponseHandler = jsonResponseHandler
): WrappedFetch<O, I> {
  return async (url, options = {}) => {
    const body: io.IOResult<B> = bodyBus
      ? bodyBus.serialize(options.body)
      : Either.right(null);

    if (body.isLeft()) {
      return body;
    }

    return fetch(url, {
      ...options,
      body: body.get(),
    })
      .then(responseHandler)
      .then((data) => {
        return data.isLeft() ? data : responseBus.deserialize(data.get());
      })
      .catch((err) =>
        io.IOReject({
          condition: "ioFetch",
          value: err,
          message: `ioFetch failed due to a network error`,
        })
      );
  };
}

/**
 * A utility type to infer the IOResult returned by a fetcher
 *
 * @param <Fetcher> The fetcher whose ResponseBody type you want.
 */
export type ResponseResult<Fetcher> = Fetcher extends WrappedFetch<
  infer ResponseBody,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>
  ? io.IOResult<ResponseBody>
  : never;
