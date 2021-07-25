import "./styles.scss";
import React, { useMemo } from "react";
import { useTable, useSortBy } from "react-table";
import { RawData } from "./dataTypes";
import { useCountryData } from "./fetchData";
import Fallback from "./FallbackNote";
import { compareAreas, comparePopulations } from "./comparison";
import { roundToMillion } from "./format";

type ProcessedDataForSorting = RawData & {
  areaSqMi: string | undefined;
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
      return { smallest: null, largest: null };
    }

    const [first, ...rest] = countriesWithAreas;

    return rest.reduce(
      (acc, c) => {
        // the ts compiler fails to narrow these properly. based on the
        // filtering above, we know they're not undefined.
        if (acc.smallest.area! > c.area!) acc.smallest = c;
        if (acc.largest.area! < c.area!) acc.largest = c;
        return acc;
      },
      { smallest: first, largest: first }
    );
  }, [countriesWithAreas]);

  const formatCountry = (country: ProcessedDataForSorting) =>
    `${country.name} (${country.areaSqMi} square miles / ${country.area} square kilometers)`;

  return (
    <section id="data-summary">
      <h3>Summary</h3>
      <p>
        The average population is {roundToMillion(populationAverage)} million.
        {smallest &&
          largest &&
          `The largest country is ${formatCountry(largest)}
        and the smallest country is ${formatCountry(smallest)}.`}
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
        accessor: (row: ProcessedDataForSorting) => row.name,
        defaultCanSort: true,
      },
      {
        Header: "Region",
        accessor: (row: ProcessedDataForSorting) => row.region || "N/A",
        disableSortBy: true,
      },
      {
        Header: "Area",
        accessor: (row: ProcessedDataForSorting) => row.areaSqMi ?? "N/A",
        defaultCanSort: true,
        sortType: compAreas,
      },
      {
        Header: "Pop.",
        accessor: (row: ProcessedDataForSorting) => row.populationMillions,
        defaultCanSort: true,
        sortType: compPopulations,
      },
    ],
    [compAreas, compPopulations]
  );

  const tableInstance = useTable(
    {
      columns,
      data,
      disableMultiSort: true,
      disableSortRemove: true,
      defaultCanSort: false,
      initialState: {
        //@ts-ignore!
        sortBy: [{ id: "Name" }],
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

  const getAriaSortValue = (isSorted: boolean, isSortedDesc: boolean) => {
    if (!isSorted) {
      return undefined;
    } else {
      return isSortedDesc ? "descending" : "ascending";
    }
  };

  const getSortingIcon = (isSorted: boolean, isSortedDesc: boolean) => {
    return !isSorted ? "🔃" : isSortedDesc ? "🔽" : "🔼";
  };

  return (
    <table id="country-table" {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              // tsc complains about missing properties on the headergroup
              //type. It doesn't seem to recognize the props properly when
              //also using sorting, so we ignore them below.
              <th
                //@ts-ignore!
                {...column.getHeaderProps(column.getSortByToggleProps)}
                aria-sort={getAriaSortValue(
                  //@ts-ignore!
                  column.isSorted,
                  //@ts-ignore!
                  column.isSortedDesc
                )}
              >
                {column.render("Header")}
                {
                  //@ts-ignore!
                  column.canSort && (
                    <button className="sort-button">
                      <span className="screen-reader">
                        {buttonText(
                          //@ts-ignore!
                          column.isSorted,
                          //@ts-ignore!
                          column.isSortedDesc,
                          //@ts-ignore!
                          column.Header.toLowerCase()
                        )}
                      </span>
                      {
                        //@ts-ignore!
                        getSortingIcon(column.isSorted, column.isSortedDesc)
                      }
                    </button>
                  )
                }
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
                return (
                  <td {...cell.getCellProps()} data-label={cell.column.id}>
                    {cell.render("Cell")}
                  </td>
                );
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

  const data: ProcessedDataForSorting[] = useMemo(
    () =>
      (countries ?? []).map((x: RawData) => ({
        ...x,
        populationMillions: `${roundToMillion(x.population)}M`,
        areaSqMi: (x.area && squareKmToSquareMi(x.area)) || undefined,
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
