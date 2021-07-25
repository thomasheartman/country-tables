import React, { useMemo } from "react";
import { useTable } from "react-table";
import { RawData } from "./dataTypes";
import { useCountryData } from "./fetchData";
import Fallback from "./FallbackNote";
import { roundToMillion } from "./format";

type LangData = {
  countries: { name: string; population: number }[];
  totalPopulation: number;
};

type ProcessedData = { language: string } & LangData;
type TableProps = { data: ProcessedData[] };

const RenderTable: React.FC<TableProps> = ({ data }) => {
  const columns = useMemo(
    () => [
      {
        Header: "Language",
        accessor: (row: ProcessedData) => row.language,
      },
      {
        Header: "Countries",
        accessor: (row: ProcessedData) => (
          <ul>
            {row.countries.map((c) => (
              <li key={c.name}>
                {c.name} ({roundToMillion(c.population)}M)
              </li>
            ))}
          </ul>
        ),
      },
      {
        Header: "Total population (in millions)",
        accessor: (row: ProcessedData) => roundToMillion(row.totalPopulation),
      },
    ],
    []
  );

  const tableInstance = useTable({
    columns,
    data,
    disableMultiSort: true,
    disableSortRemove: true,
    defaultCanSort: false,
    initialState: {
      //@ts-ignore!
      sortBy: [{ id: "Name" }],
    },
  });

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

  return (
    <table {...getTableProps()}>
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
                    <button>
                      {buttonText(
                        //@ts-ignore!
                        column.isSorted,
                        //@ts-ignore!
                        column.isSortedDesc,
                        //@ts-ignore!
                        column.Header.toLowerCase()
                      )}
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
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const LanguageTableWithData = () => {
  const { countries, isLoading, error } = useCountryData();

  const data: ProcessedData[] = useMemo(() => {
    const langDict = (countries ?? []).reduce((acc, x: RawData) => {
      if (x.name === "Norway") {
        console.log(x);
      }
      x.languages.forEach((lang) => {
        acc[lang.name] = {
          countries: [
            ...(acc[lang.name]?.countries ?? []),
            { name: x.name, population: x.population },
          ],
          totalPopulation:
            (acc[lang.name]?.totalPopulation ?? 0) + x.population,
        };
      });
      return acc;
    }, {} as Record<string, LangData>);

    const list = Object.entries(langDict).map(([k, v]) => ({
      ...v,
      language: k,
    }));
    list.sort((a, b) =>
      a.language.localeCompare(b.language, undefined, {
        ignorePunctuation: true,
      })
    );
    return list;
  }, [countries]);

  if (isLoading) {
    return <Fallback state={{ state: "loading" }} />;
  } else if (error && !countries) {
    return <Fallback state={{ state: "error", msg: error.toString() }} />;
  } else {
    return <RenderTable data={data} />;
  }
};

export default LanguageTableWithData;
