import type { Metadata } from 'next';

export { EisenhowerMatrixPage as default } from '@/pages/eisenhowerMatrix';

export const metadata: Metadata = {
  title: 'Eisenhower Matrix Explained: Four Quadrants with Examples',
  description:
    'How the Eisenhower Matrix sorts tasks by urgency and importance into Do First, Schedule, Delegate and Eliminate, with examples and a free online app. No sign-up.',
  alternates: {
    canonical: '/eisenhower-matrix',
  },
};
