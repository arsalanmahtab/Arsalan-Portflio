import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const gsapImportMessage =
  'Import gsap, its plugins and useGSAP from "@/lib/gsap" so plugins are registered once.';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "gsap", message: gsapImportMessage },
            { name: "@gsap/react", message: gsapImportMessage },
          ],
          patterns: [{ group: ["gsap/*"], message: gsapImportMessage }],
        },
      ],
    },
  },
  {
    files: ["lib/gsap.ts"],
    rules: { "no-restricted-imports": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
