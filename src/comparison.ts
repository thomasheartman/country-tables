// this file contains various comparison functions used for sorting data.
import { CleanedData, RawData } from "./dataTypes";

export const compareCountryNames = (a: string, b: string) =>
  a.localeCompare(b, "no", { sensitivity: "accent" });

export const compareAreas = (a: RawData, b: RawData): number => {
  const diff = (a.area ?? -1) - (b.area ?? -1);
  return diff === 0 ? compareCountryNames(a.name, b.name) : diff;
};

export const comparePopulations = (a: RawData, b: RawData): number => {
  const diff = a.population - b.population;
  return diff === 0 ? compareCountryNames(a.name, b.name) : diff;
};
