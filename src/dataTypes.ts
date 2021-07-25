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
