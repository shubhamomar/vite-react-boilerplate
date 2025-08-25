import { createFileRoute } from "@tanstack/react-router";
import CSVParserDashboard from "../pages/CSVParser/CSVParserDashboard";

export const Route = createFileRoute("/csv-parser")({
  component: CSVParserDashboard,
});