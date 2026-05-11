import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import StudentsGrid from "./StudentsGrid.jsx";

export default function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <StudentsGrid />
    </FluentProvider>
  );
}
