// this file contains a hook for using country data
import useSWR from "swr";
import { compareCountryNames } from "./comparison";
import { RawData } from "./dataTypes";

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
      .then((countries) =>
        countries.sort((a, b) => compareCountryNames(a.name, b.name))
      );

  const getFromCache = (): RawData[] => {
    const cached = window.localStorage.getItem(endpoint);
    return cached ? JSON.parse(cached) : [];
  };

  const { data, error } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
    initialData: getFromCache(),
    onSuccess: (data, key) => {
      console.log("storing in key", key);
      window.localStorage.setItem(key, JSON.stringify(data));
    },
  });

  return {
    countries: data,
    isLoading: !error && !data,
    error: error,
  };
};
