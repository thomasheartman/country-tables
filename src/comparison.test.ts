// tests for comparison functions

import fc, { Arbitrary, compareFunc } from "fast-check";
import {
  compareAreas,
  compareCountryNames,
  comparePopulation,
} from "./comparison";
import { RawData } from "./dataTypes";

// names are mostly taken care of by the built-in sorter because they're the
// default column and guaranteed to be unique(?). However, we should make sure
// that the Åland Islands is sorted after Zimbabwe, instead of before "Algeria"
describe("compare non-ascii names", () => {
  it("sorts Åland after Zimbabwe", () =>
    expect(compareCountryNames("Åland", "Zimbabwe")).toBeGreaterThan(0));
});

const maybeArea = () => fc.oneof(fc.nat(), fc.constant(undefined));

const dataModel = (): Arbitrary<RawData> =>
  fc.record({
    name: fc.string(),
    region: fc.string(),
    population: fc.nat(),
    area: maybeArea(),
  });

// Comparing areas is more interesting. Two countries may have the same area. In
// that case, the sorting should fall back to comparing their names to determine
// the order. Furthermore, because not all entries _have_ area data, that should
// also be taken into account. If one entry has 0 and another has 'undefined',
// then 0 should be considered greater than undefined
describe("compare areas", () => {
  it("falls back to comparing names if the area is the same", () => {
    fc.assert(
      fc.property(dataModel(), dataModel(), maybeArea(), (a, b, area) => {
        a.area = area;
        b.area = area;
        return compareAreas(a, b) === compareCountryNames(a.name, b.name);
      })
    );
  });

  it("returns a positive number if area A is greater than area B and vice versa", () => {
    fc.assert(
      fc.property(dataModel(), dataModel(), (a, b) => {
        a.area = (b.area ?? 0) + 1;
        return compareAreas(a, b) > 0 && compareAreas(b, a) < 0;
      })
    );
  });

  it("considers undefined to be less than 0", () => {
    fc.assert(
      fc.property(dataModel(), dataModel(), (a, b) => {
        a.area = undefined;
        b.area = 0;
        return compareAreas(a, b) < 0 && compareAreas(b, a) > 0;
      })
    );
  });
});

// Like with areas, population comparisons should also fall back to using the
// country names if the population is the same.
describe("compare populations", () => {
  it("falls back to comparing names if the population is the same", () => {
    fc.assert(
      fc.property(dataModel(), dataModel(), fc.nat(), (a, b, population) => {
        a.population = population;
        b.population = population;
        return comparePopulation(a, b) === compareCountryNames(a.name, b.name);
      })
    );
  });

  it("returns a positive number if population A is greater than population B and vice versa", () => {
    fc.assert(
      fc.property(dataModel(), dataModel(), (a, b) => {
        a.population = b.population + 1;
        return comparePopulation(a, b) > 0 && comparePopulation(b, a) < 0;
      })
    );
  });
});
