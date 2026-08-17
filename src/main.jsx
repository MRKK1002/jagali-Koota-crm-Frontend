import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { TableProvider } from "./contexts/TableContext.jsx";
import { installNumberInputWheelGuard } from "./lib/numberInputGuard.js";

// Keeps a stray scroll from rewriting prices and quantities.
installNumberInputWheelGuard();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TableProvider>
      <App />
    </TableProvider>
  </StrictMode>
);
