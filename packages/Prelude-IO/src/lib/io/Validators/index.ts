export type Validator = (input: unknown) => boolean;
export type ValidatorFactory = (...args: ValidatorFactoryArgs) => Validator;
export type ValidatorFactoryArgs = unknown[];

export { default as isNumber } from "./isNumber";
