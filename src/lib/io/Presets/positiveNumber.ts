import Condition from "../Condition";
import validNumber from "./validNumber";

const isPositive = Condition.create("isPositive", (n: number) => n > 0);

export default validNumber.if(isPositive, "positiveNumber");
