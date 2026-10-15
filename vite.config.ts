import { defineConfig } from "vite";
import { report } from "./src/content/report";
const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
export default defineConfig({
  base: "./",
  build: { target: "es2022" },
  plugins: [
    {
      name: "report-metadata",
      transformIndexHtml(html) {
        return html.replaceAll("[ДРУГ]", escape(report.friendName));
      },
    },
  ],
});
