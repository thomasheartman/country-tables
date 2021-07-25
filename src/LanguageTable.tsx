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
        Header: "Pop.",
        accessor: (row: ProcessedData) =>
          `${roundToMillion(row.totalPopulation)}M`,
      },
    ],
    []
  );

  const tableInstance = useTable({
    columns,
    data,
  });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
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

const LanguageTableWithData = () => {
  const { countries, isLoading, error } = useCountryData();

  const data: ProcessedData[] = useMemo(() => {
    const langDict = (countries ?? []).reduce((acc, x: RawData) => {
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
