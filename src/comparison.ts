// this file contains various comparison functions used for sorting data.
import { RawData } from "./api";

export const compareCountryNames = (a: string, b: string) =>
  // the only entry to start with a non-ascii character is the Åland islands. To
  // avoid it getting sorted in with Afghanistan, Albania, et al., we'll use a
  // nordic locale for comparisons. Additionally, ignore case differences.
  //
  // More info:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator
  a.localeCompare(b, "no", { sensitivity: "accent" });

export const compareAreas = (a: RawData, b: RawData): number => {
  const diff = (a.area ?? -1) - (b.area ?? -1);
  return diff === 0 ? compareCountryNames(a.name, b.name) : diff;
};

export const comparePopulations = (a: RawData, b: RawData): number => {
  const diff = a.population - b.population;
  return diff === 0 ? compareCountryNames(a.name, b.name) : diff;
};
