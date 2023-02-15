import { describe } from "mocha";
import assert from "assert";
import catFacts from "./catFacts.json";
import { textResponseHandler, ioFetch } from "../lib";
import * as io from "../../core/lib";
import fetchMock from "fetch-mock";
import { Either } from "prelude-ts";

const URL = "https://catfacts.example.com";

const CatFact = io.Complex("CatFact", {
  fact: io.string,
  length: io.positiveNumber,
});

const CatFactsResponse = io.Complex("CatFactsResponse", {
  factCount: io.positiveNumber,
  facts: io.Vector(CatFact),
});

const CatFactRequest = io.JSON.chain(
  io.Complex("CatFactRequest", {
    facts: io.number,
  })
);

describe("ioFetch()", () => {
  afterEach(() => {
    fetchMock.reset();
  });

  it("Correctly parses an expected API response for an expected API request with the default processor", async () => {
    fetchMock.once(URL, catFacts);
    const fetcher = ioFetch(CatFactsResponse, CatFactRequest);

    const result = await fetcher(URL, { body: { facts: 4 } });

    assert.deepEqual(result, CatFactsResponse.deserialize(catFacts));
  });

  it("Works without a body processor", async () => {
    fetchMock.once(URL, catFacts);
    const fetcher = ioFetch(CatFactsResponse);

    const result = await fetcher(URL);

    assert.deepEqual(result, CatFactsResponse.deserialize(catFacts));
  });

  it("Returns IORight for malformed JSON with the default processor", async () => {
    fetchMock.once(URL, "{blaab: bloob}");
    const fetcher = ioFetch(CatFactsResponse);

    const result = await fetcher(URL);

    assert.ok(result.isLeft());
    assert.equal(
      result.getLeft().head().getOrNull()?.message,
      "ioFetch could not parse given JSON"
    );
  });

  it("Returns IORight mismatched body field type", async () => {
    fetchMock.once(URL, catFacts);

    const fetcher = ioFetch(CatFactsResponse, CatFactRequest);

    // @ts-expect-error - Testing invalid input
    const result = await fetcher(URL, { body: { facts: "four" } });

    assert.ok(result.isLeft());
    assert.equal(
      result.getLeft().head().getOrNull()?.condition,
      "JSON -> CatFactRequest"
    );
  });

  it("Handles network errors", async () => {
    fetchMock.once(URL, () => Promise.reject(new Error("Network error")));
    const fetcher = ioFetch(CatFactsResponse);

    const result = await fetcher(URL);
    console.log(result);

    assert.ok(result.isLeft());
    assert.equal(
      result.getLeft().head().getOrNull()?.message,
      "ioFetch failed due to a network error"
    );
  });

  it("works with textResponseHandler", async () => {
    fetchMock.once(URL, "Hello world");

    const fetcher = ioFetch(io.string, null, textResponseHandler);

    const result = await fetcher(URL);

    assert.deepEqual(result, Either.right("Hello world"));
  });
});
