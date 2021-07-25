import React from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
