import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import './jest/dialogPolyfill';

expect.extend(toHaveNoViolations);
