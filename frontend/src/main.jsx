import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppRouter from "./AppRouter";
import ErrorBoundary from "./components/ui/ErrorBoundary";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Elemento root não encontrado");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(
    ErrorBoundary,
    null,
    React.createElement(AppRouter, null)
  )
);
