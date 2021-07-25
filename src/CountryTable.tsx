import React, { useMemo } from "react";
import { useTable, useSortBy } from "react-table";
import { ProcessedData, RawData } from "./dataTypes";
import { useCountryData } from "./fetchData";
import Fallback from "./FallbackNote";
import { compareAreas } from "./comparison";

// Show columns: Name, Region, Area, Population
// Format the area in square metric miles, without decimals (example, for Norway “125020”)
// Format the population in millions with one decimal (example, for Norway “5.2”)
// Input option for visualization: sort by one of name, population or area
// Summary at the end: Show the population average from all the countries, and also the countries with smallest and biggest area.

type ProcessedDataForSorting = RawData & {
  areaSqMi: string;
  populationMillions: string;
};

const RenderTable: React.FC<{ data: ProcessedDataForSorting[] }> = ({
  data,
}) => {
  const compAreas = useMemo(() => compareAreas, []);
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
        defaultCanSort: false,
      },
      {
        Header: "Area (sqmi)",
        accessor: (row: ProcessedDataForSorting) => row.areaSqMi ?? "N/A",
        defaultCanSort: true,
        sortType: compAreas,
      },
      {
        Header: "Population (in millions)",
        accessor: "population",
        defaultCanSort: true,
        sortType: "number",
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

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps(column.getSortByToggleProps)}>
                {column.render("Header")}
                <button>
                  {buttonText(
                    column.isSorted,
                    column.isSortedDesc,
                    column.Header.toLowerCase()
                  )}
                </button>
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

const CountryTableWithData = () => {
  const { countries, isLoading, error } = useCountryData();

  const roundToMillion = (n: number) => {
    let result = (n / 1000000).toFixed(1);

    return result === "0.0" ? "< 0.1" : result;
  };
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
    return <RenderTable data={data} />;
  }
};

export default CountryTableWithData;
