import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      'next/core-web-vitals',
      'next/typescript',
      'prettier',
      '@feature-sliced/eslint-config/rules/import-order',
      '@feature-sliced/eslint-config/rules/layers-slices',
    ],
    plugins: ['prettier'],
    rules: {
      'prettier/prettier': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/entities/*/*',
                '@/features/*/*',
                '@/widgets/*/*',
                '@/pages/*/*',
              ],
              message:
                'Import a slice only through its public API (@/<layer>/<slice>). See docs/agents/architecture.md.',
            },
          ],
        },
      ],
    },
  }),
];

export default eslintConfig;
