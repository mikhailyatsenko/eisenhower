import type { Config } from 'jest';
import nextJest from 'next/jest';

//config edited for handling svg as react component (ref: https://github.com/vercel/next.js/discussions/42535)

export const createJestConfig = nextJest({
  dir: './',
});

export const customJestConfig: Config = {
  testEnvironment: 'jest-environment-jsdom',
  verbose: true,
};

const jestConfig = async () => {
  const nextJestConfig = await createJestConfig(customJestConfig)();
  return {
    ...nextJestConfig,
    moduleNameMapper: {
      '\\.svg$': '<rootDir>/jest/__mocks__/svg.tsx',
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '^@/(.*)$': '<rootDir>/src/$1',
      ...nextJestConfig.moduleNameMapper,
    },
    preset: 'ts-jest',

    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    transform: {
      '^.+\\.(ts|tsx|jsx|js)$': [
        'ts-jest',
        {
          tsconfig: 'tsconfig.jest.json',
        },
      ],
    },
    transformIgnorePatterns: [
      '/node_modules/(?!@testing-library|@babel/runtime)',
    ],
  };
};

export default jestConfig;
