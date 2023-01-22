import Condition from "../Condition";
import number_ from "./number";

const isFinite = Condition.create("isFinite", Number.isFinite);
const isNaN = Condition.create("isNaN", Number.isNaN);

export default number_.if(isFinite.and(isNaN.not()), "isValidNumber");
