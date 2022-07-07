module.exports = {
  extends: [
    "airbnb-typescript/base",
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:jest/recommended",
    "plugin:prettier/recommended",
  ],
  plugins: [
    "@typescript-eslint",
    "prettier",
    "jest",
    "import"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  env: {
    browser: true,
    node: true,
    jest: true,
  },

  rules: {
    // TODO: error by "airbnb" https://github.com/typescript-eslint/typescript-eslint/issues/2077
    // "@typescript-eslint/camelcase": "off",
    // "@typescript-eslint/naming-convention": ["error",{selector: 'default',format:["camelCase", "PascalCase"]}],

    // ! The normal rule contains a "typescript error" https://stackoverflow.com/questions/57802057/eslint-configuring-no-unused-vars-for-typescript
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],

    // ! The normal rule contains a "typescript error" https://stackoverflow.com/questions/63961803/eslint-says-all-enums-in-typescript-app-are-already-declared-in-the-upper-scope
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],

    // * OreId rules

    "@typescript-eslint/no-var-requires": "off",

    "import/prefer-default-export": 0,
    "prefer-destructuring": 1,
    "no-await-in-loop": 0,
    "consistent-return": 1,

    semi: "off",

    // ! Fix: disabling "semi" rule for typescripts files
    "@typescript-eslint/semi": "off",

    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": 0,
    "class-methods-use-this": 0,
    "generator-star-spacing": 0,
    "object-curly-newline": "off",
    "operator-linebreak": 0,
    "no-lonely-if": 0,
    "implicit-arrow-linebreak": "off",
    "no-extra-semi": "off",
    "prettier/prettier": "error",
    "import/no-mutable-exports": 0,
    "import/no-cycle": 0,
    "import/no-extraneous-dependencies": 0,
    "no-unused-vars": 0,
    "no-undef": 0,
    "no-param-reassign": 0,
    "no-underscore-dangle": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/no-extra-semi": 0,
    "lines-between-class-members": 0,
    "jest/no-export": 0,
    "jsx-a11y/label-has-associated-control": 0,
    "jsx-a11y/click-events-have-key-events": 0,
    "jsx-a11y/no-static-element-interactions": 0,
    "jsx-a11y/label-has-for": 0,
    "jsx-a11y/alt-text": 0,
    "jsx-a11y/no-noninteractive-element-interactions": 0,
    "jsx-a11y/anchor-is-valid": 0,
    "sx-a11y/alt-text": 0,
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
    // The rules below were disabled to prevent conflicts with Prettier
    // ... to see conflicts, run ->  npx eslint --print-config path/to/main.js | npx eslint-config-prettier-check
    // "indent": "off", // apply indent settings to @typescript-eslint/indent - it overrides this eslint base rule
    // "@typescript-eslint/indent": ["error", 2, { "SwitchCase": 1 }],
    // "arrow-parens": 0,
    // "arrow-parens": ["error", "as-needed"],
    // "@typescript-eslint/semi": [2, "never"],
    // "max-len": [
    //   2,
    //   {
    //     "code": 600
    //   }
    // ],
    // "quotes": [
    //   "error",
    //   "single",
    //   { "avoidEscape": true }
    // ],
    // "nonblock-statement-body-position": ["error", "beside"],
    // "brace-style": [2, "1tbs", { "allowSingleLine": true }],
    // "no-multi-spaces": "error",
    // "jsx-quotes": [
    //   "error",
    //   "prefer-double"
    // ],
    // "comma-dangle": ["error", "always-multiline"],
    // Rules below were disabled to prevent conflict with prettier
  },
  globals: {
    JSX: true,
    Web3: false,
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        paths: ["web"],
        moduleDirectory: ["web", "node_modules", "src/"],
      },
    },
  },
  ignorePatterns: [
    "**/*.stories.tsx",
    "**/*.txt",
    "**/*.xml",
    "**/*.md",
    "**/*.svg",
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
    "**/*.gif",
    "**/*.ico",
    "**/*.woff",
    "**/*.woff2",
    "**/*.ttf",
    "**/*.eot",
    "**/*.otf",
    "**/*.pdf",
    // TODO: We should put the rules in the json, when we resolve the conflict with the prittier
    "**/*.scss",
    "**/*.json",
  ],
};
