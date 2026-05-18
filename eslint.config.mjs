import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react-hooks/error-boundaries": "off",
      "react-hooks/globals": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-render": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/use-memo": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "public/**",
    "scripts/**",
  ]),
]);
