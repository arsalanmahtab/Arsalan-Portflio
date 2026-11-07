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
  {
    // The 3D scenes change three.js objects (meshes, materials, camera, canvas
    // textures) in place every frame inside useFrame, which is how React Three
    // Fiber is meant to be used. The React Compiler's immutability rule can't
    // tell those objects apart from React state, so it is off for these files only.
    files: ["components/characters/*3D.tsx", "components/characters/Robot.tsx"],
    rules: { "react-hooks/immutability": "off" },
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
