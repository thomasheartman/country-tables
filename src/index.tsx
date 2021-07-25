import React from "react";
import ReactDOM from "react-dom";
import "./styles.scss";
import LanguageTable from "./LanguageTable";
import CountryTable from "./CountryTable";

ReactDOM.render(
  <React.StrictMode>
    <CountryTable />
  </React.StrictMode>,
  document.getElementById("country-data")
);

ReactDOM.render(
  <React.StrictMode>
    <LanguageTable />
  </React.StrictMode>,
  document.getElementById("lang-table")
);
