const result = CatParserBus.deserialize(data);

if (result.isLeft()) {
  console.error(result.getLeftOrThrow());
  /*
  Litter
    ├─ birthplace
    │   └─ isString(any)
    │       └─ isString rejected `false\
    └─ kittens
        └─ Vector(Cat)
            └─ [2]
                └─ Cat
                    ├─ isAdopted
                    │   └─ isBoolean(any)
                    │       └─ isBoolean rejected `not yet`
                    └─ age
                        └─ isPositive(isValidNumber(isNumber(any)))
                            └─ isPositive rejected `-1`
  */
}
