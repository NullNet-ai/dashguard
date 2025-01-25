# ESLint Configuration Documentation

## Core Settings
- **Parser**: [`@typescript-eslint/parser`](https://typescript-eslint.io/packages/parser)
- **Parser Options**: Project-aware parsing enabled

## Plugins
- **[@typescript-eslint](https://typescript-eslint.io/)**: TypeScript-specific linting rules
- **[@stylistic](https://eslint.style/)**: Code style and formatting rules
- **[react](https://github.com/jsx-eslint/eslint-plugin-react)**: React-specific linting rules
- **[jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)**: Accessibility rules for JSX
- **[import](https://github.com/import-js/eslint-plugin-import)**: ES6+ import/export syntax rules

## Extended Configurations
1. [`next/core-web-vitals`](https://nextjs.org/docs/app/building-your-application/configuring/eslint#core-web-vitals)
2. [`@typescript-eslint/recommended-type-checked`](https://typescript-eslint.io/linting/configs#recommended-type-checked)
3. [`@typescript-eslint/stylistic-type-checked`](https://typescript-eslint.io/linting/configs#stylistic-type-checked)
4. [`@stylistic/recommended-extends`](https://eslint.style/packages/default#recommended-extends)
5. [`@stylistic/disable-legacy`](https://eslint.style/packages/default#disable-legacy)
6. [`jsx-a11y/recommended`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y#recommended-configuration)
7. [`import/errors`](https://github.com/import-js/eslint-plugin-import#rules)
8. [`import/warnings`](https://github.com/import-js/eslint-plugin-import#rules)
9. [`react/recommended`](https://github.com/jsx-eslint/eslint-plugin-react#recommended)
10. [`eslint:recommended`](https://eslint.org/docs/latest/rules/)
11. [`prettier`](https://github.com/prettier/eslint-config-prettier)

## Rules Configuration

### Stylistic Rules
- [`@stylistic/array-bracket-newline`](https://eslint.style/rules/default/array-bracket-newline): Consistent array bracket newlines
- [`@stylistic/arrow-spacing`](https://eslint.style/rules/default/arrow-spacing): Spacing around arrow function arrows
- [`@stylistic/curly-newline`](https://eslint.style/rules/default/curly-newline): Newlines in curly braces
- [`@stylistic/function-call-argument-newline`](https://eslint.style/rules/default/function-call-argument-newline): Function call argument newlines
- [`@stylistic/function-call-spacing`](https://eslint.style/rules/default/function-call-spacing): Function call spacing
- [`@stylistic/implicit-arrow-linebreak`](https://eslint.style/rules/default/implicit-arrow-linebreak): Arrow function linebreaks
- [`@stylistic/line-comment-position`](https://eslint.style/rules/default/line-comment-position): Line comment positioning
- [`@stylistic/max-len`](https://eslint.style/rules/default/max-len): Maximum line length
- [`@stylistic/newline-per-chained-call`](https://eslint.style/rules/default/newline-per-chained-call): Newlines in method chains
- [`@stylistic/no-extra-semi`](https://eslint.style/rules/default/no-extra-semi): No extra semicolons
- [`@stylistic/nonblock-statement-body-position`](https://eslint.style/rules/default/nonblock-statement-body-position): Non-block statement positioning
- [`@stylistic/rest-spread-spacing`](https://eslint.style/rules/default/rest-spread-spacing): Rest/spread operator spacing
- [`@stylistic/semi`](https://eslint.style/rules/default/semi): Semicolon usage
- [`@stylistic/switch-colon-spacing`](https://eslint.style/rules/default/switch-colon-spacing): Switch case colon spacing
- [`@stylistic/template-curly-spacing`](https://eslint.style/rules/default/template-curly-spacing): Template literal curly spacing

### TypeScript Rules
- [`@typescript-eslint/consistent-type-definitions`](https://typescript-eslint.io/rules/consistent-type-definitions): Type definition style
- [`@typescript-eslint/consistent-type-imports`](https://typescript-eslint.io/rules/consistent-type-imports): Type import style
- [`@typescript-eslint/no-floating-promises`](https://typescript-eslint.io/rules/no-floating-promises): Unhandled promises
- [`@typescript-eslint/no-misused-promises`](https://typescript-eslint.io/rules/no-misused-promises): Promise misuse
- [`@typescript-eslint/no-unsafe-assignment`](https://typescript-eslint.io/rules/no-unsafe-assignment): Unsafe assignments
- [`@typescript-eslint/no-unsafe-call`](https://typescript-eslint.io/rules/no-unsafe-call): Unsafe function calls
- [`@typescript-eslint/no-unsafe-return`](https://typescript-eslint.io/rules/no-unsafe-return): Unsafe returns
- [`@typescript-eslint/prefer-optional-chain`](https://typescript-eslint.io/rules/prefer-optional-chain): Optional chaining

### Import Rules
- [`import/order`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md): Import order
- [`no-duplicate-imports`](https://eslint.org/docs/latest/rules/no-duplicate-imports): No duplicate imports

### React Rules
- [`react/boolean-prop-naming`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/boolean-prop-naming.md): Boolean prop naming
- [`react/destructuring-assignment`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/destructuring-assignment.md): Destructuring assignments
- [`react/hook-use-state`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/hook-use-state.md): useState hook usage
- [`react/jsx-boolean-value`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-boolean-value.md): Boolean attributes
- [`react/jsx-closing-bracket-location`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-closing-bracket-location.md): Closing bracket location
- [`react/jsx-curly-brace-presence`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-curly-brace-presence.md): JSX curly braces
- [`react/jsx-fragments`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-fragments.md): React fragments
- [`react/jsx-handler-names`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-handler-names.md): Event handler naming
- [`react/jsx-no-constructed-context-values`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-constructed-context-values.md): Context value construction
- [`react/jsx-sort-props`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-sort-props.md): Props sorting
- [`react/no-array-index-key`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-array-index-key.md): Array index keys
- [`react/no-unstable-nested-components`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unstable-nested-components.md): Nested components

## Scripts
- **pnpm lint:normal**: Runs ESLint with normal configuration where most rules are set to warn level and some critical rules to error level
- **pnpm lint:strict**: Runs ESLint with strict configuration where all rules are set to error level for maximum code quality enforcement

## Files
- **.eslintrc.cjs**: The main ESLint configuration file that your IDE respects for real-time linting
- **.eslintrc-default.cjs**: Initial ESLint configuration with basic rules and settings
- **.eslintrc-normal.cjs**: Normal mode configuration with balanced warn/error levels
- **.eslintrc-strict.cjs**: Strict mode configuration with all rules set to error level

## Settings
- **editor.codeActionsOnSave**: IDE setting to enable/disable automatic code formatting when saving files