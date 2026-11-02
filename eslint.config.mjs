// División de responsabilidades:
//   Biome  → formato, indentación, imports ordenados, reglas de código limpio y a11y.
//   ESLint → solo lo que Biome no cubre: reglas de Next/React (hooks, core-web-vitals),
//            TypeScript (unused vars, any) y límites de arquitectura entre capas.
// ESLint NO define reglas de formato: nunca agregar reglas stylistic/prettier aquí.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const featureDeepImport = {
  // Solo se permite la API pública del feature: @/features/x y @/features/x/server
  group: ["@/features/*/*", "!@/features/*/server"],
  message: "Importa solo la API pública del feature (@/features/x o @/features/x/server).",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".agents/**", ".claude/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]),

  // Reglas de dependencia: app → features → shared (nunca al revés)
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/app/*"],
              message: "shared/ no puede depender de features/ ni de app/.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/app/*"], message: "features/ no puede depender de app/." },
            featureDeepImport,
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [featureDeepImport] }],
    },
  },
]);

export default eslintConfig;
