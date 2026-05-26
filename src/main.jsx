window.onerror = function (msg, src, line, col, err) {
  document.body.innerHTML = `
    <pre style="
      background:#000;
      color:#00ff88;
      min-height:100vh;
      padding:20px;
      white-space:pre-wrap;
      font-size:14px;
    ">
${msg}

${src}:${line}:${col}
    </pre>
  `;
};

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
