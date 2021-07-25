// This file contains column definitions for the language tables. This is useful
// for reusing the columns and for fetching only the data we need from the API.

// a simplified model of the data returned from the api
type CountryData = {
  name: string;
  languages: { name: string }[];
  population: number;
  area: number;
  region: string;
};

// the data columns necessary for the language table
const langColumns = ["language", "name", "population"] as const;
type LangColumn = typeof langColumns[number];

const countryDataColumns = ["name", "region", "area", "population"] as const;
type CountryDataColumn = typeof countryDataColumns[number];

const allColumns = () =>
  Array.from(new Set([...langColumns, ...countryDataColumns]));
type allColumns = LangColumn | CountryDataColumn;

const formatColumn = () => {};

export {};
