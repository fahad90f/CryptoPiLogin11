import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";
import { Web3Provider } from "@/context/Web3Provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Web3Provider>
      <ThemeProvider attribute="class">
        <App />
      </ThemeProvider>
    </Web3Provider>
  </QueryClientProvider>
);
