import type { Config } from 'jest';
import nextJest from 'next/jest';

//config edited for handling svg as react component (ref: https://github.com/vercel/next.js/discussions/42535)

export const createJestConfig = nextJest({
  dir: './',
});

export const customJestConfig: Config = {
  testEnvironment: 'jest-environment-jsdom',
  verbose: true,
  // 8 GB RAM: seven jsdom workers push the machine into swap
  maxWorkers: '50%',
  // Workers grow file after file; restart one that holds too much
  workerIdleMemoryLimit: '512MB',
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
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  };
};

export default jestConfig;
