import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [".next/**/*", "node_modules/**/*"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-unsafe-function-type": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-wrapper-object-types": "error",
      "@typescript-eslint/no-this-alias": "error",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-unused-expressions": "error"
    }
  }
];

export default eslintConfig;
