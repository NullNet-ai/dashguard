// .lintstagedrc.js
// See https://nextjs.org/docs/basic-features/eslint#lint-staged for details

import path from 'path';

const buildEslintCommand = (filenames) =>
  `npx next lint --config ./src/components/eslint-config/.eslintrc-normal.cjs --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`;

export default {
  '*.{js,jsx,ts,tsx}': (files) => {
    const filteredFiles = files.filter(
      (file) => !path.basename(file).endsWith('.lintstagedrc.js'),
    );
    return filteredFiles.length > 0 ? buildEslintCommand(filteredFiles) : [];
  },
};
