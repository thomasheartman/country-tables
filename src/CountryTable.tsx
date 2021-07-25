import React, { useMemo } from "react";
import { useTable, useSortBy } from "react-table";
import { ProcessedData, RawData } from "./dataTypes";
import { useCountryData } from "./fetchData";
import Fallback from "./FallbackNote";
import { compareAreas, comparePopulations } from "./comparison";

// Show columns: Name, Region, Area, Population
// Format the area in square metric miles, without decimals (example, for Norway “125020”)
// Format the population in millions with one decimal (example, for Norway “5.2”)
// Input option for visualization: sort by one of name, population or area
// Summary at the end: Show the population average from all the countries, and also the countries with smallest and biggest area.

type ProcessedDataForSorting = RawData & {
  areaSqMi: string;
  populationMillions: string;
};

type Row = { original: ProcessedDataForSorting };

type TableProps = {
  data: ProcessedDataForSorting[];
};

const DisplayData: React.FC<TableProps> = ({ data }) => {
  return (
    <>
      <RenderTable data={data} />
      <DataSummary data={data} />
    </>
  );
};

const DataSummary: React.FC<TableProps> = ({ data }) => {
  const populationAverage = useMemo(
    () =>
      data.length
        ? data.reduce((total, c) => total + c.population, 0) / data.length
        : 0,
    [data]
  );

  // ignoring countries without reported area
  const countriesWithAreas = useMemo(
    () => data.filter((x) => x.area !== undefined),
    [data]
  );

  const { smallest, largest } = useMemo(() => {
    if (!countriesWithAreas.length) {
      return [null, null];
    }

    const [first, ...rest] = countriesWithAreas;

    return countriesWithAreas.reduce(
      (acc, c) => {
        if (acc.smallest.area > c.area) acc.smallest = c;
        if (acc.largest.area < c.area) acc.largest = c;
        return acc;
      },
      { smallest: first, largest: first }
    );
  });

  const formatCountry = (country: ProcessedDataForSorting) =>
    `${country.name} (${country.areaSqMi} square miles / ${country.area} square kilometers)`;

  return (
    <section>
      <h3>Summary</h3>
      <p>
        The average population is {roundToMillion(populationAverage)} million.
        The largest country is {formatCountry(largest)}
        and the smallest country is {formatCountry(smallest)}.
      </p>
    </section>
  );
};

const RenderTable: React.FC<TableProps> = ({ data }) => {
  const compAreas = useMemo(
    () => (a: Row, b: Row) => compareAreas(a.original, b.original),
    []
  );
  const compPopulations = useMemo(
    () => (a: Row, b: Row) => comparePopulations(a.original, b.original),
    []
  );
  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
        defaultCanSort: true,
      },
      {
        Header: "Region",
        accessor: (row: ProcessedDataForSorting) => row.region || "N/A",
        disableSortBy: true,
      },
      {
        Header: "Area (sqmi)",
        accessor: (row: ProcessedDataForSorting) => row.areaSqMi ?? "N/A",
        defaultCanSort: true,
        sortType: compAreas,
      },
      {
        Header: "Population (in millions)",
        accessor: (row: ProcessedDataForSorting) => row.populationMillions,
        defaultCanSort: true,
        sortType: compPopulations,
      },
    ],
    []
  );

  const tableInstance = useTable(
    {
      columns,
      data,
      disableMultiSort: true,
      disableSortRemove: true,
      defaultCanSort: false,
      initialState: {
        sortBy: [{ id: "name" }],
      },
    },
    useSortBy
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const buttonText = (
    isSorted: boolean,
    isSortedDesc: boolean,
    columnName: string
  ) => {
    const nextDirection = isSorted ? (isSortedDesc ? "asc" : "desc") : "asc";
    return `Sort by ${columnName} ${nextDirection}`;
  };

  const getAriaSortValue = (isSorted, isSortedDesc) => {
    if (!isSorted) {
      return undefined;
    } else {
      return isSortedDesc ? "descending" : "ascending";
    }
  };

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th
                {...column.getHeaderProps(column.getSortByToggleProps)}
                aria-sort={getAriaSortValue(
                  column.isSorted,
                  column.isSortedDesc
                )}
              >
                {column.render("Header")}
                {column.canSort && (
                  <button>
                    {buttonText(
                      column.isSorted,
                      column.isSortedDesc,
                      column.Header.toLowerCase()
                    )}
                  </button>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const squareKmToSquareMi = (n: number) => (n * 0.386102159).toFixed();
const roundToMillion = (n: number) => {
  let result = (n / 1000000).toFixed(1);

  return result === "0.0" ? "<0.1" : result;
};

const CountryTableWithData = () => {
  const { countries, isLoading, error } = useCountryData();

  const data: ProcessedDataForSorting = useMemo(
    () =>
      (countries ?? []).map((x) => ({
        ...x,
        populationMillions: roundToMillion(x.population),
        areaSqMi: x.area && squareKmToSquareMi(x.area),
      })),
    [countries]
  );

  if (isLoading) {
    return <Fallback state={{ state: "loading" }} />;
  } else if (error && !countries) {
    return <Fallback state={{ state: "error", msg: error.toString() }} />;
  } else {
    return <DisplayData data={data} />;
  }
};

export default CountryTableWithData;
