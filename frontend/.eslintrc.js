module.exports = {
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "react-hooks", "import", "unused-imports"],
  rules: {
    "react/prop-types": "off",
    "unused-imports/no-unused-imports": "error",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "object",
          "type",
          "index",
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
        alphabetize: { order: "asc", caseInsensitive: false },
        pathGroups: [
          {
            pattern: "@/components/App/**",
            group: "internal",
            position: "before",
          },
          {
            pattern: "@/components/Layout/**",
            group: "internal",
            position: "before",
          },
          {
            pattern: "@/components/pages/**",
            group: "internal",
            position: "before",
          },
          {
            pattern: "@/components/providers/**",
            group: "internal",
            position: "before",
          },
          {
            pattern: "@/components/model/**",
            group: "internal",
            position: "before",
          },
          {
            pattern: "@/components/utils/**",
            group: "internal",
            position: "before",
          },
          {
            pattern: "@/atoms/**",
            group: "internal",
            position: "before",
          },
          {
            pattern: "@/models/**",
            group: "internal",
            position: "before",
          },
          {
            pattern: "@/lib/**",
            group: "internal",
            position: "before",
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      settings: {
        "import/resolver": {
          typescript: {
            alwaysTryTypes: true,
            project: "./",
          },
        },
      },
      extends: ["plugin:@typescript-eslint/recommended"],
      plugins: ["@typescript-eslint"],
      parser: "@typescript-eslint/parser",
      rules: {},
    },
  ],
};
