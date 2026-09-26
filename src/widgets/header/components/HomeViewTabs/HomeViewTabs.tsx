'use client';

import { usePathname } from 'next/navigation';
import { ViewTabs } from '@/features/switchViewMode';

// The header is on every page, the view it switches only on the matrix
export const HomeViewTabs = () => (usePathname() === '/' ? <ViewTabs /> : null);
