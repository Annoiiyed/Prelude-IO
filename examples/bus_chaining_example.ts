import * as io from "@prelude-io/core";

// Creates a bus called isNumber(any) -> DoubledNumber
const DoubledNumberBus = io.number.chain(
  io.Bus.create<number, number>(
    "DoubledNumber",
    (n) => io.IOAccept(n * 2),
    (n) => io.IOAccept(n / 2)
  )
);

// Creates a bus called (isNumber(any) -> DoubledNumber) -> DoubledNumber
const QuadroupledNumberBus = DoubledNumberBus.chain(DoubledNumberBus);
