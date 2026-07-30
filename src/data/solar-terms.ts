import { createSolarTermLookup } from "../core/solar-terms.ts";
import { SOLAR_TERMS } from "./solar-terms.generated.ts";

export { SOLAR_TERMS };
export const SOLAR_TERM_LOOKUP = createSolarTermLookup(SOLAR_TERMS);
