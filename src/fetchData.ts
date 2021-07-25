// this file contains a hook for using country data
import useSWR from "swr";
import { processData, RawData } from "./dataTypes";

const fields = ["name", "languages", "population", "area", "region"] as const;

const endpoint = `https://restcountries.eu/rest/v2/all?fields=${fields.join(
  ";"
)}`;

export const useCountryData = () => {
  const fetcher = (url: string) =>
    fetch(url)
      .then(async (res) =>
        res.ok
          ? ((await res.json()) as RawData[])
          : Promise.reject("API request failed.")
      )
      // .then((countries) => countries.map(processData))
      .then((countries) =>
        countries.sort((a, b) =>
          // the only entry to start with a non-ascii character is the Åland
          // islands. To avvoid it getting sorted in with the Afghanistan,
          // Albania, et al., we'll use a nordic locale for comparisons.
          // Additionally, ignore case differences.
          //
          // More info:
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator
          a.name.localeCompare(b.name, "no", {
            sensitivity: "accent",
          })
        )
      );

  const { data, error } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    onSuccess: (data, key, config) => {
      console.log("onSuccess", data, key, config);
    },
    onError: (err, key, config) => {
      console.log("onerror", err, key, config);
    },
  });

  return {
    countries: data,
    isLoading: !error && !data,
    error: error,
  };
};
