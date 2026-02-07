import ReactDOM from "react-dom/client";
import "./index.css";
import AppRouter from "./AppRouter";
import ErrorBoundary from "./components/ui/ErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <ErrorBoundary>
    <AppRouter />
  </ErrorBoundary>
);
