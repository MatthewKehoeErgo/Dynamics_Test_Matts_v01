import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { Route, Routes } from "react-router-dom";
import PrototypeShell from "./PrototypeShell.jsx";
import CommentsOverviewPage from "./review-mode/CommentsOverviewPage.jsx";
import "./review-mode/reviewMode.css";

function CommentsOverviewRoute() {
  return (
    <FluentProvider theme={webLightTheme}>
      <CommentsOverviewPage />
    </FluentProvider>
  );
}

export default function PrototypeRoutes() {
  return (
    <Routes>
      <Route path="/comments-overview" element={<CommentsOverviewRoute />} />
      <Route path="/*" element={<PrototypeShell />} />
    </Routes>
  );
}
