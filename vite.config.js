import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // shadcn-style imports: "@/components/ui/button" -> src/components/ui/button
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // The live site lives at carlosz98.github.io/voice-of-the-desert/, and pages
  // like /noticias/<story> need absolute asset paths. `npm run build:preview`
  // builds with relative paths (and hash links) for the Claude preview.
  base: "/voice-of-the-desert/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
