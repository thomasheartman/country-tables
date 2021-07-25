// * List countries in a table
//  * Show columns: Name, Region, Area, Population
//  * Format the area in square metric miles, without decimals (example, for Norway “125020”)
//  * Format the population in millions with one decimal (example, for Norway “5.2”)
//  * Input option for visualization: sort by one of name, population or area
//  * Summary at the end: Show the population average from all the countries, and also the countries with
//  smallest and biggest area.

// * List languages with the countries that speak it in a table
//   * Show columns: Language, Countries[], Population

export type RawData = {
  name: string;
  languages: { name: string }[];
  population: number;
  area?: number;
  region: string;
};

export type ProcessedData = {
  name: string;
  languages: { name: string }[];
  population: number;
  area: Maybe<number>;
  region: Maybe<string>;
};

export const processData = (raw: RawData): ProcessedData => ({
  ...raw,
  area: raw.area === undefined ? nothing() : just(raw.area),
  region: raw.region.trim().length === 0 ? nothing() : just(raw.region),
});

type Maybe<T> = { kind: "just"; value: T } | { kind: "nothing" };
export const or = <T>(maybe: Maybe<T>, fallback: T) => {
  switch (maybe.kind) {
    case "just":
      return maybe.value;
    case "nothing":
      return fallback;
  }
};
export const just = <T>(value: T): Maybe<T> => ({ kind: "just", value });
export const nothing = <T>(): Maybe<T> => ({ kind: "nothing" });
export const isJust = <T>(maybe: Maybe<T>) => maybe.kind === "just";
export const map = <T, U>(maybe: Maybe<T>, f: (x: T) => U): Maybe<U> => {
  switch (maybe.kind) {
    case "just":
      return just(f(maybe.value));
    case "nothing":
      return nothing();
  }
};

export type LanguageTableData = {
  language: string;
  countries: {
    name: string;
    population: number;
  };
};

export type CountryTableData = {
  name: string;
  population: number;
  area: number | undefined;
  region: string;
};
