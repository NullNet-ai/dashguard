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

## Default Recommended Rules
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

## Additional Rules

### Stylistic
- [`@stylistic/array-bracket-newline`](https://eslint.style/rules/default/array-bracket-newline): Consistent array bracket newlines
  - Value: `["error", { "multiline": true }]`
  - ❌ Incorrect:
    ```javascript
    const arr = [1,
      2, 3];
    ```
  - ✅ Correct:
    ```javascript
    const arr = [
      1,
      2,
      3
    ];
    ```

- [`@stylistic/arrow-spacing`](https://eslint.style/rules/default/arrow-spacing): Spacing around arrow function arrows
  - Value: `["error", { "before": true, "after": true }]`
  - ❌ Incorrect:
    ```javascript
    const fn =()=>42;
    ```
  - ✅ Correct:
    ```javascript
    const fn = () => 42;
    ```

- [`@stylistic/curly-newline`](https://eslint.style/rules/default/curly-newline): Newlines in curly braces
  - Value: `["error", { "multiline": true }]`
  - ❌ Incorrect:
    ```javascript
    const obj = { foo: 1,
      bar: 2 };
    ```
  - ✅ Correct:
    ```javascript
    const obj = {
      foo: 1,
      bar: 2
    };
    ```

- [`@stylistic/function-call-spacing`](https://eslint.style/rules/default/function-call-spacing): Function call spacing
  - Value: `["error", "never"]`
  - ❌ Incorrect:
    ```javascript
    fn (x);
    ```
  - ✅ Correct:
    ```javascript
    fn(x);
    ```

- [`@stylistic/implicit-arrow-linebreak`](https://eslint.style/rules/default/implicit-arrow-linebreak): Arrow function linebreaks
  - Value: `["error", "beside"]`
  - ❌ Incorrect:
    ```javascript
    const fn = () =>
      42;
    ```
  - ✅ Correct:
    ```javascript
    const fn = () => 42;
    ```

- [`@stylistic/max-len`](https://eslint.style/rules/default/max-len): Maximum line length
  - Value: `["error", { "code": 100 }]`
  - ❌ Incorrect:
    ```javascript
    const veryLongVariableName = "This is a very long string that exceeds the maximum line length limit of 100 characters";
    ```
  - ✅ Correct:
    ```javascript
    const veryLongVariableName = 
      "This is a very long string that has been properly" +
      "split across multiple lines";
    ```

- [`@stylistic/no-extra-semi`](https://eslint.style/rules/default/no-extra-semi): No extra semicolons
  - Value: `"error"`
  - ❌ Incorrect:
    ```javascript
    const x = 5;;
    ```
  - ✅ Correct:
    ```javascript
    const x = 5;
    ```

- [`@stylistic/semi`](https://eslint.style/rules/default/semi): Semicolon usage
  - Value: `["error", "always"]`
  - ❌ Incorrect:
    ```javascript
    const x = 5
    ```
  - ✅ Correct:
    ```javascript
    const x = 5;
    ```

### TypeScript
- [`@typescript-eslint/consistent-type-definitions`](https://typescript-eslint.io/rules/consistent-type-definitions): Type definition style
  - Value: `["error", "interface"]`
  - ❌ Incorrect:
    ```typescript
    type User = { name: string; age: number; };
    ```
  - ✅ Correct:
    ```typescript
    interface User { name: string; age: number; }
    ```

- [`@typescript-eslint/consistent-type-imports`](https://typescript-eslint.io/rules/consistent-type-imports): Type import style
  - Value: `["error", { "prefer": "type-imports" }]`
  - ❌ Incorrect:
    ```typescript
    import { User } from './types';
    ```
  - ✅ Correct:
    ```typescript
    import type { User } from './types';
    ```

- [`@typescript-eslint/no-floating-promises`](https://typescript-eslint.io/rules/no-floating-promises): Unhandled promises
  - Value: `"error"`
  - ❌ Incorrect:
    ```typescript
    promise.then(callback);
    ```
  - ✅ Correct:
    ```typescript
    await promise.then(callback);
    // or
    void promise.then(callback);
    ```

- [`@typescript-eslint/no-misused-promises`](https://typescript-eslint.io/rules/no-misused-promises): Promise misuse
  - Value: `"error"`
  - ❌ Incorrect:
    ```typescript
    if (promise) { /* ... */ }
    ```
  - ✅ Correct:
    ```typescript
    if (await promise) { /* ... */ }
    ```

- [`@typescript-eslint/prefer-optional-chain`](https://typescript-eslint.io/rules/prefer-optional-chain): Optional chaining
  - Value: `"error"`
  - ❌ Incorrect:
    ```typescript
    obj && obj.prop && obj.prop.value
    ```
  - ✅ Correct:
    ```typescript
    obj?.prop?.value
    ```

### Import
- [`import/order`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md): Import order
  - Value: `["error", { "groups": ["builtin", "external", "internal", "parent", "sibling", "index"] }]`
  - ❌ Incorrect:
    ```javascript
    import './styles.css';
    import React from 'react';
    import { something } from '../parent';
    ```
  - ✅ Correct:
    ```javascript
    import React from 'react';
    import { something } from '../parent';
    import './styles.css';
    ```

- [`no-duplicate-imports`](https://eslint.org/docs/latest/rules/no-duplicate-imports): No duplicate imports
  - Value: `"error"`
  - ❌ Incorrect:
    ```javascript
    import { foo } from 'module';
    import { bar } from 'module';
    ```
  - ✅ Correct:
    ```javascript
    import { foo, bar } from 'module';
    ```

### React
- [`react/boolean-prop-naming`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/boolean-prop-naming.md): Boolean prop naming
  - Value: `["error", { "rule": "^(is|has)[A-Z]([A-Za-z0-9]?)+" }]`
  - ❌ Incorrect:
    ```jsx
    <Component disabled={true} />
    ```
  - ✅ Correct:
    ```jsx
    <Component isDisabled={true} />
    ```

- [`react/destructuring-assignment`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/destructuring-assignment.md): Destructuring assignments
  - Value: `["error", "always"]`
  - ❌ Incorrect:
    ```javascript
    const name = props.name;
    ```
  - ✅ Correct:
    ```javascript
    const { name } = props;
    ```

- [`react/hook-use-state`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/hook-use-state.md): useState hook usage
  - Value: `"error"`
  - ❌ Incorrect:
    ```javascript
    const [enabled, setEnabled] = useState(false);
    ```
  - ✅ Correct:
    ```javascript
    const [isEnabled, setIsEnabled] = useState(false);
    ```

- [`react/jsx-boolean-value`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-boolean-value.md): Boolean attributes
  - Value: `["error", "never"]`
  - ❌ Incorrect:
    ```jsx
    <Component isEnabled={true} />
    ```
  - ✅ Correct:
    ```jsx
    <Component isEnabled />
    ```

- [`react/jsx-fragments`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-fragments.md): React fragments
  - Value: `["error", "syntax"]`
  - ❌ Incorrect:
    ```jsx
    <React.Fragment><div /><div /></React.Fragment>
    ```
  - ✅ Correct:
    ```jsx
    <><div /><div /></>
    ```

- [`react/no-array-index-key`](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-array-index-key.md): Array index keys
  - Value: `"error"`
  - ❌ Incorrect:
    ```jsx
    array.map((item, index) => <div key={index} />)
    ```
  - ✅ Correct:
    ```jsx
    array.map((item) => <div key={item.id} />)
    ```

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