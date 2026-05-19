import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import PrototypeRoutes from "./PrototypeRoutes.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <PrototypeRoutes />
    </HashRouter>
  </React.StrictMode>
);
