import { readFileSync } from "node:fs";
import { mergeConfig } from "vite";
import base from "./vite.config";
import { viteSingleFile } from "vite-plugin-singlefile";

// A separate, portable review artifact. Production keeps its normal split chunks.
export default mergeConfig(base, {
  plugins: [
    viteSingleFile(),
    {
      name: "inline-preview-icon",
      transformIndexHtml(html: string) {
        const icon = readFileSync(
          new URL("./public/favicon.svg", import.meta.url),
          "utf8",
        );
        return html.replace(
          "./favicon.svg",
          `data:image/svg+xml,${encodeURIComponent(icon)}`,
        );
      },
    },
  ],
  build: { outDir: "preview-dist" },
});
